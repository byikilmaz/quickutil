#!/usr/bin/env python3
"""
🔥 Professional PDF Compressor - iLovePDF Level Compression
%80-90 sıkıştırma oranları ile Ghostscript tabanlı PDF compression

Teknik Özellikler:
- Ghostscript backend ile maksimum compression
- Image resampling (72-100 DPI)
- Font optimization & embedding
- Metadata ve boşluk removal
- Ayarlanabilir kalite seviyeleri
- subprocess ile Ghostscript integration

Author: AI Assistant for QuickUtil.app
Target: iLovePDF.com seviyesinde compression
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path
from typing import Optional, Dict, Tuple, Any
import time

def check_ghostscript_installation() -> bool:
    """
    Ghostscript kurulumunu kontrol et
    
    Returns:
        bool: Ghostscript yüklü mü?
    """
    ghostscript_commands = ['gs', 'gswin64c', 'gswin32c', 'ghostscript']
    
    for cmd in ghostscript_commands:
        if shutil.which(cmd):
            try:
                result = subprocess.run([cmd, '--version'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    print(f"✅ Ghostscript bulundu: {cmd} - Version: {result.stdout.strip()}")
                    return True
            except:
                continue
    
    print("❌ Ghostscript bulunamadı!")
    print_installation_guide()
    return False

def print_installation_guide():
    """Ghostscript kurulum kılavuzunu yazdır"""
    print("""
🚨 GHOSTSCRIPT KURULUM REHBERİ:

🐧 Linux (Ubuntu/Debian):
   sudo apt-get update
   sudo apt-get install ghostscript

🍎 macOS:
   brew install ghostscript

🪟 Windows:
   1. https://www.ghostscript.com/download/gsdnld.html
   2. Appropriate version download edin
   3. Install ve PATH'e ekleyin

🐳 Docker:
   RUN apt-get update && apt-get install -y ghostscript

✅ Test:
   gs --version
""")

def get_file_size(file_path: str) -> int:
    """Dosya boyutunu byte cinsinden al"""
    try:
        return os.path.getsize(file_path)
    except OSError:
        return 0

def format_file_size(size_bytes: int) -> str:
    """Dosya boyutunu human-readable format'ta göster"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

def calculate_compression_ratio(original_size: int, compressed_size: int) -> float:
    """Sıkıştırma oranını hesapla (%))"""
    if original_size == 0:
        return 0.0
    return ((original_size - compressed_size) / original_size) * 100

def get_ghostscript_command() -> Optional[str]:
    """Sistemde mevcut Ghostscript komutunu bul"""
    commands = ['gs', 'gswin64c', 'gswin32c', 'ghostscript']
    for cmd in commands:
        if shutil.which(cmd):
            return cmd
    return None

