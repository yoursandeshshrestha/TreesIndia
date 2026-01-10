package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type WorkerWithdrawalService struct {
	paymentService *PaymentService
	userRepo       *repositories.UserRepository
	workerRepo     *repositories.WorkerRepository
}

func NewWorkerWithdrawalService() *WorkerWithdrawalService {
	return &WorkerWithdrawalService{
		paymentService: NewPaymentService(),
		userRepo:       repositories.NewUserRepository(),
		workerRepo:     repositories.NewWorkerRepository(),
	}
}

// RequestWithdrawal creates a new withdrawal request for a worker
func (wws *WorkerWithdrawalService) RequestWithdrawal(workerUserID uint, request *models.WorkerWithdrawalRequest) (*models.Payment, error) {
	// Get user
	var user models.User
	if err := wws.userRepo.FindByID(&user, workerUserID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Verify user is a worker and get banking info
	worker, err := wws.workerRepo.GetByUserID(workerUserID)
	if err != nil {
		return nil, errors.New("user is not a worker")
	}

	// Check if worker has sufficient balance
	if user.WalletBalance < request.Amount {
		return nil, fmt.Errorf("insufficient balance. Available: ₹%.2f, Requested: ₹%.2f", user.WalletBalance, request.Amount)
	}

	// Use worker's banking info if not provided in request
	accountName := request.AccountName
	accountNumber := request.AccountNumber
	bankName := request.BankName
	ifscCode := request.IFSCCode

	// Parse worker's banking info if bank details not provided
	if accountName == "" || accountNumber == "" || bankName == "" || ifscCode == "" {
		var bankingInfo models.BankingInfoData
		if worker.BankingInfo != "" {
			if err := json.Unmarshal([]byte(worker.BankingInfo), &bankingInfo); err == nil {
				if accountName == "" {
					accountName = bankingInfo.AccountHolderName
				}
				if accountNumber == "" {
					accountNumber = bankingInfo.AccountNumber
				}
				if bankName == "" {
					bankName = bankingInfo.BankName
				}
				if ifscCode == "" {
					ifscCode = bankingInfo.IFSCCode
				}
			}
		}

		// Validate that we have all required bank details
		if accountName == "" || accountNumber == "" || bankName == "" || ifscCode == "" {
			return nil, errors.New("bank account details are required. Please update your profile with banking information")
		}
	}

	// Create metadata with bank details
	metadata := models.JSONMap{
		"account_name":   accountName,
		"account_number": accountNumber,
		"bank_name":      bankName,
		"ifsc_code":      ifscCode,
	}

	// Create payment record for withdrawal request
	paymentReq := &models.CreatePaymentRequest{
		UserID:            workerUserID,
		Amount:            request.Amount,
		Currency:          "INR",
		Type:              models.PaymentTypeWorkerWithdrawal,
		Method:            "bank_transfer",
		RelatedEntityType: "worker_wallet",
		RelatedEntityID:   workerUserID,
		Description:       fmt.Sprintf("Worker withdrawal request of ₹%.2f", request.Amount),
		Notes:             request.Notes,
		Metadata:          &metadata,
	}

	// Create payment (status will be pending)
	payment, err := wws.paymentService.CreatePayment(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create withdrawal request: %w", err)
	}

	logrus.Infof("Withdrawal request created: user %d, amount: ₹%.2f, payment_id: %d", workerUserID, request.Amount, payment.ID)

	// TODO: Send notification to admins about new withdrawal request

	return payment, nil
}

// GetWorkerWithdrawals retrieves withdrawal history for a worker
func (wws *WorkerWithdrawalService) GetWorkerWithdrawals(workerUserID uint, page, limit int) ([]models.WorkerWithdrawalResponse, int64, error) {
	offset := (page - 1) * limit

	// Get withdrawal payments
	payments, err := wws.paymentService.GetPaymentsByUserAndType(workerUserID, []models.PaymentType{
		models.PaymentTypeWorkerWithdrawal,
	}, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get withdrawals: %w", err)
	}

	// Get total count
	total, err := wws.paymentService.GetPaymentCountByUserAndType(workerUserID, []models.PaymentType{
		models.PaymentTypeWorkerWithdrawal,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get withdrawal count: %w", err)
	}

	// Convert to withdrawal response
	withdrawals := make([]models.WorkerWithdrawalResponse, len(payments))
	for i, p := range payments {
		withdrawals[i] = wws.paymentToWithdrawalResponse(&p)
	}

	return withdrawals, total, nil
}

// GetPendingWithdrawals retrieves pending withdrawal requests for a worker
func (wws *WorkerWithdrawalService) GetPendingWithdrawals(workerUserID uint) ([]models.WorkerWithdrawalResponse, error) {
	// Get pending withdrawal payments
	payments, err := wws.paymentService.GetPaymentsByUserAndTypeAndStatus(workerUserID, []models.PaymentType{
		models.PaymentTypeWorkerWithdrawal,
	}, models.PaymentStatusPending, 100, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending withdrawals: %w", err)
	}

	// Convert to withdrawal response
	withdrawals := make([]models.WorkerWithdrawalResponse, len(payments))
	for i, p := range payments {
		withdrawals[i] = wws.paymentToWithdrawalResponse(&p)
	}

	return withdrawals, nil
}

// GetWithdrawalStats calculates withdrawal statistics for a worker
func (wws *WorkerWithdrawalService) GetWithdrawalStats(workerUserID uint) (float64, float64, error) {
	// Get total completed withdrawals
	totalWithdrawals, err := wws.paymentService.GetTotalAmountByUserAndTypeAndStatus(workerUserID, models.PaymentTypeWorkerWithdrawal, models.PaymentStatusCompleted)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get total withdrawals: %w", err)
	}

	// Get total pending withdrawals
	pendingWithdrawals, err := wws.paymentService.GetTotalAmountByUserAndTypeAndStatus(workerUserID, models.PaymentTypeWorkerWithdrawal, models.PaymentStatusPending)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get pending withdrawals: %w", err)
	}

	return totalWithdrawals, pendingWithdrawals, nil
}

