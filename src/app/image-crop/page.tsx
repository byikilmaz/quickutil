'use client';
import { useState, useEffect, useRef } from 'react';
import { DocumentIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import FileUpload from '@/components/FileUpload';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  cropImage,
  getImageDimensions,
  validateImageFormat,
  formatFileSize,
  type ConversionResult,
  type CropOptions 
} from '@/lib/imageUtils';

export default function ImageCrop() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cropOptions, setCropOptions] = useState<CropOptions>({ x: 0, y: 0, width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cropResult, setCropResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateImageFormat(selectedFile)) {
      setError('Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, WebP, GIF)');
      return;
    }

    setFile(selectedFile);
    setCroppedFile(null);
    setCropResult(null);
    setError('');
    setCropOptions({ x: 0, y: 0, width: 0, height: 0 });

    // Get original dimensions
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      
      // Set default crop to center 50% of image
      const defaultCrop = {
        x: Math.round(dimensions.width * 0.25),
        y: Math.round(dimensions.height * 0.25),
        width: Math.round(dimensions.width * 0.5),
        height: Math.round(dimensions.height * 0.5)
      };
      setCropOptions(defaultCrop);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
    }

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleCrop = async () => {
    if (!file || !cropOptions.width || !cropOptions.height) {
      setError('Lütfen kırpılacak alanı seçin');
      return;
    }

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const result = await cropImage(file, cropOptions);
      setCroppedFile(result.file);
      setCropResult(result);

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_crop',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            processedSize: result.file.size,
            status: 'success',
            category: 'Image',
            processingTime,
            compressionRatio: Math.abs(1 - result.compressionRatio) * 100
          });
          console.log('Image crop activity tracked successfully');
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kırpma sırasında hata oluştu');
      
      // Track failed activity if user is logged in
      if (user && file) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_crop',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            status: 'error',
            category: 'Image',
            processingTime
          });
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!croppedFile) return;

    const url = URL.createObjectURL(croppedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = croppedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle mouse events for crop selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!originalDimensions || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate actual image coordinates
    const actualX = Math.round((x / rect.width) * originalDimensions.width);
    const actualY = Math.round((y / rect.height) * originalDimensions.height);
    
    setSelectionStart({ x: actualX, y: actualY });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionStart || !originalDimensions || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate actual image coordinates
    const actualX = Math.round((x / rect.width) * originalDimensions.width);
    const actualY = Math.round((y / rect.height) * originalDimensions.height);
    
    // Update crop options
    const newCrop = {
      x: Math.min(selectionStart.x, actualX),
      y: Math.min(selectionStart.y, actualY),
      width: Math.abs(actualX - selectionStart.x),
      height: Math.abs(actualY - selectionStart.y)
    };
    
    setCropOptions(newCrop);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
  };

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = () => {
    setFile(null);
    setCroppedFile(null);
    setCropResult(null);
    setError('');
    setOriginalDimensions(null);
    setCropOptions({ x: 0, y: 0, width: 0, height: 0 });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const setPresetCrop = (preset: 'square' | 'landscape' | 'portrait' | 'center') => {
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
    }
    
    setCropOptions(newCrop);
  };

  // Calculate crop overlay position for preview
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      <Breadcrumb />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-100 rounded-full">
              <DocumentIcon className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resim Kırpma
          </h1>
          <p className="text-lg text-gray-600">
            Resimlerinizi istediğiniz alandan kırpın ve özelleştirin
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!file ? (
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
              maxSize={50 * 1024 * 1024} // 50MB
              title="Kırpılacak Resmi Yükleyin"
              description="PNG, JPEG, WebP veya GIF formatında resminizi buraya sürükleyin"
              currentFiles={[]}
            />
          ) : !croppedFile ? (
            <>
              {/* Success Upload State */}
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
                maxSize={50 * 1024 * 1024}
                title="Kırpılacak Resmi Yükleyin"
                description="PNG, JPEG, WebP veya GIF formatında resminizi buraya sürükleyin"
                currentFiles={[file]}
              />
              
              {/* File Processing Section */}
              <div className="mt-6 space-y-6">
                {/* File Info & Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* File Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Seçilen Dosya</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dosya Adı:</span>
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Boyut:</span>
                        <span className="text-sm font-medium">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Format:</span>
                        <span className="text-sm font-medium uppercase">
                          {file.type.replace('image/', '')}
                        </span>
                      </div>
                      {originalDimensions && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Boyutlar:</span>
                          <span className="text-sm font-medium">
                            {originalDimensions.width} × {originalDimensions.height}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={resetForm}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Farklı resim seç</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Resim hazır</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Preview */}
                  {previewUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Kırpma Önizlemesi</h3>
                      <div 
                        ref={containerRef}
                        className="relative w-full h-48 bg-white rounded border overflow-hidden cursor-crosshair select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <Image
                          ref={imageRef}
                          src={previewUrl}
                          alt={`${file?.name || 'Yüklenen dosya'} kırpma önizlemesi`}
                          fill
                          className="object-contain pointer-events-none"
                          unoptimized
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Crop Overlay */}
                        {cropOptions.width > 0 && cropOptions.height > 0 && (
                          <div
                            className="absolute border-2 border-purple-500 bg-purple-200 bg-opacity-20"
                            style={getCropOverlayStyle()}
                          >
                            <div className="absolute inset-0 border border-white border-dashed"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Kırpılacak alanı seçmek için sürükleyin
                      </p>
                    </div>
                  )}
                </div>

                {/* Crop Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Kırpma Ayarları</h3>
                  
                  {/* Preset Crops */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hızlı Kırpma Seçenekleri
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        onClick={() => setPresetCrop('square')}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Kare
                      </button>
                      <button
                        onClick={() => setPresetCrop('landscape')}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Yatay
                      </button>
                      <button
                        onClick={() => setPresetCrop('portrait')}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Dikey
                      </button>
                      <button
                        onClick={() => setPresetCrop('center')}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Merkez
                      </button>
                    </div>
                  </div>

                  {/* Manual Crop Coordinates */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Koordinatı
                      </label>
                      <input
                        type="number"
                        value={cropOptions.x}
                        onChange={(e) => setCropOptions({...cropOptions, x: parseInt(e.target.value) || 0})}
                        min="0"
                        max={originalDimensions?.width || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Koordinatı
                      </label>
                      <input
                        type="number"
                        value={cropOptions.y}
                        onChange={(e) => setCropOptions({...cropOptions, y: parseInt(e.target.value) || 0})}
                        min="0"
                        max={originalDimensions?.height || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genişlik
                      </label>
                      <input
                        type="number"
                        value={cropOptions.width}
                        onChange={(e) => setCropOptions({...cropOptions, width: parseInt(e.target.value) || 0})}
                        min="1"
                        max={originalDimensions?.width || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yükseklik
                      </label>
                      <input
                        type="number"
                        value={cropOptions.height}
                        onChange={(e) => setCropOptions({...cropOptions, height: parseInt(e.target.value) || 0})}
                        min="1"
                        max={originalDimensions?.height || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Crop Stats */}
                  {cropOptions.width > 0 && cropOptions.height > 0 && originalDimensions && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm text-blue-800">
                        <strong>Kırpılacak Alan:</strong> {cropOptions.width} × {cropOptions.height} px
                        <br />
                        <strong>Orijinal Boyutun:</strong> {((cropOptions.width * cropOptions.height) / (originalDimensions.width * originalDimensions.height) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Crop Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCrop}
                    disabled={loading || !cropOptions.width || !cropOptions.height}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Kırpılıyor...</span>
                      </>
                    ) : (
                      <>
                        <DocumentIcon className="h-5 w-5" />
                        <span>Resmi Kırp</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Result */}
              {cropResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">Kırpma Tamamlandı!</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Orijinal</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(cropResult.originalSize)}</div>
                        {originalDimensions && (
                          <div>Boyutlar: {originalDimensions.width} × {originalDimensions.height}</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Kırpılmış</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(cropResult.newSize)}</div>
                        <div>Boyutlar: {cropOptions.width} × {cropOptions.height}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span>Kırpılmış Resmi İndir</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <DocumentIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">İnteraktif Kırpma</h3>
            <p className="text-gray-600">Fareyle sürükleyerek kolay kırpma alanı seçimi</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hassas Kontrol</h3>
            <p className="text-gray-600">Manuel koordinat girişi ile piksel düzeyinde kırpma</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı Presetler</h3>
            <p className="text-gray-600">Kare, yatay, dikey ve merkez kırpma seçenekleri</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
} 