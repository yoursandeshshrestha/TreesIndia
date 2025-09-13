package services

import (
	"errors"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type SimpleConversationService struct {
	conversationRepo *repositories.SimpleConversationRepository
	messageRepo      *repositories.SimpleConversationMessageRepository
	userRepo         *repositories.UserRepository
	wsService        *SimpleConversationWebSocketService
}

func NewSimpleConversationService(
	conversationRepo *repositories.SimpleConversationRepository,
	messageRepo *repositories.SimpleConversationMessageRepository,
	userRepo *repositories.UserRepository,
	wsService *SimpleConversationWebSocketService,
) *SimpleConversationService {
	return &SimpleConversationService{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		userRepo:         userRepo,
		wsService:        wsService,
	}
}

// CreateConversation creates a new conversation
func (s *SimpleConversationService) CreateConversation(req *models.CreateSimpleConversationRequest) (*models.SimpleConversation, error) {
	logrus.Infof("SimpleConversationService.CreateConversation called with user_id: %d", req.UserID)

	// Validate participants exist
	if err := s.validateParticipants(req); err != nil {
		return nil, err
	}

	// Check if conversation already exists
	existingConversation, err := s.conversationRepo.GetByParticipants(
		req.UserID,
		getUintPtr(req.WorkerID),
		getUintPtr(req.AdminID),
	)
	if err == nil && existingConversation != nil {
		logrus.Infof("SimpleConversationService.CreateConversation returning existing conversation ID: %d", existingConversation.ID)
		return existingConversation, nil
	}

	// Create new conversation
	conversation := &models.SimpleConversation{
		UserID:   req.UserID,
		WorkerID: getUintPtr(req.WorkerID),
		AdminID:  getUintPtr(req.AdminID),
	}

	conversation, err = s.conversationRepo.Create(conversation)
	if err != nil {
		logrus.Errorf("SimpleConversationService.CreateConversation failed to create conversation: %v", err)
		return nil, err
	}

	// Load relationships
	conversation, err = s.conversationRepo.GetByID(conversation.ID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.CreateConversation failed to load conversation: %v", err)
		return nil, err
	}

	logrus.Infof("SimpleConversationService.CreateConversation successfully created conversation ID: %d", conversation.ID)
	return conversation, nil
}

// GetUserConversations gets conversations for a user
func (s *SimpleConversationService) GetUserConversations(userID uint, page, limit int) ([]models.SimpleConversation, *repositories.Pagination, error) {
	logrus.Infof("SimpleConversationService.GetUserConversations called for user ID: %d", userID)

	conversations, pagination, err := s.conversationRepo.GetUserConversations(userID, page, limit)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetUserConversations failed: %v", err)
		return nil, nil, err
	}

	// Add unread counts
	if len(conversations) > 0 {
		conversationIDs := make([]uint, len(conversations))
		for i, conv := range conversations {
			conversationIDs[i] = conv.ID
		}

		unreadCounts, err := s.messageRepo.GetConversationUnreadCounts(conversationIDs, userID)
		if err != nil {
			logrus.Errorf("SimpleConversationService.GetUserConversations failed to get unread counts: %v", err)
			// Don't fail the entire operation for this
		} else {
			// Add unread counts to conversations
			for i := range conversations {
				if count, exists := unreadCounts[conversations[i].ID]; exists {
					conversations[i].UnreadCount = int(count)
				} else {
					conversations[i].UnreadCount = 0
				}
			}
		}
	}

	logrus.Infof("SimpleConversationService.GetUserConversations returning %d conversations", len(conversations))
	return conversations, pagination, nil
}

