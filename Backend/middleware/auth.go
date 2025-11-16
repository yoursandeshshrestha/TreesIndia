package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware handles JWT authentication
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Check if token starts with "Bearer "
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Parse and validate JWT token
		appConfig := config.LoadConfig()
		parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(appConfig.JWTSecret), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		// Check if token is valid
		if !parsedToken.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := parsedToken.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token claims",
			})
			c.Abort()
			return
		}

		// Check token type (should be access token)
		tokenType, ok := claims["type"].(string)
		if !ok || tokenType != "access" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token type",
			})
			c.Abort()
			return
		}

		// Extract user ID
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid user ID in token",
			})
			c.Abort()
			return
		}
		userID := uint(userIDFloat)

		// Verify user exists and is active
		var user models.User
		if err := database.GetDB().First(&user, userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "User not found",
			})
			c.Abort()
			return
		}

		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Account disabled",
			})
			c.Abort()
			return
		}

		// Extract admin roles from token if present
		adminRoles := make([]string, 0)
		if rawRoles, exists := claims["admin_roles"]; exists {
			switch rolesValue := rawRoles.(type) {
			case []interface{}:
				for _, r := range rolesValue {
					if roleStr, ok := r.(string); ok {
						adminRoles = append(adminRoles, roleStr)
					}
				}
			case []string:
				adminRoles = append(adminRoles, rolesValue...)
			}
		}

		// Set user information in context
		c.Set("user_id", user.ID)
		c.Set("user_type", string(user.UserType)) // Convert to string explicitly
		c.Set("user", user)
		if len(adminRoles) > 0 {
			c.Set("admin_roles", adminRoles)
		}

		c.Next()
	}
}

// AdminMiddleware ensures only admin users can access
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userType := c.GetString("user_type")
		
		if userType != string(models.UserTypeAdmin) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Admin access required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireAdminRoles ensures the user is an admin with at least one of the required admin roles.
// Super admins are always allowed.
func RequireAdminRoles(requiredRoles ...models.AdminRoleCode) gin.HandlerFunc {
	required := make(map[models.AdminRoleCode]struct{}, len(requiredRoles))
	for _, role := range requiredRoles {
		required[role] = struct{}{}
	}

	return func(c *gin.Context) {
		// Must be an admin user_type
		if c.GetString("user_type") != string(models.UserTypeAdmin) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Admin access required",
			})
			c.Abort()
			return
		}

		// Read admin roles from context
		rawRoles, exists := c.Get("admin_roles")
		if !exists {
			// If no specific roles are required, allow any admin user
			if len(requiredRoles) == 0 {
				c.Next()
				return
			}
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Admin role required",
			})
			c.Abort()
			return
		}

		roleSlice, ok := rawRoles.([]string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Invalid admin roles in context",
			})
			c.Abort()
			return
		}

		// Super admin is always allowed
		for _, roleCode := range roleSlice {
			if roleCode == string(models.AdminRoleSuperAdmin) {
				c.Next()
				return
			}
		}

		// If no specific roles required, any admin role is allowed
		if len(requiredRoles) == 0 && len(roleSlice) > 0 {
			c.Next()
			return
		}

		// Check intersection with required roles
		for _, roleCode := range roleSlice {
			if _, ok := required[models.AdminRoleCode(roleCode)]; ok {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Insufficient admin role",
		})
		c.Abort()
	}
}

// WorkerMiddleware ensures only worker users can access
func WorkerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userType := c.GetString("user_type")
		if userType != string(models.UserTypeWorker) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Worker access required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// BrokerMiddleware ensures only broker users can access
func BrokerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userType := c.GetString("user_type")
		if userType != string(models.UserTypeBroker) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Broker access required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// UserOrWorkerMiddleware allows both normal users and workers
func UserOrWorkerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userType := c.GetString("user_type")
		if userType != string(models.UserTypeNormal) && userType != string(models.UserTypeWorker) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "User or worker access required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}


