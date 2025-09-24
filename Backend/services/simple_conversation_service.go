package services

import (
	"errors"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

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
	logrus.Infof("SimpleConversationService.CreateConversation called with user_1: %d, user_2: %d", req.User1, req.User2)

	// Validate participants exist
	if err := s.validateParticipants(req); err != nil {
		return nil, err
	}

	// Check if conversation already exists
	existingConversation, err := s.conversationRepo.GetByParticipants(req.User1, req.User2)
	if err == nil && existingConversation != nil {
		logrus.Infof("SimpleConversationService.CreateConversation returning existing conversation ID: %d", existingConversation.ID)
		return existingConversation, nil
	}

	// Create new conversation
	conversation := &models.SimpleConversation{
		User1: req.User1,
		User2: req.User2,
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
	
	// Send notification about conversation started
	// Notify the other participant (user_2)
	var otherUser models.User
	if err := s.userRepo.FindByID(&otherUser, req.User2); err == nil {
		go NotifyConversationStarted(req.User2, otherUser.Name, 0) // 0 for booking ID since it's not a booking conversation
	}
	
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

	// Mask phone numbers in user data (but not last message text that users intentionally share)
	for i := range conversations {
		conversations[i].User1Data.Phone = utils.MaskPhoneNumberForDisplay(conversations[i].User1Data.Phone)
		conversations[i].User2Data.Phone = utils.MaskPhoneNumberForDisplay(conversations[i].User2Data.Phone)
		
		// Don't mask last message text - users can share phone numbers in messages
	}

	logrus.Infof("SimpleConversationService.GetUserConversations returning %d conversations", len(conversations))
	return conversations, pagination, nil
}

// GetAllConversations gets conversations where admin is a participant
func (s *SimpleConversationService) GetAllConversations(adminID uint, page, limit int) ([]models.SimpleConversationWithUnreadCount, *repositories.Pagination, error) {
	logrus.Infof("SimpleConversationService.GetAllConversations called for admin ID: %d", adminID)

	conversations, pagination, err := s.conversationRepo.GetAllConversations(adminID, page, limit)
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

	// Note: Admin conversations endpoint should NOT mask phone numbers as admins need full access to user data

	logrus.Infof("SimpleConversationService.GetAllConversations returning %d conversations", len(conversationsWithUnread))
	return conversationsWithUnread, pagination, nil
}

// GetAllConversationsForOversight gets all conversations for admin oversight (excluding admin's conversations)
func (s *SimpleConversationService) GetAllConversationsForOversight(adminID uint, page, limit int) ([]models.SimpleConversationWithUnreadCount, *repositories.Pagination, error) {
	logrus.Infof("SimpleConversationService.GetAllConversationsForOversight called for admin ID: %d", adminID)

	conversations, pagination, err := s.conversationRepo.GetAllConversationsForOversight(adminID, page, limit)
	if err != nil {
		logrus.Errorf("SimpleConversationService.GetAllConversationsForOversight failed: %v", err)
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
			logrus.Errorf("SimpleConversationService.GetAllConversationsForOversight failed to get unread counts: %v", err)
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

	// Note: Admin oversight endpoint should NOT mask phone numbers as admins need full access to user data

	logrus.Infof("SimpleConversationService.GetAllConversationsForOversight returning %d conversations", len(conversationsWithUnread))
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

	// Mask phone numbers in user data (but not last message text that users intentionally share)
	conversation.User1Data.Phone = utils.MaskPhoneNumberForDisplay(conversation.User1Data.Phone)
	conversation.User2Data.Phone = utils.MaskPhoneNumberForDisplay(conversation.User2Data.Phone)
	
	// Don't mask last message text - users can share phone numbers in messages

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

			// Broadcast total unread count to both users
			if conversation != nil {
				// Broadcast to user_1
				user1TotalUnreadCount, err := s.conversationRepo.GetTotalUnreadCount(conversation.User1)
				if err != nil {
					logrus.Errorf("Failed to get user_1 total unread count: %v", err)
				} else {
					s.wsService.BroadcastTotalUnreadCountToUserMonitors(user1TotalUnreadCount)
				}

				// Also broadcast individual conversation unread count to user_1
				user1ConversationUnreadCount, err := s.messageRepo.GetUnreadCount(conversationID, conversation.User1)
				if err != nil {
					logrus.Errorf("Failed to get user_1 conversation unread count: %v", err)
				} else {
					s.wsService.BroadcastConversationUnreadCountToUserMonitors(conversationID, int(user1ConversationUnreadCount))
				}

				// Broadcast to user_2
				user2TotalUnreadCount, err := s.conversationRepo.GetTotalUnreadCount(conversation.User2)
				if err != nil {
					logrus.Errorf("Failed to get user_2 total unread count: %v", err)
				} else {
					s.wsService.BroadcastTotalUnreadCountToUserMonitors(user2TotalUnreadCount)
				}

				// Also broadcast individual conversation unread count to user_2
				user2ConversationUnreadCount, err := s.messageRepo.GetUnreadCount(conversationID, conversation.User2)
				if err != nil {
					logrus.Errorf("Failed to get user_2 conversation unread count: %v", err)
				} else {
					s.wsService.BroadcastConversationUnreadCountToUserMonitors(conversationID, int(user2ConversationUnreadCount))
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

	// Mask sender phone numbers (but not message content that users intentionally share)
	for i := range messages {
		// Only mask sender phone number, not message content
		messages[i].Sender.Phone = utils.MaskPhoneNumberForDisplay(messages[i].Sender.Phone)
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
	_, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return errors.New("conversation not found")
	}

	// Mark all unread messages as read
	err = s.messageRepo.MarkConversationAsRead(conversationID, userID)
	if err != nil {
		logrus.Errorf("SimpleConversationService.MarkConversationAsRead failed: %v", err)
		return err
	}


	logrus.Infof("SimpleConversationService.MarkConversationAsRead completed successfully")
	return nil
}

// validateParticipants validates that all participants exist
func (s *SimpleConversationService) validateParticipants(req *models.CreateSimpleConversationRequest) error {
	// Validate user_1 exists
	var user1 models.User
	if err := s.userRepo.FindByID(&user1, req.User1); err != nil {
		return errors.New("user_1 not found")
	}

	// Validate user_2 exists
	var user2 models.User
	if err := s.userRepo.FindByID(&user2, req.User2); err != nil {
		return errors.New("user_2 not found")
	}

	// Users cannot chat with themselves
	if req.User1 == req.User2 {
		return errors.New("users cannot chat with themselves")
	}

	return nil
}

// validateConversationAccess validates if user has access to the conversation
func (s *SimpleConversationService) validateConversationAccess(conversation *models.SimpleConversation, userID uint) error {
	// Check if user is a participant in the conversation
	if conversation.User1 == userID || conversation.User2 == userID {
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
