package models

import "time"

// WorkerWithdrawalRequest represents a withdrawal request from a worker
type WorkerWithdrawalRequest struct {
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	AccountName   string  `json:"account_name"`   // Optional - will use worker's banking info if not provided
	AccountNumber string  `json:"account_number"` // Optional - will use worker's banking info if not provided
	BankName      string  `json:"bank_name"`      // Optional - will use worker's banking info if not provided
	IFSCCode      string  `json:"ifsc_code"`      // Optional - will use worker's banking info if not provided
	Notes         string  `json:"notes"`
}

// WorkerWithdrawalResponse represents a withdrawal payment with additional details
type WorkerWithdrawalResponse struct {
	ID               uint       `json:"id"`
	PaymentReference string     `json:"payment_reference"`
	Amount           float64    `json:"amount"`
	Status           string     `json:"status"` // pending, completed, failed, cancelled
	AccountName      string     `json:"account_name"`
	AccountNumber    string     `json:"account_number"`
	BankName         string     `json:"bank_name"`
	IFSCCode         string     `json:"ifsc_code"`
	RequestedAt      time.Time  `json:"requested_at"`
	ProcessedAt      *time.Time `json:"processed_at"`
	ProcessedBy      *uint      `json:"processed_by"`
	ProcessedByName  *string    `json:"processed_by_name"`
	RejectionReason  *string    `json:"rejection_reason"`
	Notes            string     `json:"notes"`
	User             *UserBasicInfo `json:"user,omitempty"` // User information for admin view
}

// UserBasicInfo contains basic user information for withdrawal responses
type UserBasicInfo struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// WithdrawalSummary extends EarningsSummary with withdrawal information
type WithdrawalSummary struct {
	TotalEarnings          float64 `json:"total_earnings"`
	TotalWithdrawals       float64 `json:"total_withdrawals"`
	PendingWithdrawals     float64 `json:"pending_withdrawals"`
	AvailableBalance       float64 `json:"available_balance"`
	HoursWorked            float64 `json:"hours_worked"`
	FixedServicesCount     int     `json:"fixed_services_count"`
	InquiryServicesCount   int     `json:"inquiry_services_count"`
	TotalServices          int     `json:"total_services"`
	Period                 string  `json:"period"`
}

// WithdrawalDashboardResponse combines earnings and withdrawal information
type WithdrawalDashboardResponse struct {
	Summary              WithdrawalSummary          `json:"summary"`
	RecentAssignments    []RecentAssignment         `json:"recent_assignments"`
	RecentWithdrawals    []WorkerWithdrawalResponse `json:"recent_withdrawals"`
	PendingWithdrawals   []WorkerWithdrawalResponse `json:"pending_withdrawals"`
}