// ApproveWithdrawal approves a withdrawal request and deducts from wallet (admin only)
func (wws *WorkerWithdrawalService) ApproveWithdrawal(paymentID uint, adminID uint, notes string) error {
	// Get payment
	payment, err := wws.paymentService.GetPaymentByID(paymentID)
	if err != nil {
		return fmt.Errorf("payment not found: %w", err)
	}

	// Verify it's a withdrawal request
	if payment.Type != models.PaymentTypeWorkerWithdrawal {
		return errors.New("payment is not a withdrawal request")
	}

	// Verify it's still pending
	if payment.Status != models.PaymentStatusPending {
		return fmt.Errorf("withdrawal request is not pending (status: %s)", payment.Status)
	}

	// Get user
	var user models.User
	if err := wws.userRepo.FindByID(&user, payment.UserID); err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Check if user still has sufficient balance
	if user.WalletBalance < payment.Amount {
		return fmt.Errorf("insufficient balance. Available: ₹%.2f, Withdrawal: ₹%.2f", user.WalletBalance, payment.Amount)
	}

	// Deduct from wallet
	balanceBefore := user.WalletBalance
	newBalance := user.WalletBalance - payment.Amount
	user.WalletBalance = newBalance

	if err := wws.userRepo.Update(&user); err != nil {
		return fmt.Errorf("failed to update wallet balance: %w", err)
	}

	// Update payment status
	now := time.Now()
	payment.Status = models.PaymentStatusCompleted
	payment.CompletedAt = &now
	payment.BalanceAfter = &newBalance

	// Add processing info to metadata
	if payment.Metadata == nil {
		metadata := models.JSONMap{}
		payment.Metadata = &metadata
	}
	(*payment.Metadata)["processed_by"] = adminID
	(*payment.Metadata)["processed_at"] = now
	if notes != "" {
		(*payment.Metadata)["admin_notes"] = notes
	}

	if err := wws.paymentService.UpdatePayment(payment); err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	logrus.Infof("Withdrawal approved: payment_id=%d, user_id=%d, amount=₹%.2f, balance: ₹%.2f -> ₹%.2f, admin=%d",
		payment.ID, payment.UserID, payment.Amount, balanceBefore, newBalance, adminID)

	// TODO: Send notification to worker about approved withdrawal

	return nil
}

// RejectWithdrawal rejects a withdrawal request (admin only)
func (wws *WorkerWithdrawalService) RejectWithdrawal(paymentID uint, adminID uint, reason string) error {
	// Get payment
	payment, err := wws.paymentService.GetPaymentByID(paymentID)
	if err != nil {
		return fmt.Errorf("payment not found: %w", err)
	}

	// Verify it's a withdrawal request
	if payment.Type != models.PaymentTypeWorkerWithdrawal {
		return errors.New("payment is not a withdrawal request")
	}

	// Verify it's still pending
	if payment.Status != models.PaymentStatusPending {
		return fmt.Errorf("withdrawal request is not pending (status: %s)", payment.Status)
	}

	// Update payment status
	now := time.Now()
	payment.Status = models.PaymentStatusFailed
	payment.FailedAt = &now

	// Add rejection info to metadata
	if payment.Metadata == nil {
		metadata := models.JSONMap{}
		payment.Metadata = &metadata
	}
	(*payment.Metadata)["processed_by"] = adminID
	(*payment.Metadata)["processed_at"] = now
	(*payment.Metadata)["rejection_reason"] = reason

	if err := wws.paymentService.UpdatePayment(payment); err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	logrus.Infof("Withdrawal rejected: payment_id=%d, user_id=%d, amount=₹%.2f, reason=%s, admin=%d",
		payment.ID, payment.UserID, payment.Amount, reason, adminID)

	// TODO: Send notification to worker about rejected withdrawal

	return nil
}

