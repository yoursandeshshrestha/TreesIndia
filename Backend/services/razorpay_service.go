package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)



type RazorpayService struct {
	keyID     string
	keySecret string
}

func NewRazorpayService() *RazorpayService {
	return &RazorpayService{
		keyID:     os.Getenv("RAZORPAY_KEY_ID"),
		keySecret: os.Getenv("RAZORPAY_KEY_SECRET"),
	}
}

// CreateOrder creates a Razorpay order
func (rs *RazorpayService) CreateOrder(amount float64, receipt string, notes string) (map[string]interface{}, error) {
	// Check if Razorpay is configured
	if rs.keyID == "" || rs.keySecret == "" {
		return nil, fmt.Errorf("razorpay is not configured - missing API keys")
	}
	
	// Convert amount to paise (Razorpay expects amount in smallest currency unit)
	amountInPaise := int64(amount * 100)
	
	// Prepare request payload
	payload := map[string]interface{}{
		"amount":   amountInPaise,
		"currency": "INR",
		"receipt":  receipt,
		"notes": map[string]string{
			"description": notes,
		},
	}
	
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}
	
	// Create HTTP request
	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	auth := rs.getBasicAuth()
	if auth == "" {
		return nil, fmt.Errorf("razorpay is not configured - missing API keys")
	}
	req.Header.Set("Authorization", "Basic "+auth)
	
	// Make request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("razorpay API error: %s", string(body))
	}
	
	// Parse response
	var orderResponse map[string]interface{}
	if err := json.Unmarshal(body, &orderResponse); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}
	
	return map[string]interface{}{
		"id":       orderResponse["id"].(string),
		"amount":   float64(amountInPaise),
		"currency": "INR",
		"receipt":  receipt,
		"key_id":   rs.keyID,
	}, nil
}

// VerifyPayment verifies Razorpay payment signature
func (rs *RazorpayService) VerifyPayment(paymentID, orderID, signature string) (bool, error) {
	// Debug: Check if keys are loaded
	if rs.keySecret == "" {
		return false, fmt.Errorf("razorpay key secret is not configured")
	}
	
	// Create signature string
	signatureString := orderID + "|" + paymentID

	// Verify signature using HMAC-SHA256
	expectedSignature := hmac.New(sha256.New, []byte(rs.keySecret))
	expectedSignature.Write([]byte(signatureString))
	expectedSignatureHex := hex.EncodeToString(expectedSignature.Sum(nil))

	// Debug: Log signature comparison (remove in production)
	fmt.Printf("Debug: OrderID=%s, PaymentID=%s\n", orderID, paymentID)
	fmt.Printf("Debug: Expected signature=%s\n", expectedSignatureHex)
	fmt.Printf("Debug: Received signature=%s\n", signature)
	fmt.Printf("Debug: Signatures match=%t\n", expectedSignatureHex == signature)

	// Compare signatures (both should be in hex format)
	return expectedSignatureHex == signature, nil
}

// getBasicAuth returns Basic Auth header value
func (rs *RazorpayService) getBasicAuth() string {
	if rs.keyID == "" || rs.keySecret == "" {
		return ""
	}
	auth := rs.keyID + ":" + rs.keySecret
	return base64.StdEncoding.EncodeToString([]byte(auth))
}

// VerifyWebhookSignature verifies webhook signature
func (rs *RazorpayService) VerifyWebhookSignature(body []byte, signature string) bool {
	// Check if Razorpay is configured
	if rs.keySecret == "" {
		return false
	}
	
	// Create expected signature
	expectedSignature := hmac.New(sha256.New, []byte(rs.keySecret))
	expectedSignature.Write(body)
	expectedSignatureHex := hex.EncodeToString(expectedSignature.Sum(nil))
	
	return expectedSignatureHex == signature
}

// ParseWebhookPayload parses webhook payload
func (rs *RazorpayService) ParseWebhookPayload(body []byte) (map[string]interface{}, error) {
	// Check if Razorpay is configured
	if rs.keySecret == "" {
		return nil, fmt.Errorf("razorpay is not configured - missing API keys")
	}
	
	var webhookData map[string]interface{}
	if err := json.Unmarshal(body, &webhookData); err != nil {
		return nil, fmt.Errorf("failed to parse webhook payload: %w", err)
	}
	return webhookData, nil
}

// GetPaymentDetails gets payment details
func (rs *RazorpayService) GetPaymentDetails(paymentID string) (map[string]interface{}, error) {
	// Check if Razorpay is configured
	if rs.keyID == "" || rs.keySecret == "" {
		return nil, fmt.Errorf("razorpay is not configured - missing API keys")
	}
	
	// Create HTTP request
	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.razorpay.com/v1/payments/%s", paymentID), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	auth := rs.getBasicAuth()
	if auth == "" {
		return nil, fmt.Errorf("razorpay is not configured - missing API keys")
	}
	req.Header.Set("Authorization", "Basic "+auth)
	
	// Make request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("razorpay API error: %s", string(body))
	}
	
	// Parse response
	var paymentDetails map[string]interface{}
	if err := json.Unmarshal(body, &paymentDetails); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}
	
	return paymentDetails, nil
}

// IsPaymentSuccessful checks if payment was successful
func (rs *RazorpayService) IsPaymentSuccessful(paymentDetails map[string]interface{}) bool {
	// Check if Razorpay is configured
	if rs.keySecret == "" {
		return false
	}
	
	status, ok := paymentDetails["status"].(string)
	if !ok {
		return false
	}
	return status == "captured"
}

// GetPaymentAmount gets payment amount
func (rs *RazorpayService) GetPaymentAmount(paymentDetails map[string]interface{}) (float64, error) {
	// Check if Razorpay is configured
	if rs.keySecret == "" {
		return 0, fmt.Errorf("razorpay is not configured - missing API keys")
	}
	
	amount, ok := paymentDetails["amount"].(float64)
	if !ok {
		return 0, fmt.Errorf("invalid amount format")
	}
	return amount / 100, nil // Convert from paise to rupees
}

// VerifyPaymentSignature verifies payment signature
func (rs *RazorpayService) VerifyPaymentSignature(orderID, paymentID, signature string) bool {
	// Check if Razorpay is configured
	if rs.keySecret == "" {
		return false
	}
	
	// Create signature string
	signatureString := orderID + "|" + paymentID
	
	// Create expected signature
	expectedSignature := hmac.New(sha256.New, []byte(rs.keySecret))
	expectedSignature.Write([]byte(signatureString))
	expectedSignatureHex := hex.EncodeToString(expectedSignature.Sum(nil))
	
	return expectedSignatureHex == signature
}
