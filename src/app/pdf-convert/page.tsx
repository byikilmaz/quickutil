'use client';
import { useState } from 'react';
import { 
  ArrowsRightLeftIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  ScissorsIcon, 
  Square2StackIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { 
  extractTextFromPDF, 
  splitPDF, 
  mergePDFs, 
  convertPDFToImages,
  ConversionResult 
} from '@/lib/pdfConvertUtils';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';

interface ConversionTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  acceptedFiles: string;
  action: string;
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
      id: 'pdf-to-text',
      title: 'PDF to Text',
      description: 'PDF dosyalarından metin çıkarın',
      icon: DocumentTextIcon,
      color: 'bg-blue-50 text-blue-600',
      acceptedFiles: '.pdf',
      action: 'Extract Text'
    },
    {
      id: 'pdf-to-images',
      title: 'PDF to Images',
      description: 'PDF sayfalarını resim formatına çevirin',
      icon: PhotoIcon,
      color: 'bg-green-50 text-green-600',
      acceptedFiles: '.pdf',
      action: 'Convert to Images'
    },
    {
      id: 'pdf-split',
      title: 'PDF Split',
      description: 'PDF\'yi sayfalara ayırın',
      icon: ScissorsIcon,
      color: 'bg-purple-50 text-purple-600',
      acceptedFiles: '.pdf',
      action: 'Split PDF'
    },
    {
      id: 'pdf-merge',
      title: 'PDF Merge',
      description: 'Birden fazla PDF\'yi birleştirin',
      icon: Square2StackIcon,
      color: 'bg-orange-50 text-orange-600',
      acceptedFiles: '.pdf',
      action: 'Merge PDFs'
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

  // PDF processing functions are now imported from pdfConvertUtils

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
        // PDF.js kullanarak gerçek PDF to Images dönüştürme
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
          console.log('PDF convert activity tracked successfully');
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'İşlem başarısız');
      
      // Track failed activity if user is logged in
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            PDF Dönüştürme Araçları
          </h1>
          <p className="text-lg text-gray-600">
            PDF dosyalarınızı farklı formatlara dönüştürün veya işleyin
          </p>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {conversionTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedTool === tool.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`p-3 rounded-lg w-12 h-12 mx-auto mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>

        {/* File Upload Area */}
        {selectedTool && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Dosyaları buraya bırakın...</p>
              ) : (
                <div>
                  <p className="text-gray-900 font-medium mb-2">
                    {selectedTool === 'pdf-merge' ? 'PDF dosyalarını' : 'PDF dosyasını'} seçin veya sürükleyin
                  </p>
                  <p className="text-gray-500 text-sm">
                    {selectedTool === 'pdf-merge' ? 'Birden fazla PDF dosyası seçebilirsiniz' : 'Maksimum 10MB'}
                  </p>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Seçilen Dosyalar:</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process Button */}
            {files.length > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <>
                      <ArrowsRightLeftIcon className="h-5 w-5" />
                      <span>
                        {conversionTools.find(t => t.id === selectedTool)?.action || 'Dönüştür'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {processedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dönüştürülen Dosyalar
            </h3>
            <div className="space-y-3">
              {processedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CloudArrowDownIcon className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    İndir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
} 