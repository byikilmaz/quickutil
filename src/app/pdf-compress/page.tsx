'use client';
import { useState } from 'react';
import { DocumentArrowDownIcon, ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUpload';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  compressPDF, 
  analyzePDF,
  calculateCompressionRatio,
  formatFileSize 
} from '@/lib/pdfUtils';

interface PDFAnalysis {
  pageCount: number;
  fileSize: string;
  hasImages: boolean;
  hasText: boolean;
  isEncrypted: boolean;
}

export default function PDFCompress() {
  const { user } = useAuth();
  const { uploadFile: uploadToStorage } = useStorage();
  const { checkFileSize, getMaxFileSize } = useQuota();
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
    storageDownloadURL?: string;
  } | null>(null);

  const compressionLevels = {
    light: { ratio: 0.9, label: 'Hafif Sıkıştırma', description: '~10% küçültme' },
    medium: { ratio: 0.7, label: 'Orta Sıkıştırma', description: '~30% küçültme' },
    high: { ratio: 0.5, label: 'Yoğun Sıkıştırma', description: '~50% küçültme' },
  };

  const handleFileSelect = async (selectedFile: File) => {
    console.log('File selected:', selectedFile.name, selectedFile.size, selectedFile.type);
    
    setFile(null);
    setCompressedFile(null);
    setCompressionResult(null);
    setError('');
    setPdfAnalysis(null);

    // Validate PDF file first
    if (!selectedFile.type.includes('pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Lütfen geçerli bir PDF dosyası seçin');
      return;
    }

    // Check file size (ücretsiz model: 100MB limit)
    if (!checkFileSize(selectedFile.size)) {
      setError(`Dosya boyutu ${getMaxFileSize()}MB&apos;ı aşmamalıdır`);
      return;
    }

    setFile(selectedFile);
    console.log('File validation passed, starting PDF analysis...');

    // Analyze PDF
    setAnalyzing(true);
    try {
      const analysis = await analyzePDF(selectedFile);
      console.log('PDF analysis completed:', analysis);
      setPdfAnalysis(analysis);
    } catch (err) {
      console.error('PDF analysis error:', err);
      setError('PDF analizi sırasında hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
      setFile(null); // Reset file on analysis error
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setCompressionResult(null);

    const startTime = Date.now();

    try {
      const currentRatio = compressionLevels[compressionLevel].ratio;
      const compressed = await compressPDF(file, currentRatio);
      setCompressedFile(compressed);

      // Calculate compression results
      const originalSize = file.size;
      const compressedSize = compressed.size;
      const savedBytes = originalSize - compressedSize;
      const savedPercentage = calculateCompressionRatio(originalSize, compressedSize);
      const processingTime = Date.now() - startTime;

      // Try to upload to Firebase Storage if user is logged in
      let storageDownloadURL: string | undefined;
      if (user && uploadToStorage) {
        try {
          console.log('Uploading compressed PDF to Firebase Storage...');
          const compressedFileName = `compressed_${file.name}`;
          const renamedCompressed = new File([compressed], compressedFileName, {
            type: 'application/pdf',
            lastModified: Date.now(),
          });
          
          const uploadResult = await uploadToStorage(renamedCompressed, 'pdf', compressedFileName);
          storageDownloadURL = uploadResult.downloadURL;
          console.log('Firebase Storage upload successful:', storageDownloadURL);
        } catch (uploadError) {
          console.error('Firebase Storage upload failed:', uploadError);
          // Continue without failing the compression
        }
      }

      const result = {
        originalSize,
        compressedSize,
        savedBytes,
        savedPercentage,
        storageDownloadURL
      };

      setCompressionResult(result);

      // Track activity
      if (user) {
        try {
          await ActivityTracker.createActivity(user.uid, {
            type: 'pdf_compress',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: originalSize,
            processedSize: compressedSize,
            status: 'success',
            category: 'PDF',
            processingTime,
            compressionRatio: savedPercentage,
            downloadUrl: storageDownloadURL
          });
        } catch (activityError) {
          console.error('Activity tracking failed:', activityError);
        }
      }

      console.log('PDF compression completed successfully:', result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      console.error('PDF compression error:', err);
      setError('PDF sıkıştırma hatası: ' + errorMessage);

      // Track failed activity
      if (user) {
        try {
          await ActivityTracker.createActivity(user.uid, {
            type: 'pdf_compress',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            status: 'error',
            category: 'PDF',
            errorMessage: errorMessage
          });
        } catch (activityError) {
          console.error('Failed activity tracking failed:', activityError);
        }
      }

    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (fileToDownload: File, filename?: string) => {
    const url = URL.createObjectURL(fileToDownload);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || fileToDownload.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        
        <StructuredData 
          type="howto" 
          data={{
            title: "PDF Dosyası Nasıl Sıkıştırılır",
            description: "PDF dosyalarınızı kalitesini koruyarak boyutunu küçültün",
            steps: [
              {
                '@type': 'HowToStep',
                name: "PDF Dosyasını Yükleyin",
                text: "PDF dosyanızı yükleyin"
              },
              {
                '@type': 'HowToStep',
                name: "Sıkıştırma Seviyesini Seçin",
                text: "Sıkıştırma seviyesini seçin"
              },
              {
                '@type': 'HowToStep',
                name: "Sıkıştır Butonuna Tıklayın",
                text: "Sıkıştır butonuna tıklayın"
              },
              {
                '@type': 'HowToStep',
                name: "Dosyayı İndirin",
                text: "Sıkıştırılmış dosyayı indirin"
              }
            ]
          }}
        />

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <DocumentArrowDownIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            PDF Sıkıştırma
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            PDF dosyalarınızı kalitesini koruyarak boyutunu küçültün. 
            <strong className="text-blue-600"> Tamamen ücretsiz</strong> ve güvenli!
          </p>
          
          {/* Free features badge */}
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mt-4">
            🎉 Sınırsız kullanım - {getMaxFileSize()}MB&apos;a kadar dosya
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* File Upload */}
          {!file && (
            <div className="animate-slide-in">
              <FileUpload 
                onFileSelect={handleFileSelect}
                acceptedTypes={['application/pdf']}
                maxSize={getMaxFileSize() * 1024 * 1024} // Convert MB to bytes
                title="PDF Dosyası Yükleyin"
                description={`PDF dosyanızı buraya sürükleyin veya seçin (Maksimum ${getMaxFileSize()}MB)`}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in">
              <div className="flex items-center">
                <InformationCircleIcon className="h-6 w-6 mr-3" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* PDF Analysis */}
          {analyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <span className="text-blue-800 font-medium">PDF analiz ediliyor...</span>
              </div>
            </div>
          )}

          {pdfAnalysis && file && !compressedFile && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-slide-in">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">📊 PDF Analizi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{pdfAnalysis.pageCount}</div>
                  <div className="text-sm text-gray-700 mt-1">Sayfa</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{pdfAnalysis.fileSize}</div>
                  <div className="text-sm text-gray-700 mt-1">Boyut</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{pdfAnalysis.hasImages ? '✅' : '❌'}</div>
                  <div className="text-sm text-gray-700 mt-1">Resim</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{pdfAnalysis.hasText ? '✅' : '❌'}</div>
                  <div className="text-sm text-gray-700 mt-1">Metin</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    🎛️ Sıkıştırma Seviyesi
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(compressionLevels).map(([level, config]) => (
                      <label
                        key={level}
                        className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-300 ${
                          compressionLevel === level
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="compressionLevel"
                          value={level}
                          checked={compressionLevel === level}
                          onChange={(e) => setCompressionLevel(e.target.value as 'light' | 'medium' | 'high')}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 mb-1">{config.label}</div>
                          <div className="text-sm text-gray-600">{config.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCompress}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Sıkıştırılıyor...
                    </div>
                  ) : (
                    '🚀 PDF Sıkıştır'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Compression Results */}
          {compressionResult && compressedFile && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-bounce-in">
              <div className="text-center mb-8">
                <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Sıkıştırma Tamamlandı!</h3>
                <p className="text-gray-700">PDF dosyanız başarıyla sıkıştırıldı</p>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{formatFileSize(compressionResult.originalSize)}</div>
                  <div className="text-sm text-gray-700 mt-1">Orijinal Boyut</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{formatFileSize(compressionResult.compressedSize)}</div>
                  <div className="text-sm text-gray-700 mt-1">Sıkıştırılmış Boyut</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{compressionResult.savedPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-700 mt-1">Tasarruf</div>
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-4">
                <button
                  onClick={() => downloadFile(compressedFile, `compressed_${file?.name}`)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <ArrowUpTrayIcon className="h-6 w-6 mr-3" />
                  💾 Sıkıştırılmış PDF&apos;i İndir
                </button>

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">📁 Dosyalarınızı saklayın</h4>
                        <p className="text-gray-600">
                          Dosyanız şifrelenmeden yüklenir ve işlendikten sonra otomatik olarak silinir. Kişisel verileriniz güvendedir.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Kayıt Ol
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setFile(null);
                    setCompressedFile(null);
                    setCompressionResult(null);
                    setPdfAnalysis(null);
                    setError('');
                  }}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 px-8 rounded-xl text-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  🔄 Yeni Dosya Sıkıştır
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">✨ Özellikler</h2>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Akıllı Sıkıştırma</h3>
              <p className="text-gray-700">Metadata temizleme ve object stream optimizasyonu</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Kalite Korunur</h3>
              <p className="text-gray-700">Metin ve görsel kalitesi bozulmaz</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Hızlı İşlem</h3>
              <p className="text-gray-700">Tarayıcıda güvenli işleme</p>
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