def compress_pdf(input_path: str, output_path: str, quality: str = '/screen') -> Dict[str, Any]:
    """
    PDF'i Ghostscript ile sıkıştır - iLovePDF seviyesinde compression
    
    Args:
        input_path (str): Giriş PDF dosyası yolu
        output_path (str): Çıkış PDF dosyası yolu  
        quality (str): Kalite seviyesi ('/screen', '/ebook', '/printer', '/prepress')
        
    Returns:
        Dict: Sıkıştırma sonuçları
        
    Quality Levels:
        - '/screen': Maksimum sıkıştırma ~80-90% (Web için optimize)
        - '/ebook': Yüksek sıkıştırma ~60-80% (E-reader için)
        - '/printer': Orta sıkıştırma ~30-50% (Yazdırma kalitesi)
        - '/prepress': Düşük sıkıştırma ~10-30% (Profesyonel yazdırma)
    """
    
    # Input validation
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Giriş dosyası bulunamadı: {input_path}")
    
    # Ghostscript kontrolü
    gs_cmd = get_ghostscript_command()
    if not gs_cmd:
        raise RuntimeError("Ghostscript yüklü değil. Lütfen önce Ghostscript kurun.")
    
    # Quality level validation
    valid_qualities = ['/screen', '/ebook', '/printer', '/prepress']
    if quality not in valid_qualities:
        print(f"⚠️ Geçersiz kalite seviyesi. Varsayılan '/screen' kullanılıyor.")
        quality = '/screen'
    
    # Quality-specific settings (iLovePDF seviyesinde optimizasyon)
    quality_settings = {
        '/screen': {
            'dpi_color': 72,
            'dpi_gray': 72, 
            'dpi_mono': 300,
            'jpeg_quality': 40,
            'description': 'Maksimum sıkıştırma - Web için optimize'
        },
        '/ebook': {
            'dpi_color': 150,
            'dpi_gray': 150,
            'dpi_mono': 300, 
            'jpeg_quality': 60,
            'description': 'E-reader için optimize edilmiş'
        },
        '/printer': {
            'dpi_color': 300,
            'dpi_gray': 300,
            'dpi_mono': 1200,
            'jpeg_quality': 80,
            'description': 'Yazdırma kalitesi'
        },
        '/prepress': {
            'dpi_color': 300,
            'dpi_gray': 300,
            'dpi_mono': 1200,
            'jpeg_quality': 90,
            'description': 'Profesyonel yazdırma'
        }
    }
    
    settings = quality_settings[quality]
    
    # Original file size
    original_size = get_file_size(input_path)
    print(f"📄 Giriş dosyası: {input_path}")
    print(f"📊 Orijinal boyut: {format_file_size(original_size)}")
    print(f"⚙️ Kalite profili: {quality} - {settings['description']}")
    
    # Output directory oluştur
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Advanced Ghostscript command (iLovePDF seviyesinde)
    cmd = [
        gs_cmd,
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        f'-dPDFSETTINGS={quality}',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH', 
        '-dSAFER',
        
        # 🎯 IMAGE OPTIMIZATION (iLovePDF seviyesinde)
        '-dDownsampleColorImages=true',
        f'-dColorImageResolution={settings["dpi_color"]}',
        '-dColorImageDownsampleType=/Bicubic',
        '-dDownsampleGrayImages=true', 
        f'-dGrayImageResolution={settings["dpi_gray"]}',
        '-dGrayImageDownsampleType=/Bicubic',
        '-dDownsampleMonoImages=true',
        f'-dMonoImageResolution={settings["dpi_mono"]}',
        '-dMonoImageDownsampleType=/Bicubic',
        
        # 🎯 ADVANCED IMAGE COMPRESSION  
        '-dDetectDuplicateImages=true',
        '-dOptimize=true',
        '-dConvertImagesToIndexed=true',
        f'-dJPEGQ={settings["jpeg_quality"]}',
        '-dAutoFilterColorImages=true',
        '-dAutoFilterGrayImages=true',
        
        # 🎯 FONT OPTIMIZATION & EMBEDDING
        '-dSubsetFonts=true',           # Font subsetting
        '-dCompressFonts=true',         # Font compression  
        '-dEmbedAllFonts=false',        # Don't embed fonts for max compression
        
        # 🎯 METADATA & STRUCTURE REMOVAL
        '-dDoThumbnails=false',         # Remove thumbnails
        '-dCreateJobTicket=false',      # Remove job tickets
        '-dPreserveEPSInfo=false',      # Remove EPS info
        '-dPreserveOPIComments=false',  # Remove OPI comments
        '-dPreserveHalftoneInfo=false', # Remove halftone info
        '-dAutoRotatePages=/None',      # No auto rotation
        
        # 🎯 CONTENT STREAM COMPRESSION
        '-dUseFlateCompression=true',   # Use Flate compression
        '-dLZWEncodePages=false',       # Disable LZW  
        '-dFastWebView=true',           # Optimize for web viewing
        '-dUseCropBox=false',           # Remove crop boxes
        
        # 🎯 OUTPUT FILE
        f'-sOutputFile={output_path}',
        input_path
    ]
    
    # Execute compression
    start_time = time.time()
    print("🚀 Sıkıştırma başlatılıyor...")
    
    try:
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=300,  # 5 dakika timeout
            check=False
        )
        
        execution_time = time.time() - start_time
        
        if result.returncode != 0:
            error_msg = f"Ghostscript hatası (return code: {result.returncode})"
            if result.stderr:
                error_msg += f"\nHata detayı: {result.stderr}"
            raise RuntimeError(error_msg)
        
        # Check output file
        if not os.path.isfile(output_path):
            raise RuntimeError("Çıkış dosyası oluşturulamadı")
        
        # Calculate results
        compressed_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(original_size, compressed_size)
        size_reduction = original_size - compressed_size
        
        # Results
        results = {
            'success': True,
            'input_path': input_path,
            'output_path': output_path,
            'quality': quality,
            'original_size': original_size,
            'compressed_size': compressed_size, 
            'original_size_formatted': format_file_size(original_size),
            'compressed_size_formatted': format_file_size(compressed_size),
            'compression_ratio': compression_ratio,
            'size_reduction': size_reduction,
            'size_reduction_formatted': format_file_size(size_reduction),
            'execution_time': execution_time,
            'quality_description': settings['description']
        }
        
        # Success message
        print(f"✅ Sıkıştırma tamamlandı!")
        print(f"📊 SONUÇLAR:")
        print(f"   📁 Çıkış dosyası: {output_path}")
        print(f"   📈 Orijinal: {results['original_size_formatted']}")
        print(f"   📉 Sıkıştırılmış: {results['compressed_size_formatted']}")
        print(f"   🎯 Sıkıştırma oranı: {compression_ratio:.1f}%")
        print(f"   💾 Tasarruf: {results['size_reduction_formatted']}")
        print(f"   ⏱️ İşlem süresi: {execution_time:.2f} saniye")
        
        # Quality assessment
        if compression_ratio >= 80:
            print(f"🏆 MÜKEMMEL! iLovePDF seviyesinde sıkıştırma!")
        elif compression_ratio >= 60:
            print(f"✅ ÇOK İYİ! Yüksek kalitede sıkıştırma!")  
        elif compression_ratio >= 30:
            print(f"👍 İYİ! Orta seviye sıkıştırma!")
        else:
            print(f"⚠️ DÜŞÜK sıkıştırma oranı. Daha agresif ayarlar deneyin.")
        
        return results
        
    except subprocess.TimeoutExpired:
        raise RuntimeError("Sıkıştırma işlemi zaman aşımına uğradı (5 dakika)")
    except Exception as e:
        print(f"❌ HATA: {e}")
        raise

