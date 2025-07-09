'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  ArrowDownTrayIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  PhotoIcon,
  DocumentTextIcon,
  ScissorsIcon,
  Square2StackIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import { 
  extractTextFromPDF, 
  splitPDF, 
  mergePDFs, 
  convertPDFToImages,
  ConversionResult 
} from '@/lib/pdfConvertUtils';
import JSZip from 'jszip';

interface ConversionResultDisplay {
  results: ConversionResult[];
  totalSize: number;
  convertedCount: number;
  processingTime: number;
  downloadUrls: { name: string; url: string; size: number }[];
}

// Server wrapper component to handle async params
export default async function PDFConvertPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFConvert locale={locale} />;
}

// Client component with direct locale prop
function PDFConvert({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResultDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  
  // Refs for auto-scroll
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Conversion tools configuration
  const conversionTools = [
    {
      id: 'pdf-to-images',
      title: 'PDF to Images',
      description: 'PDF sayfalarını yüksek kaliteli PNG/JPG formatına dönüştürün',
      icon: PhotoIcon,
      color: 'from-blue-500 to-cyan-500',
      multiple: false,
      formats: ['PNG', 'JPG']
    },
    {
      id: 'pdf-to-text',
      title: 'PDF to Text',
      description: 'PDF içeriğini düzenlenebilir metin formatına çıkarın',
      icon: DocumentTextIcon,
      color: 'from-green-500 to-emerald-500',
      multiple: false,
      formats: ['TXT']
    },
    {
      id: 'pdf-split',
      title: 'PDF Ayırma',
      description: 'PDF sayfalarını ayrı dosyalar halinde bölün',
      icon: ScissorsIcon,
      color: 'from-purple-500 to-violet-500',
      multiple: false,
      formats: ['PDF']
    },
    {
      id: 'pdf-merge',
      title: 'PDF Birleştirme',
      description: 'Birden fazla PDF dosyasını tek dosyada birleştirin',
      icon: Square2StackIcon,
      color: 'from-orange-500 to-red-500',
      multiple: true,
      formats: ['PDF']
    }
  ];

  // Auto-scroll to current step
  useEffect(() => {
    const refs = {
      upload: uploadRef,
      configure: configureRef,
      processing: processingRef,
      result: resultRef
    };
    
    const targetRef = refs[currentStep];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    if (!canUseFeature('pdf_convert')) {
      setError('Günlük PDF dönüştürme limitiniz doldu. Lütfen yarın tekrar deneyin.');
      return;
    }

    const tool = conversionTools.find(t => t.id === selectedTool);
    if (!tool) return;

    // File size validation (20MB limit)
    const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Dosya boyutu 20MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.');
      return;
    }

    // Multiple file validation
    if (!tool.multiple && files.length > 1) {
      setError('Bu araç için sadece tek dosya seçebilirsiniz.');
      return;
    }

    setSelectedFiles(files);
    setError(null);
    setCurrentStep('configure');
  };

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setSelectedFiles([]);
    setError(null);
    setCurrentStep('configure'); // Otomatik olarak configure adımına geç
  };

  // Process conversion
  const handleConvert = async () => {
    if (selectedFiles.length === 0 || !selectedTool) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Simulate processing steps
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    const startTime = Date.now();

    try {
      let results: ConversionResult[] = [];
      const totalFileSize = selectedFiles.reduce((total, file) => total + file.size, 0);

      // Process based on selected tool
      if (selectedTool === 'pdf-to-text') {
        const text = await extractTextFromPDF(selectedFiles[0]);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        results.push({
          name: selectedFiles[0].name.replace('.pdf', '.txt'),
          url,
          size: blob.size,
          type: 'text/plain'
        });
      } else if (selectedTool === 'pdf-split') {
        results = await splitPDF(selectedFiles[0]);
      } else if (selectedTool === 'pdf-merge') {
        const mergedResult = await mergePDFs(selectedFiles);
        results = [mergedResult];
      } else if (selectedTool === 'pdf-to-images') {
        results = await convertPDFToImages(selectedFiles[0], 'png', 0.9, 2.0);
      }

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Calculate results
      const totalProcessedSize = results.reduce((total, result) => total + result.size, 0);
      const processingTime = Date.now() - startTime;

      setConversionResult({
        results,
        totalSize: totalProcessedSize,
        convertedCount: results.length,
        processingTime,
        downloadUrls: results.map(r => ({ name: r.name, url: r.url, size: r.size }))
      });

      // Upload to storage if user is logged in
      if (user && results.length > 0) {
        try {
          // Convert first result to File for upload
          const response = await fetch(results[0].url);
          const blob = await response.blob();
          const file = new File([blob], results[0].name, { type: results[0].type });
          await uploadFile(file, 'pdf');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
        }
      }

      setCurrentStep('result');

    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'Dönüştürme sırasında hata oluştu');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  // Download all files as ZIP
  const handleDownloadAll = async () => {
    if (!conversionResult || conversionResult.results.length === 0) return;

    setIsDownloadingZip(true);
    
    try {
      const zip = new JSZip();
      
      // Add each file to ZIP
      for (const result of conversionResult.results) {
        try {
          const response = await fetch(result.url);
          const blob = await response.blob();
          zip.file(result.name, blob);
        } catch (err) {
          console.error(`Failed to add ${result.name} to ZIP:`, err);
        }
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quickutil-converted-files.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP creation error:', err);
      setError('ZIP oluşturulurken hata oluştu');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFiles([]);
    setSelectedTool('');
    setConversionResult(null);
    setError(null);
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <StructuredData 
        page="pdf-convert"
        type="tool"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb />

        {/* Step 1: Upload - Tool Selection */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="min-h-screen flex flex-col justify-center py-8">
            <div className="text-center mb-8 md:mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 md:mb-6">
                <SparklesIcon className="h-8 md:h-10 w-8 md:w-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
                AI PDF Dönüştürme
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                PDF dosyalarınızı yapay zeka destekli araçlarla istediğiniz formata dönüştürün
              </p>
            </div>

            {/* Tool Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              {conversionTools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={`group p-6 md:p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105 ${
                    selectedTool === tool.id ? 'border-purple-500 bg-purple-50/70 shadow-lg' : ''
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} mb-4`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4">{tool.description}</p>
                  
                  {/* Format badges */}
                  <div className="flex flex-wrap gap-2">
                    {tool.formats.map(format => (
                      <span key={format} className="px-2 md:px-3 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm rounded-full font-medium">
                        {format}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Next step - Remove this section */}
            {selectedTool && (
              <div className="text-center animate-bounce-in">
                <p className="text-purple-600 font-medium text-sm md:text-base">
                  ✨ {conversionTools.find(t => t.id === selectedTool)?.title} seçildi! Dosya yükleniyor...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure - File Upload */}
        {selectedTool && currentStep === 'configure' && (
          <div ref={configureRef} className="min-h-screen flex flex-col justify-center py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Tool Info - Left Side */}
              <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-200 h-fit">
                <div className="text-center">
                  {(() => {
                    const tool = conversionTools.find(t => t.id === selectedTool);
                    if (!tool) return null;
                    return (
                      <>
                        <div className={`inline-flex items-center justify-center w-12 md:w-16 h-12 md:h-16 rounded-xl bg-gradient-to-r ${tool.color} mb-4`}>
                          <tool.icon className="h-6 md:h-8 w-6 md:w-8 text-white" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{tool.title}</h2>
                        <p className="text-sm md:text-base text-gray-600 mb-4">{tool.description}</p>
                        
                        {/* Features */}
                        <div className="space-y-2 text-left">
                          <div className="flex items-center text-xs md:text-sm text-gray-600">
                            <CheckCircleIcon className="h-3 md:h-4 w-3 md:w-4 text-green-500 mr-2" />
                            <span>Yüksek kalite dönüştürme</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-600">
                            <CheckCircleIcon className="h-3 md:h-4 w-3 md:w-4 text-green-500 mr-2" />
                            <span>20MB'a kadar dosya</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-600">
                            <CheckCircleIcon className="h-3 md:h-4 w-3 md:w-4 text-green-500 mr-2" />
                            <span>Hızlı işleme süresi</span>
                          </div>
                          {tool.multiple && (
                            <div className="flex items-center text-xs md:text-sm text-gray-600">
                              <CheckCircleIcon className="h-3 md:h-4 w-3 md:w-4 text-green-500 mr-2" />
                              <span>Çoklu dosya desteği</span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* File Upload - Right Side */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 md:p-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Dosya Yükleme</h3>
                  
                  {!selectedFiles.length ? (
                    <div className="relative">
                      <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 md:p-16 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300">
                        <FileUpload
                          onFileSelect={(file) => {
                            // Handle both single file and file array
                            const files = Array.isArray(file) ? file : [file];
                            handleFileSelect(files);
                          }}
                          acceptedTypes={['application/pdf']}
                          maxSize={20 * 1024 * 1024}
                          multiple={conversionTools.find(t => t.id === selectedTool)?.multiple || false}
                          title=""
                          description=""
                        />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <CloudArrowUpIcon className="h-12 md:h-16 w-12 md:w-16 text-purple-500 mb-4" />
                        <div className="text-center px-4">
                          <p className="text-base md:text-lg font-medium text-gray-900 mb-2">
                            PDF dosyasını seç veya sürükle
                          </p>
                          <p className="text-sm md:text-base text-gray-500">
                            {conversionTools.find(t => t.id === selectedTool)?.multiple 
                              ? 'Birden fazla dosya seçebilirsiniz' 
                              : 'Tek dosya seçimi'} • Maksimum 20MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Selected Files */}
                      <div className="space-y-3 mb-4 md:mb-6">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <DocumentIcon className="h-6 md:h-8 w-6 md:w-8 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm md:text-base truncate max-w-48 md:max-w-none">{file.name}</p>
                                <p className="text-xs md:text-sm text-gray-600">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <CheckCircleIcon className="h-5 md:h-6 w-5 md:w-6 text-green-500" />
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={handleConvert}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 md:py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
                        >
                          ✨ Dönüştürmeyi Başlat
                        </button>
                        <button
                          onClick={() => setSelectedFiles([])}
                          className="px-4 md:px-6 py-3 md:py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                        >
                          <TrashIcon className="h-4 md:h-5 w-4 md:w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 'processing' && (
          <div ref={processingRef} className="min-h-screen flex flex-col justify-center px-4">
            <div className="text-center max-w-md mx-auto">
              
              {/* Processing Animation */}
              <div className="relative mb-6 md:mb-8">
                <div className="w-24 md:w-32 h-24 md:h-32 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-8 md:h-12 w-8 md:w-12 text-purple-600 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Processing Text */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                PDF dönüştürülüyor...
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
                Yapay zeka algoritmalarımız dosyanızı işliyor
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-3 md:mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 md:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">%{processingProgress} tamamlandı</p>

              {/* Processing Steps */}
              <div className="space-y-2 md:space-y-3 text-left">
                {[
                  '📄 PDF yapısı analiz ediliyor...',
                  '🤖 AI dönüştürme algoritması çalışıyor...',
                  '⚡ Yüksek kaliteli çıktı hazırlanıyor...'
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-xs md:text-sm text-gray-600">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-purple-500 rounded-full mr-2 md:mr-3 animate-pulse"></div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {currentStep === 'result' && conversionResult && (
          <div ref={resultRef} className="min-h-screen flex flex-col justify-center px-4 py-8">
            <div className="text-center max-w-2xl mx-auto">
              
              {/* Success Animation */}
              <div className="mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-20 md:w-24 h-20 md:h-24 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-10 md:h-12 w-10 md:w-12 text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Dönüştürme Tamamlandı! 🎉
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  {conversionResult.convertedCount} dosya başarıyla dönüştürüldü
                </p>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-purple-600">{conversionResult.convertedCount}</div>
                  <div className="text-xs md:text-sm text-gray-600">Dönüştürülen Dosya</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {(conversionResult.totalSize / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Toplam Boyut</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200 md:col-span-1 col-span-2">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    {(conversionResult.processingTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">İşlem Süresi</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {conversionResult.downloadUrls.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download={file.name}
                    className="flex items-center justify-between p-3 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <DocumentIcon className="h-6 md:h-8 w-6 md:w-8 text-purple-600" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm md:text-base truncate">{file.name}</p>
                        <p className="text-xs md:text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <ArrowDownTrayIcon className="h-4 md:h-5 w-4 md:w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200 ml-2" />
                  </a>
                ))}
              </div>

              {/* Download All Button */}
              {conversionResult.results.length > 1 && (
                <div className="mb-6 md:mb-8">
                  <button
                    onClick={handleDownloadAll}
                    disabled={isDownloadingZip}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isDownloadingZip ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>ZIP Hazırlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 md:h-5 w-4 md:w-5" />
                        <span>🗂️ Tümünü İndir (ZIP)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
                <button
                  onClick={handleReset}
                  className="px-6 md:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  🚀 Yeni Dönüştürme
                </button>
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-6 md:px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center text-sm md:text-base"
                >
                  <ArrowLeftIcon className="h-4 md:h-5 w-4 md:w-5 mr-2" />
                  Araç Değiştir
                </button>
              </div>

              {/* Other Tools Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 text-center">
                  Şu araca geçiş yap:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
                  <Link
                    href="/pdf-compress" 
                    className="flex flex-col items-center p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <DocumentIcon className="h-3 md:h-4 w-3 md:w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Sıkıştır</span>
                  </Link>
                  
                  <Link
                    href="/image-convert" 
                    className="flex flex-col items-center p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-3 md:h-4 w-3 md:w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Dönüştür</span>
                  </Link>

                  <Link
                    href="/image-compress" 
                    className="flex flex-col items-center p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-3 md:h-4 w-3 md:w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Sıkıştır</span>
                  </Link>

                  <Link
                    href="/image-crop" 
                    className="flex flex-col items-center p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <ScissorsIcon className="h-3 md:h-4 w-3 md:w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Kırp</span>
                  </Link>

                  <Link
                    href="/image-resize" 
                    className="flex flex-col items-center p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-3 md:h-4 w-3 md:w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Boyutlandır</span>
                  </Link>

                  <Link
                    href="/image-rotate" 
                    className="flex flex-col items-center p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-3 md:h-4 w-3 md:w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Döndür</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-300 text-red-700 px-6 py-3 rounded-lg shadow-lg z-50">
            <p className="font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 