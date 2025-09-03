package controllers

import (
	"net/http"
	"strconv"
	"time"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

type LocationTrackingController struct {
	BaseController
	locationTrackingService *services.LocationTrackingService
}

func NewLocationTrackingController(locationTrackingService *services.LocationTrackingService) *LocationTrackingController {
	return &LocationTrackingController{
		locationTrackingService: locationTrackingService,
	}
}

// StartTracking starts location tracking for a worker's assignment
// @Summary Start location tracking
// @Description Start location tracking for a worker's assignment
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Success 200 {object} views.Response{data=models.TrackingStatusResponse}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /worker/assignments/{id}/start-tracking [post]
func (ltc *LocationTrackingController) StartTracking(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	workerID := ltc.GetUserID(c)

	trackingStatus, err := ltc.locationTrackingService.StartTracking(uint(workerID), uint(assignmentID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": trackingStatus,
		"message": "Location tracking started successfully",
	})
}

// UpdateLocation updates the worker's current location
// @Summary Update worker location
// @Description Update the worker's current location during assignment
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Param location body models.LocationUpdate true "Location data"
// @Success 200 {object} views.Response{data=string}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /worker/assignments/{id}/update-location [post]
func (ltc *LocationTrackingController) UpdateLocation(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	var locationUpdate models.LocationUpdate
	if err := c.ShouldBindJSON(&locationUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location data"})
		return
	}

	workerID := ltc.GetUserID(c)

	err = ltc.locationTrackingService.UpdateLocation(
		uint(workerID),
		uint(assignmentID),
		locationUpdate.Latitude,
		locationUpdate.Longitude,
		locationUpdate.Accuracy,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Location updated successfully",
	})
}

// StopTracking stops location tracking for a worker's assignment
// @Summary Stop location tracking
// @Description Stop location tracking for a worker's assignment
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Success 200 {object} views.Response{data=string}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /worker/assignments/{id}/stop-tracking [post]
func (ltc *LocationTrackingController) StopTracking(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	workerID := ltc.GetUserID(c)

	err = ltc.locationTrackingService.StopTracking(uint(workerID), uint(assignmentID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Location tracking stopped successfully",
	})
}

// GetWorkerLocation gets the current location of a worker for a specific assignment
// @Summary Get worker location
// @Description Get the current location of a worker for a specific assignment
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Success 200 {object} views.Response{data=models.WorkerLocationResponse}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /assignments/{id}/worker-location [get]
func (ltc *LocationTrackingController) GetWorkerLocation(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	location, err := ltc.locationTrackingService.GetWorkerLocation(uint(assignmentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": location,
	})
}

// GetWorkerLocationByBooking gets the current location of a worker for a specific booking
// @Summary Get worker location by booking
// @Description Get the current location of a worker for a specific booking
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} views.Response{data=models.WorkerLocationResponse}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /bookings/{id}/worker-location [get]
func (ltc *LocationTrackingController) GetWorkerLocationByBooking(c *gin.Context) {
	_, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get assignment ID from booking
	// This would require a service method to get assignment by booking ID
	// For now, we'll return an error
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}

// GetCustomerLocation gets the customer location for a specific assignment (workers only)
// @Summary Get customer location
// @Description Get the customer location for a specific assignment (workers only)
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Success 200 {object} views.Response{data=models.CustomerLocationResponse}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /worker/assignments/{id}/customer-location [get]
func (ltc *LocationTrackingController) GetCustomerLocation(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	workerID := ltc.GetUserID(c)

	customerLocation, err := ltc.locationTrackingService.GetCustomerLocation(uint(assignmentID), uint(workerID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": customerLocation,
	})
}

// GetTrackingStatus gets the current tracking status for an assignment
// @Summary Get tracking status
// @Description Get the current tracking status for an assignment
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Success 200 {object} views.Response{data=models.TrackingStatusResponse}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /assignments/{id}/tracking-status [get]
func (ltc *LocationTrackingController) GetTrackingStatus(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	trackingStatus, err := ltc.locationTrackingService.GetTrackingStatus(uint(assignmentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": trackingStatus,
	})
}

// HealthCheck checks the health of the location tracking system
// @Summary Location tracking health check
// @Description Check if the location tracking system is working properly
// @Tags Location Tracking
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 500 {object} views.Response
// @Router /health [get]
func (ltc *LocationTrackingController) HealthCheck(c *gin.Context) {
	// Check database connection and table existence
	healthStatus := map[string]interface{}{
		"status": "unknown",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	// Check if worker_locations table exists
	err := ltc.locationTrackingService.CheckSystemHealth()
	if err != nil {
		healthStatus["status"] = "error"
		healthStatus["error"] = err.Error()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Location tracking system unhealthy",
			"details": healthStatus,
		})
		return
	}

	healthStatus["status"] = "healthy"
	healthStatus["message"] = "Location tracking system is working properly"

	c.JSON(http.StatusOK, gin.H{
		"data": healthStatus,
	})
}