def compress_pdf_batch(input_directory: str, output_directory: str, quality: str = '/screen') -> Dict[str, Any]:
    """
    Klasördeki tüm PDF dosyalarını toplu sıkıştır
    
    Args:
        input_directory (str): Giriş klasörü
        output_directory (str): Çıkış klasörü
        quality (str): Kalite seviyesi
        
    Returns:
        Dict: Toplu işlem sonuçları
    """
    
    input_path = Path(input_directory)
    output_path = Path(output_directory)
    
    if not input_path.is_dir():
        raise ValueError(f"Giriş klasörü bulunamadı: {input_directory}")
    
    # Output klasörü oluştur
    output_path.mkdir(parents=True, exist_ok=True)
    
    # PDF dosyalarını bul
    pdf_files = list(input_path.glob('*.pdf'))
    if not pdf_files:
        print(f"❌ {input_directory} klasöründe PDF dosyası bulunamadı")
        return {'success': False, 'message': 'PDF dosyası bulunamadı'}
    
    print(f"📁 {len(pdf_files)} PDF dosyası bulundu")
    print(f"🚀 Toplu sıkıştırma başlatılıyor...")
    
    # Process files
    results = []
    total_original = 0
    total_compressed = 0
    successful = 0
    
    for i, pdf_file in enumerate(pdf_files, 1):
        try:
            print(f"\n[{i}/{len(pdf_files)}] İşleniyor: {pdf_file.name}")
            
            output_file = output_path / f"compressed_{pdf_file.name}"
            result = compress_pdf(str(pdf_file), str(output_file), quality)
            
            results.append(result)
            total_original += result['original_size']
            total_compressed += result['compressed_size']
            successful += 1
            
        except Exception as e:
            print(f"❌ {pdf_file.name} sıkıştırılamadı: {e}")
            results.append({
                'success': False,
                'input_path': str(pdf_file),
                'error': str(e)
            })
    
    # Overall statistics
    overall_ratio = calculate_compression_ratio(total_original, total_compressed)
    
    batch_results = {
        'success': True,
        'total_files': len(pdf_files),
        'successful': successful,
        'failed': len(pdf_files) - successful,
        'total_original_size': total_original,
        'total_compressed_size': total_compressed,
        'total_original_formatted': format_file_size(total_original),
        'total_compressed_formatted': format_file_size(total_compressed),
        'overall_compression_ratio': overall_ratio,
        'total_savings': format_file_size(total_original - total_compressed),
        'individual_results': results
    }
    
    # Summary
    print(f"\n🏆 TOPLU SIKIŞTIRMA TAMAMLANDI!")
    print(f"📊 GENEL SONUÇLAR:")
    print(f"   📁 İşlenen dosya: {successful}/{len(pdf_files)}")
    print(f"   📈 Toplam orijinal: {batch_results['total_original_formatted']}")
    print(f"   📉 Toplam sıkıştırılmış: {batch_results['total_compressed_formatted']}")
    print(f"   🎯 Genel oran: {overall_ratio:.1f}%")
    print(f"   💾 Toplam tasarruf: {batch_results['total_savings']}")
    
    return batch_results

