package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type PaymentSegmentRepository struct {
	db *gorm.DB
}

func NewPaymentSegmentRepository() *PaymentSegmentRepository {
	return &PaymentSegmentRepository{
		db: database.GetDB(),
	}
}

// Create creates a new payment segment
func (psr *PaymentSegmentRepository) Create(segment *models.PaymentSegment) error {
	return psr.db.Create(segment).Error
}

// CreateMultiple creates multiple payment segments
func (psr *PaymentSegmentRepository) CreateMultiple(segments []models.PaymentSegment) error {
	if len(segments) == 0 {
		return nil
	}
	return psr.db.Create(&segments).Error
}

// GetByID gets a payment segment by ID
func (psr *PaymentSegmentRepository) GetByID(id uint) (*models.PaymentSegment, error) {
	var segment models.PaymentSegment
	err := psr.db.Preload("Booking").Preload("Payment").First(&segment, id).Error
	if err != nil {
		return nil, err
	}
	return &segment, nil
}

// GetByBookingID gets all payment segments for a booking
func (psr *PaymentSegmentRepository) GetByBookingID(bookingID uint) ([]models.PaymentSegment, error) {
	var segments []models.PaymentSegment
	err := psr.db.Where("booking_id = ?", bookingID).
		Order("segment_number ASC").
		Preload("Payment").
		Find(&segments).Error
	return segments, err
}

// GetByBookingIDAndSegmentNumber gets a specific payment segment
func (psr *PaymentSegmentRepository) GetByBookingIDAndSegmentNumber(bookingID uint, segmentNumber int) (*models.PaymentSegment, error) {
	var segment models.PaymentSegment
	err := psr.db.Where("booking_id = ? AND segment_number = ?", bookingID, segmentNumber).
		Preload("Payment").
		First(&segment).Error
	if err != nil {
		return nil, err
	}
	return &segment, nil
}

// GetPendingSegments gets all pending segments for a booking
func (psr *PaymentSegmentRepository) GetPendingSegments(bookingID uint) ([]models.PaymentSegment, error) {
	var segments []models.PaymentSegment
	err := psr.db.Where("booking_id = ? AND status = ?", bookingID, models.PaymentSegmentStatusPending).
		Order("segment_number ASC").
		Find(&segments).Error
	return segments, err
}

// GetPaidSegments gets all paid segments for a booking
func (psr *PaymentSegmentRepository) GetPaidSegments(bookingID uint) ([]models.PaymentSegment, error) {
	var segments []models.PaymentSegment
	err := psr.db.Where("booking_id = ? AND status = ?", bookingID, models.PaymentSegmentStatusPaid).
		Order("segment_number ASC").
		Find(&segments).Error
	return segments, err
}

// Update updates a payment segment
func (psr *PaymentSegmentRepository) Update(segment *models.PaymentSegment) error {
	return psr.db.Save(segment).Error
}

// MarkAsPaid marks a payment segment as paid
func (psr *PaymentSegmentRepository) MarkAsPaid(segmentID uint, paymentID uint) error {
	now := psr.db.NowFunc()
	return psr.db.Model(&models.PaymentSegment{}).
		Where("id = ?", segmentID).
		Updates(map[string]interface{}{
			"status":     models.PaymentSegmentStatusPaid,
			"payment_id": paymentID,
			"paid_at":    now,
		}).Error
}

// DeleteByBookingID deletes all payment segments for a booking
func (psr *PaymentSegmentRepository) DeleteByBookingID(bookingID uint) error {
	return psr.db.Where("booking_id = ?", bookingID).Delete(&models.PaymentSegment{}).Error
}

// GetPaymentProgress gets payment progress for a booking
func (psr *PaymentSegmentRepository) GetPaymentProgress(bookingID uint) (*models.PaymentProgress, error) {
	var segments []models.PaymentSegment
	err := psr.db.Where("booking_id = ?", bookingID).
		Order("segment_number ASC").
		Find(&segments).Error
	if err != nil {
		return nil, err
	}

	if len(segments) == 0 {
		return &models.PaymentProgress{
			TotalAmount:        0,
			PaidAmount:         0,
			RemainingAmount:    0,
			TotalSegments:      0,
			PaidSegments:       0,
			RemainingSegments:  0,
			ProgressPercentage: 0,
			Segments:          []models.PaymentSegmentInfo{},
		}, nil
	}

	var totalAmount, paidAmount float64
	var paidSegments int
	var segmentInfos []models.PaymentSegmentInfo

	for _, segment := range segments {
		totalAmount += segment.Amount
		
		segmentInfo := models.PaymentSegmentInfo{
			ID:            segment.ID,
			SegmentNumber: segment.SegmentNumber,
			Amount:        segment.Amount,
			DueDate:       segment.DueDate,
			Status:        segment.Status,
			PaidAt:        segment.PaidAt,
			Notes:         segment.Notes,
			PaymentID:     segment.PaymentID,
		}

		if segment.Status == models.PaymentSegmentStatusPaid {
			paidAmount += segment.Amount
			paidSegments++
		}

		segmentInfos = append(segmentInfos, segmentInfo)
	}

	remainingAmount := totalAmount - paidAmount
	remainingSegments := len(segments) - paidSegments
	progressPercentage := float64(0)
	if totalAmount > 0 {
		progressPercentage = (paidAmount / totalAmount) * 100
	}

	return &models.PaymentProgress{
		TotalAmount:        totalAmount,
		PaidAmount:         paidAmount,
		RemainingAmount:    remainingAmount,
		TotalSegments:      len(segments),
		PaidSegments:       paidSegments,
		RemainingSegments:  remainingSegments,
		ProgressPercentage: progressPercentage,
		Segments:          segmentInfos,
	}, nil
}

// CountSegmentsByStatus counts segments by status for a booking
func (psr *PaymentSegmentRepository) CountSegmentsByStatus(bookingID uint, status models.PaymentSegmentStatus) (int64, error) {
	var count int64
	err := psr.db.Model(&models.PaymentSegment{}).
		Where("booking_id = ? AND status = ?", bookingID, status).
		Count(&count).Error
	return count, err
}

// IsAllSegmentsPaid checks if all segments for a booking are paid
func (psr *PaymentSegmentRepository) IsAllSegmentsPaid(bookingID uint) (bool, error) {
	pendingCount, err := psr.CountSegmentsByStatus(bookingID, models.PaymentSegmentStatusPending)
	if err != nil {
		return false, err
	}
	return pendingCount == 0, nil
}
