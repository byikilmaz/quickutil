// Image conversion utilities using Canvas API
import heic2any from 'heic2any';

// NEW: Image Processing API URL
const IMAGE_API_URL = 'https://quickutil-image-api.onrender.com';

export interface ConversionOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
}

export interface ConversionResult {
  file: File;
  originalFile?: File; // For server-side operations
  compressedBlob?: Blob; // For server-side operations  
  originalSize: number;
  newSize?: number; // For client-side operations
  compressedSize?: number; // For server-side operations
  compressionRatio: number;
  downloadUrl?: string; // For server-side operations
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
  format?: 'png' | 'jpeg' | 'webp' | 'heic';
  maxWidth?: number;
  maxHeight?: number;
}

// NEW: Server-side compression options
export interface ServerCompressionOptions {
  quality: number; // 1-100
  format?: 'JPEG' | 'PNG' | 'WEBP' | 'HEIC';
  mode?: 'aggressive' | 'balanced' | 'quality';
  max_width?: number;
  max_height?: number;
}

// NEW: Check if Image Processing API is available
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${IMAGE_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Image API is available:', data);
      return true;
    }
    
    console.log('❌ Image API health check failed:', response.status);
    return false;
  } catch (error) {
    console.log('❌ Image API is not available:', error);
    return false;
  }
}

