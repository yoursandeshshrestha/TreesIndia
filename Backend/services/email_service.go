package services

import (
	"fmt"
	"net/smtp"
	"strconv"
	"treesindia/config"
	"treesindia/models"

	"github.com/sirupsen/logrus"
)

// EmailService handles email notifications
type EmailService struct {
	smtpServer string
	smtpPort   string
	username   string
	password   string
}

// NewEmailService creates a new email service instance
func NewEmailService() *EmailService {
	appConfig := config.LoadConfig()
	
	// Use configuration if available, otherwise use default Hostinger settings
	smtpHost := appConfig.SMTPHost
	if smtpHost == "" {
		smtpHost = "smtp.hostinger.com"
	}
	
	smtpPort := strconv.Itoa(appConfig.SMTPPort)
	if smtpPort == "0" {
		smtpPort = "465"
	}
	
	username := appConfig.SMTPUsername
	if username == "" {
		username = "noreply@treesindiaservices.com"
	}
	
	password := appConfig.SMTPPassword
	if password == "" {
		password = "your_hostinger_email_password"
	}
	
	return &EmailService{
		smtpServer: smtpHost,
		smtpPort:   smtpPort,
		username:   username,
		password:   password,
	}
}

// SendEmail sends an email using SMTP
func (es *EmailService) SendEmail(to, subject, body string) error {
	// Email headers
	headers := make(map[string]string)
	headers["From"] = es.username
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Build email message
	message := ""
	for key, value := range headers {
		message += fmt.Sprintf("%s: %s\r\n", key, value)
	}
	message += "\r\n" + body

	// SMTP authentication
	auth := smtp.PlainAuth("", es.username, es.password, es.smtpServer)

	// Send email
	err := smtp.SendMail(
		es.smtpServer+":"+es.smtpPort,
		auth,
		es.username,
		[]string{to},
		[]byte(message),
	)

	if err != nil {
		logrus.Errorf("Failed to send email to %s: %v", to, err)
		return fmt.Errorf("failed to send email: %v", err)
	}

	logrus.Infof("Email sent successfully to %s", to)
	return nil
}

// SendApplicationSubmittedEmail sends notification when application is submitted
func (es *EmailService) SendApplicationSubmittedEmail(user *models.User, application *models.RoleApplication) error {
	subject := "Role Application Submitted - TREESINDIA"
	
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Application Submitted Successfully</h2>
			<p>Dear %s,</p>
			<p>Your application for <strong>%s</strong> role has been submitted successfully.</p>
			<p><strong>Application Details:</strong></p>
			<ul>
				<li>Application ID: %d</li>
				<li>Requested Role: %s</li>
				<li>Submitted Date: %s</li>
				<li>Status: %s</li>
			</ul>
			<p>Our admin team will review your application and get back to you within 2-3 business days.</p>
			<p>You will receive an email notification once your application is reviewed.</p>
			<br>
			<p>Best regards,<br>TREESINDIA Team</p>
		</body>
		</html>
	`, user.Name, application.RequestedRole, application.ID, application.RequestedRole, application.SubmittedAt.Format("January 2, 2006"), application.Status)

	return es.SendEmail(*user.Email, subject, body)
}

// SendBrokerApplicationSubmittedEmail sends notification when broker application is submitted
func (es *EmailService) SendBrokerApplicationSubmittedEmail(user *models.User, application *models.RoleApplication) error {
	subject := "Broker Application Submitted - TREESINDIA"
	
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Broker Application Submitted Successfully</h2>
			<p>Dear %s,</p>
			<p>Your broker application has been submitted successfully.</p>
			<p><strong>Application Details:</strong></p>
			<ul>
				<li>Application ID: %d</li>
				<li>Submitted Date: %s</li>
				<li>Status: %s</li>
			</ul>
			<p>Our admin team will review your broker credentials and get back to you within 2-3 business days.</p>
			<p>Once approved, you'll be able to list properties and manage real estate transactions.</p>
			<br>
			<p>Best regards,<br>TREESINDIA Team</p>
		</body>
		</html>
	`, user.Name, application.ID, application.SubmittedAt.Format("January 2, 2006"), application.Status)

	return es.SendEmail(*user.Email, subject, body)
}

