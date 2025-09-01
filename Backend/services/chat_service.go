package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

// ChatService handles chat room and message business logic
type ChatService struct {
	chatRoomRepo           *repositories.ChatRoomRepository
	chatMessageRepo        *repositories.ChatMessageRepository
	userRepo               *repositories.UserRepository
	bookingRepo            *repositories.BookingRepository
	workerAssignmentRepo   *repositories.WorkerAssignmentRepository
	wsService              *WebSocketService
}

// NewChatService creates a new chat service
func NewChatService(wsService *WebSocketService) *ChatService {
	return &ChatService{
		chatRoomRepo:         repositories.NewChatRoomRepository(),
		chatMessageRepo:      repositories.NewChatMessageRepository(),
		userRepo:             repositories.NewUserRepository(),
		bookingRepo:          repositories.NewBookingRepository(),
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		wsService:            wsService,
	}
}

// CreateChatRoom creates a new chat room
func (cs *ChatService) CreateChatRoom(req *models.CreateChatRoomRequest) (*models.ChatRoom, error) {
	logrus.Infof("ChatService.CreateChatRoom called with room type: %s", req.RoomType)

	// Validate room type and associated entity
	if err := cs.validateRoomCreation(req); err != nil {
		return nil, err
	}

	// Create chat room
	chatRoom := &models.ChatRoom{
		RoomType:        req.RoomType,
		RoomName:        req.RoomName,
		BookingID:       req.BookingID,
		PropertyID:      req.PropertyID,
		WorkerInquiryID: req.WorkerInquiryID,
		IsActive:        true,
	}

	// Save chat room
	chatRoom, err := cs.chatRoomRepo.Create(chatRoom)
	if err != nil {
		logrus.Errorf("ChatService.CreateChatRoom failed to create room: %v", err)
		return nil, err
	}

	// Participants are now handled through messages - no separate participant table needed

	logrus.Infof("ChatService.CreateChatRoom successfully created room ID: %d", chatRoom.ID)
	return chatRoom, nil
}

// GetUserChatRooms gets chat rooms for a user
func (cs *ChatService) GetUserChatRooms(userID uint, page, limit int) ([]models.ChatRoom, *repositories.Pagination, error) {
	logrus.Infof("ChatService.GetUserChatRooms called for user ID: %d", userID)

	rooms, pagination, err := cs.chatRoomRepo.GetUserRooms(userID, nil, page, limit)
	if err != nil {
		logrus.Errorf("ChatService.GetUserChatRooms failed: %v", err)
		return nil, nil, err
	}

	logrus.Infof("ChatService.GetUserChatRooms returning %d rooms", len(rooms))
	return rooms, pagination, nil
}

