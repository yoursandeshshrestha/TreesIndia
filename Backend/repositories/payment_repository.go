package repositories

import (
	"strings"
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository() *PaymentRepository {
	return &PaymentRepository{
		db: database.GetDB(),
	}
}

// Create creates a new payment
func (pr *PaymentRepository) Create(payment *models.Payment) error {
	return pr.db.Create(payment).Error
}

// GetByID gets a payment by ID
func (pr *PaymentRepository) GetByID(id uint) (*models.Payment, error) {
	var payment models.Payment
	err := pr.db.Preload("User").First(&payment, id).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetByReference gets a payment by reference
func (pr *PaymentRepository) GetByReference(reference string) (*models.Payment, error) {
	var payment models.Payment
	err := pr.db.Preload("User").Where("payment_reference = ?", reference).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetByRazorpayOrderID gets a payment by Razorpay order ID
func (pr *PaymentRepository) GetByRazorpayOrderID(orderID string) (*models.Payment, error) {
	var payment models.Payment
	err := pr.db.Preload("User").Where("razorpay_order_id = ?", orderID).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetByRazorpayPaymentID gets a payment by Razorpay payment ID
func (pr *PaymentRepository) GetByRazorpayPaymentID(paymentID string) (*models.Payment, error) {
	var payment models.Payment
	err := pr.db.Preload("User").Where("razorpay_payment_id = ?", paymentID).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetByRelatedEntity gets a payment by related entity type and ID
func (pr *PaymentRepository) GetByRelatedEntity(entityType string, entityID uint) (*models.Payment, error) {
	var payment models.Payment
	err := pr.db.Preload("User").Where("related_entity_type = ? AND related_entity_id = ?", entityType, entityID).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetPayments gets payments with filters and pagination
func (pr *PaymentRepository) GetPayments(filters *models.PaymentFilters) ([]models.Payment, *Pagination, error) {
	var payments []models.Payment
	var total int64

	query := pr.db.Model(&models.Payment{})

	// Apply filters
	if filters.UserID != nil {
		query = query.Where("user_id = ?", *filters.UserID)
	}
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.Type != "" {
		query = query.Where("type = ?", filters.Type)
	}
	if filters.Method != "" {
		query = query.Where("method = ?", filters.Method)
	}
	if filters.RelatedEntityType != "" {
		query = query.Where("related_entity_type = ?", filters.RelatedEntityType)
	}
	if filters.RelatedEntityID != nil {
		query = query.Where("related_entity_id = ?", *filters.RelatedEntityID)
	}
	if filters.StartDate != "" {
		query = query.Where("created_at >= ?", filters.StartDate)
	}
	if filters.EndDate != "" {
		query = query.Where("created_at <= ?", filters.EndDate)
	}

	// Count total
	err := query.Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	page := filters.Page
	if page <= 0 {
		page = 1
	}
	limit := filters.Limit
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// Preload relationships
	query = query.Preload("User")

	// Execute query
	err = query.Order("created_at DESC").Find(&payments).Error
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

	return payments, pagination, nil
}

// GetUserPayments gets payments for a specific user
func (pr *PaymentRepository) GetUserPayments(userID uint, filters *models.PaymentFilters) ([]models.Payment, *Pagination, error) {
	if filters == nil {
		filters = &models.PaymentFilters{}
	}
	filters.UserID = &userID
	return pr.GetPayments(filters)
}

// Update updates a payment
func (pr *PaymentRepository) Update(payment *models.Payment) error {
	return pr.db.Save(payment).Error
}

// UpdateStatus updates payment status
func (pr *PaymentRepository) UpdateStatus(paymentID uint, status models.PaymentStatus, notes string) error {
	return pr.db.Model(&models.Payment{}).Where("id = ?", paymentID).
		Updates(map[string]interface{}{
			"status": status,
			"notes":  notes,
		}).Error
}

// GetPaymentStats gets payment statistics
func (pr *PaymentRepository) GetPaymentStats(userID *uint) (map[string]interface{}, error) {
	query := pr.db.Model(&models.Payment{})
	
	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}

	var stats map[string]interface{}
	
	// Total payments
	var totalPayments int64
	err := query.Count(&totalPayments).Error
	if err != nil {
		return nil, err
	}

	// Total amount
	var totalAmount float64
	err = query.Where("status = ?", models.PaymentStatusCompleted).Select("COALESCE(SUM(amount), 0)").Scan(&totalAmount).Error
	if err != nil {
		return nil, err
	}

	// Pending payments
	var pendingPayments int64
	err = query.Where("status = ?", models.PaymentStatusPending).Count(&pendingPayments).Error
	if err != nil {
		return nil, err
	}

	// Failed payments
	var failedPayments int64
	err = query.Where("status = ?", models.PaymentStatusFailed).Count(&failedPayments).Error
	if err != nil {
		return nil, err
	}

	// Refunded payments
	var refundedPayments int64
	err = query.Where("status = ?", models.PaymentStatusRefunded).Count(&refundedPayments).Error
	if err != nil {
		return nil, err
	}

	// Total refunded amount
	var totalRefundedAmount float64
	err = query.Where("status = ?", models.PaymentStatusRefunded).Select("COALESCE(SUM(refund_amount), 0)").Scan(&totalRefundedAmount).Error
	if err != nil {
		return nil, err
	}

	stats = map[string]interface{}{
		"total_payments":        totalPayments,
		"total_amount":          totalAmount,
		"pending_payments":      pendingPayments,
		"failed_payments":       failedPayments,
		"refunded_payments":     refundedPayments,
		"total_refunded_amount": totalRefundedAmount,
	}

	return stats, nil
}

// GetByUserIDAndTypes gets payments for a user by type(s)
func (pr *PaymentRepository) GetByUserIDAndTypes(userID uint, paymentTypes []models.PaymentType, limit, offset int) ([]models.Payment, error) {
	var payments []models.Payment
	err := pr.db.Where("user_id = ? AND type IN ?", userID, paymentTypes).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Preload("User").
		Find(&payments).Error
	return payments, err
}

// GetCountByUserIDAndTypes gets payment count for a user by type(s)
func (pr *PaymentRepository) GetCountByUserIDAndTypes(userID uint, paymentTypes []models.PaymentType) (int64, error) {
	var count int64
	err := pr.db.Model(&models.Payment{}).
		Where("user_id = ? AND type IN ?", userID, paymentTypes).
		Count(&count).Error
	return count, err
}

// GetRecentByUserIDAndTypes gets recent payments for a user by type(s)
func (pr *PaymentRepository) GetRecentByUserIDAndTypes(userID uint, paymentTypes []models.PaymentType, limit int) ([]models.Payment, error) {
	var payments []models.Payment
	err := pr.db.Where("user_id = ? AND type IN ?", userID, paymentTypes).
		Order("created_at DESC").
		Limit(limit).
		Preload("User").
		Find(&payments).Error
	return payments, err
}

// GetTotalAmountByUserIDAndType gets total amount for a user by type
func (pr *PaymentRepository) GetTotalAmountByUserIDAndType(userID uint, paymentType models.PaymentType) (float64, error) {
	var totalAmount float64
	err := pr.db.Model(&models.Payment{}).
		Where("user_id = ? AND type = ? AND status = ?", userID, paymentType, models.PaymentStatusCompleted).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalAmount).Error
	return totalAmount, err
}

// GetAbandonedWalletPayments gets pending wallet payments that are older than the cutoff time
func (pr *PaymentRepository) GetAbandonedWalletPayments(cutoffTime time.Time) ([]*models.Payment, error) {
	var payments []*models.Payment
	err := pr.db.Where("type = ? AND status = ? AND initiated_at < ?", 
		models.PaymentTypeWalletRecharge, 
		models.PaymentStatusPending, 
		cutoffTime).
		Find(&payments).Error
	
	return payments, err
}

// GetAdminPayments gets payments with comprehensive admin filters
func (pr *PaymentRepository) GetAdminPayments(filters *models.AdminPaymentFilters) ([]models.Payment, *Pagination, error) {
	var payments []models.Payment
	var total int64

	query := pr.db.Model(&models.Payment{}).Joins("LEFT JOIN users ON payments.user_id = users.id")

	// Apply filters
	if filters.UserID != nil {
		query = query.Where("payments.user_id = ?", *filters.UserID)
	}
	if filters.Status != "" {
		query = query.Where("payments.status = ?", filters.Status)
	}
	if filters.Type != "" {
		query = query.Where("payments.type = ?", filters.Type)
	}
	if filters.Method != "" {
		query = query.Where("payments.method = ?", filters.Method)
	}
	if filters.RelatedEntityType != "" {
		query = query.Where("payments.related_entity_type = ?", filters.RelatedEntityType)
	}
	if filters.RelatedEntityID != nil {
		query = query.Where("payments.related_entity_id = ?", *filters.RelatedEntityID)
	}
	if filters.StartDate != "" {
		query = query.Where("payments.created_at >= ?", filters.StartDate)
	}
	if filters.EndDate != "" {
		query = query.Where("payments.created_at <= ?", filters.EndDate)
	}
	if filters.MinAmount != nil {
		query = query.Where("payments.amount >= ?", *filters.MinAmount)
	}
	if filters.MaxAmount != nil {
		query = query.Where("payments.amount <= ?", *filters.MaxAmount)
	}
	if filters.UserEmail != "" {
		query = query.Where("users.email ILIKE ?", "%"+filters.UserEmail+"%")
	}
	if filters.UserPhone != "" {
		query = query.Where("users.phone ILIKE ?", "%"+filters.UserPhone+"%")
	}
	if filters.Search != "" {
		searchTerm := "%" + filters.Search + "%"
		query = query.Where(
			"payments.payment_reference ILIKE ? OR payments.description ILIKE ? OR users.name ILIKE ? OR users.email ILIKE ?",
			searchTerm, searchTerm, searchTerm, searchTerm,
		)
	}

	// Count total
	err := query.Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	page := filters.Page
	if page <= 0 {
		page = 1
	}
	limit := filters.Limit
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// Apply sorting
	sortBy := filters.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}
	sortOrder := filters.SortOrder
	if sortOrder == "" {
		sortOrder = "desc"
	}
	query = query.Order("payments." + sortBy + " " + strings.ToUpper(sortOrder))

	// Preload relationships
	query = query.Preload("User")

	// Execute query
	err = query.Find(&payments).Error
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

	return payments, pagination, nil
}

// GetAdminTransactionStats gets essential transaction statistics for admin dashboard
func (pr *PaymentRepository) GetAdminTransactionStats() (*models.AdminTransactionStats, error) {
	stats := &models.AdminTransactionStats{}
	
	// Single optimized query to get all essential stats
	err := pr.db.Model(&models.Payment{}).Select(`
		COUNT(*) as total_transactions,
		COALESCE(SUM(amount), 0) as total_amount,
		COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
		COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
		COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions
	`).Scan(stats).Error
	
	if err != nil {
		return nil, err
	}
	
	return stats, nil
}

// GetPaymentsForExport gets payments for export with comprehensive data
func (pr *PaymentRepository) GetPaymentsForExport(filters *models.AdminPaymentFilters) ([]models.Payment, error) {
	query := pr.db.Model(&models.Payment{}).Joins("LEFT JOIN users ON payments.user_id = users.id")

	// Apply same filters as GetAdminPayments but without pagination
	if filters.UserID != nil {
		query = query.Where("payments.user_id = ?", *filters.UserID)
	}
	if filters.Status != "" {
		query = query.Where("payments.status = ?", filters.Status)
	}
	if filters.Type != "" {
		query = query.Where("payments.type = ?", filters.Type)
	}
	if filters.Method != "" {
		query = query.Where("payments.method = ?", filters.Method)
	}
	if filters.RelatedEntityType != "" {
		query = query.Where("payments.related_entity_type = ?", filters.RelatedEntityType)
	}
	if filters.RelatedEntityID != nil {
		query = query.Where("payments.related_entity_id = ?", *filters.RelatedEntityID)
	}
	if filters.StartDate != "" {
		query = query.Where("payments.created_at >= ?", filters.StartDate)
	}
	if filters.EndDate != "" {
		query = query.Where("payments.created_at <= ?", filters.EndDate)
	}
	if filters.MinAmount != nil {
		query = query.Where("payments.amount >= ?", *filters.MinAmount)
	}
	if filters.MaxAmount != nil {
		query = query.Where("payments.amount <= ?", *filters.MaxAmount)
	}
	if filters.UserEmail != "" {
		query = query.Where("users.email ILIKE ?", "%"+filters.UserEmail+"%")
	}
	if filters.UserPhone != "" {
		query = query.Where("users.phone ILIKE ?", "%"+filters.UserPhone+"%")
	}
	if filters.Search != "" {
		searchTerm := "%" + filters.Search + "%"
		query = query.Where(
			"payments.payment_reference ILIKE ? OR payments.description ILIKE ? OR users.name ILIKE ? OR users.email ILIKE ?",
			searchTerm, searchTerm, searchTerm, searchTerm,
		)
	}

	// Apply sorting
	sortBy := filters.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}
	sortOrder := filters.SortOrder
	if sortOrder == "" {
		sortOrder = "desc"
	}
	query = query.Order("payments." + sortBy + " " + strings.ToUpper(sortOrder))

	// Preload relationships
	query = query.Preload("User")

	var payments []models.Payment
	err := query.Find(&payments).Error
	return payments, err
}
