'use client';
import { useState, useEffect, useRef } from 'react';
import { ScissorsIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/Header';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);

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
      
      // Set default crop to center 70% of image
      const defaultCrop = {
        x: Math.round(dimensions.width * 0.15),
        y: Math.round(dimensions.height * 0.15),
        width: Math.round(dimensions.width * 0.7),
        height: Math.round(dimensions.height * 0.7)
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

  // Preset crop options
  const applyPresetCrop = (preset: 'square' | 'landscape' | 'portrait' | 'center' | 'full') => {
    if (!originalDimensions) return;
    
    const { width: imgWidth, height: imgHeight } = originalDimensions;
    let newCrop: CropOptions;
    
    switch (preset) {
      case 'square':
        const size = Math.min(imgWidth, imgHeight);
        newCrop = {
          x: Math.round((imgWidth - size) / 2),
          y: Math.round((imgHeight - size) / 2),
          width: size,
          height: size
        };
        break;
      case 'landscape':
        newCrop = {
          x: 0,
          y: Math.round(imgHeight * 0.125),
          width: imgWidth,
          height: Math.round(imgHeight * 0.75)
        };
        break;
      case 'portrait':
        newCrop = {
          x: Math.round(imgWidth * 0.125),
          y: 0,
          width: Math.round(imgWidth * 0.75),
          height: imgHeight
        };
        break;
      case 'center':
        newCrop = {
          x: Math.round(imgWidth * 0.25),
          y: Math.round(imgHeight * 0.25),
          width: Math.round(imgWidth * 0.5),
          height: Math.round(imgHeight * 0.5)
        };
        break;
      case 'full':
        newCrop = {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight
        };
        break;
    }
    
    setCropOptions(newCrop);
  };

  // Mouse interaction for crop selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!originalDimensions || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const actualX = Math.round((x / rect.width) * originalDimensions.width);
    const actualY = Math.round((y / rect.height) * originalDimensions.height);
    
    setDragStart({ x: actualX, y: actualY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !originalDimensions || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const actualX = Math.round((x / rect.width) * originalDimensions.width);
    const actualY = Math.round((y / rect.height) * originalDimensions.height);
    
    const newCrop = {
      x: Math.min(dragStart.x, actualX),
      y: Math.min(dragStart.y, actualY),
      width: Math.abs(actualX - dragStart.x),
      height: Math.abs(actualY - dragStart.y)
    };
    
    setCropOptions(newCrop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Calculate crop overlay style
  const getCropOverlayStyle = () => {
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

  // Calculate crop area percentage
  const getCropPercentage = () => {
    if (!originalDimensions || !cropOptions.width || !cropOptions.height) return 0;
    
    const totalPixels = originalDimensions.width * originalDimensions.height;
    const cropPixels = cropOptions.width * cropOptions.height;
    
    return Math.round((cropPixels / totalPixels) * 100);
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
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => {}} />
      
      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-4 shadow-lg">
              <ScissorsIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Professional Image Cropping
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Resimlerinizi hassas şekilde kırpın ve tam istediğiniz alanı seçin
            </p>
          </div>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <ScissorsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Dosyayı bırakın' : 'Kırpılacak resmi yükleyin'}
            </h3>
            <p className="text-gray-600 mb-6">
              JPEG, PNG, WebP, GIF formatlarını destekliyoruz (max 50MB)
            </p>
            
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-lg">
              Dosya Seç
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cropping Stage */}
      {(stage === 'cropping' || stage === 'result') && selectedFile && (
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ScissorsIcon className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Image Cropping</h1>
                </div>
                <div className="hidden sm:block text-sm text-gray-500">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              </div>
              
              <button
                onClick={resetToUpload}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                New Image
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0">
            
            {/* Image Preview Area - 3/4 width */}
            <div className="lg:col-span-3 bg-gray-900 flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full">
                {previewUrl && (
                  <div 
                    className="relative cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Crop preview"
                      className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                      style={{ userSelect: 'none' }}
                    />
                    
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />
                    
                    {/* Crop selection area */}
                    {cropOptions.width > 0 && cropOptions.height > 0 && (
                      <div
                        className="absolute border-2 border-blue-400 bg-transparent pointer-events-none"
                        style={getCropOverlayStyle()}
                      >
                        {/* Clear area (remove dark overlay) */}
                        <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                        
                        {/* Corner handles */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 border border-white rounded-full" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 border border-white rounded-full" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 border border-white rounded-full" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 border border-white rounded-full" />
                        
                        {/* Grid lines */}
                        <div className="absolute inset-0 border border-blue-400 border-dashed opacity-70">
                          <div className="absolute top-1/3 left-0 right-0 border-t border-blue-400 border-dashed" />
                          <div className="absolute top-2/3 left-0 right-0 border-t border-blue-400 border-dashed" />
                          <div className="absolute left-1/3 top-0 bottom-0 border-l border-blue-400 border-dashed" />
                          <div className="absolute left-2/3 top-0 bottom-0 border-l border-blue-400 border-dashed" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Controls Panel - 1/4 width */}
            <div className="lg:col-span-1 bg-white border-l border-gray-200 p-6 overflow-y-auto">
              
              {/* Crop Options Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Crop Options</h3>
                <div className="text-sm text-gray-600">
                  Kırpılacak alanı ayarlayın
                </div>
              </div>

              {/* Preset Crop Buttons */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPresetCrop('square')}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  >
                    Square
                  </button>
                  <button
                    onClick={() => applyPresetCrop('landscape')}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  >
                    Landscape
                  </button>
                  <button
                    onClick={() => applyPresetCrop('portrait')}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => applyPresetCrop('center')}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  >
                    Center
                  </button>
                </div>
              </div>

              {/* Manual Coordinates */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700">Coordinates</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={cropOptions.width}
                      onChange={(e) => setCropOptions({...cropOptions, width: parseInt(e.target.value) || 0})}
                      min="1"
                      max={originalDimensions?.width || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={cropOptions.height}
                      onChange={(e) => setCropOptions({...cropOptions, height: parseInt(e.target.value) || 0})}
                      min="1"
                      max={originalDimensions?.height || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Position X (px)</label>
                    <input
                      type="number"
                      value={cropOptions.x}
                      onChange={(e) => setCropOptions({...cropOptions, x: parseInt(e.target.value) || 0})}
                      min="0"
                      max={originalDimensions?.width || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Position Y (px)</label>
                    <input
                      type="number"
                      value={cropOptions.y}
                      onChange={(e) => setCropOptions({...cropOptions, y: parseInt(e.target.value) || 0})}
                      min="0"
                      max={originalDimensions?.height || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Crop Info */}
              {originalDimensions && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Crop Info</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Original:</span>
                      <span>{originalDimensions.width} × {originalDimensions.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crop Size:</span>
                      <span>{cropOptions.width} × {cropOptions.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Area:</span>
                      <span>{getCropPercentage()}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {stage === 'cropping' && (
                  <button
                    onClick={handleCropImage}
                    disabled={isProcessing || !cropOptions.width || !cropOptions.height}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cropping...
                      </>
                    ) : (
                      <>
                        <ScissorsIcon className="w-4 h-4 mr-2" />
                        Crop Image
                      </>
                    )}
                  </button>
                )}

                {stage === 'result' && cropResult && (
                  <button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium shadow-lg flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download Cropped
                  </button>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs">{error}</p>
                  </div>
                )}
              </div>

              {/* Success Result Info */}
              {stage === 'result' && cropResult && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">✅ Crop Complete!</h4>
                  <div className="space-y-1 text-xs text-green-700">
                    <div className="flex justify-between">
                      <span>Original Size:</span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cropped Size:</span>
                      <span>{formatFileSize(cropResult.file.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{cropOptions.width} × {cropOptions.height}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 