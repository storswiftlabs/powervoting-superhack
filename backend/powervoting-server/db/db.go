package db

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
	"log"
	"powervoting-server/config"
	"powervoting-server/constant"
	"powervoting-server/model"
	"time"
)

var Engine *gorm.DB

func InitMysql() {
	var err error
	Engine, err = gorm.Open(mysql.New(mysql.Config{
		DSN:                       fmt.Sprintf("%s:%s@tcp(%s)/powervoting?charset=utf8&parseTime=True&loc=Local", config.Client.Mysql.Username, config.Client.Mysql.Password, config.Client.Mysql.Url),
		DefaultStringSize:         256,
		DisableDatetimePrecision:  true,
		DontSupportRenameIndex:    true,
		DontSupportRenameColumn:   true,
		SkipInitializeWithVersion: false,
	}), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix:   "tbl_",
			SingularTable: true,
		},
	})
	if err != nil {
		log.Fatalln("connect mysql error：", err)
	}

	Engine.AutoMigrate(model.Proposal{})
	Engine.AutoMigrate(model.Dict{})

	var mainStart model.Dict
	Engine.Model(model.Dict{}).Where("name = ?", constant.MainStartIndex).Find(&mainStart)
	if mainStart == (model.Dict{}) {
		Engine.Model(model.Dict{}).Create(&model.Dict{
			Name:       constant.MainStartIndex,
			Value:      "0",
			CreateTime: time.Now(),
			UpdateTime: time.Now(),
		})
	}

	var testStart model.Dict
	Engine.Model(model.Dict{}).Where("name = ?", constant.TestStartIndex).Find(&testStart)
	if testStart == (model.Dict{}) {
		Engine.Model(model.Dict{}).Create(&model.Dict{
			Name:       constant.TestStartIndex,
			Value:      "0",
			CreateTime: time.Now(),
			UpdateTime: time.Now(),
		})
	}
}
