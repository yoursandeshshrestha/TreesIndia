package services

import (
	"context"
	"fmt"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

// FCMService handles Firebase Cloud Messaging operations
type FCMService struct {
	client *messaging.Client
	app    *firebase.App
}

// FCMNotification represents a notification to be sent
type FCMNotification struct {
	Title       string            `json:"title"`
	Body        string            `json:"body"`
	Data        map[string]string `json:"data,omitempty"`
	ImageURL    string            `json:"image_url,omitempty"`
	ClickAction string            `json:"click_action,omitempty"`
}

// FCMResponse represents the response from FCM
type FCMResponse struct {
	SuccessCount int      `json:"success_count"`
	FailureCount int      `json:"failure_count"`
	Responses    []string `json:"responses"`
	Errors       []string `json:"errors"`
}

// NewFCMService creates a new FCM service instance
func NewFCMService(serviceAccountPath string, projectID string) (*FCMService, error) {
	opt := option.WithCredentialsFile(serviceAccountPath)
	
	// Create Firebase config with project ID
	firebaseConfig := &firebase.Config{
		ProjectID: projectID,
	}
	
	app, err := firebase.NewApp(context.Background(), firebaseConfig, opt)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}
	
	client, err := app.Messaging(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to initialize FCM client: %w", err)
	}
	
	return &FCMService{
		client: client,
		app:    app,
	}, nil
}

// SendToDevice sends a notification to a specific device
func (f *FCMService) SendToDevice(token string, notification *FCMNotification) (*FCMResponse, error) {
	message := &messaging.Message{
		Token: token,
		Notification: &messaging.Notification{
			Title: notification.Title,
			Body:  notification.Body,
		},
		Data: notification.Data,
		Android: &messaging.AndroidConfig{
			Priority: "high",
			Notification: &messaging.AndroidNotification{
				ClickAction: notification.ClickAction,
				Sound:       "default",
			},
		},
		APNS: &messaging.APNSConfig{
			Payload: &messaging.APNSPayload{
				Aps: &messaging.Aps{
					Alert: &messaging.ApsAlert{
						Title: notification.Title,
						Body:  notification.Body,
					},
					Badge: func() *int { v := 1; return &v }(),
					Sound: "default",
				},
			},
		},
	}

	response, err := f.client.Send(context.Background(), message)
	if err != nil {
		return &FCMResponse{
			SuccessCount: 0,
			FailureCount: 1,
			Errors:       []string{err.Error()},
		}, err
	}

	return &FCMResponse{
		SuccessCount: 1,
		FailureCount: 0,
		Responses:    []string{response},
	}, nil
}

// SendToMultipleDevices sends a notification to multiple devices
func (f *FCMService) SendToMultipleDevices(tokens []string, notification *FCMNotification) (*FCMResponse, error) {
	if len(tokens) == 0 {
		return &FCMResponse{}, nil
	}

	// If only 1 token, use SendToDevice instead of batch
	if len(tokens) == 1 {
		return f.SendToDevice(tokens[0], notification)
	}

	// FCM has a limit of 500 tokens per batch
	const maxBatchSize = 500
	var responses []string
	var errors []string
	successCount := 0
	failureCount := 0

	for i := 0; i < len(tokens); i += maxBatchSize {
		end := i + maxBatchSize
		if end > len(tokens) {
			end = len(tokens)
		}

		batchTokens := tokens[i:end]
		response, err := f.sendBatch(batchTokens, notification)
		if err != nil {
			errors = append(errors, err.Error())
			failureCount += len(batchTokens)
		} else {
			responses = append(responses, response.Responses...)
			successCount += response.SuccessCount
			failureCount += response.FailureCount
			errors = append(errors, response.Errors...)
		}
	}

	return &FCMResponse{
		SuccessCount: successCount,
		FailureCount: failureCount,
		Responses:    responses,
		Errors:       errors,
	}, nil
}

// SendToTopic sends a notification to a topic
func (f *FCMService) SendToTopic(topic string, notification *FCMNotification) (*FCMResponse, error) {
	message := &messaging.Message{
		Topic: topic,
		Notification: &messaging.Notification{
			Title: notification.Title,
			Body:  notification.Body,
		},
		Data: notification.Data,
		Android: &messaging.AndroidConfig{
			Priority: "high",
			Notification: &messaging.AndroidNotification{
				ClickAction: notification.ClickAction,
				Sound:       "default",
			},
		},
		APNS: &messaging.APNSConfig{
			Payload: &messaging.APNSPayload{
				Aps: &messaging.Aps{
					Alert: &messaging.ApsAlert{
						Title: notification.Title,
						Body:  notification.Body,
					},
					Badge: func() *int { v := 1; return &v }(),
					Sound: "default",
				},
			},
		},
	}

	response, err := f.client.Send(context.Background(), message)
	if err != nil {
		return &FCMResponse{
			SuccessCount: 0,
			FailureCount: 1,
			Errors:       []string{err.Error()},
		}, err
	}

	return &FCMResponse{
		SuccessCount: 1,
		FailureCount: 0,
		Responses:    []string{response},
	}, nil
}

