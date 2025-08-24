package controllers

import (
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type ServiceAreaController struct {
	serviceAreaService *services.ServiceAreaService
}

func NewServiceAreaController() *ServiceAreaController {
	return &ServiceAreaController{
		serviceAreaService: services.NewServiceAreaService(),
	}
}

// CreateServiceArea creates a new service area
// @Summary Create a new service area
// @Description Create a new service area for a service
// @Tags service-areas
// @Accept json
// @Produce json
// @Param service_area body models.CreateServiceAreaRequest true "Service area data"
// @Success 201 {object} views.Response{data=models.ServiceArea}
// @Failure 400 {object} views.Response
// @Router /api/v1/admin/service-areas [post]
func (sac *ServiceAreaController) CreateServiceArea(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.CreateServiceArea panic: %v", r)
		}
	}()

	var req models.CreateServiceAreaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	serviceArea, err := sac.serviceAreaService.CreateServiceArea(&req)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to create service area", err.Error()))
		return
	}

	c.JSON(201, views.CreateSuccessResponse("Service area created successfully", serviceArea))
}

// GetServiceAreaByID gets a service area by ID
// @Summary Get service area by ID
// @Description Get a service area by its ID
// @Tags service-areas
// @Produce json
// @Param id path integer true "Service area ID"
// @Success 200 {object} views.Response{data=models.ServiceArea}
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/service-areas/{id} [get]
func (sac *ServiceAreaController) GetServiceAreaByID(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.GetServiceAreaByID panic: %v", r)
		}
	}()

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service area ID", err.Error()))
		return
	}

	serviceArea, err := sac.serviceAreaService.GetServiceAreaByID(uint(id))
	if err != nil {
		c.JSON(404, views.CreateErrorResponse("Service area not found", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service area retrieved successfully", serviceArea))
}

// GetAllServiceAreas gets all service areas
// @Summary Get all service areas
// @Description Get all service areas for admin interface
// @Tags service-areas
// @Produce json
// @Success 200 {object} views.Response{data=[]models.ServiceArea}
// @Router /api/v1/admin/service-areas [get]
func (sac *ServiceAreaController) GetAllServiceAreas(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.GetAllServiceAreas panic: %v", r)
		}
	}()

	serviceAreas, err := sac.serviceAreaService.GetAllServiceAreas()
	if err != nil {
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve service areas", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service areas retrieved successfully", serviceAreas))
}

// GetServiceAreasByServiceID gets all service areas for a service
// @Summary Get service areas by service ID
// @Description Get all service areas for a specific service
// @Tags service-areas
// @Produce json
// @Param service_id path integer true "Service ID"
// @Success 200 {object} views.Response{data=[]models.ServiceArea}
// @Failure 400 {object} views.Response
// @Router /api/v1/admin/services/{service_id}/service-areas [get]
func (sac *ServiceAreaController) GetServiceAreasByServiceID(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.GetServiceAreasByServiceID panic: %v", r)
		}
	}()

	serviceIDStr := c.Param("service_id")
	serviceID, err := strconv.ParseUint(serviceIDStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}

	serviceAreas, err := sac.serviceAreaService.GetServiceAreasByServiceID(uint(serviceID))
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to get service areas", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service areas retrieved successfully", serviceAreas))
}

// UpdateServiceArea updates a service area
// @Summary Update a service area
// @Description Update an existing service area
// @Tags service-areas
// @Accept json
// @Produce json
// @Param id path integer true "Service area ID"
// @Param service_area body models.UpdateServiceAreaRequest true "Updated service area data"
// @Success 200 {object} views.Response{data=models.ServiceArea}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/service-areas/{id} [put]
func (sac *ServiceAreaController) UpdateServiceArea(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.UpdateServiceArea panic: %v", r)
		}
	}()

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service area ID", err.Error()))
		return
	}

	var req models.UpdateServiceAreaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	serviceArea, err := sac.serviceAreaService.UpdateServiceArea(uint(id), &req)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to update service area", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service area updated successfully", serviceArea))
}

// DeleteServiceArea deletes a service area
// @Summary Delete a service area
// @Description Delete an existing service area
// @Tags service-areas
// @Produce json
// @Param id path integer true "Service area ID"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/service-areas/{id} [delete]
func (sac *ServiceAreaController) DeleteServiceArea(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.DeleteServiceArea panic: %v", r)
		}
	}()

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service area ID", err.Error()))
		return
	}

	err = sac.serviceAreaService.DeleteServiceArea(uint(id))
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to delete service area", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service area deleted successfully", nil))
}

// GetServicesByLocation gets all services available in a specific location
// @Summary Get services by location
// @Description Get all services available in a specific city and state
// @Tags services
// @Produce json
// @Param city query string true "City name"
// @Param state query string true "State name"
// @Success 200 {object} views.Response{data=[]models.Service}
// @Failure 400 {object} views.Response
// @Router /api/v1/services/by-location [get]
func (sac *ServiceAreaController) GetServicesByLocation(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.GetServicesByLocation panic: %v", r)
		}
	}()

	city := c.Query("city")
	state := c.Query("state")

	if city == "" || state == "" {
		c.JSON(400, views.CreateErrorResponse("City and state are required", ""))
		return
	}

	services, err := sac.serviceAreaService.GetServicesByLocation(city, state)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to get services by location", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Services retrieved successfully", services))
}

// CheckServiceAvailability checks if a service is available in a specific location
// @Summary Check service availability
// @Description Check if a service is available in a specific city and state
// @Tags services
// @Produce json
// @Param service_id path integer true "Service ID"
// @Param city query string true "City name"
// @Param state query string true "State name"
// @Success 200 {object} views.Response{data=bool}
// @Failure 400 {object} views.Response
// @Router /api/v1/service-availability/{service_id} [get]
func (sac *ServiceAreaController) CheckServiceAvailability(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.CheckServiceAvailability panic: %v", r)
		}
	}()

	serviceIDStr := c.Param("service_id")
	serviceID, err := strconv.ParseUint(serviceIDStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}

	city := c.Query("city")
	state := c.Query("state")

	if city == "" || state == "" {
		c.JSON(400, views.CreateErrorResponse("City and state are required", ""))
		return
	}

	available, err := sac.serviceAreaService.CheckServiceAvailability(uint(serviceID), city, state)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to check service availability", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service availability checked successfully", available))
}

// GetServiceAreaStats gets service area statistics
// @Summary Get service area statistics
// @Description Get statistics about service areas
// @Tags service-areas
// @Produce json
// @Success 200 {object} views.Response{data=map[string]int64}
// @Failure 400 {object} views.Response
// @Router /api/v1/admin/service-areas/stats [get]
func (sac *ServiceAreaController) GetServiceAreaStats(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaController.GetServiceAreaStats panic: %v", r)
		}
	}()

	stats, err := sac.serviceAreaService.GetServiceAreaStats()
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to get service area stats", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service area stats retrieved successfully", stats))
}
