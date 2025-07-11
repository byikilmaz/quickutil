// Server-side image compression utilities using Render.com API

export interface ServerCompressionOptions {
  quality: number; // 10-100
  format?: 'JPEG' | 'PNG' | 'WEBP' | 'HEIC';
  maxWidth?: number;
  maxHeight?: number;
  mode?: 'aggressive' | 'lossless' | 'webp';
}

export interface ServerCompressionResult {
  file: File; // Add compressed file for interface compatibility
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
    usingFallback: boolean;
    mode: string;
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
  formData.append('file', file);  // Backend expects 'file' field name
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

    // Debug: Log all response headers
    console.log('🔍 Server response headers:', {
      'X-Original-Size': response.headers.get('X-Original-Size'),
      'X-Compressed-Size': response.headers.get('X-Compressed-Size'),
      'X-Compression-Ratio': response.headers.get('X-Compression-Ratio'),
      'X-Original-Format': response.headers.get('X-Original-Format'),
      'X-Output-Format': response.headers.get('X-Output-Format'),
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length'),
      'Response Status': response.status,
      'Response OK': response.ok
    });

    // Extract metadata from response headers
    const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
    const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
    const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio') || '0');
    const originalFormat = response.headers.get('X-Original-Format') || 'unknown';
    const outputFormatFromHeader = response.headers.get('X-Output-Format') || (options.format || 'JPEG').toLowerCase();

    // Get compressed image blob
    const compressedBlob = await response.blob();
    
    // FALLBACK: If headers are missing, calculate from blob and file
    const fallbackCompressedSize = compressedBlob.size;
    const fallbackOriginalSize = file.size;
    
    // Use fallback if headers are missing or invalid
    const finalOriginalSize = originalSize > 0 ? originalSize : fallbackOriginalSize;
    const finalCompressedSize = compressedSize > 0 ? compressedSize : fallbackCompressedSize;
    const finalCompressionRatio = compressionRatio > 0 ? compressionRatio : 
      ((finalOriginalSize - finalCompressedSize) / finalOriginalSize * 100);

    // Debug: Log all calculated values
    console.log('📊 Calculated values:', {
      'Header Original Size': originalSize,
      'Header Compressed Size': compressedSize,
      'Header Compression Ratio': compressionRatio,
      'Fallback Original Size': fallbackOriginalSize,
      'Fallback Compressed Size': fallbackCompressedSize,
      'Final Original Size': finalOriginalSize,
      'Final Compressed Size': finalCompressedSize,
      'Final Compression Ratio': finalCompressionRatio.toFixed(1) + '%'
    });

    // Debug: Log parsed header values
    console.log('📊 Parsed header values:', {
      originalSize,
      compressedSize,
      compressionRatio,
      originalFormat,
      outputFormatFromHeader,
      'originalSize type': typeof originalSize,
      'compressedSize type': typeof compressedSize
    });

    // Create download URL
    const downloadUrl = URL.createObjectURL(compressedBlob);

    return {
      file: new File([compressedBlob], `compressed_${file.name}`, { type: compressedBlob.type }),
      originalFile: file,
      compressedBlob,
      originalSize: finalOriginalSize,
      compressedSize: finalCompressedSize,
      compressionRatio: finalCompressionRatio,
      downloadUrl,
      metadata: {
        originalFormat,
        outputFormat: outputFormatFromHeader,
        originalDimensions: 'Unknown',
        finalDimensions: 'Unknown',
        compressionMode: 'standard',
        quality: options.quality || 85,
        mode: options.mode || 'standard',
        usingFallback: originalSize === 0 || compressedSize === 0
      }
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