// Server-side image compression utilities using Render.com API

export interface ServerCompressionOptions {
  quality: number; // 10-100
  format?: 'JPEG' | 'PNG' | 'WEBP';
  maxWidth?: number;
  maxHeight?: number;
  mode?: 'aggressive' | 'lossless' | 'webp';
}

export interface ServerCompressionResult {
  originalFile: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
  metadata: {
    originalFormat: string;
    outputFormat: string;
    originalDimensions: string;
    finalDimensions: string;
    compressionMode: string;
    quality: number;
  };
}

// API base URL - Update this when deploying to Render.com
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://quickutil-image-api.onrender.com'
  : 'http://localhost:5000';

export async function compressImageWithServer(
  file: File,
  options: ServerCompressionOptions
): Promise<ServerCompressionResult> {
  
  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('image', file);
  formData.append('quality', options.quality.toString());
  
  if (options.format) {
    formData.append('format', options.format);
  }
  
  if (options.maxWidth) {
    formData.append('max_width', options.maxWidth.toString());
  }
  
  if (options.maxHeight) {
    formData.append('max_height', options.maxHeight.toString());
  }
  
  if (options.mode) {
    formData.append('mode', options.mode);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/compress`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it for FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Get compression metadata from headers
    const metadata = {
      originalFormat: response.headers.get('X-Original-Format') || 'Unknown',
      outputFormat: response.headers.get('X-Output-Format') || 'Unknown',
      originalDimensions: response.headers.get('X-Original-Dimensions') || 'Unknown',
      finalDimensions: response.headers.get('X-Final-Dimensions') || 'Unknown',
      compressionMode: response.headers.get('X-Compression-Mode') || 'Unknown',
      quality: parseInt(response.headers.get('X-Quality') || '0')
    };

    const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
    const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
    const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio') || '0');

    // Get compressed image blob
    const compressedBlob = await response.blob();
    const downloadUrl = URL.createObjectURL(compressedBlob);

    return {
      originalFile: file,
      compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
      downloadUrl,
      metadata
    };

  } catch (error) {
    console.error('Server compression failed:', error);
    throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function batchCompressWithServer(
  files: File[],
  options: ServerCompressionOptions
): Promise<{
  results: Array<{
    filename: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    sizeReduction: number;
    status: 'success' | 'error';
    error?: string;
  }>;
  totalFiles: number;
  successful: number;
  failed: number;
}> {
  
  const formData = new FormData();
  
  // Add all files
  files.forEach(file => {
    formData.append('images', file);
  });
  
  // Add options
  formData.append('quality', options.quality.toString());
  if (options.format) formData.append('format', options.format);
  if (options.mode) formData.append('mode', options.mode);

  try {
    const response = await fetch(`${API_BASE_URL}/batch-compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Batch compression failed:', error);
    throw new Error(`Batch compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000, // 5 second timeout
    } as RequestInit);

    return response.ok;
  } catch {
    return false;
  }
}

export async function getSupportedFormats(): Promise<{
  supported_formats: string[];
  max_file_size: number;
  compression_modes: string[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/formats`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get supported formats:', error);
    // Return fallback values
    return {
      supported_formats: ['JPEG', 'PNG', 'WEBP'],
      max_file_size: 50 * 1024 * 1024, // 50MB
      compression_modes: ['aggressive', 'lossless', 'webp']
    };
  }
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to get compression savings percentage
export function getCompressionSavings(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

// Utility function to validate image file
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff', 'image/heic', 'image/heif'];
  
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Supported types: PNG, JPEG, WebP, BMP, TIFF, HEIC, HEIF`
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large: ${formatFileSize(file.size)}. Maximum size: 50MB`
    };
  }

  return { isValid: true };
}

// Progressive enhancement: Use server compression with client fallback
export async function compressImageProgressive(
  file: File,
  options: ServerCompressionOptions
): Promise<ServerCompressionResult> {
  
  // First check if API is available
  const apiAvailable = await checkAPIHealth();
  
  if (apiAvailable) {
    try {
      // Use server compression
      return await compressImageWithServer(file, options);
    } catch (error) {
      console.warn('Server compression failed, falling back to client compression:', error);
    }
  }
  
  // Fallback to client-side compression (existing imageUtils)
  throw new Error('Server compression not available and client fallback not implemented in this function');
} 