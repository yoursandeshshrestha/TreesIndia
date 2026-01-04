package repositories

import (
	"strings"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type WorkerRepository struct {
	db *gorm.DB
}

func NewWorkerRepository() *WorkerRepository {
	return &WorkerRepository{
		db: database.GetDB(),
	}
}

// GetByUserID gets a worker by user ID
func (wr *WorkerRepository) GetByUserID(userID uint) (*models.Worker, error) {
	var worker models.Worker
	err := wr.db.Preload("User").Where("user_id = ?", userID).First(&worker).Error
	if err != nil {
		return nil, err
	}
	return &worker, nil
}

// GetByID gets a worker by ID
func (wr *WorkerRepository) GetByID(id uint) (*models.Worker, error) {
	var worker models.Worker
	err := wr.db.Preload("User").First(&worker, id).Error
	if err != nil {
		return nil, err
	}
	return &worker, nil
}

// Update updates a worker
func (wr *WorkerRepository) Update(worker *models.Worker) error {
	return wr.db.Save(worker).Error
}

// IncrementCompletedJob increments the worker's completed job count and earnings
func (wr *WorkerRepository) IncrementCompletedJob(workerID uint, earnings float64) error {
	return wr.db.Model(&models.Worker{}).
		Where("id = ?", workerID).
		Updates(map[string]interface{}{
			"total_jobs":     gorm.Expr("total_jobs + 1"),
			"total_bookings": gorm.Expr("total_bookings + 1"),
			"earnings":       gorm.Expr("earnings + ?", earnings),
		}).Error
}

// UpdateRating updates the worker's rating
func (wr *WorkerRepository) UpdateRating(workerID uint, newRating float64) error {
	return wr.db.Model(&models.Worker{}).
		Where("id = ?", workerID).
		Update("rating", newRating).Error
}

// UpdateAvailability updates the worker's availability status
func (wr *WorkerRepository) UpdateAvailability(workerID uint, isAvailable bool) error {
	return wr.db.Model(&models.Worker{}).
		Where("id = ?", workerID).
		Update("is_available", isAvailable).Error
}

// GetAllWorkers gets all workers with optional filters
func (wr *WorkerRepository) GetAllWorkers(filters *WorkerFilters) ([]models.Worker, error) {
	var workers []models.Worker
	query := wr.db.Model(&models.Worker{}).Preload("User")

	if filters != nil {
		if filters.IsActive != nil {
			query = query.Where("workers.is_active = ?", *filters.IsActive)
		}
		if filters.IsAvailable != nil {
			query = query.Where("workers.is_available = ?", *filters.IsAvailable)
		}
		if filters.WorkerType != "" {
			query = query.Where("workers.worker_type = ?", filters.WorkerType)
		}
		
		// Search filter - simple substring matching in worker name, skills, and address
		if filters.Search != "" {
			searchTerm := "%" + strings.ToLower(filters.Search) + "%"
			query = query.Where("LOWER(workers.contact_info::text) ILIKE ? OR LOWER(workers.skills::text) ILIKE ? OR LOWER(workers.address::text) ILIKE ?", 
				searchTerm, searchTerm, searchTerm)
		}
		
		// Skills filter - simple substring matching in skills JSON array
		if filters.Skills != "" {
			// Split skills by comma and create OR conditions for each skill
			skills := strings.Split(filters.Skills, ",")
			var skillConditions []string
			var skillArgs []interface{}
			
			for _, skill := range skills {
				skill = strings.TrimSpace(skill)
				if skill != "" {
					// Simple substring search in skills
					skillConditions = append(skillConditions, "LOWER(workers.skills::text) ILIKE ?")
					skillArgs = append(skillArgs, "%"+strings.ToLower(skill)+"%")
				}
			}
			
			if len(skillConditions) > 0 {
				query = query.Where(strings.Join(skillConditions, " OR "), skillArgs...)
			}
		}
		
		// Experience range filters
		if filters.MinExperience != nil {
			query = query.Where("workers.experience_years >= ?", *filters.MinExperience)
		}
		if filters.MaxExperience != nil {
			query = query.Where("workers.experience_years <= ?", *filters.MaxExperience)
		}
		
		// Location filters
		if filters.State != "" {
			query = query.Where("workers.address::text ILIKE ?", "%\"state\":\""+filters.State+"\"%")
		}
		if filters.City != "" {
			query = query.Where("workers.address::text ILIKE ?", "%\"city\":\""+filters.City+"\"%")
		}
		
		// Sorting
		if filters.SortBy != "" {
			order := "ASC"
			if filters.SortOrder == "desc" {
				order = "DESC"
			}
			
			switch filters.SortBy {
			case "newest", "oldest":
				query = query.Order("workers.created_at " + order)
			case "highest_experience", "lowest_experience":
				query = query.Order("workers.experience_years " + order)
			case "rating":
				query = query.Order("workers.rating " + order)
			case "total_bookings":
				query = query.Order("workers.total_bookings " + order)
			case "earnings":
				query = query.Order("workers.earnings " + order)
			default:
				// Default sorting by created_at DESC
				query = query.Order("workers.created_at DESC")
			}
		} else {
			// Default sorting by created_at DESC
			query = query.Order("workers.created_at DESC")
		}
	} else {
		// Default sorting when no filters
		query = query.Order("workers.created_at DESC")
	}

	err := query.Find(&workers).Error
	return workers, err
}

// WorkerFilters represents filters for worker queries
type WorkerFilters struct {
	IsActive      *bool              `json:"is_active"`
	IsAvailable   *bool              `json:"is_available"`
	WorkerType    models.WorkerType  `json:"worker_type"`
	Search        string             `json:"search"`
	Skills        string             `json:"skills"`
	MinExperience *int               `json:"min_experience"`
	MaxExperience *int               `json:"max_experience"`
	State         string             `json:"state"`
	City          string             `json:"city"`
	SortBy        string             `json:"sort_by"`
	SortOrder     string             `json:"sort_order"`
}
