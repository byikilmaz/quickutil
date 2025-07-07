'use client';
import { useState, useEffect } from 'react';
import { ArrowPathIcon, ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  rotateImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult
} from '@/lib/imageUtils';

type Stage = 'upload' | 'settings' | 'result';

export default function ImageRotate() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rotation, setRotation] = useState(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [rotateResult, setRotateResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!validTypes.includes(file.type)) {
      return 'Desteklenen formatlar: JPEG, PNG, WebP';
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
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const handleRotate = async () => {
    if (!file) {
      setError('Lütfen bir resim seçin');
      return;
    }

    if (rotation === 0) {
      setError('Lütfen bir döndürme açısı seçin');
      return;
    }

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const result = await rotateImage(file, { angle: rotation });
      setRotateResult(result);
      setStage('result');

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_rotate',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            processedSize: result.file.size,
            status: 'success',
            category: 'Image',
            processingTime
          });
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Döndürme sırasında hata oluştu');
      
      if (user && file) {
        try {
          const processingTime = Date.now() - startTime;
          await ActivityTracker.createActivity(user.uid, {
            type: 'image_rotate',
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
    if (!rotateResult) return;

    const url = URL.createObjectURL(rotateResult.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = rotateResult.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStage('upload');
    setFile(null);
    setRotateResult(null);
    setError('');
    setRotation(0);
    setOriginalDimensions(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white mb-4 shadow-lg">
              <ArrowPathIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Resim Döndürme
            </h1>
            <p className="text-gray-700 max-w-md mx-auto">
              Resimlerinizi istediğiniz açıda kolayca döndürün
            </p>
          </div>

          {/* Mobile-Optimized Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-green-500 bg-green-50 scale-[1.02]'
                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
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
            
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-medium shadow-lg text-sm">
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
                <ArrowPathIcon className="w-5 h-5 text-green-600" />
                <h1 className="text-lg font-semibold text-gray-900">Döndürme</h1>
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
                  className="w-full h-48 object-contain rounded-xl transition-transform duration-300"
                  style={{ transform: `rotate(${rotation}deg)` }}
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
              
              {/* Rotation Buttons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Döndürme Açısı</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRotation(90)}
                    className={`p-4 rounded-xl text-center transition-colors ${
                      rotation === 90
                        ? 'bg-green-100 border-2 border-green-300 text-green-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-2xl mb-1">↻</div>
                    <div className="font-medium">90° Sağa</div>
                  </button>
                  <button
                    onClick={() => setRotation(180)}
                    className={`p-4 rounded-xl text-center transition-colors ${
                      rotation === 180
                        ? 'bg-green-100 border-2 border-green-300 text-green-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-2xl mb-1">↺</div>
                    <div className="font-medium">180° Ters</div>
                  </button>
                  <button
                    onClick={() => setRotation(270)}
                    className={`p-4 rounded-xl text-center transition-colors ${
                      rotation === 270
                        ? 'bg-green-100 border-2 border-green-300 text-green-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-2xl mb-1">↺</div>
                    <div className="font-medium">90° Sola</div>
                  </button>
                  <button
                    onClick={() => setRotation(0)}
                    className={`p-4 rounded-xl text-center transition-colors ${
                      rotation === 0
                        ? 'bg-green-100 border-2 border-green-300 text-green-800'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-2xl mb-1">⟲</div>
                    <div className="font-medium">Sıfırla</div>
                  </button>
                </div>
              </div>

              {/* Custom Rotation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Özel Açı</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Döndürme Açısı: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(rotation / 360) * 100}%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>0°</span>
                      <span>90°</span>
                      <span>180°</span>
                      <span>270°</span>
                      <span>360°</span>
                    </div>
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                      min="0"
                      max="360"
                      placeholder="Açı (0-360°)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Button */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <button
              onClick={handleRotate}
              disabled={loading || rotation === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Döndür</span>
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
      {stage === 'result' && rotateResult && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 text-green-600" />
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

          {/* Result Image */}
          <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Result */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Döndürülmüş Resim</h3>
                <img
                  src={URL.createObjectURL(rotateResult.file)}
                  alt="Döndürülmüş resim"
                  className="w-full h-64 object-contain rounded-xl bg-gray-50"
                />
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">İstatistikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-700">Orijinal</div>
                    <div className="font-medium text-gray-900">{formatFileSize(rotateResult.originalSize)}</div>
                    {originalDimensions && (
                      <div className="text-xs text-gray-600">{originalDimensions.width}×{originalDimensions.height}</div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-sm text-green-700">Döndürülmüş</div>
                    <div className="font-medium text-green-900">{formatFileSize(rotateResult.newSize)}</div>
                    <div className="text-xs text-green-600">{rotation}° döndürüldü</div>
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