// SendMessage sends a message in a chat room
func (cs *ChatService) SendMessage(senderID uint, req *models.SendMessageRequest) (*models.ChatMessage, error) {
	logrus.Infof("ChatService.SendMessage called by user %d in room %d", senderID, req.RoomID)

	// Validate room exists and is active
	chatRoom, err := cs.chatRoomRepo.GetByID(req.RoomID)
	if err != nil {
		return nil, errors.New("chat room not found")
	}

	// Check if room is active
	if !chatRoom.IsActive {
		return nil, errors.New("chat room is closed")
	}

	// Get user type for validation
	var user models.User
	err = cs.userRepo.FindByID(&user, senderID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Validate user has access to this chat room
	if err := cs.ValidateChatAccess(req.RoomID, senderID, string(user.UserType)); err != nil {
		return nil, err
	}

	// Create message
	message := &models.ChatMessage{
		RoomID:          req.RoomID,
		SenderID:        senderID,
		Message:         req.Message,
		MessageType:     req.MessageType,
		Attachments:     req.Attachments,
		ReplyToMessageID: req.ReplyToMessageID,
		Status:          models.MessageStatusSent,
	}

	// Save message
	message, err = cs.chatMessageRepo.Create(message)
	if err != nil {
		logrus.Errorf("ChatService.SendMessage failed to create message: %v", err)
		return nil, err
	}

	// Update room's last message timestamp
	if err := cs.chatRoomRepo.UpdateLastMessageAt(req.RoomID, time.Now()); err != nil {
		logrus.Errorf("ChatService.SendMessage failed to update last message time: %v", err)
		// Don't fail the entire operation for this
	}

	// Broadcast message through WebSocket
	if cs.wsService != nil {
		go func() {
			messageData := map[string]interface{}{
				"id":           message.ID,
				"room_id":      message.RoomID,
				"sender_id":    message.SenderID,
				"message":      message.Message,
				"message_type": message.MessageType,
				"status":       message.Status,
				"created_at":   message.CreatedAt,
				"sender": map[string]interface{}{
					"id":   user.ID,
					"name": user.Name,
					"type": user.UserType,
				},
			}
			cs.wsService.BroadcastChatMessage(req.RoomID, messageData)
		}()
	}

	logrus.Infof("ChatService.SendMessage successfully sent message ID: %d", message.ID)
	return message, nil
}

// GetMessages gets messages for a chat room
func (cs *ChatService) GetMessages(userID uint, roomID uint, page, limit int) ([]models.ChatMessage, *repositories.Pagination, error) {
	logrus.Infof("ChatService.GetMessages called by user %d for room %d", userID, roomID)

	// Validate room exists
	_, err := cs.chatRoomRepo.GetByID(roomID)
	if err != nil {
		return nil, nil, errors.New("chat room not found")
	}

	// Get messages
	messages, pagination, err := cs.chatMessageRepo.GetRoomMessages(roomID, page, limit)
	if err != nil {
		logrus.Errorf("ChatService.GetMessages failed: %v", err)
		return nil, nil, err
	}

	// Mark messages as read for this user
	go cs.markMessagesAsRead(roomID, userID, messages)

	logrus.Infof("ChatService.GetMessages returning %d messages", len(messages))
	return messages, pagination, nil
}

// MarkMessageRead marks a message as read
func (cs *ChatService) MarkMessageRead(userID uint, req *models.MarkMessageReadRequest) error {
	logrus.Infof("ChatService.MarkMessageRead called by user %d for message %d", userID, req.MessageID)

	// Validate message exists
	_, err := cs.chatMessageRepo.GetByID(req.MessageID)
	if err != nil {
		return err
	}

	// Mark message as read
	return cs.chatMessageRepo.MarkAsRead(req.MessageID, userID)
}

// CreateBookingChatRoom creates a chat room for a booking
func (cs *ChatService) CreateBookingChatRoom(bookingID uint) (*models.ChatRoom, error) {
	logrus.Infof("ChatService.CreateBookingChatRoom called for booking ID: %d", bookingID)

	// Get booking details
	booking, err := cs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, err
	}

	// Check if chat room already exists
	existingRoom, err := cs.chatRoomRepo.GetByBookingID(bookingID)
	if err == nil && existingRoom != nil {
		logrus.Infof("ChatService.CreateBookingChatRoom room already exists for booking %d", bookingID)
		return existingRoom, nil
	}

	// Check if worker is assigned (but don't require it for chat room creation)
	_, err = cs.workerAssignmentRepo.GetByBookingID(bookingID)
	if err != nil {
		logrus.Warnf("No worker assigned to booking %d, but creating chat room anyway", bookingID)
	}

	// Create chat room
	chatRoom := &models.ChatRoom{
		RoomType:  models.RoomTypeBooking,
		RoomName:  fmt.Sprintf("Booking #%s", booking.BookingReference),
		BookingID: &bookingID,
		IsActive:  true,
	}

	chatRoom, err = cs.chatRoomRepo.Create(chatRoom)
	if err != nil {
		return nil, err
	}

	// Participants are now handled through messages - no separate participant table needed

	logrus.Infof("ChatService.CreateBookingChatRoom successfully created room ID: %d for booking %d", chatRoom.ID, bookingID)
	return chatRoom, nil
}

// CreateBookingChatRoomWhenWorkerAccepts creates chat room when worker accepts assignment
func (cs *ChatService) CreateBookingChatRoomWhenWorkerAccepts(bookingID uint) (*models.ChatRoom, error) {
	logrus.Infof("ChatService.CreateBookingChatRoomWhenWorkerAccepts called for booking ID: %d", bookingID)

	// Get booking details
	booking, err := cs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, err
	}

	// Check if chat room already exists
	existingRoom, err := cs.chatRoomRepo.GetByBookingID(bookingID)
	if err == nil && existingRoom != nil {
		logrus.Infof("ChatService.CreateBookingChatRoomWhenWorkerAccepts room already exists for booking %d", bookingID)
		return existingRoom, nil
	}

	// Verify worker is assigned and accepted
	assignment, err := cs.workerAssignmentRepo.GetByBookingID(bookingID)
	if err != nil {
		return nil, errors.New("no worker assignment found for booking")
	}

	if assignment.Status != models.AssignmentStatusAccepted {
		return nil, errors.New("worker has not accepted the assignment yet")
	}

	// Create chat room
	chatRoom := &models.ChatRoom{
		RoomType:  models.RoomTypeBooking,
		RoomName:  fmt.Sprintf("Booking #%s", booking.BookingReference),
		BookingID: &bookingID,
		IsActive:  true,
	}

	chatRoom, err = cs.chatRoomRepo.Create(chatRoom)
	if err != nil {
		return nil, err
	}

	logrus.Infof("ChatService.CreateBookingChatRoomWhenWorkerAccepts successfully created room ID: %d for booking %d", chatRoom.ID, bookingID)
	return chatRoom, nil
}