// GetAllConversations gets all conversations (for admin)
func (s *SimpleConversationService) GetAllConversations(page, limit int) ([]models.SimpleConversationWithUnreadCount, *repositories.Pagination, error) {
	logrus.Infof("SimpleConversationService.GetAllConversations called")

	conversations, pagination, err := s.conversationRepo.GetAllConversations(page, limit)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetAllConversations failed: %v", err)
		return nil, nil, err
	}

	// Convert to conversations with unread counts
	var conversationsWithUnread []models.SimpleConversationWithUnreadCount

	// Get unread counts for all conversations (admin view)
	var unreadCounts map[uint]int64
	if len(conversations) > 0 {
		conversationIDs := make([]uint, len(conversations))
		for i, conv := range conversations {
			conversationIDs[i] = conv.ID
		}

		unreadCounts, err = s.messageRepo.GetConversationUnreadCountsForAdmin(conversationIDs)
		if err != nil {
			logrus.Errorf("SimpleConversationService.GetAllConversations failed to get unread counts: %v", err)
			// Don't fail the entire operation for this
		}
	}

	// Convert conversations to include unread counts
	for _, conv := range conversations {
		unreadCount := int64(0)
		if unreadCounts != nil {
			unreadCount = unreadCounts[conv.ID]
		}

		conversationsWithUnread = append(conversationsWithUnread, models.SimpleConversationWithUnreadCount{
			SimpleConversation: conv,
			UnreadCount:        unreadCount,
		})
	}

	logrus.Infof("SimpleConversationService.GetAllConversations returning %d conversations", len(conversationsWithUnread))
	return conversationsWithUnread, pagination, nil
}

// GetConversation gets a specific conversation
func (s *SimpleConversationService) GetConversation(conversationID uint) (*models.SimpleConversation, error) {
	logrus.Infof("SimpleConversationService.GetConversation called for conversation ID: %d", conversationID)

	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetConversation failed: %v", err)
		return nil, err
	}

	logrus.Infof("SimpleConversationService.GetConversation successfully retrieved conversation ID: %d", conversationID)
	return conversation, nil
}

// SendMessage sends a message in a conversation
func (s *SimpleConversationService) SendMessage(senderID uint, conversationID uint, req *models.SendSimpleConversationMessageRequest) (*models.SimpleConversationMessage, error) {
	logrus.Infof("SimpleConversationService.SendMessage called by user %d in conversation %d", senderID, conversationID)
	logrus.Infof("WebSocket service check: s.wsService = %v", s.wsService != nil)

	// Validate conversation exists
	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return nil, errors.New("conversation not found")
	}

	// Validate user has access to this conversation
	if err := s.validateConversationAccess(conversation, senderID); err != nil {
		return nil, err
	}

	// Create message
	message := &models.SimpleConversationMessage{
		ConversationID: conversationID,
		SenderID:       senderID,
		Message:        req.Message,
		IsRead:         false,
	}

	// Save message
	message, err = s.messageRepo.Create(message)
	if err != nil {
		logrus.Errorf("SimpleConversationService.SendMessage failed to create message: %v", err)
		return nil, err
	}

	// Update conversation's last message timestamp
	if err := s.conversationRepo.UpdateLastMessage(conversationID); err != nil {
		logrus.Errorf("SimpleConversationService.SendMessage failed to update last message time: %v", err)
		// Don't fail the entire operation for this
	}

	// Load sender information
	var sender models.User
	if err := s.userRepo.FindByID(&sender, senderID); err != nil {
		logrus.Errorf("SimpleConversationService.SendMessage failed to load sender: %v", err)
	} else {
		message.Sender = sender
	}

	// Load conversation with relationships
	conversation, err = s.conversationRepo.GetByID(conversationID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.SendMessage failed to load conversation: %v", err)
	} else {
		message.Conversation = *conversation
	}

	// Broadcast message through WebSocket
	logrus.Infof("About to check WebSocket service for message ID %d", message.ID)
	logrus.Infof("WebSocket service is nil: %v", s.wsService == nil)
	if s.wsService != nil {
		logrus.Infof("Broadcasting message ID %d through WebSocket", message.ID)
		go func() {
			messageData := map[string]interface{}{
				"id":              message.ID,
				"conversation_id": message.ConversationID,
				"sender_id":       message.SenderID,
				"message":         message.Message,
				"is_read":         message.IsRead,
				"created_at":      message.CreatedAt,
				"sender": map[string]interface{}{
					"id":   sender.ID,
					"name": sender.Name,
					"user_type": sender.UserType,
				},
			}
			logrus.Infof("Calling BroadcastSimpleConversationMessage for conversation %d", conversationID)
			s.wsService.BroadcastSimpleConversationMessage(conversationID, messageData)

			// Broadcast total unread count to admin clients
			// Get the admin ID from the conversation (assuming the admin is the one who should receive the count)
			if conversation != nil && conversation.AdminID != nil {
				totalUnreadCount, err := s.conversationRepo.GetAdminTotalUnreadCount(*conversation.AdminID)
				if err != nil {
					logrus.Errorf("Failed to get admin total unread count: %v", err)
				} else {
					s.wsService.BroadcastTotalUnreadCount(totalUnreadCount)
				}

				// Also broadcast individual conversation unread count
				conversationUnreadCount, err := s.messageRepo.GetUnreadCount(conversationID, *conversation.AdminID)
				if err != nil {
					logrus.Errorf("Failed to get conversation unread count: %v", err)
				} else {
					s.wsService.BroadcastConversationUnreadCount(conversationID, int(conversationUnreadCount))
				}
			}

			// Broadcast total unread count to user clients
			if conversation != nil {
				userTotalUnreadCount, err := s.conversationRepo.GetTotalUnreadCount(conversation.UserID)
				if err != nil {
					logrus.Errorf("Failed to get user total unread count: %v", err)
				} else {
					s.wsService.BroadcastTotalUnreadCountToUserMonitors(userTotalUnreadCount)
				}

				// Also broadcast individual conversation unread count to user
				userConversationUnreadCount, err := s.messageRepo.GetUnreadCount(conversationID, conversation.UserID)
				if err != nil {
					logrus.Errorf("Failed to get user conversation unread count: %v", err)
				} else {
					s.wsService.BroadcastConversationUnreadCountToUserMonitors(conversationID, int(userConversationUnreadCount))
				}
			}
		}()
	} else {
		logrus.Warn("WebSocket service is nil, cannot broadcast message")
	}

	logrus.Infof("SimpleConversationService.SendMessage successfully sent message ID: %d", message.ID)
	return message, nil
}

