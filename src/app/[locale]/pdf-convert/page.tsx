'use client';
import { useState } from 'react';
import JSZip from 'jszip';
import { 
  ArrowsRightLeftIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  ScissorsIcon, 
  Square2StackIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckCircleIcon,
  UserGroupIcon,
  StarIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { 
  extractTextFromPDF, 
  splitPDF, 
  mergePDFs, 
  convertPDFToImages,
  ConversionResult 
} from '@/lib/pdfConvertUtils';
import AuthModal from '@/components/AuthModal';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';

interface ConversionTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  emoji: string;
  color: string;
  acceptedFiles: string;
  action: string;
  outputFormats: string[];
}

export default function PDFConvert() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string>('');

  const conversionTools: ConversionTool[] = [
    {
      id: 'pdf-to-images',
      title: 'PDF to Images',
      description: 'PDF sayfalarını JPG, PNG formatına çevirin',
      icon: PhotoIcon,
      emoji: '🖼️',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-300',
      acceptedFiles: '.pdf',
      action: 'Resimlere Dönüştür',
      outputFormats: ['JPG', 'PNG']
    },
    {
      id: 'pdf-to-text',
      title: 'PDF to Text',
      description: 'PDF dosyalarından metin çıkarın (OCR)',
      icon: DocumentTextIcon,
      emoji: '📝',
      color: 'bg-green-50 border-green-200 hover:border-green-300',
      acceptedFiles: '.pdf',
      action: 'Metne Dönüştür',
      outputFormats: ['TXT']
    },
    {
      id: 'pdf-split',
      title: 'PDF Ayırma',
      description: 'PDF sayfalarını ayrı dosyalar halinde bölün',
      icon: ScissorsIcon,
      emoji: '✂️',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-300',
      acceptedFiles: '.pdf',
      action: 'PDF Böl',
      outputFormats: ['PDF']
    },
    {
      id: 'pdf-merge',
      title: 'PDF Birleştirme',
      description: 'Birden fazla PDF dosyasını tek dosyada birleştirin',
      icon: Square2StackIcon,
      emoji: '📚',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-300',
      acceptedFiles: '.pdf',
      action: 'PDF Birleştir',
      outputFormats: ['PDF']
    }
  ];

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: selectedTool === 'pdf-merge'
  });

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setFiles([]);
    setProcessedFiles([]);
    setError('');
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError('');

    const startTime = Date.now();

    try {
      let results: ConversionResult[] = [];
      const totalFileSize = files.reduce((total, file) => total + file.size, 0);

      if (selectedTool === 'pdf-to-text') {
        const text = await extractTextFromPDF(files[0]);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        results.push({
          name: files[0].name.replace('.pdf', '.txt'),
          url,
          size: blob.size,
          type: 'text/plain'
        });
      } else if (selectedTool === 'pdf-split') {
        results = await splitPDF(files[0]);
      } else if (selectedTool === 'pdf-merge') {
        const mergedResult = await mergePDFs(files);
        results = [mergedResult];
      } else if (selectedTool === 'pdf-to-images') {
        results = await convertPDFToImages(files[0], 'png', 0.9, 2.0);
      }

      setProcessedFiles(results);

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;
          const totalProcessedSize = results.reduce((total, result) => total + result.size, 0);

          await ActivityTracker.createActivity(user.uid, {
            type: 'pdf_convert',
            fileName: files.length > 1 ? `${files.length} dosya` : files[0].name,
            originalFileName: files.length > 1 ? `${files.length} dosya` : files[0].name,
            fileSize: totalFileSize,
            processedSize: totalProcessedSize,
            status: 'success',
            category: 'PDF',
            processingTime
          });
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'İşlem başarısız');
      
      // Track failed activity
      if (user && files.length > 0) {
        try {
          const processingTime = Date.now() - startTime;
          const totalFileSize = files.reduce((total, file) => total + file.size, 0);

          await ActivityTracker.createActivity(user.uid, {
            type: 'pdf_convert',
            fileName: files.length > 1 ? `${files.length} dosya` : files[0].name,
            originalFileName: files.length > 1 ? `${files.length} dosya` : files[0].name,
            fileSize: totalFileSize,
            status: 'error',
            category: 'PDF',
            processingTime
          });
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: ConversionResult) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ZIP Download Function - Download All Files as ZIP
  const downloadAllAsZip = async () => {
    if (processedFiles.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      const zip = new JSZip();
      const loadingPromises: Promise<void>[] = [];
      
      // Her dosyayı ZIP'e ekle
      processedFiles.forEach((file, index) => {
        const promise = fetch(file.url)
          .then(response => response.blob())
          .then(blob => {
            // Dosya ismini benzersiz yap (aynı isimde dosyalar varsa)
            let fileName = file.name;
            const existingFile = processedFiles.slice(0, index).find(f => f.name === file.name);
            if (existingFile) {
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
              const extension = file.name.split('.').pop();
              fileName = `${nameWithoutExt}_${index + 1}.${extension}`;
            }
            
            zip.file(fileName, blob);
          });
        
        loadingPromises.push(promise);
      });
      
      // Tüm dosyaların yüklenmesini bekle
      await Promise.all(loadingPromises);
      
      // ZIP dosyasını oluştur
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      // ZIP dosyasını indir
      const downloadLink = document.createElement('a');
      const zipUrl = URL.createObjectURL(zipBlob);
      downloadLink.href = zipUrl;
      downloadLink.download = `converted_files_${Date.now()}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Memory cleanup
      URL.revokeObjectURL(zipUrl);
      
      // Success analytics
      if (user) {
        try {
          await ActivityTracker.createActivity(user.uid, {
            type: 'pdf_convert',
            fileName: `converted_files_${Date.now()}.zip`,
            originalFileName: `${processedFiles.length} dosya toplu indirme`,
            fileSize: zipBlob.size,
            status: 'success',
            category: 'PDF',
            processingTime: 0
          });
        } catch (activityError) {
          console.error('ZIP download activity tracking error:', activityError);
        }
      }
      
    } catch (error) {
      console.error('ZIP download error:', error);
      setError('ZIP oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedToolInfo = conversionTools.find(t => t.id === selectedTool);

  return (
    <div className="min-h-screen bg-white page-transition">
      {/* Hero Section - Marketing Focus */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumb />
          
          <StructuredData 
            page="pdf-convert"
            type="howto"
          />

          <div className="text-center animate-fade-in">
            {/* Main Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black text-white mb-8 shadow-lg">
              <span className="text-4xl">🔄</span>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              PDF Dönüştürme
            </h1>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
              PDF dosyalarınızı <span className="font-semibold text-black">hızla</span> ve <span className="font-semibold text-black">kaliteli</span> şekilde 
              çeşitli formatlara dönüştürün. Tamamen <span className="font-semibold text-black">ücretsiz</span>!
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="flex items-center space-x-2 text-gray-700">
                <UserGroupIcon className="h-5 w-5" />
                <span className="font-medium">1M+ dönüştürme</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">4.9/5 puan</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="font-medium">Güvenli dönüştürme</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <BoltIcon className="h-5 w-5" />
                <span className="font-medium">Anında sonuç</span>
              </div>
            </div>

            {/* Format Support Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold text-gray-900">PDF</div>
                <div className="text-sm text-gray-600">Portable Document</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="font-semibold text-gray-900">JPG/PNG</div>
                <div className="text-sm text-gray-600">Yüksek kalite resim</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold text-gray-900">TXT</div>
                <div className="text-sm text-gray-600">Düz metin format</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold text-gray-900">Multi-PDF</div>
                <div className="text-sm text-gray-600">Böl/Birleştir</div>
              </div>
            </div>

            {/* Free Badge */}
            <div className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full text-lg font-medium">
              ✨ Ücretsiz - Sınırsız dönüştürme
            </div>
          </div>
        </div>
      </div>

      {/* Main Tool Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Tool Selection Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dönüştürme Aracını Seçin</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {conversionTools.map((tool, index) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`group p-6 rounded-2xl border-2 transition-all duration-300 apple-card-hover animate-slide-in ${
                  selectedTool === tool.id 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : `${tool.color} border-gray-200`
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{tool.emoji}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                  
                  {/* Output Formats */}
                  <div className="flex flex-wrap justify-center gap-1">
                    {tool.outputFormats.map((format) => (
                      <span key={format} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tool Interface */}
        {selectedTool && selectedToolInfo && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 animate-slide-in">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{selectedToolInfo.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedToolInfo.title}</h3>
              <p className="text-gray-600">{selectedToolInfo.description}</p>
            </div>

            {/* File Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium text-lg">Dosyaları buraya bırakın...</p>
              ) : (
                <div>
                  <p className="text-gray-900 font-medium text-lg mb-2">
                    {selectedTool === 'pdf-merge' ? 'PDF dosyalarını' : 'PDF dosyasını'} seçin veya sürükleyin
                  </p>
                  <p className="text-gray-500">
                    {selectedTool === 'pdf-merge' 
                      ? 'Birden fazla PDF dosyası seçebilirsiniz • Maksimum 10MB per dosya' 
                      : 'Maksimum 10MB • Yüksek kaliteli dönüştürme'}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Files Display */}
            {files.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Seçilen Dosyalar ({files.length})
                </h4>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="text-green-500">
                        <CheckCircleIcon className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process Button */}
            {files.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl apple-button-hover"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Dönüştürülüyor...
                    </div>
                  ) : (
                    <>
                      🚀 {selectedToolInfo.action}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {processedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-bounce-in">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Dönüştürme Tamamlandı!</h3>
              <p className="text-gray-700">Dosyalarınız başarıyla dönüştürüldü</p>
            </div>

            {/* Download All as ZIP Button - Only show if multiple files */}
            {processedFiles.length > 1 && (
              <div className="mb-6">
                <button
                  onClick={downloadAllAsZip}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl apple-button-hover"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      ZIP oluşturuluyor...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <ArchiveBoxIcon className="h-6 w-6" />
                      <span>📦 Tüm Dosyaları ZIP Olarak İndir ({processedFiles.length} dosya)</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {processedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <CloudArrowDownIcon className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    💾 İndir
                  </button>
                </div>
              ))}
            </div>

            {/* Signup Prompt for Non-users */}
            {!user && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center">
                  <h4 className="font-semibold text-blue-900 mb-2">📁 Dosyalarınızı Bulutta Saklayın</h4>
                  <p className="text-gray-600 mb-4">
                    Ücretsiz hesap oluşturun ve dönüştürdüğünüz dosyaları bulutta saklayın
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Ücretsiz Kayıt Ol
                  </button>
                </div>
              </div>
            )}

            {/* New Conversion Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setFiles([]);
                  setProcessedFiles([]);
                  setError('');
                  setSelectedTool('');
                }}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl text-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                🔄 Yeni Dönüştürme
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Neden QuickUtil PDF Dönüştürme?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Profesyonel kalitede PDF dönüştürme araçları ile dosyalarınızı istediğiniz formata çevirin
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <CpuChipIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">OCR Teknolojisi</h3>
                <p className="text-gray-700">Gelişmiş OCR ile taranmış PDF'lerden metin çıkarma</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Tüm Cihazlar</h3>
                <p className="text-gray-700">Mobil, tablet, bilgisayar uyumlu dönüştürme</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BoltIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Hızlı İşlem</h3>
                <p className="text-gray-700">Saniyeler içinde yüksek kaliteli dönüştürme</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Güvenli İşlem</h3>
                <p className="text-gray-700">Dosyalarınız işlem sonrası otomatik silinir</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Kullanıcılarımızın Deneyimi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">"PDF to JPG dönüştürme mükemmel kalitede. Çok hızlı!"</p>
              <p className="font-medium text-gray-900">— Zeynep A.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">"PDF birleştirme özelliği çok pratik. İş yerinde kullanıyorum."</p>
              <p className="font-medium text-gray-900">— Emre K.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">"OCR teknolojisi harika. Taranmış belgelerden metin çıkarıyor."</p>
              <p className="font-medium text-gray-900">— Ayşe D.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-black rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">PDF Dönüştürmeye Hemen Başlayın!</h3>
            <p className="text-gray-300 mb-6">Ücretsiz, güvenli ve hızlı PDF dönüştürme deneyimi</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors apple-button-hover"
            >
              🔄 Dönüştürmeye Başla
            </button>
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