#!/usr/bin/env python3
"""
Example Usage of Professional PDF Compressor
Demonstrates all features and capabilities

Requirements:
- pdf_compressor_pro.py
- Ghostscript installed

Author: AI Assistant
Version: 2.0
"""

import os
import sys
from pdf_compressor_pro import (
    PDFCompressor, 
    compress_pdf, 
    check_ghostscript_installation,
    get_compression_profiles,
    print_ghostscript_installation_help
)

def example_single_file_compression():
    """Example: Compress a single PDF file"""
    print("📄 Single File Compression Example")
    print("-" * 40)
    
    # Check if example file exists
    input_file = "example_input.pdf"
    if not os.path.exists(input_file):
        print(f"⚠️ Example file '{input_file}' not found.")
        print("   Create a PDF file named 'example_input.pdf' to test.")
        return
    
    # Compress with maximum compression (iLovePDF level)
    try:
        print(f"🔄 Compressing: {input_file}")
        result = compress_pdf(
            input_path=input_file,
            output_path="compressed_example.pdf",
            quality="screen"  # Maximum compression
        )
        
        print("✅ Compression completed!")
        print(f"📊 Results:")
        print(f"   Original: {result['original_size_formatted']}")
        print(f"   Compressed: {result['compressed_size_formatted']}")
        print(f"   Reduction: {result['compression_ratio']:.1f}%")
        print(f"   Time: {result['execution_time']:.2f} seconds")
        
        if result['compression_ratio'] >= 80:
            print("🏆 iLovePDF-level compression achieved!")
        elif result['compression_ratio'] >= 60:
            print("🥈 Excellent compression!")
        else:
            print("ℹ️ Good compression - file may already be optimized")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def example_multiple_quality_levels():
    """Example: Test different compression quality levels"""
    print("\n🎯 Multiple Quality Levels Example")
    print("-" * 40)
    
    input_file = "example_input.pdf"
    if not os.path.exists(input_file):
        print(f"⚠️ Example file '{input_file}' not found.")
        return
    
    profiles = get_compression_profiles()
    results = []
    
    print(f"📁 Testing file: {input_file}")
    original_size = os.path.getsize(input_file)
    print(f"📊 Original size: {original_size / 1024:.1f} KB")
    print()
    
    for quality, profile in profiles.items():
        try:
            output_file = f"compressed_{quality}_example.pdf"
            print(f"🔄 Testing {quality.upper()} quality...")
            
            result = compress_pdf(input_file, output_file, quality)
            results.append({
                'quality': quality,
                'profile': profile,
                'result': result
            })
            
            print(f"   ✅ {profile['name']}")
            print(f"   📦 Size: {result['compressed_size_formatted']}")
            print(f"   📉 Reduction: {result['compression_ratio']:.1f}%")
            print()
            
        except Exception as e:
            print(f"   ❌ Failed: {e}")
            print()
    
    # Summary
    print("📊 COMPRESSION COMPARISON")
    print("=" * 50)
    print(f"{'Quality':<12} {'Size':<10} {'Reduction':<10} {'Description'}")
    print("-" * 50)
    
    for item in results:
        quality = item['quality']
        result = item['result']
        profile = item['profile']
        
        print(f"{quality.upper():<12} "
              f"{result['compressed_size_formatted']:<10} "
              f"{result['compression_ratio']:.1f}%{'':<6} "
              f"{profile['description']}")

