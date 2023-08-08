package scheduler

import (
	"context"
	"github.com/robfig/cron/v3"
	"log"
	"math/big"
	"powervoting-server/config"
	"powervoting-server/constant"
	"powervoting-server/contract"
	"powervoting-server/db"
	"powervoting-server/model"
	"strconv"
	"time"
)

func VotingCount() {
	// create a new scheduler
	crontab := cron.New(cron.WithSeconds())
	// task function
	mainTask := MainTaskFunc
	testTask := TestTaskFunc
	checkStatusTask := CheckStatusFunc
	syncDataTask := SyncDataFunc
	mainSpec := config.Client.MainNet.Contract.Corn
	testSpec := config.Client.TestNet.Contract.Corn
	// 3m
	//checkSpec := "0 0/3 * * * ?"
	checkSpec := "0/5 * * * * ?"
	// add task to scheduler
	_, err := crontab.AddFunc(mainSpec, mainTask)
	if err != nil {
		log.Println("add main net task error: ", err)
	}
	_, err = crontab.AddFunc(testSpec, testTask)
	if err != nil {
		log.Println("add test net task error: ", err)
	}
	_, err = crontab.AddFunc(checkSpec, checkStatusTask)
	if err != nil {
		log.Println("add check status task error: ", err)
	}
	_, err = crontab.AddFunc(checkSpec, syncDataTask)
	if err != nil {
		log.Println("add data sync task error: ", err)
	}
	// start
	crontab.Start()

	select {}
}

var countNumber map[string]int

func init() {
	countNumber = make(map[string]int)
}

// SyncDataFunc data sync function
func SyncDataFunc() {
	mainEthClient := contract.GetMainClient()
	testEthClient := contract.GetTestClient()

	// get start index from mysql
	var mainStart model.Dict
	db.Engine.Model(model.Dict{}).Where("name = ?", constant.MainStartIndex).Find(&mainStart)
	var testStart model.Dict
	db.Engine.Model(model.Dict{}).Where("name = ?", constant.TestStartIndex).Find(&testStart)

	mainStartInt, err := strconv.Atoi(mainStart.Value)
	if err != nil {
		log.Println("string convert to int error: ", err)
	}
	testStartInt, err := strconv.Atoi(testStart.Value)
	if err != nil {
		log.Println("string convert to int error: ", err)
	}
	mainStartIndex := big.NewInt(int64(mainStartInt))
	mainEndIndex := big.NewInt(int64(mainStartInt) + 1)
	testStartIndex := big.NewInt(int64(testStartInt))
	testEndIndex := big.NewInt(int64(testStartInt) + 1)
	mainNet := big.NewInt(1)
	testNet := big.NewInt(2)
	log.Printf("mainStart: %d, mainEnd: %d, testStart: %d, testEnd: %d", mainStartIndex, mainEndIndex, testStartIndex, testEndIndex)
	// get proposal list from contract
	mainProposalList := contract.GetProposalListByIndex(mainEthClient, mainStartIndex, mainEndIndex, mainNet)
	testProposalList := contract.GetProposalListByIndex(testEthClient, testStartIndex, testEndIndex, testNet)

	// sync data and update start index
	if len(mainProposalList) > 0 {
		mainStart.Value = strconv.Itoa(mainStartInt + len(mainProposalList))
		mainStart.UpdateTime = time.Now()
		db.Engine.Updates(mainStart)
		go syncDataHandler(mainProposalList, 1)
	}
	if len(testProposalList) > 0 {
		testStart.Value = strconv.Itoa(testStartInt + len(testProposalList))
		testStart.UpdateTime = time.Now()
		db.Engine.Updates(testStart)
		go syncDataHandler(testProposalList, 2)
	}
}

// syncDataHandler chain and backend service data sync handler
func syncDataHandler(proposalList []contract.Proposal, net int) {
	log.Printf("proposal list: %+v, net: %d\n", proposalList, net)
	var cidList []string
	for _, proposal := range proposalList {
		if len(proposal.Cid) == 0 {
			continue
		}
		cidList = append(cidList, proposal.Cid)
	}

	// get proposal list from mysql
	var proposals []model.Proposal
	tx := db.Engine.Model(model.Proposal{}).Where("proposal_cid in ?", cidList).Find(&proposals)
	if tx.Error != nil {
		log.Println("get proposal list error", tx.Error)
	}
	if len(proposals) == len(cidList) {
		log.Println("no data sync")
		return
	}

	// filter sync proposal
	var insertProposals []model.Proposal
	for _, contractProposal := range proposalList {
		exist := false
		for _, proposal := range proposals {
			if contractProposal.Cid == proposal.ProposalCid {
				exist = true
				break
			}
		}
		if !exist {
			insertProposal := model.Proposal{
				ExpirationTime: contractProposal.ExpTime.Int64(),
				ProposalCid:    contractProposal.Cid,
				Status:         1,
				Net:            net,
				CreateTime:     time.Now(),
				UpdateTime:     time.Now(),
			}
			insertProposals = append(insertProposals, insertProposal)
		}
	}

	// insert sync data to mysql
	log.Printf("insert proposal list: %+v\n", insertProposals)
	tx = db.Engine.Model(model.Proposal{}).Create(&insertProposals)
	if tx.Error != nil {
		log.Println("insert proposal error:", tx.Error)
	}
}

