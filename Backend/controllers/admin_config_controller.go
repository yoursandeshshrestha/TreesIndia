package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// AdminConfigController handles HTTP requests for admin configurations
type AdminConfigController struct {
	service *services.AdminConfigService
}

// NewAdminConfigController creates a new admin config controller
func NewAdminConfigController() *AdminConfigController {
	return &AdminConfigController{
		service: services.NewAdminConfigService(),
	}
}

// GetAllConfigs retrieves all admin configurations
// @Summary Get all admin configurations
// @Description Retrieve all active admin configurations
// @Tags Admin Config
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=[]models.AdminConfig}
// @Failure 500 {object} views.Response
// @Router /admin/configs [get]
func (c *AdminConfigController) GetAllConfigs(ctx *gin.Context) {
	configs, err := c.service.GetAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve configurations", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configurations retrieved successfully", configs))
}

// GetConfigByID retrieves a specific admin configuration by ID
// @Summary Get configuration by ID
// @Description Retrieve a specific admin configuration by its ID
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param id path int true "Configuration ID"
// @Success 200 {object} views.Response{data=models.AdminConfig}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/{id} [get]
func (c *AdminConfigController) GetConfigByID(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid ID", "ID must be a valid integer"))
		return
	}

	config, err := c.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "record not found" {
			ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Configuration not found", "No configuration found with the specified ID"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve configuration", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configuration retrieved successfully", config))
}

// UpdateConfig updates an existing admin configuration
// @Summary Update configuration
// @Description Update an existing admin configuration
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param id path int true "Configuration ID"
// @Param config body models.AdminConfig true "Updated configuration data"
// @Success 200 {object} views.Response{data=models.AdminConfig}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/{id} [put]
func (c *AdminConfigController) UpdateConfig(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid ID", "ID must be a valid integer"))
		return
	}

	var config models.AdminConfig
	if err := ctx.ShouldBindJSON(&config); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	config.ID = uint(id)

	if err := c.service.Update(&config); err != nil {
		if err.Error() == "record not found" {
			ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Configuration not found", "No configuration found with the specified ID"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update configuration", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configuration updated successfully", config))
}



// GetConfigMap retrieves all configurations as a key-value map
// @Summary Get configuration map
// @Description Retrieve all configurations as a key-value map
// @Tags Admin Config
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=map[string]string}
// @Failure 500 {object} views.Response
// @Router /admin/configs/map [get]
func (c *AdminConfigController) GetConfigMap(ctx *gin.Context) {
	configMap, err := c.service.GetConfigMap()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve configuration map", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configuration map retrieved successfully", configMap))
}
