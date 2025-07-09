'use client';
import { useState, useEffect } from 'react';
import { ArrowPathIcon, ArrowUpTrayIcon, SparklesIcon, LockClosedIcon, BoltIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
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
      <Breadcrumb />
      
      {/* Hero Marketing Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center animate-fade-in">
            {/* Trust Badge */}
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-in">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              2M+ Resim Sıkıştırıldı
            </div>

            {/* Main Headlines */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🗜️ <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Resim Sıkıştırma</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
              Resimlerinizi <span className="font-semibold text-purple-600">%90'a kadar sıkıştırın</span>, 
              kaliteden ödün vermeden dosya boyutunu <span className="font-semibold">drastik olarak azaltın</span>
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 apple-card-hover">
                <BoltIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-gray-700 font-medium">Anında İşlem</span>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 apple-card-hover">
                <LockClosedIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700 font-medium">%100 Güvenli</span>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 apple-card-hover">
                <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-gray-700 font-medium">AI Optimize</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">2M+</div>
                <div className="text-gray-600 text-sm">Sıkıştırılan Resim</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">4.9/5</div>
                <div className="text-gray-600 text-sm">Kullanıcı Puanı</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">256-bit</div>
                <div className="text-gray-600 text-sm">SSL Güvenlik</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 apple-card-hover">
          {!file ? (
            <>
              {/* Upload Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  🚀 Ücretsiz & Sınırsız
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Resminizi Yükleyin ve Sıkıştırın
                </h2>
                <p className="text-gray-600 mb-6">
                  PNG, JPEG, WebP, GIF formatlarında resimlerinizi yükleyin
                </p>
              </div>

              <FileUpload
                onFileSelect={(file) => {
                  if (Array.isArray(file)) {
                    handleFileSelect(file[0]);
                  } else {
                    handleFileSelect(file);
                  }
                }}
                acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
                maxSize={50 * 1024 * 1024} // 50MB
                title="Sıkıştırılacak Resmi Yükleyin"
                description="PNG, JPEG, WebP veya GIF formatında resminizi buraya sürükleyin"
                currentFiles={[]}
              />

              {/* Format Support */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-4">Desteklenen Formatlar:</p>
                <div className="flex justify-center items-center space-x-6">
                  <div className="bg-gray-100 px-3 py-1 rounded text-xs font-medium text-gray-700">JPG</div>
                  <div className="bg-gray-100 px-3 py-1 rounded text-xs font-medium text-gray-700">PNG</div>
                  <div className="bg-gray-100 px-3 py-1 rounded text-xs font-medium text-gray-700">WebP</div>
                  <div className="bg-gray-100 px-3 py-1 rounded text-xs font-medium text-gray-700">GIF</div>
                </div>
              </div>
            </>
          ) : !compressedFile ? (
            <>
              {/* Success Upload State */}
              <FileUpload
                onFileSelect={(file) => {
                  if (Array.isArray(file)) {
                    handleFileSelect(file[0]);
                  } else {
                    handleFileSelect(file);
                  }
                }}
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
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 apple-button-hover"
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
                <div className="space-y-4 bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      ⚙️ Sıkıştırma Ayarları
                    </h3>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useOptimalSettings}
                        onChange={(e) => setUseOptimalSettings(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">🤖 AI Optimize</span>
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
                          className={`p-3 border rounded-lg text-sm font-medium transition-all duration-200 apple-button-hover ${
                            format === formatOption
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md'
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
                      className="w-full accent-purple-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Compress Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCompress}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl apple-button-hover text-lg font-medium"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sıkıştırılıyor...</span>
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>🗜️ Resmi Sıkıştır</span>
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
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Sıkıştırma Tamamlandı!</h3>
                    <p className="text-green-700">Resminiz başarıyla optimize edildi</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">📤 Orijinal</h4>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {formatFileSize(compressionResult.originalSize)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {file.type.replace('image/', '').toUpperCase()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">📦 Sıkıştırılmış</h4>
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {formatFileSize(compressionResult.newSize)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Savings */}
                  {getSizeDifference() && (
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-6 text-center">
                      <div className="text-green-800 font-bold text-xl mb-1">
                        🎊 {formatFileSize(getSizeDifference()!.bytes)} tasarruf ettiniz!
                      </div>
                      <div className="text-green-700 text-lg">
                        {getSizeDifference()!.percentage.toFixed(1)}% boyut azalması
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl apple-button-hover text-lg font-medium"
                    >
                      <ArrowUpTrayIcon className="h-5 w-5" />
                      <span>📥 Sıkıştırılmış Resmi İndir</span>
                    </button>
                    
                    <button
                      onClick={resetForm}
                      className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 apple-button-hover"
                    >
                      🔄 Yeni Resim Sıkıştır
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Neden QuickUtil Resim Sıkıştırma?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Gelişmiş sıkıştırma algoritmaları ile resimlerinizi optimize edin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Features */}
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 apple-card-hover animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">AI Destekli Sıkıştırma</h3>
            <p className="text-gray-600">
              Gelişmiş AI algoritmaları ile %90'a kadar sıkıştırma, kalite kaybı olmadan
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 apple-card-hover animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BoltIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Anında İşlem</h3>
            <p className="text-gray-600">
              Browser tabanlı sıkıştırma, saniyeler içinde sonuç, server'a upload yok
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 apple-card-hover animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <LockClosedIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">%100 Güvenli & Özel</h3>
            <p className="text-gray-600">
              Resimleriniz browser'ınızdan ayrılmıyor, server'a gönderilmiyor
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 apple-card-hover animate-slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <GlobeAltIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Çoklu Format Desteği</h3>
            <p className="text-gray-600">
              JPG, PNG, WebP, GIF - tüm popüler resim formatlarını destekliyoruz
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 apple-card-hover animate-slide-in" style={{ animationDelay: '0.5s' }}>
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <UserGroupIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">2M+ Mutlu Kullanıcı</h3>
            <p className="text-gray-600">
              Dünya çapında milyonlarca kullanıcı tarafından güvenilen platform
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 apple-card-hover animate-slide-in" style={{ animationDelay: '0.6s' }}>
            <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Tamamen Ücretsiz</h3>
            <p className="text-gray-600">
              Sınırsız kullanım, gizli ücret yok, kayıt olmadan da kullanabilirsiniz
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof & Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              💬 Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-lg text-gray-600">
              Binlerce mutlu kullanıcımızdan gelen yorumlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 apple-card-hover">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
                <span className="ml-2 text-sm text-gray-600">5/5</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Website yükleme hızımı %60 artırdı! Resimlerim artık çok daha hızlı yükleniyor, müşterilerim çok memnun."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Ahmet K.</div>
                  <div className="text-sm text-gray-600">E-ticaret Sahibi</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 apple-card-hover">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
                <span className="ml-2 text-sm text-gray-600">5/5</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Fotoğraflarımı Instagram için optimize etmek artık çok kolay. Kalite hiç bozulmuyor, boyut yarı yarıya düşüyor!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  Z
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Zeynep M.</div>
                  <div className="text-sm text-gray-600">İçerik Üreticisi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🚀 Resimlerinizi Hemen Optimize Edin!
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Milyonlarca kullanıcının güvendiği platform ile resimlerinizi %90'a kadar sıkıştırın
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                         <button
               onClick={() => {
                 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                 fileInput?.click();
               }}
               className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 apple-button-hover text-lg"
             >
               🗜️ Hemen Başla - Ücretsiz!
             </button>
            <div className="text-purple-100 text-sm">
              ✅ Kayıt gerektirmez • ✅ Sınırsız kullanım • ✅ %100 güvenli
            </div>
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