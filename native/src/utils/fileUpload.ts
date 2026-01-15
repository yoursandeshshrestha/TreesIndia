import * as ImagePicker from 'expo-image-picker';

export interface PickedFile {
  uri: string;
  type: 'image' | 'video';
  mimeType: string;
  fileName: string;
  fileSize: number;
}

export interface FileUploadError {
  code: string;
  message: string;
}

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    // Error handling
    return false;
  }
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    // Error handling
    return false;
  }
};

/**
 * Pick an image from the camera
 */
export const pickImageFromCamera = async (): Promise<PickedFile | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Camera permission is required to take photos',
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      fileSize: asset.fileSize || 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Pick an image from the gallery
 */
export const pickImageFromGallery = async (): Promise<PickedFile | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Media library permission is required to select photos',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize || 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Pick a video from the gallery
 */
export const pickVideoFromGallery = async (): Promise<PickedFile | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Media library permission is required to select videos',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // Validate video size (50MB max as per backend)
    if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
      throw {
        code: 'FILE_TOO_LARGE',
        message: 'Video size must be less than 50MB',
      };
    }

    return {
      uri: asset.uri,
      type: 'video',
      mimeType: asset.mimeType || 'video/mp4',
      fileName: asset.fileName || `video_${Date.now()}.mp4`,
      fileSize: asset.fileSize || 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Record a video with the camera
 */
export const recordVideoFromCamera = async (): Promise<PickedFile | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Camera permission is required to record videos',
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // Validate video size (50MB max as per backend)
    if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
      throw {
        code: 'FILE_TOO_LARGE',
        message: 'Video size must be less than 50MB',
      };
    }

    return {
      uri: asset.uri,
      type: 'video',
      mimeType: asset.mimeType || 'video/mp4',
      fileName: asset.fileName || `video_${Date.now()}.mp4`,
      fileSize: asset.fileSize || 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (file: PickedFile, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.fileSize <= maxSizeBytes;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
