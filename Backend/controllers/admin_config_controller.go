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

// GetConfigsByCategory retrieves admin configurations by category
// @Summary Get configurations by category
// @Description Retrieve all active admin configurations for a specific category
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param category path string true "Configuration category"
// @Success 200 {object} views.Response{data=[]models.AdminConfig}
// @Failure 400 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/category/{category} [get]
func (c *AdminConfigController) GetConfigsByCategory(ctx *gin.Context) {
	category := ctx.Param("category")
	if category == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Category is required", "Category parameter cannot be empty"))
		return
	}

	configs, err := c.service.GetByCategory(category)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve configurations", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configurations retrieved successfully", configs))
}

// GetConfigByKey retrieves a specific admin configuration by key
// @Summary Get configuration by key
// @Description Retrieve a specific admin configuration by its key
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param key path string true "Configuration key"
// @Success 200 {object} views.Response{data=models.AdminConfig}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/key/{key} [get]
func (c *AdminConfigController) GetConfigByKey(ctx *gin.Context) {
	key := ctx.Param("key")
	if key == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Key is required", "Key parameter cannot be empty"))
		return
	}

	config, err := c.service.GetByKey(key)
	if err != nil {
		if err.Error() == "record not found" {
			ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Configuration not found", "No configuration found with the specified key"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve configuration", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configuration retrieved successfully", config))
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

// CreateConfig creates a new admin configuration
// @Summary Create new configuration
// @Description Create a new admin configuration
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param config body models.AdminConfig true "Configuration data"
// @Success 201 {object} views.Response{data=models.AdminConfig}
// @Failure 400 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs [post]
func (c *AdminConfigController) CreateConfig(ctx *gin.Context) {
	var config models.AdminConfig
	if err := ctx.ShouldBindJSON(&config); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	if err := c.service.Create(&config); err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create configuration", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Configuration created successfully", config))
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

// DeleteConfig soft deletes an admin configuration
// @Summary Delete configuration
// @Description Soft delete an admin configuration
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param id path int true "Configuration ID"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/{id} [delete]
func (c *AdminConfigController) DeleteConfig(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid ID", "ID must be a valid integer"))
		return
	}

	if err := c.service.Delete(uint(id)); err != nil {
		if err.Error() == "record not found" {
			ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Configuration not found", "No configuration found with the specified ID"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete configuration", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configuration deleted successfully", nil))
}

// SetConfigValue sets the value of a configuration by key
// @Summary Set configuration value
// @Description Set the value of a configuration by its key
// @Tags Admin Config
// @Accept json
// @Produce json
// @Param key path string true "Configuration key"
// @Param request body map[string]string true "Value to set"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/key/{key}/value [put]
func (c *AdminConfigController) SetConfigValue(ctx *gin.Context) {
	key := ctx.Param("key")
	if key == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Key is required", "Key parameter cannot be empty"))
		return
	}

	var request map[string]string
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	value, exists := request["value"]
	if !exists {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Value is required", "Value field is required in request body"))
		return
	}

	if err := c.service.SetValueByKey(key, value); err != nil {
		if err.Error() == "record not found" {
			ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Configuration not found", "No configuration found with the specified key"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update configuration value", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configuration value updated successfully", gin.H{"key": key, "value": value}))
}

// ResetToDefaults resets all configurations to their default values
// @Summary Reset to defaults
// @Description Reset all configurations to their default values
// @Tags Admin Config
// @Accept json
// @Produce json
// @Success 200 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/reset [post]
func (c *AdminConfigController) ResetToDefaults(ctx *gin.Context) {
	if err := c.service.ResetToDefaults(); err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to reset configurations", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Configurations reset to defaults successfully", nil))
}

// InitializeDefaults initializes default configurations
// @Summary Initialize defaults
// @Description Initialize default configurations if they don't exist
// @Tags Admin Config
// @Accept json
// @Produce json
// @Success 200 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/configs/initialize [post]
func (c *AdminConfigController) InitializeDefaults(ctx *gin.Context) {
	if err := c.service.InitializeDefaults(); err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to initialize defaults", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Default configurations initialized successfully", nil))
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
