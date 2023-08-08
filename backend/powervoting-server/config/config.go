package config

import (
	"fmt"
	"github.com/spf13/viper"
	"log"
)

type Config struct {
	Server  Server
	Mysql   Mysql
	MainNet MainNet
	TestNet TestNet
}

type Server struct {
	Port string
}

type Mysql struct {
	Url      string
	Username string
	Password string
}

type MainNet struct {
	Contract Contract
}

type TestNet struct {
	Contract Contract
}

type Contract struct {
	Corn            string
	Rpc             string
	AbiPath         string
	ContractAddress string
	PrivateKey      string
	WalletAddress   string
	GasLimit        int64
}

// export client
var Client Config

// InitConfig initialization configuration
func InitConfig() {
	// configuration file name
	viper.SetConfigName("configuration")

	viper.AddConfigPath("./")

	viper.SetConfigType("yaml")

	err := viper.ReadInConfig()
	if err != nil {
		fmt.Println("read config file error:", err)
		return
	}

	err = viper.Unmarshal(&Client)
	if err != nil {
		fmt.Println("unmarshal error:", err)
		return
	}

	log.Printf("main net configuration：%+v\n", Client.MainNet.Contract)
	log.Printf("test net configuration：%+v\n", Client.TestNet.Contract)

}
