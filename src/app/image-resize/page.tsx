'use client';
import { useState, useEffect } from 'react';
import { CubeTransparentIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import FileUpload from '@/components/FileUpload';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  resizeImage,
  getImageDimensions,
  validateImageFormat,
  formatFileSize,
  type ConversionResult,
  type ResizeOptions 
} from '@/lib/imageUtils';

export default function ImageResize() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resizedFile, setResizedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [resizeMode, setResizeMode] = useState<'stretch' | 'fit' | 'fill'>('fit');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [resizeResult, setResizeResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateImageFormat(selectedFile)) {
      setError('Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, WebP, GIF)');
      return;
    }

    setFile(selectedFile);
    setResizedFile(null);
    setResizeResult(null);
    setError('');

    // Get original dimensions
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      // Set initial values to original dimensions
      if (!width) setWidth(dimensions.width);
      if (!height) setHeight(dimensions.height);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
    }

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleResize = async () => {
    if (!file || (!width && !height)) {
      setError('Lütfen en az bir boyut değeri girin');
      return;
    }

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const options: ResizeOptions = {
        width,
        height,
        maintainAspectRatio,
        resizeMode,
      };

      const result = await resizeImage(file, options);
      setResizedFile(result.file);
      setResizeResult(result);

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_resize',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            processedSize: result.file.size,
            status: 'success',
            category: 'Image',
            processingTime,
            compressionRatio: Math.abs(1 - result.compressionRatio) * 100
          });
          console.log('Image resize activity tracked successfully');
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Boyutlandırma sırasında hata oluştu');
      
      // Track failed activity if user is logged in
      if (user && file) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_resize',
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
    if (!resizedFile) return;

    const url = URL.createObjectURL(resizedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = resizedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    setResizedFile(null);
    setResizeResult(null);
    setError('');
    setOriginalDimensions(null);
    setWidth(undefined);
    setHeight(undefined);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleWidthChange = (value: string) => {
    const newWidth = value ? parseInt(value) : undefined;
    setWidth(newWidth);
    
    if (maintainAspectRatio && newWidth && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (value: string) => {
    const newHeight = value ? parseInt(value) : undefined;
    setHeight(newHeight);
    
    if (maintainAspectRatio && newHeight && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const setPresetSize = (presetWidth: number, presetHeight: number) => {
    if (maintainAspectRatio && originalDimensions) {
      const originalAspect = originalDimensions.width / originalDimensions.height;
      const presetAspect = presetWidth / presetHeight;
      
      if (originalAspect > presetAspect) {
        setWidth(presetWidth);
        setHeight(Math.round(presetWidth / originalAspect));
      } else {
        setHeight(presetHeight);
        setWidth(Math.round(presetHeight * originalAspect));
      }
    } else {
      setWidth(presetWidth);
      setHeight(presetHeight);
    }
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
              <CubeTransparentIcon className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resim Boyutlandırma
          </h1>
          <p className="text-lg text-gray-600">
            Resimlerinizi istediğiniz boyutlara getirin ve boyutlandırma seçeneklerini özelleştirin
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!file ? (
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
              maxSize={50 * 1024 * 1024} // 50MB
              title="Boyutlandırılacak Resmi Yükleyin"
              description="PNG, JPEG, WebP veya GIF formatında resminizi buraya sürükleyin"
              currentFiles={[]}
            />
          ) : !resizedFile ? (
            <>
              {/* Success Upload State */}
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
                maxSize={50 * 1024 * 1024}
                title="Boyutlandırılacak Resmi Yükleyin"
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
                          <span className="text-sm text-gray-600">Mevcut Boyut:</span>
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

                  {/* Preview */}
                  {previewUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Önizleme</h3>
                      <div className="relative w-full h-48 bg-white rounded border flex items-center justify-center overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt={`${file?.name || 'Yüklenen dosya'} resim önizlemesi`}
                          fill
                          className="object-contain"
                          unoptimized
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Resize Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Boyutlandırma Ayarları</h3>
                  
                  {/* Preset Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hızlı Boyutlar
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        onClick={() => setPresetSize(1920, 1080)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        1920×1080 (Full HD)
                      </button>
                      <button
                        onClick={() => setPresetSize(1280, 720)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        1280×720 (HD)
                      </button>
                      <button
                        onClick={() => setPresetSize(800, 600)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        800×600
                      </button>
                      <button
                        onClick={() => setPresetSize(400, 400)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        400×400 (Kare)
                      </button>
                    </div>
                  </div>

                  {/* Custom Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genişlik (px)
                      </label>
                      <input
                        type="number"
                        value={width || ''}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        placeholder="Genişlik"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yükseklik (px)
                      </label>
                      <input
                        type="number"
                        value={height || ''}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        placeholder="Yükseklik"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Aspect Ratio Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintain-aspect-ratio"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="maintain-aspect-ratio" className="text-sm text-gray-700">
                      En-boy oranını koru
                    </label>
                  </div>

                  {/* Resize Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Boyutlandırma Modu
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setResizeMode('fit')}
                        className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                          resizeMode === 'fit'
                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Sığdır
                      </button>
                      <button
                        onClick={() => setResizeMode('fill')}
                        className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                          resizeMode === 'fill'
                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Doldur
                      </button>
                      <button
                        onClick={() => setResizeMode('stretch')}
                        className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                          resizeMode === 'stretch'
                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Uzat
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {resizeMode === 'fit' && 'Resmi verilen boyutlara sığdırır, en-boy oranını korur'}
                      {resizeMode === 'fill' && 'Verilen alanı tamamen doldurur, kırpma yapılabilir'}
                      {resizeMode === 'stretch' && 'Resmi tam olarak verilen boyutlara getirir'}
                    </div>
                  </div>
                </div>

                {/* Resize Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleResize}
                    disabled={loading || (!width && !height)}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Boyutlandırılıyor...</span>
                      </>
                    ) : (
                      <>
                        <CubeTransparentIcon className="h-5 w-5" />
                        <span>Resmi Boyutlandır</span>
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
              {resizeResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">Boyutlandırma Tamamlandı!</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Orijinal</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(resizeResult.originalSize)}</div>
                        {originalDimensions && (
                          <div>Boyutlar: {originalDimensions.width} × {originalDimensions.height}</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Boyutlandırılmış</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(resizeResult.newSize)}</div>
                        <div>Boyutlar: {width} × {height}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span>Boyutlandırılmış Resmi İndir</span>
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
              <CubeTransparentIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Esnek Boyutlandırma</h3>
            <p className="text-gray-600">Özel boyutlar veya hazır presetler ile kolay boyutlandırma</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">En-Boy Oranı</h3>
            <p className="text-gray-600">Otomatik en-boy oranı koruması ve özelleştirme seçenekleri</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Yüksek Kalite</h3>
            <p className="text-gray-600">Gelişmiş algoritma ile kalite kaybı minimum boyutlandırma</p>
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