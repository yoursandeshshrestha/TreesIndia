package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

// ExotelService handles Exotel API interactions
type ExotelService struct {
	accountSid   string
	apiKey       string
	apiToken     string
	subDomain    string
	httpClient   *http.Client
	exoPhones    []string // Pool of ExoPhone numbers for rotation
	currentIndex int      // Current index for rotation
}

// ExotelCallResponse represents the response from Exotel call API
type ExotelCallResponse struct {
	CallID string `json:"CallSid"`
	Status string `json:"Status"`
}

// ExotelCallDetails represents call details from Exotel
type ExotelCallDetails struct {
	CallID     string `json:"CallSid"`
	Status     string `json:"Status"`
	Duration   string `json:"Duration"`
	StartTime  string `json:"StartTime"`
	EndTime    string `json:"EndTime"`
	From       string `json:"From"`
	To         string `json:"To"`
	Direction  string `json:"Direction"`
}

// ExotelAccountBalance represents account balance response
type ExotelAccountBalance struct {
	Balance string `json:"balance"`
}

// NewExotelService creates a new Exotel service instance
func NewExotelService() *ExotelService {
	accountSid := os.Getenv("EXOTEL_ACCOUNT_SID")
	apiKey := os.Getenv("EXOTEL_API_KEY")
	apiToken := os.Getenv("EXOTEL_API_TOKEN")
	subDomain := os.Getenv("EXOTEL_SUB_DOMAIN")
	exoPhonesStr := os.Getenv("EXOTEL_EXOPHONE_NUMBERS")

	if accountSid == "" || apiKey == "" || apiToken == "" || subDomain == "" || exoPhonesStr == "" {
		logrus.Warn("Exotel credentials or ExoPhone numbers not configured")
		return nil
	}

	// Parse ExoPhone numbers from environment variable (comma-separated)
	exoPhones := strings.Split(exoPhonesStr, ",")
	// Trim whitespace from each number
	for i, phone := range exoPhones {
		exoPhones[i] = strings.TrimSpace(phone)
	}

	httpClient := &http.Client{
		Timeout: 30 * time.Second,
	}

	return &ExotelService{
		accountSid:   accountSid,
		apiKey:       apiKey,
		apiToken:     apiToken,
		subDomain:    subDomain,
		httpClient:   httpClient,
		exoPhones:    exoPhones,
		currentIndex: 0,
	}
}


