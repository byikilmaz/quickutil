// PDF Compression Web Worker
importScripts('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');

class PDFCompressionWorker {
  constructor() {
    this.isProcessing = false;
  }

  async compressPDF(fileBuffer, options = {}) {
    try {
      const {
        compressionLevel = 'medium',
        removeMetadata = true,
        optimizeStructure = true
      } = options;

      // Progress callback
      this.updateProgress(10, 'Loading PDF...');
      
      const pdfDoc = await PDFLib.PDFDocument.load(fileBuffer);
      
      this.updateProgress(30, 'Analyzing structure...');
      
      // Configure compression settings based on level
      const settings = this.getCompressionSettings(compressionLevel);
      
      this.updateProgress(50, 'Applying compression...');
      
      // Apply metadata removal if requested
      if (removeMetadata) {
        this.removeMetadata(pdfDoc);
      }
      
      this.updateProgress(70, 'Optimizing structure...');
      
      // Save with compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: settings.useObjectStreams,
        addDefaultPage: false,
        objectsPerTick: settings.objectsPerTick,
        updateFieldAppearances: settings.updateFieldAppearances,
      });
      
      this.updateProgress(90, 'Finalizing...');
      
      this.updateProgress(100, 'Compression completed!');
      
      return {
        success: true,
        compressedBuffer: compressedBytes,
        originalSize: fileBuffer.byteLength,
        compressedSize: compressedBytes.byteLength,
        compressionRatio: ((fileBuffer.byteLength - compressedBytes.byteLength) / fileBuffer.byteLength) * 100
      };
      
    } catch (error) {
      console.error('PDF compression error in worker:', error);
      return {
        success: false,
        error: error.message || 'PDF compression failed'
      };
    }
  }

  getCompressionSettings(level) {
    const settingsMap = {
      light: {
        useObjectStreams: false,
        objectsPerTick: 25,
        updateFieldAppearances: true
      },
      medium: {
        useObjectStreams: true,
        objectsPerTick: 50,
        updateFieldAppearances: false
      },
      high: {
        useObjectStreams: true,
        objectsPerTick: 100,
        updateFieldAppearances: false
      }
    };
    
    return settingsMap[level] || settingsMap.medium;
  }

  removeMetadata(pdfDoc) {
    try {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
    } catch (e) {
      console.warn('Could not remove metadata:', e);
    }
  }

  updateProgress(percentage, message) {
    self.postMessage({
      type: 'progress',
      progress: percentage,
      message: message
    });
  }
}

// Create worker instance
const compressionWorker = new PDFCompressionWorker();

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { type, data, fileId } = event.data;
  
  switch (type) {
    case 'compress':
      try {
        compressionWorker.isProcessing = true;
        
        const result = await compressionWorker.compressPDF(
          data.fileBuffer,
          data.options
        );
        
        self.postMessage({
          type: 'completed',
          fileId: fileId,
          result: result
        });
        
      } catch (error) {
        self.postMessage({
          type: 'error',
          fileId: fileId,
          error: error.message
        });
      } finally {
        compressionWorker.isProcessing = false;
      }
      break;
      
    case 'abort':
      compressionWorker.isProcessing = false;
      self.postMessage({
        type: 'aborted',
        fileId: fileId
      });
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
});

// Worker initialization
self.postMessage({
  type: 'ready',
  message: 'PDF Compression Worker initialized'
}); 