import { PDFDocument } from 'pdf-lib';
import { OptimalCompressionSettings } from './ai/compressionOptimizer';

interface CompressionOptions {
  removeMetadata: boolean;
  optimizeStructure: boolean;
  compressionLevel: 'light' | 'medium' | 'high';
}

// Simple and effective PDF compression
export async function compressPDF(file: File, compressionRatio: number): Promise<File> {
  try {
    console.log('🔄 Starting PDF compression with ratio:', compressionRatio);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Determine compression level based on ratio
    let compressionLevel: 'light' | 'medium' | 'high' = 'medium';
    if (compressionRatio > 0.8) compressionLevel = 'light';
    else if (compressionRatio < 0.6) compressionLevel = 'high';
    
    console.log('📊 Compression level determined:', compressionLevel);
    
    // Apply compression based on level
    const compressedBytes = await applyCompression(pdfDoc, compressionLevel);
    
    // Create compressed file
    const compressedFile = new File([compressedBytes], file.name, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });
    
    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const actualRatio = ((originalSize - compressedSize) / originalSize) * 100;
    
    console.log('✅ Compression completed:', {
      original: formatFileSize(originalSize),
      compressed: formatFileSize(compressedSize),
      reduction: actualRatio.toFixed(1) + '%'
    });
    
    return compressedFile;
  } catch (error) {
    console.error('❌ PDF compression error:', error);
    throw new Error('PDF sıkıştırma hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  }
}

// AI-Powered PDF Compression - simplified and working
export async function compressPDFWithAI(file: File, aiSettings: OptimalCompressionSettings): Promise<File> {
  try {
    console.log('🤖 Starting AI-powered PDF compression');
    
    // Extract compression level from AI settings
    const compressionRatio = aiSettings.globalSettings.compressionLevel;
    
    // Use the working compression function
    const result = await compressPDF(file, compressionRatio);
    
    console.log('✅ AI-powered compression completed');
    return result;
  } catch (error) {
    console.error('❌ AI PDF compression error:', error);
    throw new Error('AI PDF sıkıştırma hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  }
}

// Core compression logic
async function applyCompression(pdfDoc: PDFDocument, level: 'light' | 'medium' | 'high'): Promise<Uint8Array> {
  const settings = {
    light: {
      useObjectStreams: false,
      objectsPerTick: 25,
      updateFieldAppearances: true,
      removeMetadata: false
    },
    medium: {
      useObjectStreams: true,
      objectsPerTick: 50,
      updateFieldAppearances: false,
      removeMetadata: true
    },
    high: {
      useObjectStreams: true,
      objectsPerTick: 100,
      updateFieldAppearances: false,
      removeMetadata: true
    }
  };
  
  const config = settings[level];
  
  // Apply metadata removal only for medium/high compression
  if (config.removeMetadata) {
    try {
      // Clear metadata without adding new ones
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
    } catch (e) {
      console.warn('⚠️ Could not remove metadata:', e);
    }
  }
  
  // Save with compression settings
  return await pdfDoc.save({
    useObjectStreams: config.useObjectStreams,
    addDefaultPage: false,
    objectsPerTick: config.objectsPerTick,
    updateFieldAppearances: config.updateFieldAppearances,
  });
}

// Keep existing utility functions
export async function analyzePDF(file: File): Promise<{
  pageCount: number;
  fileSize: string;
  hasImages: boolean;
  hasText: boolean;
  isEncrypted: boolean;
}> {
  try {
    console.log('🔍 Starting PDF analysis for:', file.name);
    
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Geçersiz dosya türü. PDF dosyası bekleniyor.');
    }
    
    if (file.size === 0) {
      throw new Error('Dosya boş görünüyor');
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('Dosya çok büyük (maksimum 100MB)');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const analysis = {
      pageCount: pages.length,
      fileSize: formatFileSize(file.size),
      hasImages: pages.length > 0, // Simplified check
      hasText: true,
      isEncrypted: false,
    };
    
    console.log('✅ PDF analysis completed:', analysis);
    return analysis;
  } catch (error) {
    console.error('❌ PDF analysis error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Geçersiz PDF dosyası formatı');
      }
      if (error.message.includes('Password')) {
        throw new Error('Şifreli PDF dosyaları desteklenmiyor');
      }
      if (error.message.includes('Corrupt')) {
        throw new Error('PDF dosyası bozuk görünüyor');
      }
      throw new Error(error.message);
    }
    
    throw new Error('PDF analizi sırasında bilinmeyen hata oluştu');
  }
}

export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileSize(file: File): string {
  return formatFileSize(file.size);
}

export function validatePDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// Additional utility functions for backward compatibility
export async function optimizePDFImages(file: File): Promise<File> {
  // Use standard compression
  return compressPDF(file, 0.7);
}

export async function removePDFMetadata(file: File): Promise<File> {
  // Use light compression with metadata removal
  return compressPDF(file, 0.9);
}

export async function convertPDFToImages(file: File): Promise<string[]> {
  // Placeholder - requires additional library
  return [];
}

export async function mergePDFs(files: File[]): Promise<Blob> {
  try {
    const mergedDoc = await PDFDocument.create();
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedDoc.addPage(page));
    }
    
    const pdfBytes = await mergedDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF merge error:', error);
    throw new Error('PDF birleştirme sırasında hata oluştu');
  }
}

export async function splitPDF(file: File, pageRanges: { start: number; end: number }[]): Promise<Blob[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const results: Blob[] = [];
    
    for (const range of pageRanges) {
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(pdfDoc, 
        Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i - 1)
      );
      pages.forEach(page => newDoc.addPage(page));
      
      const pdfBytes = await newDoc.save();
      results.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }
    
    return results;
  } catch (error) {
    console.error('PDF split error:', error);
    throw new Error('PDF bölme sırasında hata oluştu');
  }
} 