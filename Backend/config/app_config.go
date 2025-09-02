package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// AppConfig holds all application configuration
type AppConfig struct {
	// Server Configuration
	ServerPort string
	ServerHost string
	Environment string
	
	// Database Configuration
	DatabaseURL      string
	DatabaseHost     string
	DatabasePort     string
	DatabaseName     string
	DatabaseUser     string
	DatabasePassword string
	DatabaseSSLMode  string
	
	// JWT Configuration
	JWTSecret        string
	JWTExpiryHours   int
	RefreshExpiryDays int
	
	// OTP Configuration
	OTP string
	
	// Cloudinary Configuration
	CloudinaryURL    string
	CloudinaryCloudName string
	CloudinaryAPIKey string
	CloudinaryAPISecret string
	
	// File Upload Configuration
	MaxFileSize      int64
	AllowedFileTypes []string
	UploadPath       string
	
	// Logging Configuration
	LogLevel         string
	LogFormat        string
	
	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow   time.Duration
	
	// CORS Configuration
	CORSAllowedOrigins []string
	CORSAllowedMethods []string
	CORSAllowedHeaders []string
	
	// Pagination Configuration
	DefaultPageSize  int
	MaxPageSize      int
	
	// Cache Configuration
	CacheEnabled     bool
	CacheTTL         time.Duration
	RedisURL         string
	
	// Email Configuration
	SMTPHost         string
	SMTPPort         int
	SMTPUsername     string
	SMTPPassword     string
	SMTPFromEmail    string
	
	// SMS Configuration
	SMSProvider      string
	SMSAPIKey        string
	SMSSecret        string
	
	// FCM Configuration
	FCMServiceAccountPath string
	FCMProjectID         string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *AppConfig {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		// .env file not found, continue with environment variables
	}
	
	
	
	config := &AppConfig{
		// Server Configuration
		ServerPort:   getEnv("PORT", "8080"),
		ServerHost:   getEnv("SERVER_HOST", "0.0.0.0"),
		Environment:  getEnv("ENV", "development"),
		
		// Database Configuration
		DatabaseURL:      getEnv("DATABASE_URL", ""),
		DatabaseHost:     getEnv("DB_HOST", "localhost"),
		DatabasePort:     getEnv("DB_PORT", "5432"),
		DatabaseName:     getEnv("DB_NAME", "treesindia"),
		DatabaseUser:     getEnv("DB_USER", "postgres"),
		DatabasePassword: getEnv("DB_PASSWORD", ""),
		DatabaseSSLMode:  getEnv("DB_SSLMODE", "disable"),
		
		// JWT Configuration
		JWTSecret:         getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiryHours:    getEnvAsInt("JWT_EXPIRY_HOURS", 1),
		RefreshExpiryDays: getEnvAsInt("REFRESH_EXPIRY_DAYS", 30),
		
		// OTP Configuration
		OTP: getEnv("OTP", "0000"),
		
		// Cloudinary Configuration
		CloudinaryURL:        getEnv("CLOUDINARY_URL", ""),
		CloudinaryCloudName:  getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:     getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret:  getEnv("CLOUDINARY_API_SECRET", ""),
		
		// File Upload Configuration
		MaxFileSize:      getEnvAsInt64("MAX_FILE_SIZE", 10*1024*1024), // 10MB
		AllowedFileTypes: getEnvAsSlice("ALLOWED_FILE_TYPES", []string{"image/jpeg", "image/png", "image/gif", "image/webp"}),
		UploadPath:       getEnv("UPLOAD_PATH", "./uploads"),
		
		// Logging Configuration
		LogLevel:  getEnv("LOG_LEVEL", "info"),
		LogFormat: getEnv("LOG_FORMAT", "json"),
		
		// Rate Limiting
		RateLimitRequests: getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitWindow:   getEnvAsDuration("RATE_LIMIT_WINDOW", time.Minute),
		
		// CORS Configuration
		CORSAllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:4000", "http://localhost:3002"}),
		CORSAllowedMethods: getEnvAsSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}),
		CORSAllowedHeaders: getEnvAsSlice("CORS_ALLOWED_HEADERS", []string{"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control", "X-File-Name"}),
		
		// Pagination Configuration
		DefaultPageSize: getEnvAsInt("DEFAULT_PAGE_SIZE", 10),
		MaxPageSize:     getEnvAsInt("MAX_PAGE_SIZE", 100),
		
		// Cache Configuration
		CacheEnabled: getEnvAsBool("CACHE_ENABLED", false),
		CacheTTL:     getEnvAsDuration("CACHE_TTL", 5*time.Minute),
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379"),
		
		// Email Configuration
		SMTPHost:      getEnv("SMTP_HOST", ""),
		SMTPPort:      getEnvAsInt("SMTP_PORT", 587),
		SMTPUsername:  getEnv("SMTP_USERNAME", ""),
		SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
		SMTPFromEmail: getEnv("SMTP_FROM_EMAIL", ""),
		
		// SMS Configuration
		SMSProvider: getEnv("SMS_PROVIDER", ""),
		SMSAPIKey:   getEnv("SMS_API_KEY", ""),
		SMSSecret:   getEnv("SMS_SECRET", ""),
		
		// FCM Configuration
		FCMServiceAccountPath: getEnv("FCM_SERVICE_ACCOUNT_PATH", "config/treesindia-fcm-firebase-adminsdk-fbsvc-c40fa2011a.json"),
		FCMProjectID:         getEnv("FCM_PROJECT_ID", "treesindia-fcm"),
	}
	
	return config
}