// SendWorkerApplicationSubmittedEmail sends notification when worker application is submitted
func (es *EmailService) SendWorkerApplicationSubmittedEmail(user *models.User, application *models.RoleApplication) error {
	subject := "Worker Application Submitted - TREESINDIA"
	
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Worker Application Submitted Successfully</h2>
			<p>Dear %s,</p>
			<p>Your worker application has been submitted successfully.</p>
			<p><strong>Application Details:</strong></p>
			<ul>
				<li>Application ID: %d</li>
				<li>Submitted Date: %s</li>
				<li>Status: %s</li>
			</ul>
			<p>Our admin team will review your documents and skills, then get back to you within 2-3 business days.</p>
			<p>Once approved, you'll be able to accept service bookings and start earning.</p>
			<br>
			<p>Best regards,<br>TREESINDIA Team</p>
		</body>
		</html>
	`, user.Name, application.ID, application.SubmittedAt.Format("January 2, 2006"), application.Status)

	return es.SendEmail(*user.Email, subject, body)
}

// SendApplicationApprovedEmail sends notification when application is approved
func (es *EmailService) SendApplicationApprovedEmail(user *models.User, application *models.RoleApplication) error {
	subject := "Role Application Approved - TREESINDIA"
	
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Congratulations! Your Application is Approved</h2>
			<p>Dear %s,</p>
			<p>Great news! Your application for <strong>%s</strong> role has been approved.</p>
			<p><strong>Application Details:</strong></p>
			<ul>
				<li>Application ID: %d</li>
				<li>Approved Role: %s</li>
				<li>Approved Date: %s</li>
			</ul>
			<p>You can now access %s-specific features in the TREESINDIA app.</p>
			<p>Welcome to the TREESINDIA family!</p>
			<br>
			<p>Best regards,<br>TREESINDIA Team</p>
		</body>
		</html>
	`, user.Name, application.RequestedRole, application.ID, application.RequestedRole, application.ReviewedAt.Format("January 2, 2006"), application.RequestedRole)

	return es.SendEmail(*user.Email, subject, body)
}

// SendApplicationRejectedEmail sends notification when application is rejected
func (es *EmailService) SendApplicationRejectedEmail(user *models.User, application *models.RoleApplication) error {
	subject := "Role Application Update - TREESINDIA"
	
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Application Status Update</h2>
			<p>Dear %s,</p>
			<p>Your application for <strong>%s</strong> role has been reviewed.</p>
			<p><strong>Application Details:</strong></p>
			<ul>
				<li>Application ID: %d</li>
				<li>Requested Role: %s</li>
				<li>Status: %s</li>
				<li>Reviewed Date: %s</li>
			</ul>
			<p><strong>Admin Notes:</strong></p>
			<p>%s</p>
			<p>You can submit a new application after addressing the feedback provided.</p>
			<br>
			<p>Best regards,<br>TREESINDIA Team</p>
		</body>
		</html>
	`, user.Name, application.RequestedRole, application.ID, application.RequestedRole, application.Status, application.ReviewedAt.Format("January 2, 2006"), application.AdminNotes)

	return es.SendEmail(*user.Email, subject, body)
}

// SendAdminNotificationEmail sends notification to admin about new application
func (es *EmailService) SendAdminNotificationEmail(adminEmail string, application *models.RoleApplication, user *models.User) error {
	subject := "New Role Application - TREESINDIA Admin"
	
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>New Role Application Received</h2>
			<p>A new role application has been submitted and requires your review.</p>
			<p><strong>Application Details:</strong></p>
			<ul>
				<li>Application ID: %d</li>
				<li>User Name: %s</li>
				<li>User Email: %s</li>
				<li>User Phone: %s</li>
				<li>Requested Role: %s</li>
				<li>Submitted Date: %s</li>
			</ul>
			<p>Please log in to the admin dashboard to review this application.</p>
			<br>
			<p>Best regards,<br>TREESINDIA System</p>
		</body>
		</html>
	`, application.ID, user.Name, *user.Email, user.Phone, application.RequestedRole, application.SubmittedAt.Format("January 2, 2006"))

	return es.SendEmail(adminEmail, subject, body)
}
