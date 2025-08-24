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
}

// NewChatService creates a new chat service
func NewChatService() *ChatService {
	return &ChatService{
		chatRoomRepo:         repositories.NewChatRoomRepository(),
		chatMessageRepo:      repositories.NewChatMessageRepository(),
		userRepo:             repositories.NewUserRepository(),
		bookingRepo:          repositories.NewBookingRepository(),
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
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
func (cs *ChatService) GetUserChatRooms(userID uint, req *models.GetChatRoomsRequest) ([]models.ChatRoom, *repositories.Pagination, error) {
	logrus.Infof("ChatService.GetUserChatRooms called for user ID: %d", userID)

	rooms, pagination, err := cs.chatRoomRepo.GetUserRooms(userID, req.RoomType, req.Page, req.Limit)
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

	// Validate room exists
	_, err := cs.chatRoomRepo.GetByID(req.RoomID)
	if err != nil {
		return nil, errors.New("chat room not found")
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

	logrus.Infof("ChatService.SendMessage successfully sent message ID: %d", message.ID)
	return message, nil
}

// GetMessages gets messages for a chat room
func (cs *ChatService) GetMessages(userID uint, req *models.GetMessagesRequest) ([]models.ChatMessage, *repositories.Pagination, error) {
	logrus.Infof("ChatService.GetMessages called by user %d for room %d", userID, req.RoomID)

	// Validate room exists
	_, err := cs.chatRoomRepo.GetByID(req.RoomID)
	if err != nil {
		return nil, nil, errors.New("chat room not found")
	}

	// Get messages
	messages, pagination, err := cs.chatMessageRepo.GetRoomMessages(req.RoomID, req.Page, req.Limit)
	if err != nil {
		logrus.Errorf("ChatService.GetMessages failed: %v", err)
		return nil, nil, err
	}

	// Mark messages as read for this user
	go cs.markMessagesAsRead(req.RoomID, userID, messages)

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
