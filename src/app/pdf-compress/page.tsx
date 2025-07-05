'use client';
import { useState } from 'react';
import { DocumentArrowDownIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import { compressPDF } from '@/lib/pdfUtils';

export default function PDFCompress() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compressionRatio, setCompressionRatio] = useState(0.7);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setCompressedFile(null);
    setError('');
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const compressed = await compressPDF(file, compressionRatio);
      setCompressedFile(compressed);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => {}} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Seçilen Dosya</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Kaldır
                  </button>
                </div>
              </div>

              {/* Compression Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Sıkıştırma Ayarları</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıkıştırma Oranı: {Math.round(compressionRatio * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={compressionRatio}
                    onChange={(e) => setCompressionRatio(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Maksimum Sıkıştırma</span>
                    <span>Orijinal Kalite</span>
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
                      <span>PDF'i Sıkıştır</span>
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

              {/* Result */}
              {compressedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Sıkıştırma Tamamlandı!</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Orijinal Boyut:</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sıkıştırılmış Boyut:</span>
                      <span>{formatFileSize(compressedFile.size)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Tasarruf:</span>
                      <span className="text-green-600">
                        {Math.round((1 - compressedFile.size / file.size) * 100)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sıkıştırılmış PDF'i İndir
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
            <h3 className="text-lg font-semibold mb-2">Kaliteli Sıkıştırma</h3>
            <p className="text-gray-600">Görsel kaliteyi koruyarak dosya boyutunu küçültür</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Güvenli</h3>
            <p className="text-gray-600">Dosyalarınız işlem sonrası otomatik olarak silinir</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı</h3>
            <p className="text-gray-600">Saniyeler içinde sıkıştırma işlemi tamamlanır</p>
          </div>
        </div>
      </div>
    </div>
  );
} 