// CheckStatusFunc check vote count status
func CheckStatusFunc() {
	var proposalList []model.Proposal
	tx := db.Engine.Model(model.Proposal{}).Where("status = 2").Find(&proposalList)
	if tx.Error != nil {
		log.Println("get proposal list error", tx.Error)
	}
	var ethClient contract.GoEthClient
	for _, proposal := range proposalList {
		if proposal.Net == 1 {
			ethClient = contract.GetMainClient()
		} else {
			ethClient = contract.GetTestClient()
		}
		contractProposal := contract.GetProposal(ethClient, proposal.ProposalCid)
		log.Printf("proposal cid: -%s-, proposal count: -%v-", contractProposal.Cid, contractProposal.IsCounted)
		if len(contractProposal.Cid) == 0 {
			db.Engine.Model(model.Proposal{}).Where("id = ?", proposal.Id).Update("status", 4)
			continue
		}
		if contractProposal.IsCounted {
			db.Engine.Model(model.Proposal{}).Where("id = ?", proposal.Id).Update("status", 3)
			continue
		}
		count := countNumber[proposal.ProposalCid]
		if count > 4 {
			db.Engine.Model(model.Proposal{}).Where("id = ?", proposal.Id).Update("status", 4)
			delete(countNumber, proposal.ProposalCid)
			continue
		}
		countNumber[proposal.ProposalCid] = count + 1
		db.Engine.Model(model.Proposal{}).Where("id = ?", proposal.Id).Update("status", 1)
	}
}

// MainTaskFunc main net task function
func MainTaskFunc() {
	ethClient := contract.GetMainClient()
	ctx := context.Background()
	number, err := ethClient.Client.BlockNumber(ctx)
	if err != nil {
		log.Println("get block number error:", err)
	}
	block, err := ethClient.Client.BlockByNumber(ctx, big.NewInt(int64(number)))
	if err != nil {
		log.Println("get block by number error:", err)
	}
	now := int64(block.Time())
	var proposalList []model.Proposal
	tx := db.Engine.Model(model.Proposal{}).Where("status = 1").Where("net = 1").Find(&proposalList)
	if tx.Error != nil {
		log.Println("get proposal list error", tx.Error)
		return
	}
	var list []model.Proposal
	for _, proposal := range proposalList {
		if now >= proposal.ExpirationTime {
			list = append(list, proposal)
		}
	}
	proposals := contract.GetProposalList(ethClient, list)
	if len(proposals) > 0 {
		Count(proposals, ethClient)
	}
}

// TestTaskFunc test net task function
func TestTaskFunc() {
	ethClient := contract.GetTestClient()
	ctx := context.Background()
	number, err := ethClient.Client.BlockNumber(ctx)
	if err != nil {
		log.Println("get block number error:", err)
	}
	block, err := ethClient.Client.BlockByNumber(ctx, big.NewInt(int64(number)))
	if err != nil {
		log.Println("get block by number error:", err)
	}
	now := int64(block.Time())
	var proposalList []model.Proposal
	tx := db.Engine.Model(model.Proposal{}).Where("status = 1").Where("net = 2").Find(&proposalList)
	if tx.Error != nil {
		log.Println("get proposal list error", tx.Error)
		return
	}
	var list []model.Proposal
	for _, proposal := range proposalList {
		if now >= proposal.ExpirationTime {
			list = append(list, proposal)
		}
	}
	proposals := contract.GetProposalList(ethClient, list)
	if len(proposals) > 0 {
		Count(proposals, ethClient)
	}
}

// Count voting count
func Count(proposals []model.Proposal, client contract.GoEthClient) {
	go func() {
		err := contract.CountContract(proposals, client)
		var ids []int64
		for _, proposal := range proposals {
			ids = append(ids, proposal.Id)
		}
		if err != nil {
			log.Println("count failed：", err)
			db.Engine.Model(model.Proposal{}).Where("id in ?", ids).Update("status", 1)
		} else {
			db.Engine.Model(model.Proposal{}).Where("id in ?", ids).Update("status", 2)
		}
	}()
}
