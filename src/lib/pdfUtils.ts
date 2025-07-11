// QUICKUTIL PDF COMPRESSION UTILS v3.0
// ONLY Firebase Functions with Python Ghostscript Backend
// =====================================

import { getFunctions, httpsCallable } from 'firebase/functions';
// import { logEvent } from 'firebase/analytics';
// import { analytics } from '@/lib/firebase';

// Types
export interface CompressionResult {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  downloadUrl: string;
}

export interface CompressionOptions {
  quality: 'light' | 'medium' | 'high' | 'maximum';
  fileName: string;
}

/**
 * MAIN PDF COMPRESSION FUNCTION
 * Uses Firebase Functions with Python Ghostscript backend
 * NO CLIENT-SIDE PROCESSING - ONLY SERVER-SIDE
 */
export async function compressPDF(
  file: File, 
  options: CompressionOptions
): Promise<CompressionResult> {
  
  console.log('🚀 QuickUtil PDF Compression v3.0 - Server-Side Only');
  console.log('📁 File:', file.name, 'Size:', formatFileSize(file.size));
  console.log('⚙️ Quality:', options.quality);
  
  const startTime = Date.now();
  
  try {
    // Initialize Firebase Functions
    const functions = getFunctions();
    const compressFunction = httpsCallable(functions, 'compressPDFAdvanced');
    
    // Convert file to base64
    const base64PDF = await fileToBase64(file);
    
    // Map quality to compression level
    const qualityMap = {
      'light': 'light',
      'medium': 'medium', 
      'high': 'high',
      'maximum': 'maximum'
    } as const;
    
    const compressionLevel = qualityMap[options.quality];
    
    console.log('🔄 Calling Firebase Functions with:', {
      compressionLevel,
      fileName: options.fileName,
      fileSize: file.size
    });
    
    // Call Firebase Functions
    const result = await compressFunction({
      pdfBase64: base64PDF,
      compressionLevel: compressionLevel,
      fileName: options.fileName
    });
    
    const serverResult = result.data as any;
    
    if (!serverResult.success) {
      throw new Error(serverResult.error || 'Server compression failed');
    }
    
    console.log('✅ Server compression successful:', {
      originalSize: serverResult.originalSize,
      compressedSize: serverResult.compressedSize,
      compressionRatio: serverResult.compressionRatio
    });
    
    // Convert base64 back to blob
    const compressedBlob = base64ToBlob(serverResult.compressedBase64, 'application/pdf');
    const downloadUrl = URL.createObjectURL(compressedBlob);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Track analytics
    // if (analytics) {
    //   logEvent(analytics, 'pdf_compression_success', {
    //     original_size: serverResult.originalSize,
    //     compressed_size: serverResult.compressedSize,
    //     compression_ratio: serverResult.compressionRatio,
    //     processing_time: processingTime,
    //     quality: options.quality
    //   });
    // }
    
    return {
      compressedBlob,
      originalSize: serverResult.originalSize,
      compressedSize: serverResult.compressedSize, 
      compressionRatio: serverResult.compressionRatio,
      processingTime,
      downloadUrl
    };
    
  } catch (error) {
    console.error('❌ PDF compression failed:', error);
    
    // Track error analytics
    // if (analytics) {
    //   logEvent(analytics, 'pdf_compression_error', {
    //     error_message: error instanceof Error ? error.message : 'Unknown error',
    //     file_size: file.size,
    //     quality: options.quality
    //   });
    // }
    
    throw error;
  }
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 to Blob
 */
function base64ToBlob(base64: string, type: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }
  
  // Check file size (20MB limit)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size cannot exceed 20MB' };
  }
  
  // Check minimum size
  if (file.size < 1024) { // 1KB minimum
    return { valid: false, error: 'File is too small to be a valid PDF' };
  }
  
  return { valid: true };
}

/**
 * Quality level descriptions
 */
export const qualityLevels = {
  maximum: {
    name: 'Maximum Compression',
    description: 'Smallest file size, good for web sharing',
    expectedRatio: '80-90%'
  },
  high: {
    name: 'High Compression', 
    description: 'Good balance of size and quality',
    expectedRatio: '60-80%'
  },
  medium: {
    name: 'Medium Compression',
    description: 'Recommended for most use cases',
    expectedRatio: '40-60%'
  },
  light: {
    name: 'Light Compression',
    description: 'Best quality, moderate compression',
    expectedRatio: '20-40%'
  }
} as const;

// Export types
export type QualityLevel = keyof typeof qualityLevels; 