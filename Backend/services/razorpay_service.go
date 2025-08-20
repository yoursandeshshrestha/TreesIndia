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
	req.Header.Set("Authorization", "Basic "+rs.getBasicAuth())
	
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

	// Debug: Log signature comparison
	fmt.Printf("Payment Verification Debug:\n")
	fmt.Printf("OrderID: %s\n", orderID)
	fmt.Printf("PaymentID: %s\n", paymentID)
	fmt.Printf("Signature String: %s\n", signatureString)
	fmt.Printf("Expected Signature (Hex): %s\n", expectedSignatureHex)
	fmt.Printf("Received Signature: %s\n", signature)
	fmt.Printf("Signatures Match: %v\n", expectedSignatureHex == signature)

	// Compare signatures (both should be in hex format)
	return expectedSignatureHex == signature, nil
}

// getBasicAuth returns Basic Auth header value
func (rs *RazorpayService) getBasicAuth() string {
	auth := rs.keyID + ":" + rs.keySecret
	return base64.StdEncoding.EncodeToString([]byte(auth))
}

// VerifyWebhookSignature verifies webhook signature
func (rs *RazorpayService) VerifyWebhookSignature(body []byte, signature string) bool {
	// Create expected signature
	expectedSignature := hmac.New(sha256.New, []byte(rs.keySecret))
	expectedSignature.Write(body)
	expectedSignatureHex := hex.EncodeToString(expectedSignature.Sum(nil))
	
	return expectedSignatureHex == signature
}

// ParseWebhookPayload parses webhook payload
func (rs *RazorpayService) ParseWebhookPayload(body []byte) (map[string]interface{}, error) {
	var webhookData map[string]interface{}
	if err := json.Unmarshal(body, &webhookData); err != nil {
		return nil, fmt.Errorf("failed to parse webhook payload: %w", err)
	}
	return webhookData, nil
}

// GetPaymentDetails gets payment details
func (rs *RazorpayService) GetPaymentDetails(paymentID string) (map[string]interface{}, error) {
	// Create HTTP request
	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.razorpay.com/v1/payments/%s", paymentID), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Authorization", "Basic "+rs.getBasicAuth())
	
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
	status, ok := paymentDetails["status"].(string)
	if !ok {
		return false
	}
	return status == "captured"
}

// GetPaymentAmount gets payment amount
func (rs *RazorpayService) GetPaymentAmount(paymentDetails map[string]interface{}) (float64, error) {
	amount, ok := paymentDetails["amount"].(float64)
	if !ok {
		return 0, fmt.Errorf("invalid amount format")
	}
	return amount / 100, nil // Convert from paise to rupees
}

// VerifyPaymentSignature verifies payment signature
func (rs *RazorpayService) VerifyPaymentSignature(orderID, paymentID, signature string) bool {
	// Create signature string
	signatureString := orderID + "|" + paymentID
	
	// Create expected signature
	expectedSignature := hmac.New(sha256.New, []byte(rs.keySecret))
	expectedSignature.Write([]byte(signatureString))
	expectedSignatureHex := hex.EncodeToString(expectedSignature.Sum(nil))
	
	return expectedSignatureHex == signature
}
