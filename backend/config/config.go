package config

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db *gorm.DB
)

// InitConfig initializes the configuration
func InitConfig() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		logrus.Info("No .env file found, using environment variables")
	}

	// Set default values
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("GIN_MODE", "debug")
	viper.SetDefault("ENV", "development")
	viper.SetDefault("OTP", "0000")
	viper.SetDefault("JWT_SECRET", "your-secret-key-change-in-production")

	// Bind environment variables
	viper.BindEnv("PORT")
	viper.BindEnv("GIN_MODE")
	viper.BindEnv("ENV")
	viper.BindEnv("DATABASE_URL")
	viper.BindEnv("OTP")
	viper.BindEnv("JWT_SECRET")
	viper.BindEnv("CLOUDINARY_URL")

	logrus.Info("Configuration initialized")
}

// InitDatabase initializes the database connection
func InitDatabase() {
	var err error
	dsn := getDatabaseURL()
	
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logrus.Fatal("Failed to connect to database:", err)
	}

	logrus.Info("Database connected successfully")
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return db
}

// GetPort returns the port number
func GetPort() string {
	return viper.GetString("PORT")
}

// GetEnv returns the current environment
func GetEnv() string {
	return viper.GetString("ENV")
}

// IsProduction checks if the environment is production
func IsProduction() bool {
	return viper.GetString("ENV") == "production"
}

// GetOTP returns the OTP from environment
func GetOTP() string {
	return viper.GetString("OTP")
}

// GetJWTSecret returns the JWT secret from environment
func GetJWTSecret() string {
	return viper.GetString("JWT_SECRET")
}

// GetCloudinaryURL returns the Cloudinary URL from environment
func GetCloudinaryURL() string {
	return viper.GetString("CLOUDINARY_URL")
}

// getDatabaseURL returns the database connection string
func getDatabaseURL() string {
	if url := os.Getenv("DATABASE_URL"); url != "" {
		return url
	}
	
	// Fallback to individual environment variables
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	
	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "5432"
	}
	if user == "" {
		user = "postgres"
	}
	if dbname == "" {
		dbname = "treesindia"
	}
	
	return "host=" + host + " port=" + port + " user=" + user + " password=" + password + " dbname=" + dbname + " sslmode=require"
}
