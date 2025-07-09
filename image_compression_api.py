#!/usr/bin/env python3
"""
Professional Image Compression API for QuickUtil.app
Deployed on Render.com for high-quality image compression
"""

import os
import io
import logging
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from PIL import Image, ImageFilter, ImageEnhance
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import base64
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
SUPPORTED_FORMATS = ['JPEG', 'PNG', 'WEBP', 'BMP', 'TIFF']

class ImageCompressor:
    """Professional image compression with multiple algorithms"""
    
    @staticmethod
    def compress_aggressive(image: Image.Image, quality: int = 85, optimize: bool = True) -> Tuple[Image.Image, dict]:
        """Aggressive compression with quality optimization"""
        
        # Convert to RGB if necessary for JPEG compression
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparency
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            if image.mode in ('RGBA', 'LA'):
                background.paste(image, mask=image.split()[-1])
                image = background
        
        # Progressive JPEG for better compression
        compression_params = {
            'optimize': optimize,
            'progressive': True,
            'quality': quality
        }
        
        return image, compression_params
    
    @staticmethod
    def compress_lossless(image: Image.Image) -> Tuple[Image.Image, dict]:
        """Lossless PNG compression with optimization"""
        
        # Convert to appropriate color mode for PNG
        if image.mode not in ('RGB', 'RGBA', 'L', 'LA', 'P'):
            image = image.convert('RGBA')
        
        compression_params = {
            'optimize': True,
            'compress_level': 9  # Maximum PNG compression
        }
        
        return image, compression_params
    
    @staticmethod
    def compress_webp(image: Image.Image, quality: int = 85, lossless: bool = False) -> Tuple[Image.Image, dict]:
        """WebP compression (modern format)"""
        
        compression_params = {
            'optimize': True,
            'quality': quality if not lossless else 100,
            'lossless': lossless,
            'method': 6  # Maximum compression effort
        }
        
        return image, compression_params
    
    @staticmethod
    def resize_image(image: Image.Image, max_width: int = None, max_height: int = None, 
                    maintain_aspect: bool = True) -> Image.Image:
        """Smart image resizing"""
        
        if not max_width and not max_height:
            return image
        
        width, height = image.size
        
        if maintain_aspect:
            if max_width and max_height:
                # Fit within bounds
                ratio = min(max_width / width, max_height / height)
            elif max_width:
                ratio = max_width / width
            elif max_height:
                ratio = max_height / height
            
            new_width = int(width * ratio)
            new_height = int(height * ratio)
        else:
            new_width = max_width or width
            new_height = max_height or height
        
        # Use LANCZOS for high-quality resizing
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'QuickUtil Image Compression API',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/compress', methods=['POST'])
def compress_image():
    """Main image compression endpoint"""
    
    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get compression parameters
        quality = int(request.form.get('quality', 85))
        max_width = request.form.get('max_width')
        max_height = request.form.get('max_height')
        output_format = request.form.get('format', 'JPEG').upper()
        compression_mode = request.form.get('mode', 'aggressive')  # aggressive, lossless, webp
        
        # Validate parameters
        if quality < 10 or quality > 100:
            return jsonify({'error': 'Quality must be between 10 and 100'}), 400
        
        if output_format not in SUPPORTED_FORMATS:
            return jsonify({'error': f'Unsupported format. Supported: {SUPPORTED_FORMATS}'}), 400
        
        # Read and validate image
        image_data = file.read()
        if len(image_data) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size: 50MB'}), 400
        
        original_size = len(image_data)
        
        # Open image with PIL
        try:
            image = Image.open(io.BytesIO(image_data))
            original_format = image.format
            original_mode = image.mode
            original_dimensions = image.size
        except Exception as e:
            return jsonify({'error': f'Invalid image file: {str(e)}'}), 400
        
        # Apply resizing if requested
        if max_width or max_height:
            max_w = int(max_width) if max_width else None
            max_h = int(max_height) if max_height else None
            image = ImageCompressor.resize_image(image, max_w, max_h)
        
        # Apply compression based on mode
        compressor = ImageCompressor()
        
        if compression_mode == 'lossless' or output_format == 'PNG':
            compressed_image, params = compressor.compress_lossless(image)
            output_format = 'PNG'
        elif compression_mode == 'webp' or output_format == 'WEBP':
            compressed_image, params = compressor.compress_webp(image, quality)
            output_format = 'WEBP'
        else:  # aggressive
            compressed_image, params = compressor.compress_aggressive(image, quality)
            output_format = 'JPEG'
        
        # Save compressed image to memory
        output_buffer = io.BytesIO()
        compressed_image.save(output_buffer, format=output_format, **params)
        compressed_data = output_buffer.getvalue()
        compressed_size = len(compressed_data)
        
        # Calculate compression metrics
        compression_ratio = (original_size - compressed_size) / original_size * 100
        size_reduction = original_size - compressed_size
        
        # Prepare response
        output_buffer.seek(0)
        
        # Generate filename
        original_name = os.path.splitext(file.filename)[0]
        file_extension = output_format.lower().replace('jpeg', 'jpg')
        compressed_filename = f"{original_name}_compressed.{file_extension}"
        
        # Return compressed image with metadata headers
        response = send_file(
            output_buffer,
            mimetype=f'image/{file_extension}',
            as_attachment=True,
            download_name=compressed_filename
        )
        
        # Add compression metadata to headers
        response.headers['X-Original-Size'] = str(original_size)
        response.headers['X-Compressed-Size'] = str(compressed_size)
        response.headers['X-Compression-Ratio'] = f"{compression_ratio:.2f}"
        response.headers['X-Size-Reduction'] = str(size_reduction)
        response.headers['X-Original-Format'] = original_format or 'Unknown'
        response.headers['X-Output-Format'] = output_format
        response.headers['X-Original-Dimensions'] = f"{original_dimensions[0]}x{original_dimensions[1]}"
        response.headers['X-Final-Dimensions'] = f"{compressed_image.size[0]}x{compressed_image.size[1]}"
        response.headers['X-Compression-Mode'] = compression_mode
        response.headers['X-Quality'] = str(quality)
        
        logger.info(f"Compressed {file.filename}: {original_size} → {compressed_size} bytes ({compression_ratio:.2f}% reduction)")
        
        return response
        
    except Exception as e:
        logger.error(f"Compression error: {str(e)}")
        return jsonify({'error': f'Compression failed: {str(e)}'}), 500

