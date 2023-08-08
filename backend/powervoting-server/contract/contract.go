package contract

import (
	"context"
	"crypto/ecdsa"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"log"
	"math/big"
	"os"
	"powervoting-server/config"
	"powervoting-server/model"
	"sync"
)

// GoEthClient go-ethereum client
type GoEthClient struct {
	Client          *ethclient.Client
	Abi             abi.ABI
	GasPrice        *big.Int
	Amount          *big.Int
	GasLimit        uint64
	ChainID         *big.Int
	ContractAddress common.Address
	PrivateKey      *ecdsa.PrivateKey
	WalletAddress   common.Address
	Net             string
}

var (
	mainOnce   sync.Once
	testOnce   sync.Once
	lock       sync.Mutex
	mainClient GoEthClient
	testClient GoEthClient
)

// ClientConfig config for get go-ethereum client
type ClientConfig struct {
	Rpc             string
	ContractAddress string
	PrivateKey      string
	WalletAddress   string
	AbiPath         string
	GasLimit        int64
	Net             string
}

// GetMainClient get main net client
func GetMainClient() GoEthClient {
	mainOnce.Do(func() {
		log.Println("main net init")
		clientConfig := ClientConfig{
			Rpc:             config.Client.MainNet.Contract.Rpc,
			ContractAddress: config.Client.MainNet.Contract.ContractAddress,
			PrivateKey:      config.Client.MainNet.Contract.PrivateKey,
			WalletAddress:   config.Client.MainNet.Contract.WalletAddress,
			AbiPath:         config.Client.MainNet.Contract.AbiPath,
			GasLimit:        config.Client.MainNet.Contract.GasLimit,
			Net:             "mainNet",
		}
		mainClient = getGoEthClient(clientConfig)
	})
	return mainClient
}

// GetTestClient get test net client
func GetTestClient() GoEthClient {
	testOnce.Do(func() {
		log.Println("test net init")
		clientConfig := ClientConfig{
			Rpc:             config.Client.TestNet.Contract.Rpc,
			ContractAddress: config.Client.TestNet.Contract.ContractAddress,
			PrivateKey:      config.Client.TestNet.Contract.PrivateKey,
			WalletAddress:   config.Client.TestNet.Contract.WalletAddress,
			AbiPath:         config.Client.TestNet.Contract.AbiPath,
			GasLimit:        config.Client.TestNet.Contract.GasLimit,
			Net:             "testNet",
		}
		testClient = getGoEthClient(clientConfig)
	})
	return testClient
}

type Proposal struct {
	Cid         string
	ExpTime     *big.Int
	IsCounted   bool
	OptionIds   []*big.Int
	VoteResults []VoteResult
}

type VoteResult struct {
	OptionId *big.Int
	Votes    *big.Int
}

// GetProposalListByIndex get proposal list by start and end index
func GetProposalListByIndex(ethClient GoEthClient, start *big.Int, end *big.Int, net *big.Int) []Proposal {
	callData, err := ethClient.Abi.Pack("getProposalListByIndex", start, end, net)
	if err != nil {
		log.Println(err)
	}
	msg := ethereum.CallMsg{
		To:   &ethClient.ContractAddress,
		Data: callData,
	}
	result, err := ethClient.Client.CallContract(context.Background(), msg, nil)
	if err != nil {
		log.Println("call contract error:", err)
	}
	var resProposalList []Proposal
	if len(result) == 0 {
		log.Println("contract has no data")
		return resProposalList
	}
	err = ethClient.Abi.UnpackIntoInterface(&resProposalList, "getProposalList", result)
	if err != nil {
		log.Println("un pack result to interface error: ", err)
	}
	return resProposalList
}

func GetProposalList(ethClient GoEthClient, proposalList []model.Proposal) []model.Proposal {
	var cidList []string
	for _, proposal := range proposalList {
		cidList = append(cidList, proposal.ProposalCid)
	}
	callData, err := ethClient.Abi.Pack("getProposalList", cidList)
	if err != nil {
		log.Println(err)
	}
	msg := ethereum.CallMsg{
		To:   &ethClient.ContractAddress,
		Data: callData,
	}
	result, err := ethClient.Client.CallContract(context.Background(), msg, nil)
	if err != nil {
		log.Println("call contract error:", err)
	}
	var resProposalList []Proposal
	err = ethClient.Abi.UnpackIntoInterface(&resProposalList, "getProposalList", result)
	if err != nil {
		log.Println("un pack result to interface error: ", err)
	}
	var countList []model.Proposal
	for _, proposal := range resProposalList {
		for _, temp := range proposalList {
			if proposal.Cid == temp.ProposalCid && !proposal.IsCounted {
				countList = append(countList, temp)
				break
			}
		}
	}
	return countList
}

