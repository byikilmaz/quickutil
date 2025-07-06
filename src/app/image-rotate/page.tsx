'use client';
import { useState, useEffect } from 'react';
import { ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import FileUpload from '@/components/FileUpload';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  rotateImage,
  getImageDimensions,
  validateImageFormat,
  formatFileSize,
  type ConversionResult,
  type RotateOptions 
} from '@/lib/imageUtils';

export default function ImageRotate() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rotatedFile, setRotatedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [angle, setAngle] = useState(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [rotateResult, setRotateResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateImageFormat(selectedFile)) {
      setError('Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, WebP, GIF)');
      return;
    }

    setFile(selectedFile);
    setRotatedFile(null);
    setRotateResult(null);
    setError('');
    setAngle(0);

    // Get original dimensions
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
    }

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleRotate = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const options: RotateOptions = {
        angle: angle,
      };

      const result = await rotateImage(file, options);
      setRotatedFile(result.file);
      setRotateResult(result);

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
            processingTime,
            compressionRatio: Math.abs(1 - result.compressionRatio) * 100
          });
          console.log('Image rotate activity tracked successfully');
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Döndürme sırasında hata oluştu');
      
      // Track failed activity if user is logged in
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
    if (!rotatedFile) return;

    const url = URL.createObjectURL(rotatedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = rotatedFile.name;
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
    setRotatedFile(null);
    setRotateResult(null);
    setError('');
    setOriginalDimensions(null);
    setAngle(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const setPresetAngle = (presetAngle: number) => {
    setAngle(presetAngle);
  };

  const normalizeAngle = (angle: number) => {
    return ((angle % 360) + 360) % 360;
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
              <ArrowPathIcon className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resim Döndürme
          </h1>
          <p className="text-lg text-gray-600">
            Resimlerinizi istediğiniz açıda döndürün ve yönelimi düzenleyin
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!file ? (
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
              maxSize={50 * 1024 * 1024} // 50MB
              title="Döndürülecek Resmi Yükleyin"
              description="PNG, JPEG, WebP veya GIF formatında resminizi buraya sürükleyin"
              currentFiles={[]}
            />
          ) : !rotatedFile ? (
            <>
              {/* Success Upload State */}
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
                maxSize={50 * 1024 * 1024}
                title="Döndürülecek Resmi Yükleyin"
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Döndürme Açısı:</span>
                        <span className="text-sm font-medium">{normalizeAngle(angle)}°</span>
                      </div>
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

                  {/* Live Preview */}
                  {previewUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Canlı Önizleme</h3>
                      <div className="relative w-full h-48 bg-white rounded border flex items-center justify-center overflow-hidden">
                        <div 
                          className="transition-transform duration-300 ease-in-out"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <Image
                            src={previewUrl}
                            alt={`${file?.name || 'Yüklenen dosya'} döndürme önizlemesi`}
                            width={120}
                            height={120}
                            className="object-contain max-w-none"
                            unoptimized
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Anlık önizleme - {normalizeAngle(angle)}° döndürülmüş
                      </p>
                    </div>
                  )}
                </div>

                {/* Rotation Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Döndürme Ayarları</h3>
                  
                  {/* Quick Rotation Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hızlı Döndürme
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        onClick={() => setPresetAngle(90)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>90° Sağa</span>
                      </button>
                      <button
                        onClick={() => setPresetAngle(180)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>180° Ters</span>
                      </button>
                      <button
                        onClick={() => setPresetAngle(270)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>90° Sola</span>
                      </button>
                      <button
                        onClick={() => setPresetAngle(0)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Sıfırla</span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Angle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Özel Açı: {normalizeAngle(angle)}°
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="-360"
                        max="360"
                        step="1"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-360°</span>
                        <span>0°</span>
                        <span>+360°</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Angle Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manuel Açı Girişi
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                        min="-360"
                        max="360"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Açı değeri"
                      />
                      <span className="text-sm text-gray-600">derece</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pozitif değerler saat yönünde, negatif değerler saat yönünün tersine döndürür
                    </p>
                  </div>

                  {/* Fine Adjustment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İnce Ayar
                    </label>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setAngle(angle - 1)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        -1°
                      </button>
                      <button
                        onClick={() => setAngle(angle - 0.1)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        -0.1°
                      </button>
                      <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                        {angle.toFixed(1)}°
                      </span>
                      <button
                        onClick={() => setAngle(angle + 0.1)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        +0.1°
                      </button>
                      <button
                        onClick={() => setAngle(angle + 1)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        +1°
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rotate Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleRotate}
                    disabled={loading || angle === 0}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Döndürülüyor...</span>
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Resmi Döndür</span>
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
              {rotateResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">Döndürme Tamamlandı!</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Orijinal</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(rotateResult.originalSize)}</div>
                        {originalDimensions && (
                          <div>Boyutlar: {originalDimensions.width} × {originalDimensions.height}</div>
                        )}
                        <div>Açı: 0°</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Döndürülmüş</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(rotateResult.newSize)}</div>
                        <div>Döndürme: {normalizeAngle(angle)}°</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span>Döndürülmüş Resmi İndir</span>
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
              <ArrowPathIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Canlı Önizleme</h3>
            <p className="text-gray-600">Döndürme işlemini gerçek zamanlı olarak görebilirsiniz</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hassas Kontrol</h3>
            <p className="text-gray-600">0.1° hassasiyetinde döndürme ve ince ayar seçenekleri</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı Presetler</h3>
            <p className="text-gray-600">90°, 180°, 270° ve özel açılarla kolay döndürme</p>
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