// GetMessages gets messages for a conversation
func (s *SimpleConversationService) GetMessages(conversationID uint, page, limit int) ([]models.SimpleConversationMessage, *repositories.Pagination, error) {
	logrus.Infof("SimpleConversationService.GetMessages called for conversation %d", conversationID)

	// Validate conversation exists
	_, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return nil, nil, errors.New("conversation not found")
	}

	// Get messages
	messages, pagination, err := s.messageRepo.GetConversationMessages(conversationID, page, limit)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetMessages failed: %v", err)
		return nil, nil, err
	}

	logrus.Infof("SimpleConversationService.GetMessages returning %d messages", len(messages))
	return messages, pagination, nil
}

// MarkMessageRead marks a message as read
func (s *SimpleConversationService) MarkMessageRead(messageID uint, userID uint) error {
	logrus.Infof("SimpleConversationService.MarkMessageRead called by user %d for message %d", userID, messageID)

	// Validate message exists
	_, err := s.messageRepo.GetByID(messageID)
	if err != nil {
		return err
	}

	// Mark message as read
	err = s.messageRepo.MarkAsRead(messageID, userID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.MarkMessageRead failed: %v", err)
		return err
	}

	logrus.Infof("SimpleConversationService.MarkMessageRead successfully marked message %d as read", messageID)
	return nil
}

// GetUnreadCount gets unread message count for a conversation
func (s *SimpleConversationService) GetUnreadCount(conversationID uint, userID uint) (int64, error) {
	logrus.Infof("SimpleConversationService.GetUnreadCount called for conversation %d and user %d", conversationID, userID)

	// Validate conversation exists
	_, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return 0, errors.New("conversation not found")
	}

	count, err := s.messageRepo.GetUnreadCount(conversationID, userID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetUnreadCount failed: %v", err)
		return 0, err
	}

	logrus.Infof("SimpleConversationService.GetUnreadCount returning count: %d", count)
	return count, nil
}

