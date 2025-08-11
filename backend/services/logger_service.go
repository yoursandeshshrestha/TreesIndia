package services

import (
	"context"
	"time"

	"github.com/sirupsen/logrus"
)

// LoggerService provides structured logging functionality
type LoggerService struct {
	logger *logrus.Logger
}

// NewLoggerService creates a new logger service
func NewLoggerService() *LoggerService {
	logger := logrus.New()
	
	// Configure logger
	logger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})
	
	// Set log level based on environment
	logger.SetLevel(logrus.InfoLevel)
	
	return &LoggerService{
		logger: logger,
	}
}

// LogLevel represents log levels
type LogLevel string

const (
	LogLevelDebug LogLevel = "debug"
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
	LogLevelFatal LogLevel = "fatal"
)

// LogEntry represents a log entry
type LogEntry struct {
	Level     LogLevel                `json:"level"`
	Message   string                  `json:"message"`
	Timestamp time.Time               `json:"timestamp"`
	Fields    map[string]interface{}  `json:"fields,omitempty"`
	Error     error                   `json:"error,omitempty"`
}

// LogRequest logs HTTP request information
func (ls *LoggerService) LogRequest(ctx context.Context, method, path, userAgent string, userID uint, duration time.Duration, statusCode int) {
	fields := logrus.Fields{
		"method":      method,
		"path":        path,
		"user_agent":  userAgent,
		"user_id":     userID,
		"duration_ms": duration.Milliseconds(),
		"status_code": statusCode,
	}

	if statusCode >= 400 {
		ls.logger.WithFields(fields).Warn("HTTP Request")
	} else {
		ls.logger.WithFields(fields).Info("HTTP Request")
	}
}

// LogError logs error information
func (ls *LoggerService) LogError(ctx context.Context, message string, err error, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	
	fields["error"] = err.Error()
	ls.logger.WithFields(fields).Error(message)
}

// LogInfo logs information messages
func (ls *LoggerService) LogInfo(ctx context.Context, message string, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	ls.logger.WithFields(fields).Info(message)
}

// LogWarn logs warning messages
func (ls *LoggerService) LogWarn(ctx context.Context, message string, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	ls.logger.WithFields(fields).Warn(message)
}

// LogDebug logs debug messages
func (ls *LoggerService) LogDebug(ctx context.Context, message string, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	ls.logger.WithFields(fields).Debug(message)
}

// LogUserAction logs user actions
func (ls *LoggerService) LogUserAction(ctx context.Context, userID uint, action string, resource string, resourceID interface{}, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	
	fields["user_id"] = userID
	fields["action"] = action
	fields["resource"] = resource
	fields["resource_id"] = resourceID
	
	ls.logger.WithFields(fields).Info("User Action")
}

// LogDatabaseQuery logs database query information
func (ls *LoggerService) LogDatabaseQuery(ctx context.Context, query string, duration time.Duration, rowsAffected int64, err error) {
	fields := logrus.Fields{
		"query":          query,
		"duration_ms":    duration.Milliseconds(),
		"rows_affected":  rowsAffected,
	}
	
	if err != nil {
		fields["error"] = err.Error()
		ls.logger.WithFields(fields).Error("Database Query Error")
	} else {
		ls.logger.WithFields(fields).Debug("Database Query")
	}
}

// LogAuthentication logs authentication events
func (ls *LoggerService) LogAuthentication(ctx context.Context, userID uint, action string, success bool, ipAddress string, userAgent string) {
	fields := logrus.Fields{
		"user_id":     userID,
		"action":      action,
		"success":     success,
		"ip_address":  ipAddress,
		"user_agent":  userAgent,
	}
	
	if success {
		ls.logger.WithFields(fields).Info("Authentication Success")
	} else {
		ls.logger.WithFields(fields).Warn("Authentication Failure")
	}
}

// LogFileUpload logs file upload events
func (ls *LoggerService) LogFileUpload(ctx context.Context, userID uint, fileName string, fileSize int64, fileType string, uploadPath string, success bool, err error) {
	fields := logrus.Fields{
		"user_id":     userID,
		"file_name":   fileName,
		"file_size":   fileSize,
		"file_type":   fileType,
		"upload_path": uploadPath,
		"success":     success,
	}
	
	if err != nil {
		fields["error"] = err.Error()
	}
	
	if success {
		ls.logger.WithFields(fields).Info("File Upload Success")
	} else {
		ls.logger.WithFields(fields).Error("File Upload Failure")
	}
}

// LogPerformance logs performance metrics
func (ls *LoggerService) LogPerformance(ctx context.Context, operation string, duration time.Duration, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	
	fields["operation"] = operation
	fields["duration_ms"] = duration.Milliseconds()
	
	if duration > time.Second {
		ls.logger.WithFields(fields).Warn("Performance Warning")
	} else {
		ls.logger.WithFields(fields).Debug("Performance Metric")
	}
}
