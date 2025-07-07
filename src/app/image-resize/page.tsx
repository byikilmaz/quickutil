'use client';
import { useState, useEffect } from 'react';
import { CubeTransparentIcon, ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  resizeImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult,
  type ResizeOptions 
} from '@/lib/imageUtils';

type Stage = 'upload' | 'settings' | 'result';

export default function ImageResize() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [resizeMode, setResizeMode] = useState<'stretch' | 'fit' | 'fill'>('fit');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [resizeResult, setResizeResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    const selectedFile = files[0];
    const error = validateFile(selectedFile);
    
    if (error) {
      setError(error);
      return;
    }

    setFile(selectedFile);
    setStage('settings');
    setError('');

    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      setWidth(dimensions.width);
      setHeight(dimensions.height);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
      setError('Resim boyutları alınamadı');
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false
  });

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
      setResizeResult(result);
      setStage('result');

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
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Boyutlandırma sırasında hata oluştu');
      
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
    if (!resizeResult) return;

    const url = URL.createObjectURL(resizeResult.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = resizeResult.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStage('upload');
    setFile(null);
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

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Breadcrumb />
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white mb-4 shadow-lg">
              <CubeTransparentIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Resim Boyutlandırma
            </h1>
            <p className="text-gray-700 max-w-md mx-auto">
              Resimlerinizi istediğiniz boyutlara kolayca getirin
            </p>
          </div>

          {/* Mobile-Optimized Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
            
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium shadow-lg text-sm">
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

      {/* Settings Stage */}
      {stage === 'settings' && file && (
        <div className="flex flex-col h-screen">
          {/* Mobile Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CubeTransparentIcon className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">Boyutlandırma</h1>
              </div>
              <button
                onClick={resetForm}
                className="text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                Yeni Resim
              </button>
            </div>
          </div>

          {/* Image Preview */}
          <div className="bg-gray-100 p-4">
            {previewUrl && (
              <div className="bg-white rounded-2xl p-4 mx-auto max-w-sm">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-xl"
                />
                <div className="mt-3 text-center text-sm text-gray-700">
                  <p>{file.name}</p>
                  <p>{formatFileSize(file.size)} • {originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}` : ''}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile-Friendly Settings */}
          <div className="flex-1 bg-white p-4 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Quick Presets */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hızlı Boyutlar</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPresetSize(1920, 1080)}
                    className="p-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    📺 Full HD<br/>
                    <span className="text-xs text-gray-600">1920×1080</span>
                  </button>
                  <button
                    onClick={() => setPresetSize(1280, 720)}
                    className="p-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    📱 HD<br/>
                    <span className="text-xs text-gray-600">1280×720</span>
                  </button>
                  <button
                    onClick={() => setPresetSize(800, 600)}
                    className="p-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    💻 Standart<br/>
                    <span className="text-xs text-gray-600">800×600</span>
                  </button>
                  <button
                    onClick={() => setPresetSize(400, 400)}
                    className="p-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    🔲 Kare<br/>
                    <span className="text-xs text-gray-600">400×400</span>
                  </button>
                </div>
              </div>

              {/* Custom Dimensions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Özel Boyutlar</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Genişlik (px)</label>
                    <input
                      type="number"
                      value={width || ''}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      placeholder="Genişlik"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Yükseklik (px)</label>
                    <input
                      type="number"
                      value={height || ''}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      placeholder="Yükseklik"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Aspect Ratio Toggle */}
                <div className="mt-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="maintain-aspect-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="maintain-aspect-ratio" className="text-sm font-medium text-gray-800">
                    En-boy oranını koru
                  </label>
                </div>
              </div>

              {/* Resize Mode */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Boyutlandırma Modu</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setResizeMode('fit')}
                    className={`w-full p-4 rounded-xl text-left transition-colors ${
                      resizeMode === 'fit'
                        ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-medium">🎯 Sığdır</div>
                    <div className="text-sm opacity-75 mt-1">En-boy oranını koruyarak sığdırır</div>
                  </button>
                  <button
                    onClick={() => setResizeMode('fill')}
                    className={`w-full p-4 rounded-xl text-left transition-colors ${
                      resizeMode === 'fill'
                        ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-medium">📏 Doldur</div>
                    <div className="text-sm opacity-75 mt-1">Alanı tamamen doldurur, kırpma yapabilir</div>
                  </button>
                  <button
                    onClick={() => setResizeMode('stretch')}
                    className={`w-full p-4 rounded-xl text-left transition-colors ${
                      resizeMode === 'stretch'
                        ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-medium">↔️ Uzat</div>
                    <div className="text-sm opacity-75 mt-1">Tam olarak verilen boyutlara getirir</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Button */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <button
              onClick={handleResize}
              disabled={loading || (!width && !height)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <CubeTransparentIcon className="w-5 h-5" />
                  <span>Boyutlandır</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Stage */}
      {stage === 'result' && resizeResult && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CubeTransparentIcon className="w-5 h-5 text-green-600" />
                <h1 className="text-lg font-semibold text-gray-900">Tamamlandı</h1>
              </div>
              <button
                onClick={resetForm}
                className="text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                Yeni Resim
              </button>
            </div>
          </div>

          {/* Result Comparison */}
          <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Before/After */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sonuç</h3>
                  <img
                    src={URL.createObjectURL(resizeResult.file)}
                    alt="Boyutlandırılmış resim"
                    className="w-full h-64 object-contain rounded-xl bg-gray-50"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">İstatistikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-700">Orijinal</div>
                    <div className="font-medium text-gray-900">{formatFileSize(resizeResult.originalSize)}</div>
                    {originalDimensions && (
                      <div className="text-xs text-gray-600">{originalDimensions.width}×{originalDimensions.height}</div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-sm text-blue-700">Yeni</div>
                    <div className="font-medium text-blue-900">{formatFileSize(resizeResult.newSize)}</div>
                    <div className="text-xs text-blue-600">{width}×{height}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
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

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
} 