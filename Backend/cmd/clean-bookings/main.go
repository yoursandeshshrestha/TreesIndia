package main

import (
	"log"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load application configuration
	appConfig := config.LoadConfig()

	// Initialize database
	dsn := appConfig.GetDatabaseURL()
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
		SkipDefaultTransaction:                   true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Set the database instance
	database.SetDB(db)

	logrus.Warn("⚠️  Starting deletion of all bookings and related records...")

	// Count bookings before deletion
	var countBefore int64
	db.Model(&models.Booking{}).Count(&countBefore)
	logrus.Infof("Found %d bookings to delete", countBefore)

	if countBefore == 0 {
		logrus.Info("No bookings found to delete")
		return
	}

	// Delete related records first (to avoid foreign key constraint issues)
	// Order matters: delete child records before parent records

	// 1. Delete Worker Assignments
	var workerAssignmentCount int64
	db.Model(&models.WorkerAssignment{}).Count(&workerAssignmentCount)
	if workerAssignmentCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.WorkerAssignment{})
		if result.Error != nil {
			log.Fatal("Failed to delete worker assignments:", result.Error)
		}
		logrus.Infof("✅ Deleted %d worker assignments", result.RowsAffected)
	}

	// 2. Delete Buffer Requests
	var bufferRequestCount int64
	db.Model(&models.BufferRequest{}).Count(&bufferRequestCount)
	if bufferRequestCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.BufferRequest{})
		if result.Error != nil {
			log.Fatal("Failed to delete buffer requests:", result.Error)
		}
		logrus.Infof("✅ Deleted %d buffer requests", result.RowsAffected)
	}

	// 3. Delete Payment Segments
	var paymentSegmentCount int64
	db.Model(&models.PaymentSegment{}).Count(&paymentSegmentCount)
	if paymentSegmentCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.PaymentSegment{})
		if result.Error != nil {
			log.Fatal("Failed to delete payment segments:", result.Error)
		}
		logrus.Infof("✅ Deleted %d payment segments", result.RowsAffected)
	}

	// 4. Delete Call Logs (must be deleted before CallMaskingEnabled)
	var callLogCount int64
	db.Model(&models.CallLog{}).Count(&callLogCount)
	if callLogCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.CallLog{})
		if result.Error != nil {
			log.Fatal("Failed to delete call logs:", result.Error)
		}
		logrus.Infof("✅ Deleted %d call logs", result.RowsAffected)
	}

	// 5. Delete Call Masking Enabled records
	var callMaskingCount int64
	db.Model(&models.CallMaskingEnabled{}).Count(&callMaskingCount)
	if callMaskingCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.CallMaskingEnabled{})
		if result.Error != nil {
			log.Fatal("Failed to delete call masking enabled records:", result.Error)
		}
		logrus.Infof("✅ Deleted %d call masking enabled records", result.RowsAffected)
	}

	// 6. Delete Worker Location records
	var workerLocationCount int64
	db.Model(&models.WorkerLocation{}).Count(&workerLocationCount)
	if workerLocationCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.WorkerLocation{})
		if result.Error != nil {
			log.Fatal("Failed to delete worker location records:", result.Error)
		}
		logrus.Infof("✅ Deleted %d worker location records", result.RowsAffected)
	}

	// 7. Delete Payments related to bookings
	var paymentCount int64
	db.Model(&models.Payment{}).Where("related_entity_type = ?", "booking").Count(&paymentCount)
	if paymentCount > 0 {
		result := db.Unscoped().Where("related_entity_type = ?", "booking").Delete(&models.Payment{})
		if result.Error != nil {
			log.Fatal("Failed to delete booking-related payments:", result.Error)
		}
		logrus.Infof("✅ Deleted %d booking-related payments", result.RowsAffected)
	}

	// 8. Delete Chat Rooms related to bookings (only those with booking_id set)
	var chatRoomCount int64
	db.Model(&models.ChatRoom{}).Where("booking_id IS NOT NULL").Count(&chatRoomCount)
	if chatRoomCount > 0 {
		result := db.Unscoped().Where("booking_id IS NOT NULL").Delete(&models.ChatRoom{})
		if result.Error != nil {
			log.Fatal("Failed to delete booking-related chat rooms:", result.Error)
		}
		logrus.Infof("✅ Deleted %d booking-related chat rooms", result.RowsAffected)
	}

	// 9. Finally, delete all bookings (including soft-deleted ones)
	result := db.Unscoped().Where("1 = 1").Delete(&models.Booking{})
	if result.Error != nil {
		log.Fatal("Failed to delete bookings:", result.Error)
	}

	logrus.Infof("✅ Successfully deleted %d bookings", result.RowsAffected)
	logrus.Info("🎉 Booking cleanup completed successfully")
}
