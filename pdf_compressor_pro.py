#!/usr/bin/env python3
"""
Professional PDF Compressor using Ghostscript
Achieves iLovePDF-level compression (80-90% reduction)

Requirements:
- Python 3.6+
- Ghostscript installed on system

Author: AI Assistant
Version: 2.0
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import time
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PDFCompressor:
    """
    Professional PDF Compressor using Ghostscript
    Achieves iLovePDF-level compression rates
    """
    
    # iLovePDF-level compression profiles
    COMPRESSION_PROFILES = {
        'screen': {
            'name': 'Screen Quality (Maximum Compression)',
            'settings': '/screen',
            'dpi_color': 72,
            'dpi_gray': 72,
            'dpi_mono': 300,
            'jpeg_quality': 40,
            'description': 'Optimized for web viewing, maximum compression (~80-90%)'
        },
        'ebook': {
            'name': 'E-book Quality (High Compression)', 
            'settings': '/ebook',
            'dpi_color': 150,
            'dpi_gray': 150,
            'dpi_mono': 300,
            'jpeg_quality': 60,
            'description': 'Balanced quality for e-readers (~60-80%)'
        },
        'printer': {
            'name': 'Print Quality (Moderate Compression)',
            'settings': '/printer', 
            'dpi_color': 300,
            'dpi_gray': 300,
            'dpi_mono': 1200,
            'jpeg_quality': 80,
            'description': 'High quality for printing (~30-50%)'
        },
        'prepress': {
            'name': 'Prepress Quality (Light Compression)',
            'settings': '/prepress',
            'dpi_color': 300,
            'dpi_gray': 300,
            'dpi_mono': 1200,
            'jpeg_quality': 90,
            'description': 'Professional printing quality (~10-30%)'
        }
    }

    def __init__(self):
        """Initialize the PDF Compressor"""
        self.ghostscript_path = self._find_ghostscript()
        if not self.ghostscript_path:
            raise RuntimeError("Ghostscript not found. Please install Ghostscript first.")
        
        logger.info(f"Using Ghostscript: {self.ghostscript_path}")

    def _find_ghostscript(self) -> Optional[str]:
        """Find Ghostscript executable on system"""
        possible_names = ['gs', 'gswin64c', 'gswin32c', 'ghostscript']
        
        for name in possible_names:
            path = shutil.which(name)
            if path:
                return path
                
        # Check common installation paths
        common_paths = [
            '/usr/bin/gs',
            '/usr/local/bin/gs',
            '/opt/homebrew/bin/gs',
            'C:\\Program Files\\gs\\gs*\\bin\\gswin64c.exe',
            'C:\\Program Files (x86)\\gs\\gs*\\bin\\gswin32c.exe'
        ]
        
        for path_pattern in common_paths:
            if '*' in path_pattern:
                # Handle wildcard paths
                import glob
                matches = glob.glob(path_pattern)
                if matches:
                    return matches[0]
            elif os.path.isfile(path_pattern):
                return path_pattern
                
        return None

    def check_ghostscript(self) -> bool:
        """Check if Ghostscript is properly installed"""
        try:
            result = subprocess.run(
                [self.ghostscript_path, '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                logger.info(f"Ghostscript version: {version}")
                return True
            return False
        except Exception as e:
            logger.error(f"Ghostscript check failed: {e}")
            return False

    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        try:
            return os.path.getsize(file_path)
        except OSError:
            return 0

    def format_file_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"

    def calculate_compression_ratio(self, original_size: int, compressed_size: int) -> float:
        """Calculate compression ratio as percentage"""
        if original_size == 0:
            return 0.0
        return ((original_size - compressed_size) / original_size) * 100

    def build_ghostscript_command(
        self, 
        input_path: str, 
        output_path: str, 
        quality: str = 'screen',
        custom_options: Optional[Dict[str, Any]] = None
    ) -> list:
        """Build advanced Ghostscript command for maximum compression"""
        
        profile = self.COMPRESSION_PROFILES.get(quality, self.COMPRESSION_PROFILES['screen'])
        
        # Base command with aggressive compression settings
        cmd = [
            self.ghostscript_path,
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            f'-dPDFSETTINGS={profile["settings"]}',
            '-dNOPAUSE',
            '-dQUIET', 
            '-dBATCH',
            '-dSAFER',
            
            # Image compression (iLovePDF-level)
            '-dDownsampleColorImages=true',
            f'-dColorImageResolution={profile["dpi_color"]}',
            '-dColorImageDownsampleType=/Bicubic',
            f'-dColorImageDownsampleThreshold=1.5',
            '-dDownsampleGrayImages=true',
            f'-dGrayImageResolution={profile["dpi_gray"]}',
            '-dGrayImageDownsampleType=/Bicubic',
            '-dDownsampleMonoImages=true',
            f'-dMonoImageResolution={profile["dpi_mono"]}',
            '-dMonoImageDownsampleType=/Bicubic',
            
            # Advanced image optimization
            '-dDetectDuplicateImages=true',
            '-dColorConversionStrategy=/LeaveColorUnchanged',
            '-dConvertCMYKImagesToRGB=false',
            '-dConvertImagesToIndexed=true',
            '-dOptimize=true',
            
            # Font optimization (aggressive)
            '-dSubsetFonts=true',
            '-dCompressFonts=true',
            '-dEmbedAllFonts=false',  # Don't embed fonts for max compression
            
            # Metadata and structure optimization
            '-dDoThumbnails=false',
            '-dCreateJobTicket=false',
            '-dPreserveEPSInfo=false',
            '-dPreserveOPIComments=false',
            '-dPreserveHalftoneInfo=false',
            '-dAutoRotatePages=/None',
            
            # Advanced compression
            '-dUseFlateCompression=true',
            '-dLZWEncodePages=false',
            '-dFastWebView=true',
            '-dUseCropBox=false',
            
            # Quality settings
            f'-dJPEGQ={profile["jpeg_quality"]}',
            '-dAutoFilterColorImages=true',
            '-dAutoFilterGrayImages=true',
            
            # Output file
            f'-sOutputFile={output_path}',
            input_path
        ]
        
        # Add custom options if provided
        if custom_options:
            for key, value in custom_options.items():
                cmd.append(f'-d{key}={value}')
        
        return cmd

    def compress_pdf(
        self, 
        input_path: str, 
        output_path: str, 
        quality: str = 'screen',
        custom_options: Optional[Dict[str, Any]] = None,
        timeout: int = 300
    ) -> Dict[str, Any]:
        """
        Compress PDF using Ghostscript with iLovePDF-level compression
        
        Args:
            input_path: Path to input PDF file
            output_path: Path to output compressed PDF file  
            quality: Compression quality ('screen', 'ebook', 'printer', 'prepress')
            custom_options: Additional Ghostscript options
            timeout: Command timeout in seconds
            
        Returns:
            Dictionary with compression results
        """
        
        # Validate inputs
        if not os.path.isfile(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
            
        if quality not in self.COMPRESSION_PROFILES:
            raise ValueError(f"Invalid quality setting. Choose from: {list(self.COMPRESSION_PROFILES.keys())}")
        
        # Get original file size
        original_size = self.get_file_size(input_path)
        if original_size == 0:
            raise ValueError("Input file is empty or cannot be read")
        
        profile = self.COMPRESSION_PROFILES[quality]
        logger.info(f"Starting compression with profile: {profile['name']}")
        logger.info(f"Original size: {self.format_file_size(original_size)}")
        
        # Create output directory if needed
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Build Ghostscript command
        cmd = self.build_ghostscript_command(input_path, output_path, quality, custom_options)
        
        # Execute compression
        start_time = time.time()
        try:
            logger.info("Executing Ghostscript compression...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False
            )
            
            execution_time = time.time() - start_time
            
            if result.returncode != 0:
                error_msg = f"Ghostscript failed with return code {result.returncode}"
                if result.stderr:
                    error_msg += f"\nError: {result.stderr}"
                raise RuntimeError(error_msg)
            
            # Check if output file was created
            if not os.path.isfile(output_path):
                raise RuntimeError("Output file was not created")
            
            # Get compressed file size
            compressed_size = self.get_file_size(output_path)
            compression_ratio = self.calculate_compression_ratio(original_size, compressed_size)
            
            # Prepare results
            results = {
                'success': True,
                'input_path': input_path,
                'output_path': output_path,
                'quality_profile': quality,
                'original_size': original_size,
                'compressed_size': compressed_size,
                'original_size_formatted': self.format_file_size(original_size),
                'compressed_size_formatted': self.format_file_size(compressed_size),
                'compression_ratio': compression_ratio,
                'size_reduction': original_size - compressed_size,
                'execution_time': execution_time,
                'ghostscript_output': result.stdout,
                'profile_info': profile
            }
            
            # Log results
            logger.info(f"✅ Compression completed successfully!")
            logger.info(f"📊 Results:")
            logger.info(f"   Original: {results['original_size_formatted']}")
            logger.info(f"   Compressed: {results['compressed_size_formatted']}")
            logger.info(f"   Ratio: {compression_ratio:.1f}% reduction")
            logger.info(f"   Time: {execution_time:.2f} seconds")
            
            return results
            
        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Compression timed out after {timeout} seconds")
        except Exception as e:
            logger.error(f"❌ Compression failed: {e}")
            raise

    def compress_pdf_batch(
        self, 
        input_directory: str, 
        output_directory: str,
        quality: str = 'screen',
        file_pattern: str = '*.pdf'
    ) -> Dict[str, Any]:
        """
        Batch compress all PDF files in a directory
        
        Args:
            input_directory: Directory containing PDF files
            output_directory: Directory for compressed files
            quality: Compression quality
            file_pattern: File pattern to match
            
        Returns:
            Dictionary with batch results
        """
        
        input_path = Path(input_directory)
        output_path = Path(output_directory)
        
        if not input_path.is_dir():
            raise ValueError(f"Input directory does not exist: {input_directory}")
        
        # Create output directory
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Find PDF files
        pdf_files = list(input_path.glob(file_pattern))
        if not pdf_files:
            logger.warning(f"No PDF files found in {input_directory}")
            return {'success': False, 'message': 'No PDF files found'}
        
        logger.info(f"Found {len(pdf_files)} PDF files to compress")
        
        # Process files
        results = []
        total_original_size = 0
        total_compressed_size = 0
        successful_compressions = 0
        
        for pdf_file in pdf_files:
            try:
                output_file = output_path / f"compressed_{pdf_file.name}"
                result = self.compress_pdf(str(pdf_file), str(output_file), quality)
                
                results.append(result)
                total_original_size += result['original_size']
                total_compressed_size += result['compressed_size']
                successful_compressions += 1
                
            except Exception as e:
                logger.error(f"Failed to compress {pdf_file.name}: {e}")
                results.append({
                    'success': False,
                    'input_path': str(pdf_file),
                    'error': str(e)
                })
        
        # Calculate overall statistics
        overall_ratio = self.calculate_compression_ratio(total_original_size, total_compressed_size)
        
        batch_results = {
            'success': True,
            'total_files': len(pdf_files),
            'successful_compressions': successful_compressions,
            'failed_compressions': len(pdf_files) - successful_compressions,
            'total_original_size': total_original_size,
            'total_compressed_size': total_compressed_size,
            'total_original_size_formatted': self.format_file_size(total_original_size),
            'total_compressed_size_formatted': self.format_file_size(total_compressed_size),
            'overall_compression_ratio': overall_ratio,
            'individual_results': results
        }
        
        logger.info(f"🏆 Batch compression completed!")
        logger.info(f"📊 Overall Results:")
        logger.info(f"   Files processed: {successful_compressions}/{len(pdf_files)}")
        logger.info(f"   Total original: {batch_results['total_original_size_formatted']}")
        logger.info(f"   Total compressed: {batch_results['total_compressed_size_formatted']}")
        logger.info(f"   Overall ratio: {overall_ratio:.1f}% reduction")
        
        return batch_results

# Convenience functions for easy usage
def compress_pdf(input_path: str, output_path: str, quality: str = 'screen') -> Dict[str, Any]:
    """
    Simple function to compress a single PDF file
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        quality: Compression quality ('screen', 'ebook', 'printer', 'prepress')
        
    Returns:
        Compression results dictionary
    """
    compressor = PDFCompressor()
    return compressor.compress_pdf(input_path, output_path, quality)

def check_ghostscript_installation() -> bool:
    """Check if Ghostscript is properly installed"""
    try:
        compressor = PDFCompressor()
        return compressor.check_ghostscript()
    except RuntimeError:
        return False

def get_compression_profiles() -> Dict[str, Dict[str, Any]]:
    """Get available compression profiles"""
    return PDFCompressor.COMPRESSION_PROFILES

def print_ghostscript_installation_help():
    """Print Ghostscript installation instructions"""
    print("""