@app.route('/batch-compress', methods=['POST'])
def batch_compress():
    """Batch image compression endpoint"""
    
    try:
        files = request.files.getlist('images')
        if not files:
            return jsonify({'error': 'No images provided'}), 400
        
        # Get common parameters
        quality = int(request.form.get('quality', 85))
        output_format = request.form.get('format', 'JPEG').upper()
        compression_mode = request.form.get('mode', 'aggressive')
        
        results = []
        
        for file in files:
            if file.filename == '':
                continue
                
            try:
                # Process each image individually
                # (This is a simplified version - in production, you'd want proper batch processing)
                image_data = file.read()
                original_size = len(image_data)
                
                image = Image.open(io.BytesIO(image_data))
                
                # Apply compression
                compressor = ImageCompressor()
                
                if compression_mode == 'lossless':
                    compressed_image, params = compressor.compress_lossless(image)
                    format_used = 'PNG'
                elif compression_mode == 'webp':
                    compressed_image, params = compressor.compress_webp(image, quality)
                    format_used = 'WEBP'
                else:
                    compressed_image, params = compressor.compress_aggressive(image, quality)
                    format_used = 'JPEG'
                
                # Get compressed data size (without saving)
                output_buffer = io.BytesIO()
                compressed_image.save(output_buffer, format=format_used, **params)
                compressed_size = len(output_buffer.getvalue())
                
                compression_ratio = (original_size - compressed_size) / original_size * 100
                
                results.append({
                    'filename': file.filename,
                    'original_size': original_size,
                    'compressed_size': compressed_size,
                    'compression_ratio': round(compression_ratio, 2),
                    'size_reduction': original_size - compressed_size,
                    'status': 'success'
                })
                
            except Exception as e:
                results.append({
                    'filename': file.filename,
                    'status': 'error',
                    'error': str(e)
                })
        
        return jsonify({
            'results': results,
            'total_files': len(files),
            'successful': len([r for r in results if r['status'] == 'success']),
            'failed': len([r for r in results if r['status'] == 'error'])
        })
        
    except Exception as e:
        logger.error(f"Batch compression error: {str(e)}")
        return jsonify({'error': f'Batch compression failed: {str(e)}'}), 500

@app.route('/formats', methods=['GET'])
def get_supported_formats():
    """Get supported image formats"""
    return jsonify({
        'supported_formats': SUPPORTED_FORMATS,
        'max_file_size': MAX_FILE_SIZE,
        'compression_modes': ['aggressive', 'lossless', 'webp']
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 