// MarkConversationAsRead marks all messages in a conversation as read for a user
func (s *SimpleConversationService) MarkConversationAsRead(conversationID uint, userID uint) error {
	logrus.Infof("SimpleConversationService.MarkConversationAsRead called for conversation %d and user %d", conversationID, userID)

	// Validate conversation exists
	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return errors.New("conversation not found")
	}

	// Mark all unread messages as read
	err = s.messageRepo.MarkConversationAsRead(conversationID, userID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.MarkConversationAsRead failed: %v", err)
		return err
	}

	// Broadcast total unread count to admin clients
	if s.wsService != nil && conversation.AdminID != nil {
		go func() {
			totalUnreadCount, err := s.conversationRepo.GetAdminTotalUnreadCount(*conversation.AdminID)
			if err != nil {
				logrus.Errorf("Failed to get admin total unread count: %v", err)
			} else {
				s.wsService.BroadcastTotalUnreadCount(totalUnreadCount)
			}

			// Also broadcast individual conversation unread count
			conversationUnreadCount, err := s.messageRepo.GetUnreadCount(conversationID, *conversation.AdminID)
			if err != nil {
				logrus.Errorf("Failed to get conversation unread count: %v", err)
			} else {
				s.wsService.BroadcastConversationUnreadCount(conversationID, int(conversationUnreadCount))
			}
		}()
	}

	// Broadcast total unread count to user clients
	if s.wsService != nil {
		go func() {
			userTotalUnreadCount, err := s.conversationRepo.GetTotalUnreadCount(conversation.UserID)
			if err != nil {
				logrus.Errorf("Failed to get user total unread count: %v", err)
			} else {
				s.wsService.BroadcastTotalUnreadCountToUserMonitors(userTotalUnreadCount)
			}

			// Also broadcast individual conversation unread count to user
			userConversationUnreadCount, err := s.messageRepo.GetUnreadCount(conversationID, conversation.UserID)
			if err != nil {
				logrus.Errorf("Failed to get user conversation unread count: %v", err)
			} else {
				s.wsService.BroadcastConversationUnreadCountToUserMonitors(conversationID, int(userConversationUnreadCount))
			}
		}()
	}

	logrus.Infof("SimpleConversationService.MarkConversationAsRead completed successfully")
	return nil
}

// validateParticipants validates that all participants exist
func (s *SimpleConversationService) validateParticipants(req *models.CreateSimpleConversationRequest) error {
	// Validate user exists
	var user models.User
	if err := s.userRepo.FindByID(&user, req.UserID); err != nil {
		return errors.New("user not found")
	}

	// Validate worker exists (if provided)
	if req.WorkerID != 0 {
		var worker models.User
		if err := s.userRepo.FindByID(&worker, req.WorkerID); err != nil {
			return errors.New("worker not found")
		}
		if worker.UserType != models.UserTypeWorker {
			return errors.New("invalid worker")
		}
	}

	// Validate admin exists (if provided)
	if req.AdminID != 0 {
		var admin models.User
		if err := s.userRepo.FindByID(&admin, req.AdminID); err != nil {
			return errors.New("admin not found")
		}
		if admin.UserType != models.UserTypeAdmin {
			return errors.New("invalid admin")
		}
	}

	// At least one of worker or admin must be provided
	if req.WorkerID == 0 && req.AdminID == 0 {
		return errors.New("either worker_id or admin_id must be provided")
	}

	return nil
}

// validateConversationAccess validates if user has access to the conversation
func (s *SimpleConversationService) validateConversationAccess(conversation *models.SimpleConversation, userID uint) error {
	// Check if user is a participant in the conversation
	if conversation.UserID == userID {
		return nil
	}
	
	if conversation.WorkerID != nil && *conversation.WorkerID == userID {
		return nil
	}
	
	if conversation.AdminID != nil && *conversation.AdminID == userID {
		return nil
	}

	return errors.New("access denied")
}

// Helper function to get pointer to uint
func getUintPtr(value uint) *uint {
	if value == 0 {
		return nil
	}
	return &value
}

// GetTotalUnreadCount gets total unread count for a user across all conversations
func (s *SimpleConversationService) GetTotalUnreadCount(userID uint) (int, error) {
	logrus.Infof("SimpleConversationService.GetTotalUnreadCount called for user ID: %d", userID)

	totalUnreadCount, err := s.conversationRepo.GetTotalUnreadCount(userID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetTotalUnreadCount failed: %v", err)
		return 0, err
	}

	logrus.Infof("SimpleConversationService.GetTotalUnreadCount returning total: %d", totalUnreadCount)
	return totalUnreadCount, nil
}

// GetAdminTotalUnreadCount gets total unread count for admin across all conversations
func (s *SimpleConversationService) GetAdminTotalUnreadCount(adminID uint) (int, error) {
	logrus.Infof("SimpleConversationService.GetAdminTotalUnreadCount called for admin ID: %d", adminID)

	totalUnreadCount, err := s.conversationRepo.GetAdminTotalUnreadCount(adminID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetAdminTotalUnreadCount failed: %v", err)
		return 0, err
	}

	logrus.Infof("SimpleConversationService.GetAdminTotalUnreadCount returning total: %d", totalUnreadCount)
	return totalUnreadCount, nil
}
