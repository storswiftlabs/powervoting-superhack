package main

import (
	"github.com/gin-gonic/gin"
	"powervoting-server/api"
	"powervoting-server/config"
	"powervoting-server/db"
	"powervoting-server/scheduler"
)

func main() {
	// initialization configuration
	config.InitConfig()
	// initialization mysql
	db.InitMysql()
	go scheduler.VotingCount()
	r := gin.Default()
	r.POST("/api/create_proposal", api.Create)
	r.Run(config.Client.Server.Port)
}
