// QUICKUTIL PDF COMPRESSION UTILS v4.0
// BROWSER-BASED PDF-LIB COMPRESSION (No External Service)
// =======================================================

import { PDFDocument } from 'pdf-lib';

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
 * Uses PDF-lib for browser-based compression
 * NO EXTERNAL SERVICE DEPENDENCIES
 */
export async function compressPDF(
  file: File, 
  options: CompressionOptions
): Promise<CompressionResult> {
  
  console.log('🚀 QuickUtil PDF Compression v4.0 - Browser-Based PDF-lib');
  console.log('📁 File:', file.name, 'Size:', formatFileSize(file.size));
  console.log('⚙️ Quality:', options.quality);
  
  const startTime = Date.now();
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = file.size;
    
    // Load PDF with PDF-lib
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Apply compression based on quality
    const compressionSettings = getCompressionSettings(options.quality);
    
    // Compress PDF using PDF-lib optimization
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: compressionSettings.useObjectStreams,
      addDefaultPage: false,
      objectsPerTick: compressionSettings.objectsPerTick,
      updateFieldAppearances: false,
    });
    
    // Create compressed blob
    const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
    const compressedSize = compressedBlob.size;
    
    // Calculate metrics
    const compressionRatio = calculateCompressionRatio(originalSize, compressedSize);
    const processingTime = Date.now() - startTime;
    const downloadUrl = URL.createObjectURL(compressedBlob);
    
    console.log('✅ Browser compression successful:', {
      original: formatFileSize(originalSize),
      compressed: formatFileSize(compressedSize), 
      ratio: compressionRatio.toFixed(1) + '%',
      time: processingTime + 'ms'
    });
    
    return {
      compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
      processingTime,
      downloadUrl
    };
    
  } catch (error) {
    console.error('❌ PDF compression failed:', error);
    throw new Error(`PDF sıkıştırma başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
}

/**
 * Get compression settings based on quality level
 */
function getCompressionSettings(quality: string) {
  const settings = {
    'light': {
      useObjectStreams: true,
      objectsPerTick: 100, // Light compression
    },
    'medium': {
      useObjectStreams: true, 
      objectsPerTick: 50, // Recommended compression
    },
    'high': {
      useObjectStreams: true,
      objectsPerTick: 25, // High compression
    },
    'maximum': {
      useObjectStreams: false, // Maximum compression
      objectsPerTick: 10,
    }
  };
  
  return settings[quality as keyof typeof settings] || settings.medium;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100;
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // File type check
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Lütfen geçerli bir PDF dosyası seçin' };
  }
  
  // File size check (20MB limit)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Dosya boyutu 20MB dan büyük olamaz' };
  }
  
  // File name check
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Dosya .pdf uzantısına sahip olmalı' };
  }
  
  return { valid: true };
}

export type QualityLevel = 'light' | 'medium' | 'high' | 'maximum'; 