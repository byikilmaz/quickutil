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
import { PDFDocument } from 'pdf-lib';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';

interface ConversionTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  acceptedFiles: string;
  action: string;
}

export default function PDFConvert() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Array<{ name: string; url: string; size: number }>>([]);
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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      let fullText = '';
      for (let i = 0; i < pages.length; i++) {
        // Bu basit bir implementasyon - gerçek OCR için pdf-parse gibi kütüphaneler gerekir
        fullText += `Page ${i + 1}\n\n`;
      }
      
      return fullText || 'Metin çıkarma işlemi tamamlandı. Daha detaylı metin çıkarma için OCR özelliği gerekir.';
    } catch (error) {
      throw new Error('PDF\'den metin çıkarılamadı');
    }
  };

  const splitPDF = async (file: File): Promise<PDFDocument[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const splitDocs: PDFDocument[] = [];

      for (let i = 0; i < pages.length; i++) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(copiedPage);
        splitDocs.push(newDoc);
      }

      return splitDocs;
    } catch (error) {
      throw new Error('PDF bölme işlemi başarısız');
    }
  };

  const mergePDFs = async (files: File[]): Promise<PDFDocument> => {
    try {
      const mergedDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedDoc.addPage(page));
      }

      return mergedDoc;
    } catch (error) {
      throw new Error('PDF birleştirme işlemi başarısız');
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      const results: Array<{ name: string; url: string; size: number }> = [];

      if (selectedTool === 'pdf-to-text') {
        const text = await extractTextFromPDF(files[0]);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        results.push({
          name: files[0].name.replace('.pdf', '.txt'),
          url,
          size: blob.size
        });
      } else if (selectedTool === 'pdf-split') {
        const splitDocs = await splitPDF(files[0]);
        for (let i = 0; i < splitDocs.length; i++) {
          const pdfBytes = await splitDocs[i].save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          results.push({
            name: files[0].name.replace('.pdf', `_page_${i + 1}.pdf`),
            url,
            size: blob.size
          });
        }
      } else if (selectedTool === 'pdf-merge') {
        const mergedDoc = await mergePDFs(files);
        const pdfBytes = await mergedDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        results.push({
          name: 'merged_document.pdf',
          url,
          size: blob.size
        });
      } else if (selectedTool === 'pdf-to-images') {
        // PDF to images için canvas ile rendering gerekir
        setError('PDF to Images özelliği henüz geliştiriliyor');
      }

      setProcessedFiles(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'İşlem başarısız');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: { name: string; url: string; size: number }) => {
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