// InitiateCall initiates a call between two parties using Exotel's Connect API
func (es *ExotelService) InitiateCall(fromPhone, toPhone string) (string, error) {
	if es.httpClient == nil {
		return "", errors.New("Exotel service not configured")
	}

	// Get a rotated ExoPhone number for caller ID
	callerID := es.getRotatedExoPhone()

	// Exotel Connect API endpoint for making calls (with authentication in URL)
	url := fmt.Sprintf("https://%s:%s@%s/v1/Accounts/%s/Calls/connect", es.apiKey, es.apiToken, es.subDomain, es.accountSid)

	// Prepare JSON data for Exotel Connect API
	requestData := map[string]string{
		"From":     fromPhone,  // Customer's real number
		"To":       toPhone,    // Worker's real number
		"CallerId": callerID,   // Rotated ExoPhone as caller ID
		"CallType": "trans",    // Transactional call
		"TimeLimit": "3600",    // 1 hour time limit
		"TimeOut":  "30",       // 30 seconds timeout
		"Record":   "false",    // Don't record calls
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

	// Make the request
	resp, err := es.httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Failed to initiate Exotel call from %s to %s: %v", fromPhone, toPhone, err)
		return "", fmt.Errorf("failed to initiate call: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var callResponse ExotelCallResponse
	if err := json.NewDecoder(resp.Body).Decode(&callResponse); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("Exotel API error: status %d", resp.StatusCode)
	}

	logrus.Infof("Initiated Exotel call: %s", callResponse.CallID)
	return callResponse.CallID, nil
}


// GetCallDetails retrieves call details from Exotel
func (es *ExotelService) GetCallDetails(callID string) (*ExotelCallDetails, error) {
	if es.httpClient == nil {
		return nil, errors.New("Exotel service not configured")
	}

	// Exotel API endpoint for fetching call details
	url := fmt.Sprintf("https://%s/v1/Accounts/%s/Calls/%s.json", es.subDomain, es.accountSid, callID)

	// Create HTTP request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.SetBasicAuth(es.apiKey, es.apiToken)

	// Make the request
	resp, err := es.httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Failed to fetch Exotel call details for %s: %v", callID, err)
		return nil, fmt.Errorf("failed to fetch call details: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var callDetails ExotelCallDetails
	if err := json.NewDecoder(resp.Body).Decode(&callDetails); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Exotel API error: status %d", resp.StatusCode)
	}

	return &callDetails, nil
}

// ParseCallDuration parses call duration from Exotel response
func (es *ExotelService) ParseCallDuration(duration string) int {
	if duration == "" {
		return 0
	}

	durationInt, err := strconv.Atoi(duration)
	if err != nil {
		logrus.Errorf("Failed to parse call duration %s: %v", duration, err)
		return 0
	}

	return durationInt
}

// IsServiceAvailable checks if Exotel service is available
func (es *ExotelService) IsServiceAvailable() bool {
	return es.httpClient != nil && es.accountSid != "" && es.subDomain != ""
}

// TestCall makes a test call for development
func (es *ExotelService) TestCall(testPhoneNumber string) (string, error) {
	if es.httpClient == nil {
		return "", errors.New("Exotel service not configured")
	}

	// Exotel Connect API endpoint for making calls (with authentication in URL)
	url := fmt.Sprintf("https://%s:%s@%s/v1/Accounts/%s/Calls/connect", es.apiKey, es.apiToken, es.subDomain, es.accountSid)

	// Get a rotated ExoPhone number for caller ID
	callerID := es.getRotatedExoPhone()

	// Prepare JSON data for Exotel Connect API
	requestData := map[string]string{
		"From":     callerID,        // Use rotated ExoPhone as From number
		"To":       testPhoneNumber,
		"CallerId": callerID,        // Use rotated ExoPhone as caller ID
		"CallType": "trans",         // Transactional call
		"TimeLimit": "60",           // 1 minute for testing
		"TimeOut":  "30",            // 30 seconds timeout
		"Record":   "false",         // Don't record calls
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

	// Make the request
	resp, err := es.httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Failed to make test call to %s: %v", testPhoneNumber, err)
		return "", fmt.Errorf("failed to make test call: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var callResponse ExotelCallResponse
	if err := json.NewDecoder(resp.Body).Decode(&callResponse); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("Exotel API error: status %d", resp.StatusCode)
	}

	logrus.Infof("Test call initiated: %s", callResponse.CallID)
	return callResponse.CallID, nil
}

// TestCallWithParams makes a test call with custom parameters
func (es *ExotelService) TestCallWithParams(from, to, callerID string) (string, error) {
	if es.httpClient == nil {
		return "", errors.New("Exotel service not configured")
	}

	// Exotel Connect API endpoint for making calls (with authentication in URL)
	url := fmt.Sprintf("https://%s:%s@%s/v1/Accounts/%s/Calls/connect", es.apiKey, es.apiToken, es.subDomain, es.accountSid)

	// Prepare JSON data for Exotel Connect API
	requestData := map[string]string{
		"From":     from,            // Custom from number
		"To":       to,              // Custom to number
		"CallerId": callerID,        // Custom caller ID
		"CallType": "trans",         // Transactional call
		"TimeLimit": "60",           // 1 minute for testing
		"TimeOut":  "30",            // 30 seconds timeout
		"Record":   "false",         // Don't record calls
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

	// Make the request
	resp, err := es.httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Failed to make test call from %s to %s: %v", from, to, err)
		return "", fmt.Errorf("failed to make test call: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var callResponse ExotelCallResponse
	if err := json.NewDecoder(resp.Body).Decode(&callResponse); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("Exotel API error: status %d", resp.StatusCode)
	}

	logrus.Infof("Test call initiated from %s to %s with caller ID %s: %s", from, to, callerID, callResponse.CallID)
	return callResponse.CallID, nil
}

// GetAccountBalance gets the Exotel account balance
func (es *ExotelService) GetAccountBalance() (string, error) {
	if es.httpClient == nil {
		return "", errors.New("Exotel service not configured")
	}

	// Exotel API endpoint for account balance
	url := fmt.Sprintf("https://%s/v1/Accounts/%s/Balance.json", es.subDomain, es.accountSid)

	// Create HTTP request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.SetBasicAuth(es.apiKey, es.apiToken)

	// Make the request
	resp, err := es.httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Failed to fetch Exotel account balance: %v", err)
		return "", fmt.Errorf("failed to fetch account balance: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var balanceResponse ExotelAccountBalance
	if err := json.NewDecoder(resp.Body).Decode(&balanceResponse); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Exotel API error: status %d", resp.StatusCode)
	}

	return balanceResponse.Balance, nil
}

// getRotatedExoPhone returns the next ExoPhone number in rotation
func (es *ExotelService) getRotatedExoPhone() string {
	// Get current number and increment index
	phone := es.exoPhones[es.currentIndex]
	es.currentIndex = (es.currentIndex + 1) % len(es.exoPhones)
	
	logrus.Infof("Using ExoPhone: %s (index: %d)", phone, es.currentIndex)
	return phone
}

