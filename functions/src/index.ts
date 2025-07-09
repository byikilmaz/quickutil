import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Initialize Firebase Admin with new secure service account
const serviceAccount = require('../quickutil-d2998-2d5b967ac0e5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'quickutil-d2998',
});

const corsHandler = cors({ origin: true });

interface CompressionRequest {
  pdfBase64: string;
  compressionLevel: 'light' | 'medium' | 'high' | 'maximum';
  fileName: string;
}

interface CompressionResponse {
  success: boolean;
  compressedBase64?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}

/**
 * Advanced PDF Compression Function - Gelişmiş AI Destekli Sıkıştırma
 * Firebase Functions v1 ile advanced compression algoritmaları
 */
/**
 * Revolutionary PDF Compression using External Python Service
 * iLovePDF-level compression with Ghostscript backend
 */
export const compressPDFAdvanced = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540, // 9 dakika
    memory: '2GB'
  })
  .https.onCall(async (data: CompressionRequest, context): Promise<CompressionResponse> => {
    try {
      const { pdfBase64, compressionLevel, fileName } = data;

      functions.logger.info('🚀 Starting revolutionary PDF compression with Python service', { 
        compressionLevel, 
        fileName,
        originalSize: Buffer.from(pdfBase64, 'base64').length 
      });

      // Input validation
      if (!pdfBase64 || !compressionLevel) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
      }

      const originalBuffer = Buffer.from(pdfBase64, 'base64');
      const originalSize = originalBuffer.length;

      functions.logger.info('📊 Original PDF size:', { size: originalSize });

      // ONLY Python service - NO FALLBACK!
      functions.logger.info('🎯 Calling Python service ONLY - no fallback');
      
      const pythonResult = await callPythonCompressionService(originalBuffer, compressionLevel, fileName);
      
      if (!pythonResult.success || !pythonResult.compressedBuffer || pythonResult.compressionRatio === undefined) {
        throw new functions.https.HttpsError('internal', `Python service failed: ${pythonResult.error}`);
      }

      const compressedBuffer = pythonResult.compressedBuffer;
      const compressionRatio = pythonResult.compressionRatio;
      const compressedSize = compressedBuffer.length;
      
      functions.logger.info('✅ Python service compression successful', {
        compressionRatio: compressionRatio.toFixed(2) + '%',
        usedPythonService: true
      });

      functions.logger.info('✅ Compression completed', {
        originalSize,
        compressedSize,
        compressionRatio: compressionRatio.toFixed(2) + '%',
        usedPythonService: true
      });

      return {
        success: true,
        compressedBase64: compressedBuffer.toString('base64'),
        originalSize,
        compressedSize,
        compressionRatio: parseFloat(compressionRatio.toFixed(2))
      };

    } catch (error) {
      functions.logger.error('❌ PDF compression error:', error);
      throw new functions.https.HttpsError('internal', `Compression failed: ${error}`);
    }
  });

/**
 * Call External Python Compression Service
 * Revolutionary iLovePDF-level compression using Ghostscript
 */
async function callPythonCompressionService(
  buffer: Buffer, 
  compressionLevel: string, 
  fileName: string
): Promise<{
  success: boolean;
  compressedBuffer?: Buffer;
  compressionRatio?: number;
  error?: string;
}> {
  try {
    // Python service URL (configure this based on your deployment)
    const PYTHON_SERVICE_URL = functions.config().python?.compression_service_url || 'https://quickutil-pdf-api.onrender.com';
    
    functions.logger.info('🔄 Calling Python compression service...', { 
      serviceUrl: PYTHON_SERVICE_URL,
      compressionLevel,
      fileName 
    });

    // Map compression levels
    const qualityMap: Record<string, string> = {
      'light': 'printer',
      'medium': 'ebook', 
      'high': 'ebook',
      'maximum': 'screen'  // Screen = maximum compression (80-90%)
    };
    
    const quality = qualityMap[compressionLevel] || 'screen';

    // Create form data for Python API
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: fileName,
      contentType: 'application/pdf'
    });
    formData.append('quality', quality);

    // Call Python compression service
    const response = await fetch(`${PYTHON_SERVICE_URL}/compress`, {
      method: 'POST',
      body: formData,
      timeout: 480000, // 8 minutes timeout (more time for large files)
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      functions.logger.error('❌ Python service HTTP error', { 
        status: response.status, 
        statusText: response.statusText,
        url: `${PYTHON_SERVICE_URL}/compress`
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    functions.logger.info('📥 Python service response received', { result });

    if (!result.success) {
      functions.logger.error('❌ Python service logic error', { error: result.error });
      throw new Error(result.error || 'Python service returned error');
    }

    functions.logger.info('🎯 Python service response received', {
      compressionRatio: result.compression_ratio,
      originalSize: result.original_size,
      compressedSize: result.compressed_size
    });

    // Download compressed file
    functions.logger.info('🔄 Downloading compressed file...', { downloadId: result.download_id });
    
    const downloadResponse = await fetch(`${PYTHON_SERVICE_URL}/download/${result.download_id}`, {
      timeout: 180000 // 3 minutes timeout for download
    });

    if (!downloadResponse.ok) {
      functions.logger.error('❌ Download failed', { 
        status: downloadResponse.status, 
        statusText: downloadResponse.statusText 
      });
      throw new Error(`Download failed: HTTP ${downloadResponse.status} ${downloadResponse.statusText}`);
    }

    const compressedBuffer = Buffer.from(await downloadResponse.arrayBuffer());

    return {
      success: true,
      compressedBuffer,
      compressionRatio: result.compression_ratio
    };

  } catch (error) {
    functions.logger.error('❌ Python service call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// REMOVED ALL PDF-LIB FALLBACK FUNCTIONS
// Now using ONLY Python Ghostscript service



/**
 * Health Check Endpoint
 */
export const healthCheck = functions
  .region('us-central1')
  .https.onRequest((req, res) => {
    corsHandler(req, res, () => {
      res.json({
        status: 'healthy',
        service: 'pdf-compression',
        timestamp: new Date().toISOString(),
        version: '2.1.0-with-render-backend',
        python_service_url: functions.config().python?.compression_service_url || 'https://quickutil-pdf-api.onrender.com'
      });
    });
  }); 