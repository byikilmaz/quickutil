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
  DocumentTextIcon,
  PhotoIcon,
  ScissorsIcon,
  Square2StackIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import { extractTextFromPDF } from '@/lib/pdfConvertUtils';

interface ConversionResultDisplay {
  text: string;
  wordCount: number;
  charCount: number;
  processingTime: number;
  downloadUrl: string;
}

// Server wrapper component to handle async params
export default async function PDFToTextPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFToText locale={locale} />;
}

// Client component with direct locale prop
function PDFToText({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResultDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for auto-scroll
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
  const handleFileSelect = (file: File) => {
    if (!canUseFeature('pdf_convert')) {
      setError('Günlük PDF dönüştürme limitiniz doldu. Lütfen yarın tekrar deneyin.');
      return;
    }

    // File size validation (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setError('Dosya boyutu 20MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setCurrentStep('configure');
  };

  // Process conversion
  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Simulate processing steps
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => Math.min(prev + 15, 90));
    }, 200);

    const startTime = Date.now();

    try {
      const extractedText = await extractTextFromPDF(selectedFile);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Calculate text stats
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
      const charCount = extractedText.length;
      const processingTime = Date.now() - startTime;

      // Create downloadable text file
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(blob);

      setConversionResult({
        text: extractedText,
        wordCount,
        charCount,
        processingTime,
        downloadUrl
      });

      // Upload to storage if user is logged in
      if (user) {
        try {
          const textFileName = selectedFile.name.replace('.pdf', '.txt');
          const textFile = new File([blob], textFileName, { type: 'text/plain' });
          await uploadFile(textFile, 'document');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
        }
      }

      setCurrentStep('result');

    } catch (error) {
      console.error('Text extraction error:', error);
      setError(error instanceof Error ? error.message : 'Metin çıkarma sırasında hata oluştu');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setConversionResult(null);
    setError(null);
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <StructuredData 
        page="pdf-to-text"
        type="tool"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb />

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6">
                <DocumentTextIcon className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
                {locale === 'en' ? 'AI PDF to Text' :
                 locale === 'es' ? 'PDF a Texto con IA' :
                 locale === 'de' ? 'AI PDF zu Text' :
                 locale === 'fr' ? 'PDF vers Texte IA' :
                 'AI PDF to Metin'}
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                {locale === 'en' ? 'Extract text from PDF documents using advanced AI technology. Fast and accurate text extraction.' :
                 locale === 'es' ? 'Extrae texto de documentos PDF usando tecnología IA avanzada. Extracción de texto rápida y precisa.' :
                 locale === 'de' ? 'Extrahieren Sie Text aus PDF-Dokumenten mit fortschrittlicher KI-Technologie. Schnelle und genaue Textextraktion.' :
                 locale === 'fr' ? 'Extrayez le texte des documents PDF avec une technologie IA avancée. Extraction de texte rapide et précise.' :
                 'PDF belgelerinden gelişmiş yapay zeka teknolojisi ile metin çıkarın'}
              </p>
            </div>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="border-2 border-dashed border-green-300 rounded-2xl p-16 text-center hover:border-green-400 hover:bg-green-50/30 transition-all duration-300">
                  <FileUpload
                    onFileSelect={(file) => {
                      if (Array.isArray(file)) {
                        handleFileSelect(file[0]);
                      } else {
                        handleFileSelect(file);
                      }
                    }}
                    acceptedTypes={['application/pdf']}
                    maxSize={20 * 1024 * 1024}
                    title=""
                    description=""
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <CloudArrowUpIcon className="h-16 w-16 text-green-500 mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      PDF dosyasını seç veya sürükle
                    </p>
                    <p className="text-gray-500">
                      Maksimum 20MB • AI destekli metin çıkarma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {currentStep === 'configure' && selectedFile && (
          <div ref={configureRef} className="min-h-screen flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* File Info - Left Side */}
              <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 h-fit">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF to Text</h2>
                  <p className="text-gray-600">AI destekli metin çıkarma</p>
                </div>

                {/* Selected File */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>OCR teknoloji desteği</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Düzenlenebilir metin çıktısı</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Yüksek doğruluk oranı</span>
                  </div>
                </div>
              </div>

              {/* Info - Right Side */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Metin Çıkarma Bilgileri</h3>
                  
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl mb-2">🤖</div>
                      <h4 className="font-semibold text-gray-900 mb-1">AI Teknolojisi</h4>
                      <p className="text-sm text-gray-600">Gelişmiş OCR ile taranmış belgelerden bile metin çıkarır</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl mb-2">📝</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Format Desteği</h4>
                      <p className="text-sm text-gray-600">Normal PDF'ler ve taranmış belgeler desteklenir</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-2xl mb-2">⚡</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Hızlı İşlem</h4>
                      <p className="text-sm text-gray-600">Saniyeler içinde düzenlenebilir metin elde edin</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="text-2xl mb-2">🔍</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Yüksek Doğruluk</h4>
                      <p className="text-sm text-gray-600">%99+ doğruluk oranı ile güvenilir sonuçlar</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleConvert}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      🤖 Metni Çıkar
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="px-6 py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 'processing' && (
          <div ref={processingRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center max-w-md mx-auto">
              
              {/* Processing Animation */}
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="h-12 w-12 text-green-600 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Processing Text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Metin çıkarılıyor...
              </h2>
              <p className="text-gray-600 mb-8">
                OCR teknolojimiz PDF içeriğini analiz ediyor
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">%{processingProgress} tamamlandı</p>

              {/* Processing Steps */}
              <div className="mt-8 space-y-3 text-left">
                {[
                  '📄 PDF içeriği analiz ediliyor...',
                  '🔍 Metin blokları tespit ediliyor...',
                  '📝 Düzenlenebilir format hazırlanıyor...'
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {currentStep === 'result' && conversionResult && (
          <div ref={resultRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center max-w-4xl mx-auto">
              
              {/* Success Animation */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Metin Çıkarma Tamamlandı! 📝
                </h2>
                <p className="text-gray-600">
                  {conversionResult.wordCount} kelime başarıyla çıkarıldı
                </p>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{conversionResult.wordCount}</div>
                  <div className="text-sm text-gray-600">Kelime Sayısı</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{conversionResult.charCount}</div>
                  <div className="text-sm text-gray-600">Karakter Sayısı</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 md:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {(conversionResult.processingTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">İşlem Süresi</div>
                </div>
              </div>

              {/* Text Preview */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Metin Önizleme</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto text-left">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                    {conversionResult.text.substring(0, 500)}
                    {conversionResult.text.length > 500 && '...'}
                  </pre>
                </div>
              </div>

              {/* Download Button */}
              <div className="mb-8">
                <a
                  href={conversionResult.downloadUrl}
                  download={selectedFile?.name.replace('.pdf', '.txt')}
                  className="inline-flex items-center space-x-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                  <span>📄 Metni İndir (.txt)</span>
                </a>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Yeni Dönüştürme
                </button>
                <Link
                  href="/pdf-convert"
                  className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Diğer Araçlar
                </Link>
              </div>

              {/* Other Tools Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
                  Şu araca geçiş yap:
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
                  <Link
                    href="/pdf-compress" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Sıkıştır</span>
                  </Link>
                  
                  <Link
                    href="/pdf-to-images" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF to Images</span>
                  </Link>

                  <Link
                    href="/pdf-split" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <ScissorsIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Ayır</span>
                  </Link>

                  <Link
                    href="/pdf-merge" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <Square2StackIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Birleştir</span>
                  </Link>

                  <Link
                    href="/image-compress" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Sıkıştır</span>
                  </Link>

                  <Link
                    href="/image-resize" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Boyutlandır</span>
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