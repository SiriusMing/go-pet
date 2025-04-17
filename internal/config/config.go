// internal/config/config.go
type Config struct {
    DBHost     string `mapstructure:"DB_HOST"`
    DBPort     int    `mapstructure:"DB_PORT"`
    ServerPort int    `mapstructure:"SERVER_PORT"`
}