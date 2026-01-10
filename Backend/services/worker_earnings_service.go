package services

import (
	"errors"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type WorkerEarningsService struct {
	workerEarningsRepo *repositories.WorkerEarningsRepository
	workerRepo         *repositories.WorkerRepository
	withdrawalService  *WorkerWithdrawalService
}

func NewWorkerEarningsService() *WorkerEarningsService {
	return &WorkerEarningsService{
		workerEarningsRepo: repositories.NewWorkerEarningsRepository(),
		workerRepo:         repositories.NewWorkerRepository(),
		withdrawalService:  NewWorkerWithdrawalService(),
	}
}

// GetWorkerEarningsDashboard retrieves complete earnings dashboard data
func (wes *WorkerEarningsService) GetWorkerEarningsDashboard(workerUserID uint, period string) (*models.WorkerEarningsDashboardResponse, error) {
	// Verify worker exists by checking user ID
	_, err := wes.workerRepo.GetByUserID(workerUserID)
	if err != nil {
		logrus.Errorf("Worker not found for user ID %d: %v", workerUserID, err)
		return nil, errors.New("worker not found")
	}

	// Validate and normalize period
	if period == "" {
		period = "30_days"
	}

	validPeriods := map[string]bool{
		"30_days":  true,
		"90_days":  true,
		"all_time": true,
	}

	if !validPeriods[period] {
		return nil, errors.New("invalid period. Valid values: 30_days, 90_days, all_time")
	}

	// Calculate start date based on period
	startDate := repositories.CalculateStartDate(period)

	// Get earnings summary
	// Note: worker_assignments.worker_id stores user_id, not workers.id
	summary, err := wes.workerEarningsRepo.GetEarningsSummary(workerUserID, startDate)
	if err != nil {
		logrus.Errorf("Failed to get earnings summary: %v", err)
		return nil, errors.New("failed to retrieve earnings summary")
	}
	summary.Period = period

	// Get recent assignments (limit to 10)
	// Note: worker_assignments.worker_id stores user_id, not workers.id
	recentAssignments, err := wes.workerEarningsRepo.GetRecentAssignments(workerUserID, startDate, 10)
	if err != nil {
		logrus.Errorf("Failed to get recent assignments: %v", err)
		return nil, errors.New("failed to retrieve recent assignments")
	}

	// Get withdrawal statistics
	totalWithdrawals, pendingWithdrawals, err := wes.withdrawalService.GetWithdrawalStats(workerUserID)
	if err != nil {
		logrus.Errorf("Failed to get withdrawal stats: %v", err)
		// Continue without withdrawal stats
		totalWithdrawals = 0
		pendingWithdrawals = 0
	}

	// Get worker's current wallet balance
	worker, err := wes.workerRepo.GetByUserID(workerUserID)
	var availableBalance float64
	if err == nil && worker.User.ID != 0 {
		availableBalance = worker.User.WalletBalance
	}

	// Build withdrawal summary
	withdrawalSummary := &models.WithdrawalSummary{
		TotalEarnings:        summary.TotalEarnings,
		TotalWithdrawals:     totalWithdrawals,
		PendingWithdrawals:   pendingWithdrawals,
		AvailableBalance:     availableBalance,
		HoursWorked:          summary.HoursWorked,
		FixedServicesCount:   summary.FixedServicesCount,
		InquiryServicesCount: summary.InquiryServicesCount,
		TotalServices:        summary.TotalServices,
		Period:               summary.Period,
	}

	return &models.WorkerEarningsDashboardResponse{
		Summary:           *summary,
		RecentAssignments: recentAssignments,
		WithdrawalSummary: withdrawalSummary,
	}, nil
}
