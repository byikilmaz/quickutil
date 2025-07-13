"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.compressPDFAdvanced = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const form_data_1 = __importDefault(require("form-data"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Initialize Firebase Admin with new secure service account
const serviceAccount = require('../quickutil-d2998-2d5b967ac0e5.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'quickutil-d2998',
});
const corsHandler = (0, cors_1.default)({ origin: true });
/**
 * Advanced PDF Compression Function - Gelişmiş AI Destekli Sıkıştırma
 * Firebase Functions v1 ile advanced compression algoritmaları
 */
/**
 * Revolutionary PDF Compression using External Python Service
 * iLovePDF-level compression with Ghostscript backend
 */
exports.compressPDFAdvanced = functions
    .region('us-central1')
    .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
})
    .https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error('❌ PDF compression error:', error);
        throw new functions.https.HttpsError('internal', `Compression failed: ${error}`);
    }
});
/**
 * Call External Python Compression Service
 * Revolutionary iLovePDF-level compression using Ghostscript
 */
async function callPythonCompressionService(buffer, compressionLevel, fileName) {
    var _a;
    try {
        // Python service URL (configure this based on your deployment)
        const PYTHON_SERVICE_URL = ((_a = functions.config().python) === null || _a === void 0 ? void 0 : _a.compression_service_url) || 'https://quickutil-pdf-api.onrender.com';
        functions.logger.info('🔄 Calling Python compression service...', {
            serviceUrl: PYTHON_SERVICE_URL,
            compressionLevel,
            fileName
        });
        // Map compression levels
        const qualityMap = {
            'light': 'printer',
            'medium': 'ebook',
            'high': 'ebook',
            'maximum': 'ebook' // FALLBACK: screen causing HTTP 500, use ebook instead
        };
        const quality = qualityMap[compressionLevel] || 'ebook'; // Safe fallback
        // Log fallback for maximum quality
        if (compressionLevel === 'maximum') {
            functions.logger.warn('⚠️ YÜKSEK SIKIŞTIRMA fallback: using ebook instead of screen to avoid HTTP 500 error - v2.0');
        }
        // Create form data for Python API
        const formData = new form_data_1.default();
        formData.append('file', buffer, {
            filename: fileName,
            contentType: 'application/pdf'
        });
        formData.append('quality', quality);
        // Call Python compression service
        const response = await (0, node_fetch_1.default)(`${PYTHON_SERVICE_URL}/compress`, {
            method: 'POST',
            body: formData,
            timeout: 480000,
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
        const downloadResponse = await (0, node_fetch_1.default)(`${PYTHON_SERVICE_URL}/download/${result.download_id}`, {
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
    }
    catch (error) {
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
exports.healthCheck = functions
    .region('us-central1')
    .https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        var _a;
        res.json({
            status: 'healthy',
            service: 'pdf-compression',
            timestamp: new Date().toISOString(),
            version: '2.1.0-with-render-backend',
            python_service_url: ((_a = functions.config().python) === null || _a === void 0 ? void 0 : _a.compression_service_url) || 'https://quickutil-pdf-api.onrender.com'
        });
    });
});
//# sourceMappingURL=index.js.map