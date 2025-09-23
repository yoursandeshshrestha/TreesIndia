package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

// CloudShopeService handles CloudShope API interactions for call masking
type CloudShopeService struct {
	apiKey     string
	httpClient *http.Client
}

// CloudShopeCallRequest represents the request structure for CloudShope call API
type CloudShopeCallRequest struct {
	FromNumber   string `json:"from_number"`
	MobileNumber string `json:"mobile_number"`
}

// CloudShopeCallResponse represents the response from CloudShope call API
type CloudShopeCallResponse struct {
	Status int `json:"status"`
	Message string `json:"message"`
	Data struct {
		Mobile string `json:"mobile"`
	} `json:"data"`
}

// NewCloudShopeService creates a new CloudShope service instance
func NewCloudShopeService() *CloudShopeService {
	apiKey := os.Getenv("CLOUDSHOPE_API")
	
	if apiKey == "" {
		logrus.Warn("CloudShope API key not configured")
		return nil
	}

	httpClient := &http.Client{
		Timeout: 30 * time.Second,
	}

	return &CloudShopeService{
		apiKey:     apiKey,
		httpClient: httpClient,
	}
}

// InitiateCall initiates a call between two parties using CloudShope API
func (cs *CloudShopeService) InitiateCall(fromPhone, toPhone string) (string, error) {
	if cs.httpClient == nil {
		return "", errors.New("CloudShope service not configured")
	}

	// CloudShope API endpoint
	url := "https://apiv1.cloudshope.com/api/outboundCall"

	// Prepare request data for CloudShope API
	requestData := CloudShopeCallRequest{
		FromNumber:   fromPhone,
		MobileNumber: toPhone,
	}

	// Create JSON payload
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request data: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", url, strings.NewReader(string(jsonData)))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cs.apiKey)

	// Make the request
	resp, err := cs.httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Failed to initiate CloudShope call from %s to %s: %v", fromPhone, toPhone, err)
		return "", fmt.Errorf("failed to initiate call: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var callResponse CloudShopeCallResponse
	if err := json.NewDecoder(resp.Body).Decode(&callResponse); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("CloudShope API error: status %d, message: %s", resp.StatusCode, callResponse.Message)
	}

	if callResponse.Status != 200 {
		return "", fmt.Errorf("CloudShope API error: %s", callResponse.Message)
	}

	logrus.Infof("Initiated CloudShope call: masked number %s", callResponse.Data.Mobile)
	return callResponse.Data.Mobile, nil
}

// IsServiceAvailable checks if CloudShope service is available
func (cs *CloudShopeService) IsServiceAvailable() bool {
	return cs.httpClient != nil && cs.apiKey != ""
}

// TestCall makes a test call for development
func (cs *CloudShopeService) TestCall(testPhoneNumber string) (string, error) {
	if cs.httpClient == nil {
		return "", errors.New("CloudShope service not configured")
	}

	// Use a test number as from_number for testing
	testFromNumber := "9876543210"
	
	maskedNumber, err := cs.InitiateCall(testFromNumber, testPhoneNumber)
	if err != nil {
		logrus.Errorf("Failed to make test call to %s: %v", testPhoneNumber, err)
		return "", fmt.Errorf("failed to make test call: %w", err)
	}

	logrus.Infof("Test call initiated with masked number: %s", maskedNumber)
	return maskedNumber, nil
}
