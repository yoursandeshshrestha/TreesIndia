package config

import (
	"os"
	"strconv"
	"time"
)

// PerformanceConfig holds performance-related configuration
type PerformanceConfig struct {
	// File upload settings
	FileUploadTimeout    time.Duration
	MaxFileSize          int64
	MaxConcurrentUploads int

	// Database settings
	DBConnectionTimeout time.Duration
	DBQueryTimeout      time.Duration
	BatchSize           int

	// API settings
	APITimeout         time.Duration
	MaxRequestBodySize int64

	// Cache settings
	CacheEnabled bool
	CacheTTL     time.Duration

	// Cloudinary settings
	CloudinaryTimeout time.Duration
	CloudinaryRetries int
}

// LoadPerformanceConfig loads performance configuration from environment variables
func LoadPerformanceConfig() *PerformanceConfig {
	config := &PerformanceConfig{
		// Default values
		FileUploadTimeout:    30 * time.Second,
		MaxFileSize:          10 * 1024 * 1024, // 10MB
		MaxConcurrentUploads: 5,
		DBConnectionTimeout:  10 * time.Second,
		DBQueryTimeout:       5 * time.Second,
		BatchSize:            100,
		APITimeout:           60 * time.Second,
		MaxRequestBodySize:   50 * 1024 * 1024, // 50MB
		CacheEnabled:         true,
		CacheTTL:             5 * time.Minute,
		CloudinaryTimeout:    15 * time.Second,
		CloudinaryRetries:    3,
	}

	// Override with environment variables if set
	if timeout := os.Getenv("FILE_UPLOAD_TIMEOUT"); timeout != "" {
		if seconds, err := strconv.Atoi(timeout); err == nil {
			config.FileUploadTimeout = time.Duration(seconds) * time.Second
		}
	}

	if maxSize := os.Getenv("MAX_FILE_SIZE"); maxSize != "" {
		if size, err := strconv.ParseInt(maxSize, 10, 64); err == nil {
			config.MaxFileSize = size
		}
	}

	if maxUploads := os.Getenv("MAX_CONCURRENT_UPLOADS"); maxUploads != "" {
		if uploads, err := strconv.Atoi(maxUploads); err == nil {
			config.MaxConcurrentUploads = uploads
		}
	}

	if dbTimeout := os.Getenv("DB_CONNECTION_TIMEOUT"); dbTimeout != "" {
		if seconds, err := strconv.Atoi(dbTimeout); err == nil {
			config.DBConnectionTimeout = time.Duration(seconds) * time.Second
		}
	}

	if queryTimeout := os.Getenv("DB_QUERY_TIMEOUT"); queryTimeout != "" {
		if seconds, err := strconv.Atoi(queryTimeout); err == nil {
			config.DBQueryTimeout = time.Duration(seconds) * time.Second
		}
	}

	if batchSize := os.Getenv("BATCH_SIZE"); batchSize != "" {
		if size, err := strconv.Atoi(batchSize); err == nil {
			config.BatchSize = size
		}
	}

	if apiTimeout := os.Getenv("API_TIMEOUT"); apiTimeout != "" {
		if seconds, err := strconv.Atoi(apiTimeout); err == nil {
			config.APITimeout = time.Duration(seconds) * time.Second
		}
	}

	if maxBodySize := os.Getenv("MAX_REQUEST_BODY_SIZE"); maxBodySize != "" {
		if size, err := strconv.ParseInt(maxBodySize, 10, 64); err == nil {
			config.MaxRequestBodySize = size
		}
	}

	if cacheEnabled := os.Getenv("CACHE_ENABLED"); cacheEnabled != "" {
		config.CacheEnabled = cacheEnabled == "true"
	}

	if cacheTTL := os.Getenv("CACHE_TTL"); cacheTTL != "" {
		if seconds, err := strconv.Atoi(cacheTTL); err == nil {
			config.CacheTTL = time.Duration(seconds) * time.Second
		}
	}

	if cloudinaryTimeout := os.Getenv("CLOUDINARY_TIMEOUT"); cloudinaryTimeout != "" {
		if seconds, err := strconv.Atoi(cloudinaryTimeout); err == nil {
			config.CloudinaryTimeout = time.Duration(seconds) * time.Second
		}
	}

	if cloudinaryRetries := os.Getenv("CLOUDINARY_RETRIES"); cloudinaryRetries != "" {
		if retries, err := strconv.Atoi(cloudinaryRetries); err == nil {
			config.CloudinaryRetries = retries
		}
	}

	return config
}