// SubscribeToTopic subscribes devices to a topic
func (f *FCMService) SubscribeToTopic(tokens []string, topic string) error {
	if len(tokens) == 0 {
		return nil
	}
	
	// FCM has a limit of 1000 tokens per batch for topic operations
	const maxBatchSize = 1000
	for i := 0; i < len(tokens); i += maxBatchSize {
		end := i + maxBatchSize
		if end > len(tokens) {
			end = len(tokens)
		}
		
		batchTokens := tokens[i:end]
		_, err := f.client.SubscribeToTopic(context.Background(), batchTokens, topic)
		if err != nil {
			return fmt.Errorf("failed to subscribe batch %d-%d to topic %s: %w", i, end-1, topic, err)
		}
	}
	
	return nil
}

// UnsubscribeFromTopic unsubscribes devices from a topic
func (f *FCMService) UnsubscribeFromTopic(tokens []string, topic string) error {
	if len(tokens) == 0 {
		return nil
	}
	
	// FCM has a limit of 1000 tokens per batch for topic operations
	const maxBatchSize = 1000
	for i := 0; i < len(tokens); i += maxBatchSize {
		end := i + maxBatchSize
		if end > len(tokens) {
			end = len(tokens)
		}
		
		batchTokens := tokens[i:end]
		_, err := f.client.UnsubscribeFromTopic(context.Background(), batchTokens, topic)
		if err != nil {
			return fmt.Errorf("failed to unsubscribe batch %d-%d from topic %s: %w", i, end-1, topic, err)
		}
	}
	
	return nil
}

// sendBatch sends a notification to a batch of devices
func (f *FCMService) sendBatch(tokens []string, notification *FCMNotification) (*FCMResponse, error) {
	message := &messaging.MulticastMessage{
		Tokens: tokens,
		Notification: &messaging.Notification{
			Title: notification.Title,
			Body:  notification.Body,
		},
		Data: notification.Data,
		Android: &messaging.AndroidConfig{
			Priority: "high",
			Notification: &messaging.AndroidNotification{
				ClickAction: notification.ClickAction,
				Icon:        "ic_notification",
				Color:       "#4CAF50",
				Sound:       "default",
			},
		},
		APNS: &messaging.APNSConfig{
			Payload: &messaging.APNSPayload{
				Aps: &messaging.Aps{
					Alert: &messaging.ApsAlert{
						Title: notification.Title,
						Body:  notification.Body,
					},
					Badge: func() *int { v := 1; return &v }(),
					Sound: "default",
				},
			},
		},
	}

	response, err := f.client.SendMulticast(context.Background(), message)
	if err != nil {
		return &FCMResponse{
			SuccessCount: 0,
			FailureCount: len(tokens),
			Errors:       []string{err.Error()},
		}, err
	}

	var errors []string
	if response.FailureCount > 0 {
		errors = append(errors, fmt.Sprintf("%d tokens failed to receive notification", response.FailureCount))
	}

	return &FCMResponse{
		SuccessCount: response.SuccessCount,
		FailureCount: response.FailureCount,
		Responses:    []string{fmt.Sprintf("batch processed: %d success, %d failure", response.SuccessCount, response.FailureCount)},
		Errors:       errors,
	}, nil
}

// ValidateToken validates if a device token is still valid
func (f *FCMService) ValidateToken(token string) (bool, error) {
	// Send a silent message to validate the token
	message := &messaging.Message{
		Token: token,
		Data: map[string]string{
			"type": "validation",
		},
		Android: &messaging.AndroidConfig{
			Priority: "normal",
		},
		APNS: &messaging.APNSConfig{
			Headers: map[string]string{
				"apns-priority": "5",
			},
		},
	}
	
	_, err := f.client.Send(context.Background(), message)
	if err != nil {
		// Check if it's a registration token error
		if strings.Contains(err.Error(), "registration-token-not-registered") ||
		   strings.Contains(err.Error(), "invalid-registration-token") ||
		   strings.Contains(err.Error(), "mismatched-credential") ||
		   strings.Contains(err.Error(), "Requested entity was not found") ||
		   strings.Contains(err.Error(), "unregistered") {
			return false, nil
		}
		return false, err
	}
	
	return true, nil
}
