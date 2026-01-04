package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
	"treesindia/config"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/admin"
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

// UploadChatImage uploads an image to Cloudinary for chat messages with auto-delete tracking
// Returns URL and publicID for tracking expiration
func (cs *CloudinaryService) UploadChatImage(file *multipart.FileHeader, folder string) (string, string, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Open the file
	src, err := file.Open()
	if err != nil {
		logrus.Errorf("Failed to open file %s: %v", file.Filename, err)
		return "", "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s_%d%s", strings.TrimSuffix(file.Filename, ext), timestamp, ext)
	publicID := fmt.Sprintf("%s/%s", folder, filename)

	// Calculate expiration date (30 days from now)
	expirationDate := time.Now().Add(30 * 24 * time.Hour)
	
	// Upload to Cloudinary with timeout context
	// Note: Cloudinary doesn't support direct expiration in upload params
	// We'll use tags to track chat media and handle deletion via background job
	uploadParams := uploader.UploadParams{
		PublicID:     publicID,
		Folder:       folder,
		ResourceType: "image",
		// Add optimization parameters for better performance
		Transformation: "f_auto,q_auto", // Auto format and quality optimization
		// Add tags for tracking and potential auto-deletion
		Tags: []string{"chat_media", "auto_delete_30d"},
	}
	
	result, err := cs.cld.Upload.Upload(ctx, src, uploadParams)
	if err != nil {
		logrus.Errorf("Failed to upload image to Cloudinary: %v", err)
		return "", "", fmt.Errorf("failed to upload image to Cloudinary: %v", err)
	}

	logrus.Infof("Successfully uploaded chat image %s to Cloudinary: %s (expires: %s)", file.Filename, result.SecureURL, expirationDate.Format(time.RFC3339))
	return result.SecureURL, result.PublicID, nil
}

// UploadImage uploads an image to Cloudinary with timeout (backward compatibility)
func (cs *CloudinaryService) UploadImage(file *multipart.FileHeader, folder string) (string, error) {
	url, _, err := cs.UploadChatImage(file, folder)
	return url, err
}

// UploadImageFromPath uploads an image from a local file path to Cloudinary
func (cs *CloudinaryService) UploadImageFromPath(filePath string, folder string) (string, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		logrus.Errorf("Failed to open file %s: %v", filePath, err)
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	// Get file info for filename
	fileInfo, err := file.Stat()
	if err != nil {
		logrus.Errorf("Failed to get file info for %s: %v", filePath, err)
		return "", fmt.Errorf("failed to get file info: %v", err)
	}

	// Generate unique filename
	ext := filepath.Ext(fileInfo.Name())
	if ext == "" {
		ext = ".jpg" // Default extension if none found
	}
	baseName := strings.TrimSuffix(fileInfo.Name(), ext)
	// Remove any existing extension from baseName to avoid double extensions
	baseName = strings.TrimSuffix(baseName, filepath.Ext(baseName))
	timestamp := time.Now().UnixNano() // Use nanoseconds for better uniqueness
	filename := fmt.Sprintf("%s_%d%s", baseName, timestamp, ext)
	// Don't include folder in publicID when Folder is set, to avoid duplication
	publicID := filename

	// Upload to Cloudinary with timeout context
	uploadParams := uploader.UploadParams{
		PublicID:     publicID,
		Folder:       folder,
		ResourceType: "image",
		// Add optimization parameters for better performance
		Transformation: "f_auto,q_auto", // Auto format and quality optimization
	}

	result, err := cs.cld.Upload.Upload(ctx, file, uploadParams)
	if err != nil {
		logrus.Errorf("Failed to upload image to Cloudinary: %v", err)
		return "", fmt.Errorf("failed to upload image to Cloudinary: %v", err)
	}

	logrus.Infof("Successfully uploaded image %s to Cloudinary: %s", filePath, result.SecureURL)
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

// UploadChatVideo uploads a video to Cloudinary for chat messages with auto-delete tracking
// Returns URL and publicID for tracking expiration
func (cs *CloudinaryService) UploadChatVideo(file *multipart.FileHeader, folder string) (string, string, error) {
	// Create context with timeout (longer for videos)
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Open the file
	src, err := file.Open()
	if err != nil {
		logrus.Errorf("Failed to open file %s: %v", file.Filename, err)
		return "", "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s_%d%s", strings.TrimSuffix(file.Filename, ext), timestamp, ext)
	publicID := fmt.Sprintf("%s/%s", folder, filename)

	// Calculate expiration date (30 days from now)
	expirationDate := time.Now().Add(30 * 24 * time.Hour)

	// Upload to Cloudinary with timeout context
	// Note: Cloudinary doesn't support direct expiration in upload params
	// We'll use tags to track chat media and handle deletion via background job
	uploadParams := uploader.UploadParams{
		PublicID:     publicID,
		Folder:       folder,
		ResourceType: "video",
		// Add optimization parameters for better performance
		Transformation: "f_auto,q_auto", // Auto format and quality optimization
		// Add tags for tracking and potential auto-deletion
		Tags: []string{"chat_media", "auto_delete_30d"},
	}
	
	result, err := cs.cld.Upload.Upload(ctx, src, uploadParams)
	if err != nil {
		logrus.Errorf("Failed to upload video to Cloudinary: %v", err)
		return "", "", fmt.Errorf("failed to upload video to Cloudinary: %v", err)
	}

	logrus.Infof("Successfully uploaded chat video %s to Cloudinary: %s (expires: %s)", file.Filename, result.SecureURL, expirationDate.Format(time.RFC3339))
	return result.SecureURL, result.PublicID, nil
}

// UploadVideo uploads a video to Cloudinary with timeout (backward compatibility)
func (cs *CloudinaryService) UploadVideo(file *multipart.FileHeader, folder string) (string, error) {
	url, _, err := cs.UploadChatVideo(file, folder)
	return url, err
}

// UploadMedia uploads either an image or video to Cloudinary based on content type
func (cs *CloudinaryService) UploadMedia(file *multipart.FileHeader, folder string, mediaType string) (string, error) {
	if mediaType == "video" {
		return cs.UploadVideo(file, folder)
	}
	return cs.UploadImage(file, folder)
}

// DeleteMedia deletes a media file (image or video) from Cloudinary
func (cs *CloudinaryService) DeleteMedia(publicID string, resourceType string) error {
	ctx := context.Background()
	result, err := cs.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID:     publicID,
		ResourceType: resourceType,
	})

	if err != nil {
		return fmt.Errorf("failed to delete media: %v", err)
	}

	logrus.Infof("Media deleted successfully: %s", result.Result)
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

