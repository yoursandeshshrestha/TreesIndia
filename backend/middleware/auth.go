package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"treesindia/config"
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
		parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(config.GetJWTSecret()), nil
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
		if err := config.GetDB().First(&user, userID).Error; err != nil {
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

		// Set user information in context
		c.Set("user_id", user.ID)
		c.Set("user_type", string(user.UserType)) // Convert to string explicitly
		c.Set("user", user)

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

// VerifiedUserMiddleware ensures user has completed KYC verification
func VerifiedUserMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := c.MustGet("user").(models.User)
		
		if user.KYCStatus != models.KYCStatusApproved && user.KYCStatus != models.KYCStatusNotNeeded {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "KYC verification required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