// GetAllWithdrawals retrieves all withdrawal requests for admin (with filters and pagination)
func (wws *WorkerWithdrawalService) GetAllWithdrawals(status string, search string, page, limit int) ([]models.WorkerWithdrawalResponse, int64, error) {
	// Build admin payment filters
	filters := &models.AdminPaymentFilters{
		PaymentFilters: models.PaymentFilters{
			Type:  models.PaymentTypeWorkerWithdrawal,
			Page:  page,
			Limit: limit,
		},
		Search: search,
	}

	// Add status filter if provided
	if status != "" && status != "all" {
		filters.Status = models.PaymentStatus(status)
	}

	// Get payments using existing admin payment method
	payments, pagination, err := wws.paymentService.GetAdminPayments(filters)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get withdrawals: %w", err)
	}

	// Convert to withdrawal response with user data
	withdrawals := make([]models.WorkerWithdrawalResponse, len(payments))
	for i, p := range payments {
		withdrawals[i] = wws.paymentToWithdrawalResponseWithUser(&p)
	}

	return withdrawals, int64(pagination.Total), nil
}

// GetAllPendingWithdrawals retrieves all pending withdrawal requests for admin
func (wws *WorkerWithdrawalService) GetAllPendingWithdrawals() ([]models.WorkerWithdrawalResponse, error) {
	// Build filters for pending withdrawals
	filters := &models.AdminPaymentFilters{
		PaymentFilters: models.PaymentFilters{
			Type:   models.PaymentTypeWorkerWithdrawal,
			Status: models.PaymentStatusPending,
			Page:   1,
			Limit:  1000,
		},
	}

	// Get all pending withdrawal payments
	payments, _, err := wws.paymentService.GetAdminPayments(filters)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending withdrawals: %w", err)
	}

	// Convert to withdrawal response with user data
	withdrawals := make([]models.WorkerWithdrawalResponse, len(payments))
	for i, p := range payments {
		withdrawals[i] = wws.paymentToWithdrawalResponseWithUser(&p)
	}

	return withdrawals, nil
}

// Helper function to convert payment to withdrawal response
func (wws *WorkerWithdrawalService) paymentToWithdrawalResponse(p *models.Payment) models.WorkerWithdrawalResponse {
	response := models.WorkerWithdrawalResponse{
		ID:               p.ID,
		PaymentReference: p.PaymentReference,
		Amount:           p.Amount,
		Status:           string(p.Status),
		RequestedAt:      p.InitiatedAt,
		ProcessedAt:      p.CompletedAt,
		Notes:            p.Notes,
	}

	// Extract bank details from metadata
	if p.Metadata != nil {
		if accountName, ok := (*p.Metadata)["account_name"].(string); ok {
			response.AccountName = accountName
		}
		if accountNumber, ok := (*p.Metadata)["account_number"].(string); ok {
			response.AccountNumber = accountNumber
		}
		if bankName, ok := (*p.Metadata)["bank_name"].(string); ok {
			response.BankName = bankName
		}
		if ifscCode, ok := (*p.Metadata)["ifsc_code"].(string); ok {
			response.IFSCCode = ifscCode
		}
		if processedBy, ok := (*p.Metadata)["processed_by"].(float64); ok {
			processedByUint := uint(processedBy)
			response.ProcessedBy = &processedByUint
		}
		if rejectionReason, ok := (*p.Metadata)["rejection_reason"].(string); ok {
			response.RejectionReason = &rejectionReason
		}
	}

	return response
}

// Helper function to convert payment to withdrawal response with user data (for admin view)
func (wws *WorkerWithdrawalService) paymentToWithdrawalResponseWithUser(p *models.Payment) models.WorkerWithdrawalResponse {
	response := wws.paymentToWithdrawalResponse(p)

	// Load user data if not already loaded
	if p.User.ID == 0 {
		var user models.User
		if err := wws.userRepo.FindByID(&user, p.UserID); err == nil {
			p.User = user
		}
	}

	// Add user data to response
	if p.User.ID != 0 {
		userInfo := &models.UserBasicInfo{
			ID:    p.User.ID,
			Name:  p.User.Name,
			Phone: p.User.Phone,
		}
		if p.User.Email != nil {
			userInfo.Email = *p.User.Email
		}
		response.User = userInfo
	}

	return response
}
