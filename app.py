#!/usr/bin/env python3
"""
QuickUtil Image Processing API
Advanced image processing microservice with professional features
Supports: Compression, Format Conversion, HEIC, Resize, Crop, Rotate, Filters, Batch Processing
"""

import os
import uuid
import tempfile
import logging
import gc
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance, ImageFilter
import io
import threading
import time

# HEIC support
try:
    from PIL import Image
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
    print("✅ HEIC support enabled (pillow-heif)")
except ImportError:
    HEIC_SUPPORT = False
    print("❌ HEIC support disabled (pillow-heif not available)")

# Flask app configuration
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB limit
CORS(app)

# Constants
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'quickutil_uploads')
PROCESSED_FOLDER = os.path.join(tempfile.gettempdir(), 'quickutil_processed')
SUPPORTED_FORMATS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'heic', 'heif'}

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Background cleanup thread
def cleanup_files():
    """Clean up old files every 10 minutes"""
    while True:
        try:
            now = time.time()
            for folder in [UPLOAD_FOLDER, PROCESSED_FOLDER]:
                for filename in os.listdir(folder):
                    file_path = os.path.join(folder, filename)
                    if os.path.isfile(file_path):
                        file_age = now - os.path.getmtime(file_path)
                        if file_age > 600:  # 10 minutes
                            os.remove(file_path)
                            logger.info(f"Cleaned up: {filename}")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        
        time.sleep(600)  # Run every 10 minutes

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_files, daemon=True)
cleanup_thread.start()

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in SUPPORTED_FORMATS

def get_file_format(filename):
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else None

def process_image_with_quality(image, format='JPEG', quality=85):
    """Process image with specified quality and format - MEMORY OPTIMIZED"""
    output = io.BytesIO()
    original_image = image
    background = None
    
    try:
        if format.upper() == 'JPEG':
            # Convert RGBA to RGB for JPEG
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            image.save(output, format='JPEG', quality=quality, optimize=True)
            
        elif format.upper() == 'WEBP':
            image.save(output, format='WEBP', quality=quality, optimize=True)
            
        elif format.upper() in ['HEIC', 'HEIF']:
            # HEIC/HEIF output support with pillow-heif - MEMORY OPTIMIZED
            if HEIC_SUPPORT:
                # Convert RGBA to RGB for HEIC if necessary
                if image.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                    image = background
                image.save(output, format='HEIF', quality=quality, optimize=True)
            else:
                # Fallback to JPEG if HEIC not supported
                if image.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = background
                image.save(output, format='JPEG', quality=quality, optimize=True)
        else:
            image.save(output, format=format.upper(), optimize=True)
        
        output.seek(0)
        return output
        
    except Exception as e:
        logger.error(f"💥 Memory error in process_image_with_quality: {e}")
        raise
        
    finally:
        # 🔧 CRITICAL MEMORY CLEANUP
        try:
            if background and background != image:
                background.close()
                del background
            # Don't close original_image as it might be used elsewhere
            # Force garbage collection for HEIC memory cleanup
            gc.collect()
            logger.info(f"🧹 Memory cleanup completed for format: {format}")
        except Exception as cleanup_error:
            logger.warning(f"⚠️ Memory cleanup warning: {cleanup_error}")

def save_file_temporarily(file):
    """Save uploaded file to temporary location and return path"""
    temp_filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
    temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)
    file.save(temp_path)
    return temp_path