// GetDatabaseURL returns the database connection URL
func (ac *AppConfig) GetDatabaseURL() string {
	
	
	// If DATABASE_URL is provided, use it directly
	if ac.DatabaseURL != "" {
		// Clean up any line breaks or extra spaces
		cleanURL := strings.TrimSpace(ac.DatabaseURL)
		cleanURL = strings.ReplaceAll(cleanURL, "\n", "")
		cleanURL = strings.ReplaceAll(cleanURL, "\r", "")
		return cleanURL
	}
	
	// Otherwise, construct from individual components
	constructedURL := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		ac.DatabaseHost, ac.DatabasePort, ac.DatabaseUser, ac.DatabasePassword, ac.DatabaseName, ac.DatabaseSSLMode)
	return constructedURL
}

// IsDevelopment returns true if the environment is development
func (ac *AppConfig) IsDevelopment() bool {
	return ac.Environment == "development"
}

// IsProduction returns true if the environment is production
func (ac *AppConfig) IsProduction() bool {
	return ac.Environment == "production"
}

// IsTest returns true if the environment is test
func (ac *AppConfig) IsTest() bool {
	return ac.Environment == "test"
}

// GetJWTExpiry returns the JWT expiry duration
func (ac *AppConfig) GetJWTExpiry() time.Duration {
	return time.Duration(ac.JWTExpiryHours) * time.Hour
}

// GetRefreshExpiry returns the refresh token expiry duration
func (ac *AppConfig) GetRefreshExpiry() time.Duration {
	return time.Duration(ac.RefreshExpiryDays) * 24 * time.Hour
}

// GetFCMConfig returns the FCM configuration
func (ac *AppConfig) GetFCMConfig() map[string]string {
	return map[string]string{
		"project_id":           ac.FCMProjectID,
		"service_account_path": ac.FCMServiceAccountPath,
	}
}

// Helper functions to get environment variables with defaults
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		// Clean up any line breaks or extra spaces
		cleanValue := strings.TrimSpace(value)
		cleanValue = strings.ReplaceAll(cleanValue, "\n", "")
		cleanValue = strings.ReplaceAll(cleanValue, "\r", "")
		return cleanValue
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Parse comma-separated values and trim whitespace
		values := strings.Split(value, ",")
		for i, v := range values {
			values[i] = strings.TrimSpace(v)
		}
		return values
	}
	return defaultValue
}
