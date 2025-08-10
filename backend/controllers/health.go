package controllers

import (
	"net/http"
	"runtime"
	"time"
	"treesindia/config"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// HealthCheck godoc
// @Summary Health check
// @Description Get server health status and system information
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Server health information"
// @Router /health [get]
func HealthCheck(c *gin.Context) {
	// Get system info
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Get database status
	dbStatus := "unknown"
	if config.GetDB() != nil {
		dbStatus = "connected"
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse(
		"Server is healthy",
		gin.H{
			"status":        "OK",
			"version":       "1.0.0",
			"environment":   config.GetEnv(),
			"timestamp":     time.Now().UTC().Format(time.RFC3339),
			"uptime":        time.Since(appStartTime).String(),
			"database":      dbStatus,
			"system": gin.H{
				"go_version":    runtime.Version(),
				"platform":      runtime.GOOS + "/" + runtime.GOARCH,
				"cpu_count":     runtime.NumCPU(),
				"goroutines":    runtime.NumGoroutine(),
				"memory_usage": gin.H{
					"alloc_mb":     bToMb(m.Alloc),
					"total_alloc_mb": bToMb(m.TotalAlloc),
					"sys_mb":        bToMb(m.Sys),
					"num_gc":        m.NumGC,
				},
			},
			
		},
	))
}

// AppInfo godoc
// @Summary Application information
// @Description Get application information and available endpoints
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Application information"
// @Router / [get]
func AppInfo(c *gin.Context) {
	c.JSON(http.StatusOK, views.CreateSuccessResponse(
		"TREESINDIA",
		gin.H{
			"Application":         "TREESINDIA Backend",
			"description":  "Unified digital platform for home services and real estate marketplace",
			"version":      "1.0.0",
			"environment":  config.GetEnv(),
			"documentation": "API documentation available at /swagger/index.html",
			"health":        "GET /api/v1/health",
			
		},
	))
}

// Helper function to convert bytes to MB
func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}

// Track app start time
var appStartTime = time.Now()