def example_batch_compression():
    """Example: Batch compress multiple PDF files"""
    print("\n📦 Batch Compression Example")
    print("-" * 40)
    
    # Create test directory
    input_dir = "test_pdfs"
    output_dir = "compressed_pdfs"
    
    if not os.path.exists(input_dir):
        print(f"⚠️ Directory '{input_dir}' not found.")
        print("   Create directory with PDF files to test batch compression.")
        return
    
    pdf_files = [f for f in os.listdir(input_dir) if f.endswith('.pdf')]
    if not pdf_files:
        print(f"⚠️ No PDF files found in '{input_dir}'")
        return
    
    print(f"📁 Input directory: {input_dir}")
    print(f"📂 Output directory: {output_dir}")
    print(f"📄 Found {len(pdf_files)} PDF files")
    print()
    
    try:
        compressor = PDFCompressor()
        result = compressor.compress_pdf_batch(
            input_directory=input_dir,
            output_directory=output_dir,
            quality="screen"  # Maximum compression
        )
        
        print("✅ Batch compression completed!")
        print(f"📊 Results:")
        print(f"   Files processed: {result['successful_compressions']}/{result['total_files']}")
        print(f"   Total original: {result['total_original_size_formatted']}")
        print(f"   Total compressed: {result['total_compressed_size_formatted']}")
        print(f"   Overall reduction: {result['overall_compression_ratio']:.1f}%")
        
        if result['failed_compressions'] > 0:
            print(f"⚠️ Failed compressions: {result['failed_compressions']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def example_advanced_compression():
    """Example: Advanced compression with custom options"""
    print("\n⚙️ Advanced Compression Example")
    print("-" * 40)
    
    input_file = "example_input.pdf"
    if not os.path.exists(input_file):
        print(f"⚠️ Example file '{input_file}' not found.")
        return
    
    try:
        compressor = PDFCompressor()
        
        # Custom compression options for extreme compression
        custom_options = {
            'ColorImageResolution': 50,  # Very low resolution
            'GrayImageResolution': 50,
            'ColorImageDownsampleThreshold': 1.0,
            'JPEGQ': 30,  # Very low JPEG quality
            'EmbedAllFonts': 'false',
            'SubsetFonts': 'true',
            'CompressFonts': 'true'
        }
        
        print("🔄 Applying extreme compression settings...")
        print("⚠️ Warning: This will significantly reduce quality!")
        
        result = compressor.compress_pdf(
            input_path=input_file,
            output_path="extreme_compressed_example.pdf",
            quality="screen",
            custom_options=custom_options
        )
        
        print("✅ Extreme compression completed!")
        print(f"📊 Results:")
        print(f"   Original: {result['original_size_formatted']}")
        print(f"   Compressed: {result['compressed_size_formatted']}")
        print(f"   Reduction: {result['compression_ratio']:.1f}%")
        
        if result['compression_ratio'] >= 90:
            print("🏆 Extreme compression achieved!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def example_api_usage():
    """Example: How to use with Flask API"""
    print("\n🌐 API Usage Example")
    print("-" * 40)
    
    print("📡 Flask API Server Usage:")
    print()
    print("1️⃣ Start the server:")
    print("   python pdf_api_server.py")
    print()
    print("2️⃣ Compress PDF via API:")
    print("   curl -X POST \\")
    print("        -F 'file=@input.pdf' \\")
    print("        -F 'quality=screen' \\")
    print("        http://localhost:5000/compress")
    print()
    print("3️⃣ Get compression profiles:")
    print("   curl http://localhost:5000/profiles")
    print()
    print("4️⃣ Download compressed file:")
    print("   curl http://localhost:5000/download/<download_id> -o compressed.pdf")
    print()
    print("5️⃣ Check server health:")
    print("   curl http://localhost:5000/health")
    print()
    print("🐍 Python client example:")
    python_example = '''
import requests

# Upload and compress PDF
with open('input.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/compress',
        files={'file': f},
        data={'quality': 'screen'}
    )

result = response.json()
if result['success']:
    download_id = result['download_id']
    print(f"Compression: {result['compression_ratio']:.1f}% reduction")
    
    # Download compressed file
    download_response = requests.get(f'http://localhost:5000/download/{download_id}')
    with open('compressed.pdf', 'wb') as f:
        f.write(download_response.content)
    '''
    
    print(python_example)

def main():
    """Main function to run all examples"""
    print("🔥 Professional PDF Compressor - Examples")
    print("=" * 60)
    
    # Check Ghostscript installation
    if not check_ghostscript_installation():
        print("❌ Ghostscript not installed!")
        print_ghostscript_installation_help()
        return
    
    print("✅ Ghostscript is installed and working!")
    
    # Show available profiles
    print("\n📊 Available Compression Profiles:")
    profiles = get_compression_profiles()
    for key, profile in profiles.items():
        print(f"   {key.upper()}: {profile['description']}")
    
    # Run examples
    try:
        example_single_file_compression()
        example_multiple_quality_levels()
        example_batch_compression()
        example_advanced_compression()
        example_api_usage()
        
    except KeyboardInterrupt:
        print("\n\n👋 Examples interrupted by user")
    except Exception as e:
        print(f"\n❌ Error running examples: {e}")
    
    print("\n✅ Examples completed!")
    print("\n💡 Tips:")
    print("   - Use 'screen' quality for maximum compression (80-90%)")
    print("   - Use 'ebook' quality for balanced compression (60-80%)")
    print("   - Use 'printer' quality for high-quality output (30-50%)")
    print("   - Check file quality after compression")
    print("   - Batch process multiple files for efficiency")

if __name__ == "__main__":
    main() 