// NEW: Server-side HEIC conversion
export async function convertHEICServerSide(file: File, quality: number = 85): Promise<File> {
  try {
    console.log('🔧 Converting HEIC using server-side API...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality.toString());
    
    const response = await fetch(`${IMAGE_API_URL}/heic-convert`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/octet-stream',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    const blob = await response.blob();
    const convertedFile = new File(
      [blob],
      `${getFileNameWithoutExtension(file.name)}.jpg`,
      {
        type: 'image/jpeg',
        lastModified: Date.now(),
      }
    );
    
    console.log('✅ Server-side HEIC conversion successful:', {
      originalSize: file.size,
      convertedSize: convertedFile.size,
      compressionRatio: ((file.size - convertedFile.size) / file.size * 100).toFixed(1) + '%'
    });
    
    return convertedFile;
  } catch (error) {
    console.error('❌ Server-side HEIC conversion failed:', error);
    throw error;
  }
}

// NEW: Server-side image compression
export async function compressImageWithServer(
  file: File,
  options: ServerCompressionOptions
): Promise<ConversionResult> {
  try {
    console.log('🔧 Compressing image using server-side API...', options);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', options.quality.toString());
    if (options.format) {
      formData.append('format', options.format);
    }
    
    if (options.max_width) {
      formData.append('max_width', options.max_width.toString());
    }
    
    if (options.max_height) {
      formData.append('max_height', options.max_height.toString());
    }
    
    if (options.mode) {
      formData.append('mode', options.mode);
    }

    const response = await fetch(`${IMAGE_API_URL}/compress`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/octet-stream',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    const compressedBlob = await response.blob();
    const compressedFile = new File(
      [compressedBlob],
      `${getFileNameWithoutExtension(file.name)}_compressed.${options.format?.toLowerCase() || 'jpeg'}`,
      {
        type: `image/${options.format?.toLowerCase() || 'jpeg'}`,
        lastModified: Date.now(),
      }
    );
    
    const compressionRatio = ((file.size - compressedBlob.size) / file.size) * 100;
    
    console.log('✅ Server-side compression successful:', {
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      compressionRatio: compressionRatio.toFixed(1) + '%',
      format: options.format || 'jpeg'
    });
    
    return {
      file: compressedFile, // Add the compressed file as the main file
      originalFile: file,
      compressedBlob,
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      compressionRatio,
      downloadUrl: URL.createObjectURL(compressedBlob)
    };
  } catch (error) {
    console.error('❌ Server-side compression failed:', error);
    throw error;
  }
}

// NEW: Mobile-optimized compression detection
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

// NEW: Mobile-optimized compression settings
export function getMobileOptimizedSettings(fileSize: number, originalFormat: string): CompressOptions {
  const isMobile = isMobileDevice();
  const devicePixelRatio = getDevicePixelRatio();
  
  console.log('🔍 Device info:', { isMobile, devicePixelRatio, fileSize, originalFormat });
  
  if (isMobile) {
    // IMPROVED: Mobile-specific optimization with better quality balance
    if (fileSize > 5 * 1024 * 1024) { // > 5MB
      return {
        quality: 0.75, // IMPROVED: Increased from 0.5 to 0.75 for better quality
        format: 'jpeg', // Force JPEG for better compression
        maxWidth: Math.min(1920, Math.floor(1920 / Math.max(devicePixelRatio, 1.5))), // More conservative DPI adjustment
        maxHeight: Math.min(1080, Math.floor(1080 / Math.max(devicePixelRatio, 1.5)))
      };
    } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
      return {
        quality: 0.8, // IMPROVED: Increased from 0.6 to 0.8
        format: 'jpeg',
        maxWidth: Math.min(1600, Math.floor(1600 / Math.max(devicePixelRatio, 1.5))),
        maxHeight: Math.min(900, Math.floor(900 / Math.max(devicePixelRatio, 1.5)))
      };
    } else if (fileSize > 1 * 1024 * 1024) { // > 1MB
      return {
        quality: 0.85, // IMPROVED: Increased from 0.7 to 0.85
        format: originalFormat === 'image/png' ? 'jpeg' : undefined, // Convert PNG to JPEG on mobile
        maxWidth: Math.floor(1200 / Math.max(devicePixelRatio, 1.2)), // Less aggressive DPI adjustment
        maxHeight: Math.floor(800 / Math.max(devicePixelRatio, 1.2))
      };
    } else {
      return {
        quality: 0.9, // IMPROVED: Increased from 0.8 to 0.9
        format: originalFormat === 'image/png' && fileSize > 500 * 1024 ? 'jpeg' : undefined // Convert large PNGs
      };
    }
  } else {
    // Desktop settings (existing)
    if (fileSize > 5 * 1024 * 1024) {
      return { quality: 0.6, maxWidth: 1920, maxHeight: 1080 };
    } else if (fileSize > 2 * 1024 * 1024) {
      return { quality: 0.7, maxWidth: 2560, maxHeight: 1440 };
    } else if (fileSize > 1 * 1024 * 1024) {
      return { quality: 0.8 };
    } else {
      return { quality: 0.9 };
    }
  }
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

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
  
  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Desteklenmeyen dosya formatı: ${file.type}. Desteklenen formatlar: PNG, JPEG, WebP, HEIC` 
    };
  }
  
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `Dosya boyutu çok büyük: ${formatFileSize(file.size)}. Maksimum boyut: 50MB` 
    };
  }
  
  return { isValid: true };
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

// NEW: Advanced image compression with mobile optimization
export async function compressImageAdvanced(
  file: File,
  options: CompressOptions
): Promise<ConversionResult> {
  
  // NEW: Handle HEIC format first
  let processedFile = file;
  if (isHEICFormat(file)) {
    try {
      console.log('📱 HEIC format detected, converting to JPEG first...');
      processedFile = await convertHEICToJPEG(file);
      console.log('✅ HEIC converted to JPEG successfully');
    } catch (error) {
      console.error('❌ HEIC conversion failed:', error);
      throw new Error(`HEIC format işlenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }
  
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
        const isMobile = isMobileDevice();
        const devicePixelRatio = getDevicePixelRatio();
        
        console.log('🖼️ Image compression started:', {
          isMobile,
          devicePixelRatio,
          originalSize: file.size,
          processedSize: processedFile.size,
          originalFormat: file.type,
          processedFormat: processedFile.type,
          originalDimensions: { width: img.width, height: img.height },
          isHEIC: isHEICFormat(file)
        });

        let { width, height } = img;
        
        // Mobile-specific canvas normalization
        if (isMobile && devicePixelRatio > 1) {
          // Normalize dimensions for high-DPI mobile devices
          width = Math.floor(width / devicePixelRatio);
          height = Math.floor(height / devicePixelRatio);
          console.log('📱 Mobile DPI normalization:', { width, height, devicePixelRatio });
        }
        
        // Apply max dimensions if specified
        if (options.maxWidth && width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }
        
        if (options.maxHeight && height > options.maxHeight) {
          width = (width * options.maxHeight) / height;
          height = options.maxHeight;
        }

        // Ensure minimum dimensions (prevent too small images)
        width = Math.max(width, 100);
        height = Math.max(height, 100);

        // Set canvas dimensions (normalized for mobile)
        canvas.width = width;
        canvas.height = height;

        // Mobile-optimized canvas settings
        if (isMobile) {
          // Lower quality settings for mobile to ensure smaller file sizes
          ctx.imageSmoothingEnabled = devicePixelRatio > 2 ? false : true;
          ctx.imageSmoothingQuality = devicePixelRatio > 2 ? 'low' : 'medium';
        } else {
          // Desktop high-quality settings
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format with mobile optimization
        let outputFormat = options.format || getImageFormat(processedFile.type);
        
        // Force JPEG for mobile if PNG is too large or if converted from HEIC
        if (isMobile && (processedFile.type === 'image/png' && processedFile.size > 500 * 1024 || isHEICFormat(file))) {
          outputFormat = 'jpeg';
          console.log('📱 Mobile PNG→JPEG conversion for better compression');
        }

        const mimeType = `image/${outputFormat}`;

        // Mobile-optimized quality settings
        let finalQuality = options.quality;
        if (isMobile && finalQuality > 0.9) {
          finalQuality = Math.min(finalQuality, 0.9); // IMPROVED: Cap mobile quality at 0.9 instead of 0.8
          console.log('📱 Mobile quality capped at:', finalQuality);
        }

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
            const sizeReduction = ((file.size - blob.size) / file.size) * 100;

            console.log('✅ Compression completed:', {
              originalSize: file.size,
              newSize: blob.size,
              sizeReduction: sizeReduction.toFixed(1) + '%',
              compressionRatio: compressionRatio.toFixed(3),
              finalDimensions: { width, height },
              outputFormat,
              isMobile,
              wasHEIC: isHEICFormat(file)
            });

            resolve({
              file: newFile,
              originalSize: file.size,
              newSize: blob.size,
              compressionRatio,
            });

            URL.revokeObjectURL(img.src);
          },
          mimeType,
          finalQuality
        );
      } catch (error) {
        console.error('❌ Image compression error:', error);
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    // Use processed file (converted from HEIC if needed)
    img.src = URL.createObjectURL(processedFile);
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
    'image/svg+xml',
    'image/heic',  // NEW: HEIC support
    'image/heif'   // NEW: HEIF support
  ];
  return supportedTypes.includes(file.type);
}