func GetProposal(ethClient GoEthClient, proposalCid string) *Proposal {
	callData, err := ethClient.Abi.Pack("getProposal", proposalCid)
	if err != nil {
		log.Println(err)
	}
	msg := ethereum.CallMsg{
		To:   &ethClient.ContractAddress,
		Data: callData,
	}
	result, err := ethClient.Client.CallContract(context.Background(), msg, nil)
	if err != nil {
		log.Println("call contract error:", err)
	}
	res := new(Proposal)
	err = ethClient.Abi.UnpackIntoInterface(&res, "getProposal", result)
	if err != nil {
		log.Println("un pack result to interface error: ", err)
	}
	return res
}

// getGoEthClient get go-ethereum client
func getGoEthClient(clientConfig ClientConfig) GoEthClient {
	client, err := ethclient.Dial(clientConfig.Rpc)
	if err != nil {
		log.Println("ethclient.Dial error: ", err)
	}

	// contract address, wallet private key , wallet address
	contractAddress := common.HexToAddress(clientConfig.ContractAddress)
	privateKey, err := crypto.HexToECDSA(clientConfig.PrivateKey)
	walletAddress := common.HexToAddress(clientConfig.WalletAddress)

	// open abi file and parse json
	open, err := os.Open(clientConfig.AbiPath)
	if err != nil {
		log.Println("open abi file error: ", err)
	}
	contractAbi, err := abi.JSON(open)
	if err != nil {
		log.Println("abi.JSON error: ", err)
	}

	// gas price
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Println("client.SuggestGasPrice error: ", err)
	}
	// transfer amount, if no set zero
	amount := big.NewInt(0)
	// gas limit
	gasLimit := uint64(clientConfig.GasLimit)
	// get chain id
	chainID, err := client.NetworkID(context.Background())
	if err != nil {
		log.Println("client.NetworkID error: ", err)
	}
	// generate goEthClient
	goEthClient := GoEthClient{
		Client:          client,
		Abi:             contractAbi,
		GasPrice:        gasPrice,
		Amount:          amount,
		GasLimit:        gasLimit,
		ChainID:         chainID,
		ContractAddress: contractAddress,
		PrivateKey:      privateKey,
		WalletAddress:   walletAddress,
		Net:             clientConfig.Net,
	}
	return goEthClient
}

// CountContract contract count
func CountContract(proposals []model.Proposal, ethClient GoEthClient) error {
	// avoiding nonce duplication in multiple threads
	lock.Lock()
	defer lock.Unlock()

	// pack method and param
	var data []byte
	var err error
	if len(proposals) == 1 {
		data, err = ethClient.Abi.Pack("count", proposals[len(proposals)-1].ProposalCid)
		if err != nil {
			log.Println("contractAbi.Pack error: ", err)
			return err
		}
	} else {
		var proposalCids []string
		for _, proposal := range proposals {
			proposalCids = append(proposalCids, proposal.ProposalCid)
		}
		data, err = ethClient.Abi.Pack("countBatch", proposalCids)
		if err != nil {
			log.Println("contractAbi.Pack error: ", err)
			return err
		}
	}

	// get transaction nonce
	nonce, err := ethClient.Client.PendingNonceAt(context.Background(), ethClient.WalletAddress)
	if err != nil {
		log.Println("PendingNonceAt error: ", err)
		return err
	}
	// create transaction
	tx := types.NewTx(&types.DynamicFeeTx{
		ChainID:   ethClient.ChainID,
		Nonce:     nonce,
		GasTipCap: ethClient.GasPrice,
		GasFeeCap: ethClient.GasPrice,
		Gas:       ethClient.GasLimit,
		To:        &ethClient.ContractAddress,
		Value:     ethClient.Amount,
		Data:      data,
	})
	// sign with private key
	signedTx, err := types.SignTx(tx, types.LatestSignerForChainID(ethClient.ChainID), ethClient.PrivateKey)
	if err != nil {
		log.Println("types.SignTx error: ", err)
		return err
	}
	// send transaction
	err = ethClient.Client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		log.Println("client.SendTransaction error: ", err)
		return err
	}

	log.Printf("net work：%s, transaction id: %s", ethClient.Net, signedTx.Hash().Hex())
	return nil
}
