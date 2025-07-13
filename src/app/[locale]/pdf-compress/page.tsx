'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpTrayIcon, DocumentCheckIcon, SparklesIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { getTranslations } from '@/lib/translations';
import { compressPDF, type CompressionResult } from '@/lib/pdfUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';

interface CompressionResultDisplay {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  downloadUrl: string;
}

export default async function PDFCompressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFCompress locale={locale} />;
}

function PDFCompress({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Enhanced language detection logging
  useEffect(() => {
    console.log('📍 PDF Compress Page - AI Auto Mode:', {
      currentLocale: locale,
      autoCompressionEnabled: true,
      timestamp: new Date().toISOString()
    });
  }, [locale]);
  
  // Refs for auto-scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResultDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Auto-scroll to current step
  useEffect(() => {
    const scrollToStep = () => {
      let targetRef;
      switch (currentStep) {
        case 'upload':
          targetRef = uploadRef;
          break;
        case 'processing':
          targetRef = processingRef;
          break;
        case 'result':
          targetRef = resultRef;
          break;
      }
      
      if (targetRef?.current) {
        setTimeout(() => {
          targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    scrollToStep();
  }, [currentStep]);

  // Handle file selection with auto compression
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    setError(null);
    
    // File size limit
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError(getText('errors.pdfCompress.fileSizeLimit', 'Dosya boyutu 20MB dan büyük olamaz'));
      return;
    }
    
    setSelectedFile(file);
    
    // Auto-start compression with AI optimization
    setTimeout(async () => {
      await handleCompress(file);
    }, 800);
  };

  // Handle compression with AI auto mode
  const handleCompress = async (file?: File) => {
    const fileToCompress = file || selectedFile;
    if (!fileToCompress) return;
    
    setIsCompressing(true);
    setError(null);
    setCurrentStep('processing');
    setCompressionProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 80) return 80; // Stop at 80% until server responds
          return prev + 15;
        });
      }, 500);

      // Auto AI compression with optimized quality
      const compressionQuality = 'medium' as const; // AI optimized quality

      console.log('🚀 QuickUtil AI PDF Compression v3.0 - Auto Mode');
      console.log('📁 File:', fileToCompress.name, 'AI Quality: optimized');
      
      // Call PDF Compression API
      const result: CompressionResult = await compressPDF(fileToCompress, {
        quality: compressionQuality,
        fileName: fileToCompress.name
      });
      
      // Clear progress and set to 100%
      clearInterval(progressInterval);
      setCompressionProgress(100);
      
      // Set result data
      const compressionRatio = ((result.originalSize - result.compressedSize) / result.originalSize) * 100;
      
      const resultData: CompressionResultDisplay = {
        compressedBlob: result.compressedBlob,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio,
        processingTime: result.processingTime || 0,
        downloadUrl: result.downloadUrl || URL.createObjectURL(result.compressedBlob)
      };
      
      setCompressionResult(resultData);
      setCurrentStep('result');
      
    } catch (error: any) {
      console.error('❌ PDF compression failed:', error);
      setError(getText('errors.pdfCompress.compressionFailed', 'Sıkıştırma sırasında hata oluştu. Lütfen tekrar deneyin.'));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setCompressionResult(null);
    setError(null);
    setCompressionProgress(0);
    setIsCompressing(false);
  };

  const getText = (key: string, fallback: string) => {
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || fallback;
    } catch {
      return fallback;
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        handleFileSelect(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6">
            <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium text-sm">
              {getText('pdfCompress.aiCompressionBadge', 'AI PDF Sıkıştırma')}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {getText('pdfCompress.title', 'AI PDF Sıkıştırma')}
          </h1>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {getText('pdfCompress.subtitle', 'Yapay zeka ile PDF dosyalarinizi optimize edin. En iyi kalite ve boyut dengesini otomatik olarak bulur.')}
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {/* Step 1: Upload */}
            <div className={`flex items-center ${currentStep === 'upload' ? 'text-purple-600' : currentStep === 'processing' || currentStep === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'upload' ? 'border-purple-600 bg-purple-50' : currentStep === 'processing' || currentStep === 'result' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {currentStep === 'processing' || currentStep === 'result' ? (
                  <DocumentCheckIcon className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">1</span>
                )}
              </div>
              <span className="ml-3 font-medium">
                {getText('pdfCompress.step1', 'Dosya Yükle')}
              </span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep === 'processing' || currentStep === 'result' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            {/* Step 2: Processing */}
            <div className={`flex items-center ${currentStep === 'processing' ? 'text-purple-600' : currentStep === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'processing' ? 'border-purple-600 bg-purple-50' : currentStep === 'result' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {currentStep === 'result' ? (
                  <DocumentCheckIcon className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">2</span>
                )}
              </div>
              <span className="ml-3 font-medium">
                {getText('pdfCompress.step2', 'AI Sıkıştırma')}
              </span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep === 'result' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            {/* Step 3: Result */}
            <div className={`flex items-center ${currentStep === 'result' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'result' ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`}>
                <span className="font-semibold">3</span>
              </div>
              <span className="ml-3 font-medium">
                {getText('pdfCompress.step3', 'İndir')}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div 
                {...getRootProps()} 
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-purple-500 bg-purple-50 scale-105' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                }`}
              >
                <input {...getInputProps()} />
                
                {/* Upload Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <ArrowUpTrayIcon className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {getText('pdfCompress.uploadTitle', 'PDF Dosyanizi Surukleyin')}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg">
                  {getText('pdfCompress.uploadDesc', 'veya tiklayarak dosya secin')}
                </p>
                
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  {getText('pdfCompress.selectFile', 'Dosya Sec')}
                </button>
                
                <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center">
                    <DocumentCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                    {getText('pdfCompress.maxFileSizeText', 'Maksimum 20MB PDF dosyasi')}
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                    {getText('pdfCompress.aiOptimized', 'AI Optimize Edilmis')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <div ref={processingRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 text-center">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                  <SparklesIcon className="h-12 w-12 text-purple-600 animate-pulse" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {getText('pdfCompress.processingTitle', 'AI Sıkıştırma Devam Ediyor')}
                </h3>
                
                <p className="text-gray-600 text-lg">
                  {getText('pdfCompress.processingDesc', 'Yapay zeka dosyanızı optimize ediyor...')}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
              
              <p className="text-purple-600 font-semibold text-lg">
                %{compressionProgress}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {currentStep === 'result' && compressionResult && (
          <div ref={resultRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <DocumentCheckIcon className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {getText('pdfCompress.successTitle', 'Sıkıştırma Tamamlandı!')}
                </h3>
                
                <p className="text-gray-600 text-lg">
                  {getText('pdfCompress.successDesc', 'PDF dosyanız başarıyla optimize edildi.')}
                </p>
              </div>
              
              {/* Compression Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {getText('pdfCompress.originalSize', 'Orijinal Boyut')}
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {(compressionResult.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {getText('pdfCompress.compressedSize', 'Sıkıştırılmış Boyut')}
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(compressionResult.compressedSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {getText('pdfCompress.compressionRatio', 'Sıkıştırma Oranı')}
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    %{compressionResult.compressionRatio.toFixed(1)}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={compressionResult.downloadUrl}
                  download={selectedFile?.name?.replace('.pdf', '_compressed.pdf')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  {getText('pdfCompress.downloadCompressed', 'Sıkıştırılmış PDF İndir')}
                </a>
                
                <button
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {getText('pdfCompress.compressAnother', 'Başka Dosya Sıkıştır')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 text-red-600 hover:text-red-800 font-medium"
            >
              {getText('common.dismiss', 'Kapat')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 