package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"
	"treesindia/config"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/sirupsen/logrus"
)

// CloudinaryService handles image upload and management
type CloudinaryService struct {
	cld *cloudinary.Cloudinary
}

// NewCloudinaryService creates a new Cloudinary service instance
func NewCloudinaryService() (*CloudinaryService, error) {
	appConfig := config.LoadConfig()
	cloudinaryURL := appConfig.CloudinaryURL
	
	logrus.Infof("Initializing Cloudinary service...")
	logrus.Infof("Cloudinary URL configured: %v", cloudinaryURL != "")
	
	if cloudinaryURL == "" {
		logrus.Error("CLOUDINARY_URL environment variable is not set")
		logrus.Error("Please set CLOUDINARY_URL in your .env file")
		logrus.Error("Format: cloudinary://your-cloud-name:your-api-key@your-cloud-name")
		return nil, fmt.Errorf("CLOUDINARY_URL not configured. Please set the CLOUDINARY_URL environment variable")
	}

	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		logrus.Errorf("Failed to initialize Cloudinary client: %v", err)
		return nil, fmt.Errorf("failed to initialize Cloudinary: %v", err)
	}

	logrus.Info("Cloudinary service initialized successfully")
	return &CloudinaryService{
		cld: cld,
	}, nil
}

// UploadImage uploads an image to Cloudinary with timeout
func (cs *CloudinaryService) UploadImage(file *multipart.FileHeader, folder string) (string, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Open the file
	src, err := file.Open()
	if err != nil {
		logrus.Errorf("Failed to open file %s: %v", file.Filename, err)
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s_%d%s", strings.TrimSuffix(file.Filename, ext), timestamp, ext)

	// Upload to Cloudinary with timeout context
	uploadParams := uploader.UploadParams{
		PublicID:     fmt.Sprintf("%s/%s", folder, filename),
		Folder:       folder,
		ResourceType: "image",
		// Add optimization parameters for better performance
		Transformation: "f_auto,q_auto", // Auto format and quality optimization
	}
	
	result, err := cs.cld.Upload.Upload(ctx, src, uploadParams)
	if err != nil {
		logrus.Errorf("Failed to upload image to Cloudinary: %v", err)
		return "", fmt.Errorf("failed to upload image to Cloudinary: %v", err)
	}

	logrus.Infof("Successfully uploaded %s to Cloudinary: %s", file.Filename, result.SecureURL)
	return result.SecureURL, nil
}

// DeleteImage deletes an image from Cloudinary
func (cs *CloudinaryService) DeleteImage(publicID string) error {
	ctx := context.Background()
	result, err := cs.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	if err != nil {
		return fmt.Errorf("failed to delete image: %v", err)
	}

	logrus.Infof("Image deleted successfully: %s", result.Result)
	return nil
}

// GetPublicIDFromURL extracts the public ID from a Cloudinary URL
func (cs *CloudinaryService) GetPublicIDFromURL(url string) string {
	// Example URL: https://res.cloudinary.com/dxw83r0h4/image/upload/v1234567890/categories/plumbing.jpg
	parts := strings.Split(url, "/")
	if len(parts) < 2 {
		return ""
	}

	// Find the index after "upload"
	uploadIndex := -1
	for i, part := range parts {
		if part == "upload" {
			uploadIndex = i
			break
		}
	}

	if uploadIndex == -1 || uploadIndex+2 >= len(parts) {
		return ""
	}

	// Skip version number and get the rest
	pathParts := parts[uploadIndex+2:]
	return strings.Join(pathParts, "/")
}