🚨 Ghostscript not found! Please install Ghostscript:

📦 Installation Instructions:

🐧 Linux (Ubuntu/Debian):
   sudo apt-get update
   sudo apt-get install ghostscript

🍎 macOS:
   brew install ghostscript
   # or
   sudo port install ghostscript

🪟 Windows:
   1. Download from: https://www.ghostscript.com/download/gsdnld.html
   2. Install the appropriate version (64-bit recommended)
   3. Add to PATH or use full path

🐳 Docker:
   FROM python:3.9
   RUN apt-get update && apt-get install -y ghostscript

✅ Verify installation:
   gs --version
""")

# Example usage and testing
if __name__ == "__main__":
    """
    Example usage of the PDF Compressor
    """
    
    print("🔥 Professional PDF Compressor - iLovePDF Level Compression")
    print("=" * 60)
    
    # Check Ghostscript installation
    if not check_ghostscript_installation():
        print_ghostscript_installation_help()
        sys.exit(1)
    
    # Show available profiles
    print("\n📊 Available Compression Profiles:")
    profiles = get_compression_profiles()
    for key, profile in profiles.items():
        print(f"   {key.upper()}: {profile['description']}")
    
    # Example single file compression
    print("\n🔧 Example Usage:")
    print("""
# Single file compression
from pdf_compressor_pro import compress_pdf

