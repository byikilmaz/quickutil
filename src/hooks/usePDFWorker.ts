import { useCallback, useRef, useEffect } from 'react';

interface CompressionOptions {
  compressionLevel: 'light' | 'medium' | 'high';
  removeMetadata?: boolean;
  optimizeStructure?: boolean;
}

interface CompressionResult {
  success: boolean;
  compressedBuffer?: ArrayBuffer;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

interface ProgressUpdate {
  progress: number;
  message: string;
}

interface UsePDFWorkerReturn {
  compressFile: (
    file: File,
    options: CompressionOptions,
    onProgress?: (progress: ProgressUpdate) => void
  ) => Promise<CompressionResult>;
  isWorkerReady: boolean;
  terminateWorker: () => void;
}

export function usePDFWorker(): UsePDFWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const isWorkerReady = useRef(false);
  const pendingPromises = useRef<Map<string, {
    resolve: (result: CompressionResult) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: ProgressUpdate) => void;
  }>>(new Map());

  // Initialize worker
  useEffect(() => {
    const initWorker = () => {
      try {
        workerRef.current = new Worker('/js/pdf-compression-worker.js');
        
        workerRef.current.onmessage = (event) => {
          const { type, fileId, result, error, progress, message } = event.data;
          
          switch (type) {
            case 'ready':
              isWorkerReady.current = true;
              console.log('💼 PDF Compression Worker ready');
              break;
              
            case 'progress':
              const pendingPromise = pendingPromises.current.get(fileId);
              if (pendingPromise?.onProgress) {
                pendingPromise.onProgress({ progress, message });
              }
              break;
              
            case 'completed':
              const completedPromise = pendingPromises.current.get(fileId);
              if (completedPromise) {
                completedPromise.resolve(result);
                pendingPromises.current.delete(fileId);
              }
              break;
              
            case 'error':
              const errorPromise = pendingPromises.current.get(fileId);
              if (errorPromise) {
                errorPromise.reject(new Error(error));
                pendingPromises.current.delete(fileId);
              }
              break;
              
            case 'aborted':
              const abortedPromise = pendingPromises.current.get(fileId);
              if (abortedPromise) {
                abortedPromise.reject(new Error('Compression aborted'));
                pendingPromises.current.delete(fileId);
              }
              break;
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.error('❌ PDF Worker error:', error);
          isWorkerReady.current = false;
        };
        
      } catch (error) {
        console.error('❌ Failed to initialize PDF Worker:', error);
        isWorkerReady.current = false;
      }
    };

    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        isWorkerReady.current = false;
      }
    };
  }, []);

  const compressFile = useCallback(async (
    file: File,
    options: CompressionOptions,
    onProgress?: (progress: ProgressUpdate) => void
  ): Promise<CompressionResult> => {
    if (!workerRef.current || !isWorkerReady.current) {
      throw new Error('PDF Worker not ready');
    }

    const fileId = Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      // Store promise handlers
      pendingPromises.current.set(fileId, {
        resolve,
        reject,
        onProgress
      });

      // Convert file to array buffer
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileBuffer = event.target?.result as ArrayBuffer;
        
        // Send compression task to worker
        workerRef.current!.postMessage({
          type: 'compress',
          fileId,
          data: {
            fileBuffer,
            options
          }
        });
      };

      reader.onerror = () => {
        pendingPromises.current.delete(fileId);
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }, []);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      isWorkerReady.current = false;
      
      // Reject all pending promises
      pendingPromises.current.forEach(({ reject }) => {
        reject(new Error('Worker terminated'));
      });
      pendingPromises.current.clear();
    }
  }, []);

  return {
    compressFile,
    isWorkerReady: isWorkerReady.current,
    terminateWorker
  };
}

// Helper function to convert ArrayBuffer to File
export function arrayBufferToFile(
  buffer: ArrayBuffer,
  filename: string,
  mimeType: string = 'application/pdf'
): File {
  return new File([buffer], filename, {
    type: mimeType,
    lastModified: Date.now()
  });
} 