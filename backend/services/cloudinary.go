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
	cloudinaryURL := config.GetCloudinaryURL()
	if cloudinaryURL == "" {
		return nil, fmt.Errorf("CLOUDINARY_URL not configured")
	}

	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Cloudinary: %v", err)
	}

	return &CloudinaryService{
		cld: cld,
	}, nil
}

// UploadImage uploads an image to Cloudinary
func (cs *CloudinaryService) UploadImage(file *multipart.FileHeader, folder string) (string, error) {
	// Open the file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s_%d%s", strings.TrimSuffix(file.Filename, ext), timestamp, ext)

	// Upload to Cloudinary
	ctx := context.Background()
	result, err := cs.cld.Upload.Upload(ctx, src, uploader.UploadParams{
		PublicID: fmt.Sprintf("%s/%s", folder, filename),
		Folder:   folder,
		ResourceType: "image",
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload image: %v", err)
	}

	logrus.Infof("Image uploaded successfully: %s", result.SecureURL)
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