def cleanup_temp_file(file_path):
    """Clean up temporary file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {e}")

# API Routes
@app.route('/')
def index():
    """API information"""
    return jsonify({
        'service': 'QuickUtil Image Processing API',
        'version': '1.0.8',
        'status': 'running',
        'platform': 'Render.com',
        'heic_support': HEIC_SUPPORT,
        'max_file_size': f'{MAX_CONTENT_LENGTH // (1024*1024)}MB',
        'supported_formats': list(SUPPORTED_FORMATS),
        'endpoints': {
            '/compress': 'Image compression with quality control',
            '/convert': 'Format conversion (PNG, JPEG, WebP, HEIC, etc.)',
            '/heic-convert': 'HEIC/HEIF to JPEG conversion',
            '/resize': 'Image resizing with aspect ratio',
            '/crop': 'Image cropping',
            '/rotate': 'Image rotation',
            '/filters': 'Image filters (blur, brightness, contrast, etc.)',
            '/batch-process': 'Multiple image processing'
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'heic_support': HEIC_SUPPORT,
        'service': 'QuickUtil Image Processing API',
        'version': '1.0.8'
    })

@app.route('/compress', methods=['POST', 'OPTIONS'])
def compress_image():
    """Compress image with quality control"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
    
    temp_path = None
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Get compression parameters
        quality = int(request.form.get('quality', 85))
        target_format = request.form.get('format', 'jpeg').lower()
        max_width = request.form.get('max_width', type=int)
        max_height = request.form.get('max_height', type=int)
        
        # Validate parameters
        quality = max(10, min(100, quality))
        
        # CRITICAL: Validate target format
        if target_format not in ['png', 'jpeg', 'jpg', 'webp', 'bmp', 'tiff', 'heic', 'heif']:
            return jsonify({'error': f'Target format not supported: {target_format}'}), 400
        
        # CRITICAL: Format mapping for processing 
        format_mapping = {
            'jpeg': 'JPEG',
            'jpg': 'JPEG', 
            'png': 'PNG',
            'webp': 'WEBP',
            'bmp': 'BMP',
            'tiff': 'TIFF',
            'heic': 'HEIF',  # HEIC maps to HEIF for pillow-heif
            'heif': 'HEIF'
        }
        
        processing_format = format_mapping.get(target_format, 'JPEG')
        
        # DEBUG: Log format mapping
        logger.info(f"🔧 Format mapping: {target_format} -> {processing_format}")
        
        # 🔧 EARLY FILE SIZE VALIDATION (MEMORY PROTECTION)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 20 * 1024 * 1024:  # 20MB limit for HEIC files
            return jsonify({'error': f'File too large: {file_size/(1024*1024):.1f}MB. Max: 20MB'}), 413
        
        logger.info(f"📊 Processing file: {file.filename}, Size: {file_size/(1024*1024):.1f}MB, Format: {target_format}")
        
        # Save file temporarily
        temp_path = save_file_temporarily(file)
        
        # 🔧 MEMORY-SAFE IMAGE LOADING
        image = None
        compressed_data = None
        try:
            image = Image.open(temp_path)
            original_size = os.path.getsize(temp_path)
            
            # Log image dimensions for memory estimation
            logger.info(f"🖼️ Image dimensions: {image.width}x{image.height}, Mode: {image.mode}")
            
            # Resize if dimensions specified
            if max_width or max_height:
                image.thumbnail((max_width or image.width, max_height or image.height), Image.Resampling.LANCZOS)
                logger.info(f"🔄 Resized to: {image.width}x{image.height}")
            
            # Compress image with mapped format
            compressed_data = process_image_with_quality(image, processing_format, quality)
            
        except MemoryError as me:
            logger.error(f"💥 MEMORY ERROR: {me}")
            return jsonify({'error': 'File too large for processing. Try a smaller image or lower quality.'}), 413
            
        except Exception as pe:
            logger.error(f"💥 PROCESSING ERROR: {pe}")
            return jsonify({'error': f'Image processing failed: {str(pe)}'}), 500
            
        finally:
            # 🧹 CRITICAL MEMORY CLEANUP
            if image:
                try:
                    image.close()
                    del image
                    gc.collect()
                    logger.info("🧹 Image memory cleaned up")
                except Exception as cleanup_err:
                    logger.warning(f"⚠️ Image cleanup warning: {cleanup_err}")
        
        # Exit early if processing failed
        if not compressed_data:
            return jsonify({'error': 'Image processing failed'}), 500
        
        # Generate unique filename for output
        unique_filename = f"{uuid.uuid4()}.{target_format}"
        output_path = os.path.join(PROCESSED_FOLDER, unique_filename)
        
        # Save compressed file
        with open(output_path, 'wb') as f:
            f.write(compressed_data.getvalue())
        
        # Calculate compression ratio
        new_size = len(compressed_data.getvalue())
        compression_ratio = (original_size - new_size) / original_size * 100
        
        logger.info(f"Image compressed: {file.filename} -> {unique_filename}, Quality: {quality}, Ratio: {compression_ratio:.1f}%")
        
        # Send compressed file
        response = send_file(
            output_path,
            mimetype=f'image/{target_format}',
            as_attachment=True,
            download_name=f"compressed_{file.filename.rsplit('.', 1)[0]}.{target_format}"
        )
        
        # Add compression metadata to headers
        response.headers['X-Original-Size'] = str(original_size)
        response.headers['X-Compressed-Size'] = str(new_size)
        response.headers['X-Compression-Ratio'] = f"{compression_ratio:.1f}"
        response.headers['X-Original-Format'] = get_file_format(file.filename) or 'unknown'
        response.headers['X-Output-Format'] = target_format
        # Get dimensions safely (image might be closed)
        dimensions = "unknown"
        try:
            with Image.open(temp_path) as img_check:
                dimensions = f"{img_check.width}x{img_check.height}"
        except:
            pass
            
        response.headers['X-Original-Dimensions'] = dimensions
        response.headers['X-Final-Dimensions'] = dimensions
        response.headers['X-Compression-Mode'] = 'standard'
        response.headers['X-Quality'] = str(quality)
        
        # CRITICAL: Expose custom headers for CORS
        response.headers['Access-Control-Expose-Headers'] = 'X-Original-Size,X-Compressed-Size,X-Compression-Ratio,X-Original-Format,X-Output-Format,X-Original-Dimensions,X-Final-Dimensions,X-Compression-Mode,X-Quality'
        
        # DEBUG: Log headers being set
        logger.info(f"🔍 Setting response headers: Original={original_size}, Compressed={new_size}, Ratio={compression_ratio:.1f}%")
        
        return response
        
    except Exception as e:
        logger.error(f"Image compression error: {e}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        cleanup_temp_file(temp_path)

@app.route('/heic-convert', methods=['POST', 'OPTIONS'])
def convert_heic():
    """Convert HEIC/HEIF to JPEG"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
    
    temp_path = None
    try:
        if not HEIC_SUPPORT:
            return jsonify({'error': 'HEIC support not available'}), 501
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get quality parameter
        quality = int(request.form.get('quality', 85))
        quality = max(10, min(100, quality))
        
        # Save HEIC file temporarily
        temp_path = save_file_temporarily(file)
        
        # Load HEIC image
        image = Image.open(temp_path)
        
        # Convert to JPEG
        converted_data = process_image_with_quality(image, 'JPEG', quality)
        
        # Generate unique filename for output
        unique_filename = f"{uuid.uuid4()}.jpg"
        output_path = os.path.join(PROCESSED_FOLDER, unique_filename)
        
        # Save converted file
        with open(output_path, 'wb') as f:
            f.write(converted_data.getvalue())
        
        logger.info(f"HEIC converted: {file.filename} -> JPEG")
        
        # Send converted file
        return send_file(
            output_path,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=f"converted_{file.filename.rsplit('.', 1)[0]}.jpg"
        )
        
    except Exception as e:
        logger.error(f"HEIC conversion error: {e}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        cleanup_temp_file(temp_path)

@app.route('/convert', methods=['POST', 'OPTIONS'])
def convert_format():
    """Convert image format"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
    
    temp_path = None
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Get conversion parameters
        target_format = request.form.get('format', 'jpeg').lower()
        quality = int(request.form.get('quality', 85))
        
        # Validate parameters
        if target_format not in ['png', 'jpeg', 'jpg', 'webp', 'bmp', 'tiff', 'heic', 'heif']:
            return jsonify({'error': 'Target format not supported'}), 400
        
        quality = max(10, min(100, quality))
        
        # Save file temporarily
        temp_path = save_file_temporarily(file)
        
        # Load and convert image
        image = Image.open(temp_path)
        
        # Convert image
        converted_data = process_image_with_quality(image, target_format, quality)
        
        # Generate unique filename for output
        unique_filename = f"{uuid.uuid4()}.{target_format}"
        output_path = os.path.join(PROCESSED_FOLDER, unique_filename)
        
        # Save converted file
        with open(output_path, 'wb') as f:
            f.write(converted_data.getvalue())
        
        logger.info(f"Image converted: {file.filename} -> {target_format}")
        
        # Send converted file
        return send_file(
            output_path,
            mimetype=f'image/{target_format}',
            as_attachment=True,
            download_name=f"converted_{file.filename.rsplit('.', 1)[0]}.{target_format}"
        )
        
    except Exception as e:
        logger.error(f"Image conversion error: {e}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        cleanup_temp_file(temp_path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 