// GetResourceTypeFromURL extracts the resource type from a Cloudinary URL
func (cs *CloudinaryService) GetResourceTypeFromURL(url string) string {
	// Example URL: https://res.cloudinary.com/dxw83r0h4/image/upload/v1234567890/categories/plumbing.jpg
	// or: https://res.cloudinary.com/dxw83r0h4/video/upload/v1234567890/hero/video.mp4
	parts := strings.Split(url, "/")
	
	// Find the resource type (image or video) before "upload"
	for i, part := range parts {
		if part == "upload" && i > 0 {
			return parts[i-1]
		}
	}
	
	return "image" // default to image if not found
}

// DeleteAllResources deletes all resources from Cloudinary
// This uses the Admin API to list and delete all resources
func (cs *CloudinaryService) DeleteAllResources() error {
	ctx := context.Background()
	
	logrus.Info("🗑️  Starting Cloudinary cleanup - deleting all resources...")
	
	// Delete images
	if err := cs.deleteResourcesByType(ctx, "image"); err != nil {
		logrus.Warnf("Error deleting images: %v", err)
	}
	
	// Delete videos
	if err := cs.deleteResourcesByType(ctx, "video"); err != nil {
		logrus.Warnf("Error deleting videos: %v", err)
	}
	
	// Delete raw files
	if err := cs.deleteResourcesByType(ctx, "raw"); err != nil {
		logrus.Warnf("Error deleting raw files: %v", err)
	}
	
	logrus.Info("✅ Cloudinary cleanup completed")
	return nil
}

// deleteResourcesByType deletes all resources of a specific type
func (cs *CloudinaryService) deleteResourcesByType(ctx context.Context, resourceType string) error {
	const maxResults = 500
	totalDeleted := 0
	nextCursor := ""
	
	// Convert string to AssetType
	var assetType api.AssetType
	switch resourceType {
	case "image":
		assetType = api.Image
	case "video":
		assetType = api.Video
	case "raw":
		assetType = api.AssetType("raw")
	default:
		return fmt.Errorf("unsupported resource type: %s", resourceType)
	}
	
	for {
		// List resources
		params := admin.AssetsParams{
			AssetType:  assetType,
			MaxResults: maxResults,
		}
		if nextCursor != "" {
			params.NextCursor = nextCursor
		}
		
		result, err := cs.cld.Admin.Assets(ctx, params)
		if err != nil {
			return fmt.Errorf("failed to list %s resources: %v", resourceType, err)
		}
		
		if len(result.Assets) == 0 {
			break // No more resources
		}
		
		// Extract public IDs
		publicIDs := make([]string, 0, len(result.Assets))
		for _, asset := range result.Assets {
			publicIDs = append(publicIDs, asset.PublicID)
		}
		
		// Delete resources in batches (max 100 per request)
		batchSize := 100
		for i := 0; i < len(publicIDs); i += batchSize {
			end := i + batchSize
			if end > len(publicIDs) {
				end = len(publicIDs)
			}
			batch := publicIDs[i:end]
			
			deleteResult, err := cs.cld.Admin.DeleteAssets(ctx, admin.DeleteAssetsParams{
				AssetType: assetType,
				PublicIDs: api.CldAPIArray(batch),
			})
			
			if err != nil {
				return fmt.Errorf("failed to delete %s resources: %v", resourceType, err)
			}
			
			deletedCount := len(deleteResult.Deleted)
			totalDeleted += deletedCount
			logrus.Infof("Deleted %d %s resources (batch, total: %d)", deletedCount, resourceType, totalDeleted)
		}
		
		// Check if there are more resources
		if result.NextCursor == "" {
			break
		}
		nextCursor = result.NextCursor
	}
	
	if totalDeleted > 0 {
		logrus.Infof("✅ Deleted %d %s resources from Cloudinary", totalDeleted, resourceType)
	} else {
		logrus.Infof("ℹ️  No %s resources found in Cloudinary", resourceType)
	}
	
	return nil
}
