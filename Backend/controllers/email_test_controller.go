package controllers

import (
	"net/http"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// TestEmail sends a test email (for development only)
// @Summary Test email functionality
// @Description Send a test email to verify SMTP configuration
// @Tags email
// @Produce json
// @Param email query string true "Email address to send test to"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /test-email [post]
func TestEmail(ctx *gin.Context) {
	// Only allow in development environment
	if gin.Mode() == gin.ReleaseMode {
		ctx.JSON(http.StatusForbidden, views.CreateErrorResponse("Forbidden", "Test endpoint not available in production"))
		return
	}

	email := ctx.Query("email")
	if email == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Email required", "Email parameter is required"))
		return
	}

	emailService := services.NewEmailService()

	subject := "Test Email - TREESINDIA"
	body := `
		<html>
		<body>
			<h2>Test Email from TREESINDIA</h2>
			<p>This is a test email to verify that the SMTP configuration is working correctly.</p>
			<p>If you received this email, the email service is properly configured!</p>
			<br>
			<p>Best regards,<br>TREESINDIA Team</p>
		</body>
		</html>
	`

	err := emailService.SendEmail(email, subject, body)
	if err != nil {
		logrus.Errorf("Failed to send test email: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to send email", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Test email sent successfully", gin.H{
		"email":   email,
		"message": "Test email sent successfully",
	}))
}