def main():
    """Ana test ve örnek kullanım fonksiyonu"""
    
    print("🔥 PROFESSIONAL PDF COMPRESSOR")
    print("=" * 50)
    print("iLovePDF seviyesinde %80-90 compression")
    print("Ghostscript tabanlı advanced compression\n")
    
    # Ghostscript kontrolü
    if not check_ghostscript_installation():
        sys.exit(1)
    
    # Kalite profilleri
    print("\n📊 AVAILABLE QUALITY PROFILES:")
    profiles = {
        '/screen': 'Maksimum sıkıştırma ~80-90% (Web optimize)',
        '/ebook': 'Yüksek sıkıştırma ~60-80% (E-reader)', 
        '/printer': 'Orta sıkıştırma ~30-50% (Yazdırma)',
        '/prepress': 'Düşük sıkıştırma ~10-30% (Profesyonel)'
    }
    
    for quality, desc in profiles.items():
        print(f"   {quality}: {desc}")
    
    print("\n🔧 ÖRNEK KULLANIM:")
    print("""
# Single file compression
from pdf_compressor_focused import compress_pdf

result = compress_pdf('input.pdf', 'output.pdf', '/screen')
print(f"Compression: {result['compression_ratio']:.1f}%")

# Batch compression  
from pdf_compressor_focused import compress_pdf_batch

batch_result = compress_pdf_batch('input_folder/', 'output_folder/', '/screen')
print(f"Overall compression: {batch_result['overall_compression_ratio']:.1f}%")

# Flask API integration
@app.route('/compress', methods=['POST'])
def api_compress():
    file = request.files['pdf']
    file.save('temp_input.pdf')
    
    result = compress_pdf('temp_input.pdf', 'temp_output.pdf', '/screen')
    
    return jsonify({
        'success': result['success'],
        'compression_ratio': result['compression_ratio'],
        'original_size': result['original_size_formatted'],
        'compressed_size': result['compressed_size_formatted']
    })
""")

if __name__ == "__main__":
    main() 