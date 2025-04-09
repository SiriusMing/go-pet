// cmd/go-pet/main.go
package main

import (
    "github.com/BZtiangou/go-pet/internal/config"
    "github.com/BZtiangou/go-pet/internal/database"
)

func main() {
    cfg := config.Load()
    db := database.NewConnection(cfg)
    // 启动服务...
}