// CloseBookingChatRoom closes a chat room when booking is completed
func (cs *ChatService) CloseBookingChatRoom(bookingID uint, reason string) error {
	logrus.Infof("ChatService.CloseBookingChatRoom called for booking ID: %d", bookingID)

	chatRoom, err := cs.chatRoomRepo.GetByBookingID(bookingID)
	if err != nil {
		return err
	}

	err = cs.chatRoomRepo.CloseRoom(chatRoom.ID, reason)
	if err != nil {
		logrus.Errorf("ChatService.CloseBookingChatRoom failed to close room: %v", err)
		return err
	}

	logrus.Infof("ChatService.CloseBookingChatRoom successfully closed room ID: %d for booking %d", chatRoom.ID, bookingID)
	return nil
}

// ValidateChatAccess checks if user can access/send messages in chat room
func (cs *ChatService) ValidateChatAccess(roomID uint, userID uint, userType string) error {
	// Get chat room
	chatRoom, err := cs.chatRoomRepo.GetByID(roomID)
	if err != nil {
		return errors.New("chat room not found")
	}

	// Check if room is active
	if !chatRoom.IsActive {
		return errors.New("chat room is closed")
	}

	// Admin can access all chat rooms
	if userType == string(models.UserTypeAdmin) {
		return nil
	}

	// Get booking details
	if chatRoom.BookingID == nil {
		return errors.New("invalid chat room")
	}

	booking, err := cs.bookingRepo.GetByID(*chatRoom.BookingID)
	if err != nil {
		return errors.New("booking not found")
	}

	// Check if user is booking owner
	if booking.UserID == userID {
		return nil
	}

	// Check if user is assigned worker
	assignment, err := cs.workerAssignmentRepo.GetByBookingID(*chatRoom.BookingID)
	if err == nil && assignment.WorkerID == userID {
		return nil
	}

	return errors.New("access denied")
}

// GetUserChatHistory gets both active and closed chat rooms for a user
func (cs *ChatService) GetUserChatHistory(userID uint, userType string, page, limit int) ([]models.ChatRoom, *repositories.Pagination, error) {
	// Admin can see all chat rooms
	if userType == string(models.UserTypeAdmin) {
		return cs.chatRoomRepo.GetAllRooms(page, limit)
	}

	// Regular users see their own chat rooms (both active and closed)
	return cs.chatRoomRepo.GetUserRooms(userID, nil, page, limit)
}

// GetUserClosedChatRooms gets closed chat rooms for a user
func (cs *ChatService) GetUserClosedChatRooms(userID uint, userType string, page, limit int) ([]models.ChatRoom, *repositories.Pagination, error) {
	// Admin can see all closed chat rooms
	if userType == string(models.UserTypeAdmin) {
		return cs.chatRoomRepo.GetAllRooms(page, limit)
	}

	// Regular users see their own closed chat rooms
	return cs.chatRoomRepo.GetClosedRooms(userID, page, limit)
}

// validateRoomCreation validates room creation request
func (cs *ChatService) validateRoomCreation(req *models.CreateChatRoomRequest) error {
	switch req.RoomType {
	case models.RoomTypeBooking:
		if req.BookingID == nil {
			return errors.New("booking_id is required for booking chat room")
		}
	case models.RoomTypeProperty:
		if req.PropertyID == nil {
			return errors.New("property_id is required for property chat room")
		}
	case models.RoomTypeWorkerInquiry:
		if req.WorkerInquiryID == nil {
			return errors.New("worker_inquiry_id is required for worker inquiry chat room")
		}
	default:
		return errors.New("invalid room type")
	}

	return nil
}

// markMessagesAsRead marks messages as read for a user
func (cs *ChatService) markMessagesAsRead(roomID uint, userID uint, messages []models.ChatMessage) {
	for _, message := range messages {
		if message.SenderID != userID && !message.IsRead {
			if err := cs.chatMessageRepo.MarkAsRead(message.ID, userID); err != nil {
				logrus.Errorf("ChatService.markMessagesAsRead failed to mark message %d as read: %v", message.ID, err)
			}
		}
	}
}