// NEW: HEIC format detection
export function isHEICFormat(file: File): boolean {
  return file.type === 'image/heic' || file.type === 'image/heif' || 
         file.name.toLowerCase().endsWith('.heic') || 
         file.name.toLowerCase().endsWith('.heif');
}

// NEW: Convert HEIC to JPEG using server-side API first, then client-side fallback
export async function convertHEICToJPEG(file: File): Promise<File> {
  try {
    console.log('🔄 Converting HEIC to JPEG with server-side API first...');
    console.log('📁 Input file:', file.name, 'Size:', formatFileSize(file.size), 'Type:', file.type);
    
    // Try server-side conversion first
    const serverAvailable = await checkAPIHealth();
    
    if (serverAvailable) {
      try {
        console.log('🔧 Using server-side HEIC conversion...');
        const convertedFile = await convertHEICServerSide(file, 90);
        console.log('✅ Server-side HEIC conversion successful');
        return convertedFile;
      } catch (serverError) {
        console.log('❌ Server-side HEIC conversion failed, falling back to client-side:', serverError);
        // Fall through to client-side conversion
      }
    }
    
    // Fallback to client-side conversion
    console.log('📦 Falling back to client-side heic2any conversion...');
    
    try {
      // Dynamic import to avoid SSR issues
      const heic2any = (await import('heic2any')).default;
      console.log('📦 heic2any library loaded successfully');
      
      // Convert HEIC to JPEG blob with multiple quality attempts
      console.log('🚀 Starting client-side HEIC conversion with progressive quality...');
      
      // Try different quality levels for better compatibility
      const qualityLevels = [0.8, 0.9, 0.7, 0.6, 0.5];
      let conversionError: any = null;
      let result: any = null;
      
      for (const quality of qualityLevels) {
        try {
          console.log(`🔄 Trying HEIC conversion with quality: ${quality}`);
          result = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: quality
          });
          
          console.log(`✅ HEIC conversion successful with quality: ${quality}`);
          break; // Success - exit the loop
          
        } catch (attemptError) {
          console.log(`❌ Quality ${quality} failed:`, attemptError);
          conversionError = attemptError;
          continue;
        }
      }
      
      // If all quality levels failed, throw the last error
      if (!result) {
        throw conversionError || new Error('All quality levels failed');
      }
      
      console.log('✅ Client-side HEIC conversion completed');
      console.log('📊 Conversion result type:', typeof result);
      
      // Handle different result types
      let convertedBlob: Blob;
      if (Array.isArray(result)) {
        convertedBlob = result[0] as Blob;
      } else {
        convertedBlob = result as Blob;
      }
      
      // Create new file with converted blob
      const convertedFile = new File(
        [convertedBlob],
        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        {
          type: 'image/jpeg',
          lastModified: Date.now()
        }
      );
      
      console.log('📄 Converted file created:', convertedFile.name, 'Size:', formatFileSize(convertedFile.size));
      return convertedFile;
      
    } catch (clientError) {
      console.warn('❌ Client-side HEIC conversion failed');
      console.log('🔍 Client error details:', clientError);
      
      // Check if it's a common heic2any error
      const errorMessage = clientError instanceof Error ? clientError.message : String(clientError);
      if (errorMessage.includes('Could not parse HEIF file') || 
          errorMessage.includes('format not supported') ||
          errorMessage.includes('ERR_LIBHEIF')) {
        console.log('🔧 heic2any library compatibility issue detected');
      }
      
      // Re-throw client-side error 
      throw clientError;
    }
    
  } catch (error) {
    console.error('❌ HEIC conversion failed completely:', error);
    console.log('🔍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // User-friendly error message with workaround
    const userMessage = `HEIC dönüştürme başarısız. 
    
📱 iPhone/iPad Kullanıcıları için Hızlı Çözüm:
1. Fotoğraflar uygulamasını açın
2. Fotoğrafınızı seçin
3. Paylaş butonuna tıklayın  
4. "JPEG olarak kopyala" seçeneğini seçin
5. Kopyalanan JPEG dosyasını buraya yükleyin

Ya da Settings > Camera > Format'tan "Most Compatible" seçeneğini aktif edin.

🔧 Alternatif: Resimi önce başka bir araçla JPEG'e dönüştürüp tekrar deneyin.`;
    
    throw new Error(userMessage);
  }
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