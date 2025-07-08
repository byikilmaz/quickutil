'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ScissorsIcon, ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { trackImageCrop } from '@/lib/activityTracker';
import { 
  cropImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult,
  type CropOptions 
} from '@/lib/imageUtils';

type Stage = 'upload' | 'cropping' | 'result';

export default function ImageCropPage() {
  const { user } = useAuth();
  
  // Core state
  const [stage, setStage] = useState<Stage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cropOptions, setCropOptions] = useState<CropOptions>({ x: 0, y: 0, width: 0, height: 0 });
  const [cropResult, setCropResult] = useState<ConversionResult | null>(null);
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isTouching, setIsTouching] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!validTypes.includes(file.type)) {
      return 'Desteklenen formatlar: JPEG, PNG, WebP, GIF';
    }
    
    if (file.size > maxSize) {
      return 'Dosya boyutu 50MB\'tan küçük olmalıdır';
    }
    
    return null;
  };

  // File selection handler
  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      setError(error);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStage('cropping');
    setError('');
    
    try {
      const dimensions = await getImageDimensions(file);
      setOriginalDimensions(dimensions);
      
      // Set default crop to center 80% of image (larger for mobile)
      const defaultCrop = {
        x: Math.round(dimensions.width * 0.1),
        y: Math.round(dimensions.height * 0.1),
        width: Math.round(dimensions.width * 0.8),
        height: Math.round(dimensions.height * 0.8)
      };
      setCropOptions(defaultCrop);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
      setError('Resim boyutları alınamadı');
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false
  });

  // Mobile-friendly touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!imageRef.current) return;
    
    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    
    setIsTouching(true);
    setTouchStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isTouching || !touchStart || !imageRef.current || !originalDimensions) return;
    
    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    // Convert to actual image coordinates
    const scaleX = originalDimensions.width / rect.width;
    const scaleY = originalDimensions.height / rect.height;
    
    const actualX = Math.max(0, Math.min(originalDimensions.width * 0.8, (currentX - touchStart.x) * scaleX + cropOptions.x));
    const actualY = Math.max(0, Math.min(originalDimensions.height * 0.8, (currentY - touchStart.y) * scaleY + cropOptions.y));
    
    setCropOptions(prev => ({
      ...prev,
      x: actualX,
      y: actualY
    }));
  }, [isTouching, touchStart, cropOptions, originalDimensions]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    setTouchStart(null);
  }, []);

  // Crop processing
  const handleCropImage = async () => {
    if (!selectedFile || !cropOptions.width || !cropOptions.height) {
      setError('Lütfen kırpılacak alanı seçin');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    const startTime = Date.now();

    try {
      const result = await cropImage(selectedFile, cropOptions);
      setCropResult(result);
      setStage('result');

      // Track activity
      if (user) {
        const processingTime = Date.now() - startTime;
        await trackImageCrop(
          user.uid,
          selectedFile.name,
          selectedFile.size,
          result.file.size,
          processingTime
        );
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kırpma sırasında hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!cropResult) return;
    
    const url = URL.createObjectURL(cropResult.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = cropResult.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset handler
  const resetToUpload = () => {
    setStage('upload');
    setSelectedFile(null);
    setPreviewUrl('');
    setOriginalDimensions(null);
    setCropOptions({ x: 0, y: 0, width: 0, height: 0 });
    setCropResult(null);
    setError('');
  };

  // Mobile-optimized preset crops
  const applyPresetCrop = (preset: 'square' | 'center' | 'wide' | 'tall') => {
    if (!originalDimensions) return;
    
    const { width: imgWidth, height: imgHeight } = originalDimensions;
    let newCrop: CropOptions;
    
    switch (preset) {
      case 'square':
        const size = Math.min(imgWidth, imgHeight) * 0.9;
        newCrop = {
          x: Math.round((imgWidth - size) / 2),
          y: Math.round((imgHeight - size) / 2),
          width: Math.round(size),
          height: Math.round(size)
        };
        break;
      case 'center':
        newCrop = {
          x: Math.round(imgWidth * 0.15),
          y: Math.round(imgHeight * 0.15),
          width: Math.round(imgWidth * 0.7),
          height: Math.round(imgHeight * 0.7)
        };
        break;
      case 'wide':
        newCrop = {
          x: 0,
          y: Math.round(imgHeight * 0.2),
          width: imgWidth,
          height: Math.round(imgHeight * 0.6)
        };
        break;
      case 'tall':
        newCrop = {
          x: Math.round(imgWidth * 0.2),
          y: 0,
          width: Math.round(imgWidth * 0.6),
          height: imgHeight
        };
        break;
    }
    
    setCropOptions(newCrop);
  };

  // Get crop selection style for display
  const getCropSelectionStyle = () => {
    if (!originalDimensions || !imageRef.current) return {};
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = rect.width / originalDimensions.width;
    const scaleY = rect.height / originalDimensions.height;
    
    return {
      left: `${cropOptions.x * scaleX}px`,
      top: `${cropOptions.y * scaleY}px`,
      width: `${cropOptions.width * scaleX}px`,
      height: `${cropOptions.height * scaleY}px`
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      
      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Breadcrumb />
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4 shadow-lg">
              <ScissorsIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Resim Kırpma
            </h1>
            <p className="text-gray-700 max-w-md mx-auto">
              Resimlerinizi kolayca kırpın ve tam istediğiniz alanı seçin
            </p>
          </div>

          {/* Mobile-Optimized Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Dosyayı Bırakın' : 'Resim Yükleyin'}
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              JPEG, PNG, WebP formatları • Max 50MB
            </p>
            
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-medium shadow-lg text-sm">
              📁 Dosya Seç
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile-Optimized Cropping Stage */}
      {stage === 'cropping' && selectedFile && (
        <div className="flex flex-col h-screen">
          {/* Mobile Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScissorsIcon className="w-5 h-5 text-purple-600" />
                <h1 className="text-lg font-semibold text-gray-900">Kırpma</h1>
              </div>
              <button
                onClick={resetToUpload}
                className="text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                Yeni Resim
              </button>
            </div>
          </div>

          {/* Mobile Preset Buttons */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => applyPresetCrop('square')}
                className="flex-shrink-0 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              >
                🔲 Kare
              </button>
              <button
                onClick={() => applyPresetCrop('center')}
                className="flex-shrink-0 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              >
                🎯 Merkez
              </button>
              <button
                onClick={() => applyPresetCrop('wide')}
                className="flex-shrink-0 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              >
                📐 Geniş
              </button>
              <button
                onClick={() => applyPresetCrop('tall')}
                className="flex-shrink-0 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              >
                📏 Uzun
              </button>
            </div>
          </div>

          {/* Mobile-Optimized Image Area */}
          <div className="flex-1 bg-gray-900 relative overflow-hidden">
            {previewUrl && (
              <div className="relative h-full flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Kırpma önizlemesi"
                  className="max-w-full max-h-full object-contain"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ userSelect: 'none', touchAction: 'none' }}
                  draggable={false}
                />
                
                {/* Mobile-Optimized Crop Selection */}
                <div
                  ref={cropRef}
                  className="absolute border-2 border-white shadow-lg"
                  style={{
                    ...getCropSelectionStyle(),
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    touchAction: 'none'
                  }}
                >
                  {/* Touch Handle - Larger for mobile */}
                  <div className="absolute inset-0">
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-white border-2 border-purple-500 rounded-full shadow-md"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-white border-2 border-purple-500 rounded-full shadow-md"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white border-2 border-purple-500 rounded-full shadow-md"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-purple-500 rounded-full shadow-md"></div>
                  </div>
                  
                  {/* Center Move Handle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/50 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Action Buttons */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <div className="flex space-x-3">
              <button
                onClick={handleCropImage}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <ScissorsIcon className="w-5 h-5" />
                    <span>Kırp</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile-Optimized Result Stage */}
      {stage === 'result' && cropResult && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScissorsIcon className="w-5 h-5 text-green-600" />
                <h1 className="text-lg font-semibold text-gray-900">Tamamlandı</h1>
              </div>
              <button
                onClick={resetToUpload}
                className="text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                Yeni Resim
              </button>
            </div>
          </div>

          {/* Result Image */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-4 max-w-full max-h-full">
              <img
                src={URL.createObjectURL(cropResult.file)}
                alt="Kırpılmış resim"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-700">
                Boyut: {formatFileSize(cropResult.file.size)}
              </p>
            </div>
            
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>İndir</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 