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
  compressImageAdvanced,
  getImageDimensions,
  validateImageFormat,
  formatFileSize,
  getOptimalCompressionSettings,
  type ConversionResult,
  type CompressOptions 
} from '@/lib/imageUtils';

export default function ImageCompress() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('jpeg');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [compressionResult, setCompressionResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useOptimalSettings, setUseOptimalSettings] = useState(true);

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateImageFormat(selectedFile)) {
      setError('Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, WebP, GIF)');
      return;
    }

    setFile(selectedFile);
    setCompressedFile(null);
    setCompressionResult(null);
    setError('');

    // Apply optimal settings if enabled
    if (useOptimalSettings) {
      const optimal = getOptimalCompressionSettings(selectedFile.size);
      setQuality(optimal.quality);
      setMaxWidth(optimal.maxWidth);
      setMaxHeight(optimal.maxHeight);
      if (optimal.format) {
        setFormat(optimal.format);
      }
    }

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

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const options: CompressOptions = {
        quality,
        format,
        maxWidth,
        maxHeight,
      };

      const result = await compressImageAdvanced(file, options);
      setCompressedFile(result.file);
      setCompressionResult(result);

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;
          const savedBytes = result.originalSize - result.newSize;
          const savingPercentage = (savedBytes / result.originalSize) * 100;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_compress',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            processedSize: result.file.size,
            status: 'success',
            category: 'Image',
            processingTime,
            compressionRatio: savingPercentage
          });
          console.log('Image compress activity tracked successfully');
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sıkıştırma sırasında hata oluştu');
      
      // Track failed activity if user is logged in
      if (user && file) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_compress',
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
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressedFile.name;
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
    setCompressedFile(null);
    setCompressionResult(null);
    setError('');
    setOriginalDimensions(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getSizeDifference = () => {
    if (!compressionResult) return null;
    const savedBytes = compressionResult.originalSize - compressionResult.newSize;
    const savingPercentage = (savedBytes / compressionResult.originalSize) * 100;
    return {
      bytes: savedBytes,
      percentage: savingPercentage
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
              <ArrowPathIcon className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resim Sıkıştırma
          </h1>
          <p className="text-lg text-gray-600">
            Resimlerinizi kaliteden ödün vermeden sıkıştırın ve dosya boyutunu azaltın
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!file ? (
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
              maxSize={50 * 1024 * 1024} // 50MB
              title="Sıkıştırılacak Resmi Yükleyin"
              description="PNG, JPEG, WebP veya GIF formatında resminizi buraya sürükleyin"
              currentFiles={[]}
            />
          ) : !compressedFile ? (
            <>
              {/* Success Upload State */}
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
                maxSize={50 * 1024 * 1024}
                title="Sıkıştırılacak Resmi Yükleyin"
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

                {/* Compression Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Sıkıştırma Ayarları</h3>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useOptimalSettings}
                        onChange={(e) => setUseOptimalSettings(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Otomatik optimize et</span>
                    </label>
                  </div>
                  
                  {/* Output Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çıktı Formatı
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['jpeg', 'png', 'webp'] as const).map((formatOption) => (
                        <button
                          key={formatOption}
                          onClick={() => setFormat(formatOption)}
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            format === formatOption
                              ? 'bg-purple-50 border-purple-300 text-purple-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {formatOption.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalite: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Maksimum Sıkıştırma</span>
                      <span>En İyi Kalite</span>
                    </div>
                  </div>

                  {/* Max Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maksimum Genişlik (px)
                      </label>
                      <input
                        type="number"
                        value={maxWidth || ''}
                        onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Orijinal"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maksimum Yükseklik (px)
                      </label>
                      <input
                        type="number"
                        value={maxHeight || ''}
                        onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Orijinal"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Compress Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCompress}
                    disabled={loading}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sıkıştırılıyor...</span>
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Resmi Sıkıştır</span>
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
              {compressionResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">Sıkıştırma Tamamlandı!</h3>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Orijinal</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(compressionResult.originalSize)}</div>
                        <div>Format: {file.type.replace('image/', '').toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Sıkıştırılmış</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(compressionResult.newSize)}</div>
                        <div>Format: {format.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Savings */}
                  {getSizeDifference() && (
                    <div className="bg-green-100 rounded-lg p-3 mb-4">
                      <div className="text-green-800 font-medium">
                        🎉 {formatFileSize(getSizeDifference()!.bytes)} tasarruf ettiniz! 
                        ({getSizeDifference()!.percentage.toFixed(1)}% azalma)
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span>Sıkıştırılmış Resmi İndir</span>
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
            <h3 className="text-lg font-semibold mb-2">Akıllı Sıkıştırma</h3>
            <p className="text-gray-600">Otomatik optimize ayarları ile en iyi sıkıştırma oranı</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı İşlem</h3>
            <p className="text-gray-600">Browser tabanlı sıkıştırma, upload gerektirmez</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Kalite Kontrolü</h3>
            <p className="text-gray-600">Kalite ve dosya boyutu arasında mükemmel denge</p>
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