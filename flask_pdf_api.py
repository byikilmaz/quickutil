#!/usr/bin/env python3
"""
🔥 Flask API for Professional PDF Compressor
iLovePDF seviyesinde compression service

API Endpoints:
- POST /compress - Single file compression
- POST /compress-batch - Multiple file compression  
- GET /profiles - Available quality profiles
- GET /health - Service health check

Author: AI Assistant for QuickUtil.app
Target: 80-90% compression like iLovePDF
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import uuid
from werkzeug.utils import secure_filename
import json
from datetime import datetime
import traceback

# Import our compression engine
try:
    from pdf_compressor_focused import (
        compress_pdf, 
        compress_pdf_batch,
        check_ghostscript_installation,
        get_file_size,
        format_file_size
    )
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure pdf_compressor_focused.py is in the same directory")
    exit(1)

# Flask app configuration
app = Flask(__name__)
CORS(app)  # Enable CORS for web integration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Temporary directory for processing
TEMP_DIR = tempfile.mkdtemp(prefix='pdf_compressor_')
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_quality(quality):
    """Validate quality parameter"""
    valid_qualities = ['/screen', '/ebook', '/printer', '/prepress']
    if quality not in valid_qualities:
        return '/screen'  # Default
    return quality

@app.route('/health', methods=['GET'])
def health_check():
    """Service health check endpoint"""
    try:
        # Check Ghostscript
        gs_available = check_ghostscript_installation()
        
        # Check temp directory
        temp_writable = os.access(TEMP_DIR, os.W_OK)
        
        status = {
            'status': 'healthy' if gs_available and temp_writable else 'unhealthy',
            'ghostscript_available': gs_available,
            'temp_directory_writable': temp_writable,
            'temp_directory': TEMP_DIR,
            'timestamp': datetime.now().isoformat(),
            'service': 'PDF Compression API',
            'version': '2.0'
        }
        
        return jsonify(status), 200 if gs_available else 503
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/profiles', methods=['GET'])
def get_profiles():
    """Get available compression profiles"""
    profiles = {
        '/screen': {
            'name': 'Screen Quality',
            'description': 'Maksimum sıkıştırma ~80-90% (Web optimize)',
            'target_compression': '80-90%',
            'use_case': 'Web viewing, email sharing'
        },
        '/ebook': {
            'name': 'E-book Quality', 
            'description': 'Yüksek sıkıştırma ~60-80% (E-reader)',
            'target_compression': '60-80%',
            'use_case': 'E-readers, tablets'
        },
        '/printer': {
            'name': 'Print Quality',
            'description': 'Orta sıkıştırma ~30-50% (Yazdırma)',
            'target_compression': '30-50%',
            'use_case': 'Home/office printing'
        },
        '/prepress': {
            'name': 'Prepress Quality',
            'description': 'Düşük sıkıştırma ~10-30% (Profesyonel)',
            'target_compression': '10-30%',
            'use_case': 'Professional printing'
        }
    }
    
    return jsonify({
        'success': True,
        'profiles': profiles,
        'default': '/screen',
        'recommendation': 'Use /screen for maximum compression (iLovePDF level)'
    })

@app.route('/compress', methods=['POST'])
def api_compress():
    """
    Single PDF file compression endpoint
    
    Form Data:
        - file: PDF file to compress
        - quality: Optional quality level (default: /screen)
        
    Returns:
        JSON response with compression results and download link
    """
    try:
        # Validate request
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
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Only PDF files are allowed'
            }), 400
        
        # Get quality parameter
        quality = request.form.get('quality', '/screen')
        quality = validate_quality(quality)
        
        # Generate unique filenames
        file_id = str(uuid.uuid4())
        secure_name = secure_filename(file.filename)
        input_filename = f"{file_id}_input_{secure_name}"
        output_filename = f"{file_id}_compressed_{secure_name}"
        
        input_path = os.path.join(TEMP_DIR, input_filename)
        output_path = os.path.join(TEMP_DIR, output_filename)
        
        # Save uploaded file
        file.save(input_path)
        
        # Compress PDF
        print(f"🚀 Starting compression: {secure_name} with quality {quality}")
        result = compress_pdf(input_path, output_path, quality)
        
        # Prepare response
        response_data = {
            'success': True,
            'file_id': file_id,
            'original_filename': secure_name,
            'compressed_filename': f"compressed_{secure_name}",
            'original_size': result['original_size'],
            'compressed_size': result['compressed_size'],
            'original_size_formatted': result['original_size_formatted'],
            'compressed_size_formatted': result['compressed_size_formatted'],
            'compression_ratio': result['compression_ratio'],
            'size_reduction_formatted': result['size_reduction_formatted'],
            'execution_time': result['execution_time'],
            'quality_used': quality,
            'quality_description': result['quality_description'],
            'download_url': f'/download/{file_id}',
            'timestamp': datetime.now().isoformat()
        }
        
        # Clean up input file
        os.remove(input_path)
        
        print(f"✅ Compression completed: {result['compression_ratio']:.1f}% reduction")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Compression error: {e}")
        print(traceback.format_exc())
        
        # Clean up files
        try:
            if 'input_path' in locals() and os.path.exists(input_path):
                os.remove(input_path)
            if 'output_path' in locals() and os.path.exists(output_path):
                os.remove(output_path)
        except:
            pass
        
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/download/<file_id>')
def download_file(file_id):
    """Download compressed PDF file"""
    try:
        # Find the compressed file
        files = [f for f in os.listdir(TEMP_DIR) if f.startswith(f"{file_id}_compressed_")]
        
        if not files:
            return jsonify({
                'success': False,
                'error': 'File not found or expired'
            }), 404
        
        file_path = os.path.join(TEMP_DIR, files[0])
        original_name = files[0].replace(f"{file_id}_compressed_", "")
        
        # Send file and delete after sending
        def remove_file(response):
            try:
                os.remove(file_path)
            except OSError:
                pass
            return response
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"compressed_{original_name}",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/compress-batch', methods=['POST'])
def api_compress_batch():
    """
    Multiple PDF files compression endpoint
    
    Form Data:
        - files[]: Multiple PDF files
        - quality: Optional quality level (default: /screen)
        
    Returns:
        JSON response with batch compression results
    """
    try:
        # Validate request
        if 'files[]' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No files provided'
            }), 400
        
        files = request.files.getlist('files[]')
        if not files or all(f.filename == '' for f in files):
            return jsonify({
                'success': False,
                'error': 'No files selected'
            }), 400
        
        # Validate all files
        valid_files = []
        for file in files:
            if file.filename and allowed_file(file.filename):
                valid_files.append(file)
        
        if not valid_files:
            return jsonify({
                'success': False,
                'error': 'No valid PDF files found'
            }), 400
        
        # Get quality parameter
        quality = request.form.get('quality', '/screen')
        quality = validate_quality(quality)
        
        # Create batch directory
        batch_id = str(uuid.uuid4())
        batch_input_dir = os.path.join(TEMP_DIR, f"{batch_id}_input")
        batch_output_dir = os.path.join(TEMP_DIR, f"{batch_id}_output")
        os.makedirs(batch_input_dir)
        os.makedirs(batch_output_dir)
        
        # Save all files
        file_mappings = []
        for file in valid_files:
            secure_name = secure_filename(file.filename)
            input_path = os.path.join(batch_input_dir, secure_name)
            file.save(input_path)
            file_mappings.append({
                'original_name': file.filename,
                'secure_name': secure_name,
                'input_path': input_path
            })
        
        print(f"🚀 Starting batch compression: {len(valid_files)} files with quality {quality}")
        
        # Compress batch
        batch_result = compress_pdf_batch(batch_input_dir, batch_output_dir, quality)
        
        # Process individual results
        individual_results = []
        for file_info, result in zip(file_mappings, batch_result['individual_results']):
            if result.get('success'):
                individual_results.append({
                    'original_filename': file_info['original_name'],
                    'success': True,
                    'original_size_formatted': result['original_size_formatted'],
                    'compressed_size_formatted': result['compressed_size_formatted'],
                    'compression_ratio': result['compression_ratio'],
                    'execution_time': result['execution_time']
                })
            else:
                individual_results.append({
                    'original_filename': file_info['original_name'],
                    'success': False,
                    'error': result.get('error', 'Unknown error')
                })
        
        # Prepare response
        response_data = {
            'success': True,
            'batch_id': batch_id,
            'total_files': batch_result['total_files'],
            'successful_compressions': batch_result['successful'],
            'failed_compressions': batch_result['failed'],
            'total_original_size_formatted': batch_result['total_original_formatted'],
            'total_compressed_size_formatted': batch_result['total_compressed_formatted'],
            'overall_compression_ratio': batch_result['overall_compression_ratio'],
            'total_savings': batch_result['total_savings'],
            'quality_used': quality,
            'individual_results': individual_results,
            'download_batch_url': f'/download-batch/{batch_id}',
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"✅ Batch compression completed: {batch_result['overall_compression_ratio']:.1f}% overall reduction")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Batch compression error: {e}")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/download-batch/<batch_id>')
def download_batch(batch_id):
    """Download compressed files as ZIP archive"""
    try:
        import zipfile
        
        batch_output_dir = os.path.join(TEMP_DIR, f"{batch_id}_output")
        
        if not os.path.exists(batch_output_dir):
            return jsonify({
                'success': False,
                'error': 'Batch not found or expired'
            }), 404
        
        # Create ZIP file
        zip_path = os.path.join(TEMP_DIR, f"{batch_id}_compressed.zip")
        
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for file in os.listdir(batch_output_dir):
                file_path = os.path.join(batch_output_dir, file)
                zipf.write(file_path, file)
        
        return send_file(
            zip_path,
            as_attachment=True,
            download_name=f"compressed_batch_{batch_id}.zip",
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 100MB.'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

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
    print("Starting Flask API server...")
    print(f"Temp directory: {TEMP_DIR}")
    
    # Check Ghostscript on startup
    if not check_ghostscript_installation():
        print("⚠️ WARNING: Ghostscript not found. API will not work properly.")
        print("Install Ghostscript before starting the server.")
    else:
        print("✅ Ghostscript is available")
    
    # Development server
    print("🌐 API Endpoints:")
    print("   POST /compress - Single file compression")
    print("   POST /compress-batch - Batch file compression") 
    print("   GET /profiles - Quality profiles")
    print("   GET /health - Health check")
    print("   GET /download/<file_id> - Download compressed file")
    print("   GET /download-batch/<batch_id> - Download batch as ZIP")
    print("\n🚀 Starting server on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=False) 