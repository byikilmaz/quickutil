'use client';
import { useState, useEffect } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  convertImage, 
  getImageDimensions, 
  validateImageFile, 
  formatFileSize,
  type ConversionResult,
  type ConversionOptions 
} from '@/lib/imageUtils';

export default function ImageConvert() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(0.9);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateImageFile(selectedFile)) {
      setError('Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, WebP)');
      return;
    }

    setFile(selectedFile);
    setConvertedFile(null);
    setConversionResult(null);
    setError('');

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

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const startTime = Date.now();

    try {
      const options: ConversionOptions = {
        format,
        quality,
        maxWidth,
        maxHeight,
      };

      const result = await convertImage(file, options);
      setConvertedFile(result.file);
      setConversionResult(result);

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
          console.log('Image convert activity tracked successfully');
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dönüştürme sırasında hata oluştu');
      
      // Track failed activity if user is logged in
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
    if (!convertedFile) return;

    const url = URL.createObjectURL(convertedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFile.name;
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
    setConvertedFile(null);
    setConversionResult(null);
    setError('');
    setOriginalDimensions(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-100 rounded-full">
              <PhotoIcon className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resim Dönüştürme
          </h1>
          <p className="text-lg text-gray-600">
            PNG, JPEG ve WebP formatları arasında dönüştürme yapın
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!file ? (
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
              maxSize={50 * 1024 * 1024} // 50MB
              title="Resim Dosyası Yükleyin"
              description="PNG, JPEG veya WebP formatında resminizi buraya sürükleyin"
              currentFiles={[]}
            />
          ) : !convertedFile ? (
            <>
              {/* Success Upload State */}
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
                maxSize={50 * 1024 * 1024}
                title="Resim Dosyası Yükleyin"
                description="PNG, JPEG veya WebP formatında resminizi buraya sürükleyin"
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
                          alt={`${file?.name || 'Yüklenen dosya'} resim önizlemesi - ${format} formatına dönüştürülecek`}
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

                {/* Conversion Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Dönüştürme Ayarları</h3>
                  
                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hedef Format
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
                  {format !== 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kalite: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Düşük Kalite</span>
                        <span>Yüksek Kalite</span>
                      </div>
                    </div>
                  )}

                  {/* Dimensions */}
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

                {/* Convert Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleConvert}
                    disabled={loading}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Dönüştürülüyor...</span>
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Resmi Dönüştür</span>
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
              {conversionResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">Dönüştürme Tamamlandı!</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Orijinal</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(conversionResult.originalSize)}</div>
                        <div>Format: {file.type.replace('image/', '').toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Dönüştürülmüş</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {formatFileSize(conversionResult.newSize)}</div>
                        <div>Format: {format.toUpperCase()}</div>
                        <div className="font-medium">
                          {conversionResult.newSize < conversionResult.originalSize ? 'Küçültme' : 'Büyütme'}: {' '}
                          {Math.round(Math.abs(1 - conversionResult.compressionRatio) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span>Dönüştürülmüş Resmi İndir</span>
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
              <PhotoIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Çoklu Format</h3>
            <p className="text-gray-600">PNG, JPEG ve WebP formatları arasında dönüştürme</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kalite Kontrolü</h3>
            <p className="text-gray-600">Dosya boyutu ve kalite dengesini ayarlayın</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Anında İşlem</h3>
            <p className="text-gray-600">Browser&apos;da hızlı dönüştürme, upload gerektirmez</p>
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