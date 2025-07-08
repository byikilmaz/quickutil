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
      
      this.updateProgress(50, 'Applying enhanced compression...');
      
      // Apply comprehensive metadata removal if requested
      if (removeMetadata) {
        this.removeMetadata(pdfDoc);
      }
      
      this.updateProgress(60, 'Applying advanced optimizations...');
      
      // Apply additional optimizations for medium/high compression
      if (settings.optimizeSize) {
        this.applyAdvancedOptimizations(pdfDoc, compressionLevel);
      }
      
      this.updateProgress(80, 'Finalizing compression...');
      
      // Enhanced save with compression
      const saveOptions = {
        useObjectStreams: settings.useObjectStreams,
        addDefaultPage: false,
        objectsPerTick: settings.objectsPerTick,
        updateFieldAppearances: settings.updateFieldAppearances,
      };
      
      // Add aggressive compression for high levels
      if (compressionLevel === 'high' || compressionLevel === 'maximum') {
        saveOptions.compress = true;
      }
      
      const compressedBytes = await pdfDoc.save(saveOptions);
      
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
        updateFieldAppearances: true,
        optimizeSize: false
      },
      medium: {
        useObjectStreams: true,
        objectsPerTick: 100,
        updateFieldAppearances: false,
        optimizeSize: true
      },
      high: {
        useObjectStreams: true,
        objectsPerTick: 500,
        updateFieldAppearances: false,
        optimizeSize: true
      },
      maximum: {
        useObjectStreams: true,
        objectsPerTick: 1000,
        updateFieldAppearances: false,
        optimizeSize: true
      }
    };
    
    return settingsMap[level] || settingsMap.high; // Default to high compression
  }

  removeMetadata(pdfDoc) {
    try {
      // Remove all document metadata
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      // Try to remove additional metadata
      try {
        const documentRef = pdfDoc.context.trailerInfo;
        if (documentRef && documentRef.Info) {
          const infoDict = documentRef.Info;
          if (infoDict.delete) {
            infoDict.delete('CreationDate');
            infoDict.delete('ModDate');
            infoDict.delete('Trapped');
          }
        }
      } catch (e) {
        console.warn('Could not remove advanced metadata:', e);
      }
      
    } catch (e) {
      console.warn('Could not remove metadata:', e);
    }
  }

  applyAdvancedOptimizations(pdfDoc, compressionLevel) {
    try {
      const pages = pdfDoc.getPages();
      
      // Remove annotations for maximum compression
      if (compressionLevel === 'high' || compressionLevel === 'maximum') {
        pages.forEach((page, index) => {
          try {
            const pageRef = page.ref;
            const pageDict = pdfDoc.context.lookup(pageRef);
            
            // Remove annotations if they exist
            if (pageDict && pageDict.has && pageDict.has('Annots')) {
              pageDict.delete('Annots');
            }
            
            // Remove thumbnails for size reduction
            if (pageDict && pageDict.has && pageDict.has('Thumb')) {
              pageDict.delete('Thumb');
            }
            
          } catch (e) {
            console.warn(`Could not optimize page ${index + 1}:`, e);
          }
        });
      }
      
    } catch (e) {
      console.warn('Advanced optimizations failed:', e);
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