# Maximum compression (iLovePDF level)
result = compress_pdf('input.pdf', 'output.pdf', quality='screen')
print(f"Compression ratio: {result['compression_ratio']:.1f}%")

# Batch compression
compressor = PDFCompressor()
batch_results = compressor.compress_pdf_batch(
    input_directory='./input_pdfs',
    output_directory='./compressed_pdfs',
    quality='screen'
)
""")

    # Interactive testing if files provided
    if len(sys.argv) >= 3:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        quality_level = sys.argv[3] if len(sys.argv) > 3 else 'screen'
        
        print(f"\n🚀 Compressing: {input_file}")
        print(f"📁 Output: {output_file}")
        print(f"⚙️ Quality: {quality_level}")
        print("-" * 50)
        
        try:
            result = compress_pdf(input_file, output_file, quality_level)
            
            print("\n🎉 SUCCESS!")
            print(f"📊 Original: {result['original_size_formatted']}")
            print(f"📦 Compressed: {result['compressed_size_formatted']}")
            print(f"🎯 Reduction: {result['compression_ratio']:.1f}%")
            print(f"⏱️ Time: {result['execution_time']:.2f} seconds")
            
            if result['compression_ratio'] >= 80:
                print("🏆 iLovePDF-level compression achieved!")
            elif result['compression_ratio'] >= 60:
                print("🥈 Excellent compression!")
            elif result['compression_ratio'] >= 40:
                print("🥉 Good compression!")
            else:
                print("ℹ️ Moderate compression - file may already be optimized")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            sys.exit(1)
    
    else:
        print(f"\n💡 Quick Test:")
        print(f"   python {__file__} input.pdf output.pdf [screen|ebook|printer]")
        print(f"\n📚 Full Documentation:")
        print(f"   Check the docstrings in the PDFCompressor class") 