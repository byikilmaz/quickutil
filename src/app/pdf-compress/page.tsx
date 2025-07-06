'use client';
import { useState } from 'react';
import { DocumentArrowDownIcon, ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { 
  compressPDF, 
  analyzePDF,
  calculateCompressionRatio,
  getFileSize 
} from '@/lib/pdfUtils';

interface PDFAnalysis {
  pageCount: number;
  fileSize: string;
  hasImages: boolean;
  hasText: boolean;
  isEncrypted: boolean;
}

export default function PDFCompress() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [compressionLevel, setCompressionLevel] = useState<'light' | 'medium' | 'high'>('medium');
  const [pdfAnalysis, setPdfAnalysis] = useState<PDFAnalysis | null>(null);
  const [compressionResult, setCompressionResult] = useState<{
    originalSize: number;
    compressedSize: number;
    savedBytes: number;
    savedPercentage: number;
  } | null>(null);

  const compressionLevels = {
    light: { ratio: 0.9, label: 'Hafif Sıkıştırma', description: '~10% küçültme' },
    medium: { ratio: 0.7, label: 'Orta Sıkıştırma', description: '~30% küçültme' },
    high: { ratio: 0.5, label: 'Yoğun Sıkıştırma', description: '~50% küçültme' },
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setCompressedFile(null);
    setCompressionResult(null);
    setError('');
    setPdfAnalysis(null);

    // Analyze PDF
    setAnalyzing(true);
    try {
      const analysis = await analyzePDF(selectedFile);
      setPdfAnalysis(analysis);
    } catch (err) {
      console.error('PDF analysis error:', err);
      setError('PDF analizi sırasında hata oluştu');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setCompressionResult(null);

    try {
      const currentRatio = compressionLevels[compressionLevel].ratio;
      const compressed = await compressPDF(file, currentRatio);
      setCompressedFile(compressed);

      // Calculate compression results
      const originalSize = file.size;
      const compressedSize = compressed.size;
      const savedBytes = originalSize - compressedSize;
      const savedPercentage = calculateCompressionRatio(originalSize, compressedSize);

      setCompressionResult({
        originalSize,
        compressedSize,
        savedBytes,
        savedPercentage: Math.max(0, savedPercentage), // Ensure non-negative
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sıkıştırma sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${file?.name || 'document.pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setCompressedFile(null);
    setCompressionResult(null);
    setError('');
    setPdfAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StructuredData 
        type="howto" 
        data={{
          title: 'PDF Dosyası Nasıl Sıkıştırılır',
          description: 'PDF dosyalarınızı kaliteden ödün vermeden nasıl sıkıştıracağınızı öğrenin'
        }}
      />
      <StructuredData type="faq" />
      
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <DocumentArrowDownIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            PDF Sıkıştırma
          </h1>
          <p className="text-lg text-gray-600">
            PDF dosyalarınızı kaliteden ödün vermeden sıkıştırın
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!file ? (
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes={['application/pdf']}
              maxSize={50 * 1024 * 1024} // 50MB
              title="PDF Dosyası Yükleyin"
              description="PDF dosyanızı buraya sürükleyin veya seçin"
            />
          ) : (
            <div className="space-y-6">
              {/* File Info & Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Dosya Bilgileri</h3>
                  {analyzing && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm">Analiz ediliyor...</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dosya Adı:</span>
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dosya Boyutu:</span>
                      <span className="text-sm font-medium">{getFileSize(file)}</span>
                    </div>
                  </div>
                  
                  {pdfAnalysis && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sayfa Sayısı:</span>
                        <span className="text-sm font-medium">{pdfAnalysis.pageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">İçerik:</span>
                        <span className="text-sm font-medium">
                          {pdfAnalysis.hasText && 'Metin'}
                          {pdfAnalysis.hasText && pdfAnalysis.hasImages && ' + '}
                          {pdfAnalysis.hasImages && 'Görsel'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={resetForm}
                  className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Başka Dosya Seç
                </button>
              </div>

              {/* Compression Settings */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Sıkıştırma Ayarları</h2>
                
                {/* Compression Level Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    Sıkıştırma Seviyesi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Object.keys(compressionLevels) as Array<keyof typeof compressionLevels>).map((level) => (
                      <button
                        key={level}
                        onClick={() => setCompressionLevel(level)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          compressionLevel === level
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium mb-1">
                          {compressionLevels[level].label}
                        </div>
                        <div className="text-sm opacity-75">
                          {compressionLevels[level].description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info about compression */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Sıkıştırma Hakkında</p>
                      <p>
                        PDF sıkıştırma işlemi metadata temizleme, object stream optimizasyonu ve 
                        dosya yapısını optimize ederek gerçekleşir. Metin kalitesi korunur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compress Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCompress}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sıkıştırılıyor...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-5 w-5" />
                      <span>PDF&apos;i Sıkıştır</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Result */}
              {compressionResult && compressedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">Sıkıştırma Tamamlandı!</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Öncesi</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {getFileSize(file)}</div>
                        {pdfAnalysis && <div>Sayfa: {pdfAnalysis.pageCount}</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-800">Sonrası</h4>
                      <div className="text-sm text-green-700">
                        <div>Boyut: {getFileSize(compressedFile)}</div>
                        <div className="font-medium text-green-600">
                          Tasarruf: {compressionResult.savedPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {compressionResult.savedBytes > 0 && (
                    <div className="mb-4 p-3 bg-green-100 rounded-lg">
                      <div className="text-sm text-green-800">
                        <span className="font-medium">
                          {Math.round(compressionResult.savedBytes / 1024)} KB
                        </span> tasarruf sağlandı!
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span>Sıkıştırılmış PDF&apos;i İndir</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Akıllı Sıkıştırma</h3>
            <p className="text-gray-600">Metadata temizleme ve object stream optimizasyonu</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Kalite Korunur</h3>
            <p className="text-gray-600">Metin ve görsel kalitesi bozulmaz</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı İşlem</h3>
            <p className="text-gray-600">Browser&apos;da güvenli işleme</p>
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