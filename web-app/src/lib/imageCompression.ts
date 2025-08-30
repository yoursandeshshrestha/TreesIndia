// Utility function to compress images before upload
export const compressImage = (
  file: File,
  maxWidth = 1024,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Compress multiple files
export const compressFiles = async (files: {
  [key: string]: File;
}): Promise<{ [key: string]: File }> => {
  const compressedFiles: { [key: string]: File } = {};

  for (const [key, file] of Object.entries(files)) {
    if (file.type.startsWith("image/")) {
      try {
        compressedFiles[key] = await compressImage(file);
        console.log(
          `Compressed ${key}: ${file.size} -> ${compressedFiles[key].size} bytes`
        );
      } catch (error) {
        console.warn(`Failed to compress ${key}, using original:`, error);
        compressedFiles[key] = file;
      }
    } else {
      compressedFiles[key] = file;
    }
  }

  return compressedFiles;
};
