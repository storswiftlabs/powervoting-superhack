package api

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"powervoting-server/db"
	"powervoting-server/model"
	"time"
)

type ProposalReq struct {
	ExpirationTime int64  `json:"expirationTime" binding:"required"`
	ProposalCid    string `json:"proposalCid" binding:"required"`
	Net            int    `json:"net" binding:"required"`
}

func Create(c *gin.Context) {
	var req ProposalReq
	err := c.BindJSON(&req)
	if err != nil {
		log.Println("request param error", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"msg": "Invalid param",
		})
		return
	}
	var proposal model.Proposal
	db.Engine.Model(model.Proposal{}).Where("proposal_cid = ?", req.ProposalCid).Find(&proposal)
	if proposal != (model.Proposal{}) {
		c.JSON(http.StatusBadRequest, gin.H{
			"msg": "CID already exists",
		})
		return
	}
	tx := db.Engine.Create(&model.Proposal{
		ExpirationTime: req.ExpirationTime,
		ProposalCid:    req.ProposalCid,
		Net:            req.Net,
		Status:         1,
		CreateTime:     time.Now(),
		UpdateTime:     time.Now(),
	})
	if tx.Error != nil {
		log.Println("create proposal error", tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"msg": "system error",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"msg": "OK",
	})
}
