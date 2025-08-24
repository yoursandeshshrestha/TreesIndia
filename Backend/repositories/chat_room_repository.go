package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// ChatRoomRepository handles chat room database operations
type ChatRoomRepository struct {
	db *gorm.DB
}

// NewChatRoomRepository creates a new chat room repository
func NewChatRoomRepository() *ChatRoomRepository {
	return &ChatRoomRepository{
		db: database.GetDB(),
	}
}

// Create creates a new chat room
func (crr *ChatRoomRepository) Create(chatRoom *models.ChatRoom) (*models.ChatRoom, error) {
	err := crr.db.Create(chatRoom).Error
	if err != nil {
		return nil, err
	}
	return chatRoom, nil
}

// GetByID gets a chat room by ID
func (crr *ChatRoomRepository) GetByID(id uint) (*models.ChatRoom, error) {
	var chatRoom models.ChatRoom
	err := crr.db.Preload("Messages.Sender").First(&chatRoom, id).Error
	if err != nil {
		return nil, err
	}
	return &chatRoom, nil
}

// GetByBookingID gets a chat room by booking ID
func (crr *ChatRoomRepository) GetByBookingID(bookingID uint) (*models.ChatRoom, error) {
	var chatRoom models.ChatRoom
	err := crr.db.Where("booking_id = ? AND is_active = ?", bookingID, true).First(&chatRoom).Error
	if err != nil {
		return nil, err
	}
	return &chatRoom, nil
}

// GetUserRooms gets chat rooms for a user
func (crr *ChatRoomRepository) GetUserRooms(userID uint, roomType *models.RoomType, page, limit int) ([]models.ChatRoom, *Pagination, error) {
	var chatRooms []models.ChatRoom
	var total int64

	// Build query - simplified without participants table
	query := crr.db.Where("chat_rooms.is_active = ?", true)

	// Filter by room type if provided
	if roomType != nil {
		query = query.Where("chat_rooms.room_type = ?", *roomType)
	}

	// Count total
	err := query.Model(&models.ChatRoom{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// Preload relationships
	query = query.Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC").Limit(1) // Get last message
	}).Preload("Messages.Sender")

	// Execute query
	err = query.Order("chat_rooms.last_message_at DESC NULLS LAST, chat_rooms.created_at DESC").Find(&chatRooms).Error
	if err != nil {
		return nil, nil, err
	}

	// Calculate pagination
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return chatRooms, pagination, nil
}

// UpdateLastMessageAt updates the last message timestamp for a chat room
func (crr *ChatRoomRepository) UpdateLastMessageAt(roomID uint, timestamp interface{}) error {
	return crr.db.Model(&models.ChatRoom{}).Where("id = ?", roomID).Update("last_message_at", timestamp).Error
}
