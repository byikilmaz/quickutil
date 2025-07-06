// Batch Processing System for multiple file operations
import { BatchFile } from '@/components/BatchFileUpload';

export type BatchOperation = 
  | 'compress' 
  | 'resize' 
  | 'crop' 
  | 'rotate' 
  | 'filter'
  | 'convert';

export interface BatchOperationConfig {
  operation: BatchOperation;
  params: any; // Operation-specific parameters
}

export interface BatchProcessorOptions {
  maxConcurrent?: number;
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, result: any) => void;
  onError?: (fileId: string, error: string) => void;
  onBatchComplete?: (results: BatchResult[]) => void;
}

export interface BatchResult {
  fileId: string;
  success: boolean;
  result?: any;
  error?: string;
  processingTime: number;
}

export class BatchProcessor {
  private files: BatchFile[] = [];
  private config: BatchOperationConfig | null = null;
  private options: BatchProcessorOptions;
  private isProcessing = false;
  private shouldStop = false;
  private currentlyProcessing = new Set<string>();
  
  constructor(options: BatchProcessorOptions = {}) {
    this.options = {
      maxConcurrent: 3, // Process 3 files simultaneously
      ...options
    };
  }

  public setFiles(files: BatchFile[]): void {
    this.files = files;
  }

  public setConfig(config: BatchOperationConfig): void {
    this.config = config;
  }

  public async start(): Promise<BatchResult[]> {
    if (!this.config) {
      throw new Error('Batch configuration not set');
    }

    if (this.files.length === 0) {
      throw new Error('No files to process');
    }

    this.isProcessing = true;
    this.shouldStop = false;
    const results: BatchResult[] = [];

    try {
      // Process files in chunks with concurrency limit
      const chunks = this.createProcessingChunks();
      
      for (const chunk of chunks) {
        if (this.shouldStop) break;
        
        const chunkResults = await Promise.allSettled(
          chunk.map(file => this.processFile(file))
        );
        
        // Handle results
        chunkResults.forEach((result, index) => {
          const file = chunk[index];
          if (result.status === 'fulfilled') {
            results.push(result.value);
            this.options.onComplete?.(file.id, result.value.result);
          } else {
            const errorResult: BatchResult = {
              fileId: file.id,
              success: false,
              error: result.reason?.message || 'Unknown error',
              processingTime: 0
            };
            results.push(errorResult);
            this.options.onError?.(file.id, errorResult.error!);
          }
        });
      }

      this.options.onBatchComplete?.(results);
      return results;

    } finally {
      this.isProcessing = false;
      this.currentlyProcessing.clear();
    }
  }

  public stop(): void {
    this.shouldStop = true;
  }

  public pause(): void {
    this.shouldStop = true;
  }

  public isRunning(): boolean {
    return this.isProcessing;
  }

  private createProcessingChunks(): BatchFile[][] {
    const chunks: BatchFile[][] = [];
    const pendingFiles = this.files.filter(f => f.status === 'pending');
    const chunkSize = this.options.maxConcurrent || 3;
    
    for (let i = 0; i < pendingFiles.length; i += chunkSize) {
      chunks.push(pendingFiles.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  private async processFile(file: BatchFile): Promise<BatchResult> {
    const startTime = Date.now();
    this.currentlyProcessing.add(file.id);
    
    try {
      // Update progress
      this.options.onProgress?.(file.id, 0);
      
      // Import the appropriate processing function based on operation
      const result = await this.executeOperation(file.file, this.config!);
      
      // Simulate progress updates during processing
      for (let progress = 20; progress <= 100; progress += 20) {
        if (this.shouldStop) break;
        this.options.onProgress?.(file.id, progress);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for progress animation
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        fileId: file.id,
        success: true,
        result,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        fileId: file.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      };
      
    } finally {
      this.currentlyProcessing.delete(file.id);
    }
  }

  private async executeOperation(file: File, config: BatchOperationConfig): Promise<any> {
    const { operation, params } = config;
    
    switch (operation) {
      case 'compress':
        const { compressImageAdvanced } = await import('@/lib/imageUtils');
        return await compressImageAdvanced(file, params);
        
      case 'resize':
        const { resizeImage } = await import('@/lib/imageUtils');
        return await resizeImage(file, params);
        
      case 'crop':
        const { cropImage } = await import('@/lib/imageUtils');
        return await cropImage(file, params);
        
      case 'rotate':
        const { rotateImage } = await import('@/lib/imageUtils');
        return await rotateImage(file, params);
        
      case 'filter':
        const { applyFilters } = await import('@/lib/imageFilters');
        return await applyFilters(file, params);
        
      case 'convert':
        const { convertImage } = await import('@/lib/imageUtils');
        return await convertImage(file, params);
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

// Utility functions for batch operations
export class BatchDownloader {
  static async createZip(results: BatchResult[]): Promise<Blob> {
    // Dynamic import to avoid large bundle
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    let validResults = 0;
    
    for (const result of results) {
      if (result.success && result.result?.file) {
        const file = result.result.file as File;
        const fileName = file.name;
        
        // Add file to zip
        zip.file(fileName, file);
        validResults++;
      }
    }
    
    if (validResults === 0) {
      throw new Error('No valid files to download');
    }
    
    return await zip.generateAsync({ type: 'blob' });
  }
  
  static downloadZip(blob: Blob, filename: string = 'processed_images.zip'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Batch operation helpers
export const BatchOperations = {
  // Get default parameters for each operation
  getDefaultParams: (operation: BatchOperation) => {
    switch (operation) {
      case 'compress':
        return { quality: 0.8, format: 'jpeg' };
      case 'resize':
        return { width: 800, height: 600, maintainAspectRatio: true };
      case 'crop':
        return { x: 0, y: 0, width: 400, height: 400 };
      case 'rotate':
        return { angle: 90 };
      case 'filter':
        return { brightness: 0, contrast: 0, saturation: 0 };
      case 'convert':
        return { format: 'png', quality: 0.9 };
      default:
        return {};
    }
  },
  
  // Validate parameters for each operation
  validateParams: (operation: BatchOperation, params: any): boolean => {
    switch (operation) {
      case 'compress':
        return params.quality >= 0.1 && params.quality <= 1.0;
      case 'resize':
        return params.width > 0 && params.height > 0;
      case 'crop':
        return params.width > 0 && params.height > 0;
      case 'rotate':
        return typeof params.angle === 'number';
      case 'filter':
        return typeof params === 'object';
      case 'convert':
        return ['png', 'jpeg', 'webp'].includes(params.format);
      default:
        return true;
    }
  }
};

// Generate unique file ID
export const generateFileId = (): string => {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}; 