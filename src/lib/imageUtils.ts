// Image conversion utilities using Canvas API

export interface ConversionOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
}

export interface ConversionResult {
  file: File;
  originalSize: number;
  newSize: number;
  compressionRatio: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  resizeMode?: 'stretch' | 'fit' | 'fill';
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RotateOptions {
  angle: number; // in degrees
}

export interface CompressOptions {
  quality: number; // 0.1 to 1.0
  format?: 'png' | 'jpeg' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
}

export async function convertImage(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate dimensions with optional max width/height
        let { width, height } = img;
        
        if (options.maxWidth && width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }
        
        if (options.maxHeight && height > options.maxHeight) {
          width = (width * options.maxHeight) / height;
          height = options.maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image conversion failed'));
              return;
            }

            // Create new file
            const newFile = new File(
              [blob],
              `${getFileNameWithoutExtension(file.name)}.${options.format}`,
              {
                type: `image/${options.format}`,
                lastModified: Date.now(),
              }
            );

            const compressionRatio = blob.size / file.size;

            resolve({
              file: newFile,
              originalSize: file.size,
              newSize: blob.size,
              compressionRatio,
            });

            // Clean up object URL
            URL.revokeObjectURL(img.src);
          },
          `image/${options.format}`,
          options.quality
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    // Create object URL and set as image source
    img.src = URL.createObjectURL(file);
  });
}

export async function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<ConversionResult> {
  const format = getImageFormat(file.type);
  return convertImage(file, {
    format: format as 'png' | 'jpeg' | 'webp',
    quality,
    maxWidth,
    maxHeight,
  });
}

export function getImageFormat(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpeg'; // Default fallback
  }
}

export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  return validTypes.includes(file.type);
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for dimension reading'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// NEW: Advanced image compression
export async function compressImageAdvanced(
  file: File,
  options: CompressOptions
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        let { width, height } = img;
        
        // Apply max dimensions if specified
        if (options.maxWidth && width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }
        
        if (options.maxHeight && height > options.maxHeight) {
          width = (width * options.maxHeight) / height;
          height = options.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format
        const outputFormat = options.format || getImageFormat(file.type);
        const mimeType = `image/${outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }

            const newFile = new File(
              [blob],
              `${getFileNameWithoutExtension(file.name)}_compressed.${outputFormat}`,
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            const compressionRatio = blob.size / file.size;

            resolve({
              file: newFile,
              originalSize: file.size,
              newSize: blob.size,
              compressionRatio,
            });

            URL.revokeObjectURL(img.src);
          },
          mimeType,
          options.quality
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// NEW: Image resizing
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        let newWidth = options.width || originalWidth;
        let newHeight = options.height || originalHeight;

        // Handle aspect ratio maintenance
        if (options.maintainAspectRatio !== false) {
          if (options.width && !options.height) {
            newHeight = (originalHeight * newWidth) / originalWidth;
          } else if (options.height && !options.width) {
            newWidth = (originalWidth * newHeight) / originalHeight;
          } else if (options.width && options.height) {
            const aspectRatio = originalWidth / originalHeight;
            const targetAspectRatio = newWidth / newHeight;

            if (options.resizeMode === 'fit') {
              if (aspectRatio > targetAspectRatio) {
                newHeight = newWidth / aspectRatio;
              } else {
                newWidth = newHeight * aspectRatio;
              }
            }
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Use original format
        const outputFormat = getImageFormat(file.type);
        const mimeType = `image/${outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image resize failed'));
              return;
            }

            const newFile = new File(
              [blob],
              `${getFileNameWithoutExtension(file.name)}_resized.${outputFormat}`,
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            resolve({
              file: newFile,
              originalSize: file.size,
              newSize: blob.size,
              compressionRatio: blob.size / file.size,
            });

            URL.revokeObjectURL(img.src);
          },
          mimeType,
          0.9 // High quality for resize
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// NEW: Image cropping
export async function cropImage(
  file: File,
  options: CropOptions
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Validate crop dimensions
        if (options.x < 0 || options.y < 0 || 
            options.x + options.width > img.width || 
            options.y + options.height > img.height) {
          reject(new Error('Crop dimensions are out of image bounds'));
          return;
        }

        canvas.width = options.width;
        canvas.height = options.height;

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped portion
        ctx.drawImage(
          img,
          options.x, options.y, options.width, options.height, // Source
          0, 0, options.width, options.height // Destination
        );

        const outputFormat = getImageFormat(file.type);
        const mimeType = `image/${outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image crop failed'));
              return;
            }

            const newFile = new File(
              [blob],
              `${getFileNameWithoutExtension(file.name)}_cropped.${outputFormat}`,
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            resolve({
              file: newFile,
              originalSize: file.size,
              newSize: blob.size,
              compressionRatio: blob.size / file.size,
            });

            URL.revokeObjectURL(img.src);
          },
          mimeType,
          0.9 // High quality for crop
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// NEW: Image rotation
export async function rotateImage(
  file: File,
  options: RotateOptions
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        const radians = (options.angle * Math.PI) / 180;
        
        // Calculate new canvas dimensions to fit rotated image
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Move to center and rotate
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);

        // Draw image centered
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const outputFormat = getImageFormat(file.type);
        const mimeType = `image/${outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image rotation failed'));
              return;
            }

            const newFile = new File(
              [blob],
              `${getFileNameWithoutExtension(file.name)}_rotated.${outputFormat}`,
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            resolve({
              file: newFile,
              originalSize: file.size,
              newSize: blob.size,
              compressionRatio: blob.size / file.size,
            });

            URL.revokeObjectURL(img.src);
          },
          mimeType,
          0.9 // High quality for rotation
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// Helper function to validate supported image formats
export function validateImageFormat(file: File): boolean {
  const supportedTypes = [
    'image/png',
    'image/jpeg', 
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];
  return supportedTypes.includes(file.type);
}

// Helper function to get optimal compression settings
export function getOptimalCompressionSettings(fileSize: number): CompressOptions {
  if (fileSize > 5 * 1024 * 1024) { // > 5MB
    return { quality: 0.6, maxWidth: 1920, maxHeight: 1080 };
  } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
    return { quality: 0.7, maxWidth: 2560, maxHeight: 1440 };
  } else if (fileSize > 1 * 1024 * 1024) { // > 1MB
    return { quality: 0.8 };
  } else {
    return { quality: 0.9 };
  }
} 