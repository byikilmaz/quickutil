'use client';
import { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon, ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  convertImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult,
  type ConversionOptions
} from '@/lib/imageUtils';

type Stage = 'upload' | 'settings' | 'result';
type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function ImageFormatConvert() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(0.9);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [convertResult, setConvertResult] = useState<ConversionResult | null>(null);
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

  const handleConvert = async () => {
    if (!file) {
      setError('Lütfen bir resim seçin');
      return;
    }

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const options: ConversionOptions = {
        format: outputFormat,
        quality,
      };

      const result = await convertImage(file, options);
      setConvertResult(result);
      setStage('result');

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_convert',
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
      setError(err instanceof Error ? err.message : 'Dönüştürme sırasında hata oluştu');
      
      if (user && file) {
        try {
          const processingTime = Date.now() - startTime;
          await ActivityTracker.createActivity(user.uid, {
            type: 'image_convert',
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
    if (!convertResult) return;

    const url = URL.createObjectURL(convertResult.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertResult.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStage('upload');
    setFile(null);
    setConvertResult(null);
    setError('');
    setOutputFormat('jpeg');
    setQuality(0.9);
    setOriginalDimensions(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Get current file format
  const getCurrentFormat = (): string => {
    if (!file) return '';
    switch (file.type) {
      case 'image/jpeg':
        return 'JPEG';
      case 'image/png':
        return 'PNG';
      case 'image/webp':
        return 'WebP';
      case 'image/gif':
        return 'GIF';
      default:
        return file.type.replace('image/', '').toUpperCase();
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

  const formatConfigs = {
    jpeg: { icon: '📷', name: 'JPEG', desc: 'Küçük boyut, fotoğraflar için ideal' },
    png: { icon: '🖼️', name: 'PNG', desc: 'Şeffaflık desteği, kaliteli görüntü' },
    webp: { icon: '🔧', name: 'WebP', desc: 'Modern format, en iyi sıkıştırma' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Breadcrumb />
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-4 shadow-lg">
              <ArrowsRightLeftIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Format Dönüştürme
            </h1>
            <p className="text-gray-700 max-w-md mx-auto">
              Resimlerinizi farklı formatlara kolayca dönüştürün
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
              JPEG, PNG, WebP, GIF formatları • Max 50MB
            </p>
            
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium shadow-lg text-sm">
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
                <ArrowsRightLeftIcon className="w-5 h-5 text-purple-600" />
                <h1 className="text-lg font-semibold text-gray-900">Dönüştürme</h1>
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
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                      {getCurrentFormat()}
                    </span>
                    <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400" />
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-medium">
                      {formatConfigs[outputFormat].name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile-Friendly Settings */}
          <div className="flex-1 bg-white p-4 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Output Format Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Çıktı Formatı</h3>
                <div className="space-y-3">
                  {Object.entries(formatConfigs).map(([format, config]) => (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format as OutputFormat)}
                      className={`w-full p-4 rounded-xl text-left transition-colors ${
                        outputFormat === format
                          ? 'bg-purple-100 border-2 border-purple-300 text-purple-800'
                          : 'bg-gray-100 border-2 border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm opacity-75">{config.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Settings (only for JPEG and WebP) */}
              {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Kalite</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Kalite: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${quality * 100}%, #e5e7eb ${quality * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-700 mt-1">
                        <span>Düşük (Küçük dosya)</span>
                        <span>Yüksek (Büyük dosya)</span>
                      </div>
                    </div>
                    
                    {/* Quick Quality Presets */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setQuality(0.6)}
                        className={`p-2 rounded-lg text-sm transition-colors ${
                          quality === 0.6 
                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        Düşük (60%)
                      </button>
                      <button
                        onClick={() => setQuality(0.8)}
                        className={`p-2 rounded-lg text-sm transition-colors ${
                          quality === 0.8 
                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        Orta (80%)
                      </button>
                      <button
                        onClick={() => setQuality(1.0)}
                        className={`p-2 rounded-lg text-sm transition-colors ${
                          quality === 1.0 
                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        Yüksek (100%)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Format Info */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h4 className="font-medium text-purple-900 mb-2">
                  {formatConfigs[outputFormat].name} Hakkında
                </h4>
                <p className="text-sm text-purple-800">
                  {formatConfigs[outputFormat].desc}
                </p>
                {outputFormat === 'jpeg' && (
                  <p className="text-xs text-purple-700 mt-1">
                    • Şeffaflık desteği yok • Fotoğraflar için en uygun
                  </p>
                )}
                {outputFormat === 'png' && (
                  <p className="text-xs text-purple-700 mt-1">
                    • Şeffaflık destekli • Kayıpsız sıkıştırma
                  </p>
                )}
                {outputFormat === 'webp' && (
                  <p className="text-xs text-purple-700 mt-1">
                    • Modern tarayıcılarda desteklenir • En iyi sıkıştırma
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Action Button */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <button
              onClick={handleConvert}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Dönüştürülüyor...</span>
                </>
              ) : (
                <>
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                  <span>Dönüştür</span>
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
      {stage === 'result' && convertResult && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowsRightLeftIcon className="w-5 h-5 text-purple-600" />
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dönüştürülmüş Resim</h3>
                <img
                  src={URL.createObjectURL(convertResult.file)}
                  alt="Dönüştürülmüş resim"
                  className="w-full h-64 object-contain rounded-xl bg-gray-50"
                />
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">İstatistikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-700">Orijinal</div>
                    <div className="font-medium text-gray-900">{formatFileSize(convertResult.originalSize)}</div>
                    <div className="text-xs text-gray-600">{getCurrentFormat()}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-sm text-purple-700">Dönüştürülmüş</div>
                    <div className="font-medium text-purple-900">{formatFileSize(convertResult.newSize)}</div>
                    <div className="text-xs text-purple-600">{formatConfigs[outputFormat].name}</div>
                  </div>
                </div>
                
                {/* Size Change */}
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-sm text-blue-700">Boyut Değişimi</div>
                    <div className="font-medium text-blue-900">
                      {convertResult.newSize < convertResult.originalSize ? '📉' : '📈'} 
                      {' '}
                      {Math.abs(Math.round((1 - convertResult.compressionRatio) * 100))}%
                      {' '}
                      {convertResult.newSize < convertResult.originalSize ? 'küçüldü' : 'büyüdü'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg"
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