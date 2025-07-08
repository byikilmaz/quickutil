#!/usr/bin/env python3
"""
Flask API Server for Professional PDF Compression
Uses Ghostscript for iLovePDF-level compression

Requirements:
- Flask
- pdf_compressor_pro.py
- Ghostscript

Usage:
    python pdf_api_server.py

API Endpoints:
    POST /compress - Compress PDF file
    GET /profiles - Get available compression profiles
    GET /health - Health check

Author: AI Assistant
Version: 2.0
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import uuid
from werkzeug.utils import secure_filename
import logging
from datetime import datetime, timedelta
import threading
import time

# Import our professional compressor
try:
    from pdf_compressor_pro import PDFCompressor, check_ghostscript_installation, get_compression_profiles
except ImportError:
    print("❌ Error: pdf_compressor_pro.py not found!")
    print("   Please ensure pdf_compressor_pro.py is in the same directory")
    exit(1)

# Configure Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'pdf'}
UPLOAD_FOLDER = 'temp_uploads'
CLEANUP_INTERVAL = 3600  # 1 hour
FILE_RETENTION_TIME = 3600  # 1 hour

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global compressor instance
compressor = None

def init_compressor():
    """Initialize the PDF compressor"""
    global compressor
    try:
        compressor = PDFCompressor()
        logger.info("✅ PDF Compressor initialized successfully")
        return True
    except RuntimeError as e:
        logger.error(f"❌ Failed to initialize compressor: {e}")
        return False

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_files():
    """Clean up old temporary files"""
    try:
        current_time = time.time()
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                if file_age > FILE_RETENTION_TIME:
                    os.remove(file_path)
                    logger.info(f"🗑️ Cleaned up old file: {filename}")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

def start_cleanup_thread():
    """Start background cleanup thread"""
    def cleanup_worker():
        while True:
            time.sleep(CLEANUP_INTERVAL)
            cleanup_old_files()
    
    cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
    cleanup_thread.start()
    logger.info("🧹 Background cleanup thread started")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    global compressor
    
    status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ghostscript_available': compressor is not None,
        'version': '2.0'
    }
    
    if compressor:
        try:
            gs_check = compressor.check_ghostscript()
            status['ghostscript_working'] = gs_check
        except:
            status['ghostscript_working'] = False
    
    return jsonify(status)

@app.route('/profiles', methods=['GET'])
def get_profiles():
    """Get available compression profiles"""
    try:
        profiles = get_compression_profiles()
        return jsonify({
            'success': True,
            'profiles': profiles
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/compress', methods=['POST'])
def compress_pdf():
    """
    Compress PDF file
    
    Form data:
        file: PDF file to compress
        quality: Compression quality (screen, ebook, printer, prepress)
        
    Returns:
        JSON response with compression results and download link
    """
    global compressor
    
    if not compressor:
        return jsonify({
            'success': False,
            'error': 'PDF compressor not available. Please check Ghostscript installation.'
        }), 500
    
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Check file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Only PDF files are allowed'
            }), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'error': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB'
            }), 400
        
        # Get compression quality
        quality = request.form.get('quality', 'screen')
        profiles = get_compression_profiles()
        if quality not in profiles:
            return jsonify({
                'success': False,
                'error': f'Invalid quality. Choose from: {list(profiles.keys())}'
            }), 400
        
        # Generate unique filenames
        unique_id = str(uuid.uuid4())
        original_filename = secure_filename(file.filename)
        input_filename = f"{unique_id}_input_{original_filename}"
        output_filename = f"{unique_id}_compressed_{original_filename}"
        
        input_path = os.path.join(UPLOAD_FOLDER, input_filename)
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)
        
        # Save uploaded file
        file.save(input_path)
        logger.info(f"📥 File uploaded: {original_filename} ({file_size} bytes)")
        
        # Compress PDF
        logger.info(f"🔄 Starting compression with quality: {quality}")
        start_time = time.time()
        
        result = compressor.compress_pdf(input_path, output_path, quality)
        
        compression_time = time.time() - start_time
        logger.info(f"✅ Compression completed in {compression_time:.2f} seconds")
        
        # Prepare response
        response_data = {
            'success': True,
            'original_filename': original_filename,
            'compressed_filename': f"compressed_{original_filename}",
            'download_id': unique_id,
            'quality_profile': quality,
            'original_size': result['original_size'],
            'compressed_size': result['compressed_size'],
            'original_size_formatted': result['original_size_formatted'],
            'compressed_size_formatted': result['compressed_size_formatted'],
            'compression_ratio': result['compression_ratio'],
            'size_reduction': result['size_reduction'],
            'execution_time': result['execution_time'],
            'api_processing_time': compression_time,
            'profile_info': result['profile_info']
        }
        
        logger.info(f"📊 Compression Results:")
        logger.info(f"   Original: {result['original_size_formatted']}")
        logger.info(f"   Compressed: {result['compressed_size_formatted']}")
        logger.info(f"   Ratio: {result['compression_ratio']:.1f}% reduction")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Compression error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    finally:
        # Clean up input file
        try:
            if 'input_path' in locals() and os.path.exists(input_path):
                os.remove(input_path)
        except:
            pass

@app.route('/download/<download_id>', methods=['GET'])
def download_file(download_id):
    """Download compressed PDF file"""
    try:
        # Find the compressed file
        compressed_files = [f for f in os.listdir(UPLOAD_FOLDER) 
                          if f.startswith(f"{download_id}_compressed_")]
        
        if not compressed_files:
            return jsonify({
                'success': False,
                'error': 'File not found or expired'
            }), 404
        
        file_path = os.path.join(UPLOAD_FOLDER, compressed_files[0])
        
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Get original filename from the stored filename
        original_name = compressed_files[0].replace(f"{download_id}_compressed_", "")
        download_name = f"compressed_{original_name}"
        
        logger.info(f"📤 File downloaded: {download_name}")
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=download_name,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"❌ Download error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get server statistics"""
    try:
        # Count temporary files
        temp_files = len([f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.pdf')])
        
        # Get disk usage
        import shutil
        total, used, free = shutil.disk_usage(UPLOAD_FOLDER)
        
        stats = {
            'success': True,
            'temp_files': temp_files,
            'disk_usage': {
                'total': total,
                'used': used,
                'free': free,
                'total_formatted': f"{total / 1024**3:.1f} GB",
                'used_formatted': f"{used / 1024**3:.1f} GB",
                'free_formatted': f"{free / 1024**3:.1f} GB"
            },
            'max_file_size': MAX_FILE_SIZE,
            'max_file_size_formatted': f"{MAX_FILE_SIZE / 1024**2:.1f} MB",
            'retention_time': f"{FILE_RETENTION_TIME / 3600:.1f} hours"
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(413)
def file_too_large(e):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'error': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("🔥 Professional PDF Compression API Server")
    print("=" * 50)
    
    # Check Ghostscript installation
    print("🔧 Checking Ghostscript installation...")
    if not check_ghostscript_installation():
        print("❌ Ghostscript not found!")
        print("\n📦 Installation Instructions:")
        print("   Linux: sudo apt-get install ghostscript")
        print("   macOS: brew install ghostscript")  
        print("   Windows: Download from https://www.ghostscript.com/")
        exit(1)
    
    # Initialize compressor
    print("⚙️ Initializing PDF compressor...")
    if not init_compressor():
        print("❌ Failed to initialize PDF compressor!")
        exit(1)
    
    # Start cleanup thread
    start_cleanup_thread()
    
    # Show API endpoints
    print("✅ Server ready!")
    print("\n📡 API Endpoints:")
    print("   POST /compress - Compress PDF file")
    print("   GET  /download/<id> - Download compressed file")
    print("   GET  /profiles - Available compression profiles")
    print("   GET  /health - Health check")
    print("   GET  /stats - Server statistics")
    
    print("\n🔧 Usage Example:")
    print("   curl -X POST -F 'file=@input.pdf' -F 'quality=screen' http://localhost:5000/compress")
    
    print("\n🌐 Starting server on http://localhost:5000")
    print("   Press Ctrl+C to stop")
    print("-" * 50)
    
    # Configure Flask
    app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
    
    # Start server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    ) 