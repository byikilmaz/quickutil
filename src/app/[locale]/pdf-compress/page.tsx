'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  DocumentArrowDownIcon, 
  ArrowUpTrayIcon, 
  InformationCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckCircleIcon,
  UserGroupIcon,
  StarIcon,
  CpuChipIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  ArrowsUpDownIcon,
  ClockIcon,
  CloudArrowUpIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import BatchFileUpload, { BatchFile } from '@/components/BatchFileUpload';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  compressPDF, 
  compressPDFWithAI,
  analyzePDF,
  calculateCompressionRatio,
  formatFileSize 
} from '@/lib/pdfUtils';
import { 
  aiEngine, 
  AIProcessingResult, 
  SmartPreset,
  UserPreferences
} from '@/lib/ai/aiEngine';
import { usePDFWorker, arrayBufferToFile } from '@/hooks/usePDFWorker';
import JSZip from 'jszip';
import { useTranslations, getTranslations } from '@/lib/translations';
import { useParams } from 'next/navigation';

interface PDFFile extends BatchFile {
  compressionSettings: {
    level: 'light' | 'medium' | 'high';
    useAI: boolean;
    selectedPreset?: SmartPreset;
  };
  analysis?: {
    pageCount: number;
    fileSize: string;
    hasImages: boolean;
    hasText: boolean;
    isEncrypted: boolean;
  };
  aiResult?: AIProcessingResult;
  compressionResult?: {
    originalSize: number;
    compressedSize: number;
    savedBytes: number;
    savedPercentage: number;
    storageDownloadURL?: string;
  };
}

export default function PDFCompress() {
  const { user } = useAuth();
  const { uploadFile: uploadToStorage } = useStorage();
  const { checkFileSize, getMaxFileSize } = useQuota();
  const { compressFile: compressWithWorker, isWorkerReady } = usePDFWorker();
  const params = useParams();
  const locale = params?.locale as string || 'tr';
  const t = useTranslations('pdfCompress', locale);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [globalSettings, setGlobalSettings] = useState({
    level: 'medium' as 'light' | 'medium' | 'high',
    useAI: true,
    applyToAll: false
  });

  const compressionLevels = {
    light: { ratio: 0.9, label: t('light'), description: t('lightDesc'), icon: '📄' },
    medium: { ratio: 0.7, label: t('medium'), description: t('mediumDesc'), icon: '📋' },
    high: { ratio: 0.5, label: t('high'), description: t('highDesc'), icon: '📰' },
  };

  // Dosya ekleme handler'ı
  const handleFilesSelect = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(t('error.onlyPDF') || 'Only PDF files are supported');
        return false;
      }
      
      if (!checkFileSize(file.size)) {
        setError(t('error.fileSizeLimit') || `File size must not exceed ${getMaxFileSize()}MB`);
        return false;
      }
      
      return true;
    });

    const newPdfFiles: PDFFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      compressionSettings: {
        level: globalSettings.level,
        useAI: globalSettings.useAI
      }
    }));

    setPdfFiles(prev => [...prev, ...newPdfFiles]);

    // Auto-start AI analysis for new files if AI is enabled
    if (globalSettings.useAI) {
      setTimeout(() => {
        newPdfFiles.forEach(pdfFile => {
          analyzeFileWithAI(pdfFile.id);
        });
      }, 500); // Small delay to ensure state is updated
    }
    setError('');

    // Her dosya için otomatik analiz yap
    if (globalSettings.useAI) {
      newPdfFiles.forEach(pdfFile => {
        analyzeFileWithAI(pdfFile.id);
      });
    }
  };

  // AI analizi
  const analyzeFileWithAI = async (fileId: string) => {
    const fileIndex = pdfFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    try {
      const result = await aiEngine.processFile(pdfFiles[fileIndex].file, { priority: 'balanced' });
      
      setPdfFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              aiResult: result,
              compressionSettings: {
                ...file.compressionSettings,
                selectedPreset: result.recommendedPreset.preset
              }
            }
          : file
      ));
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  };

  // Dosya kaldırma
  const handleFileRemove = (fileId: string) => {
    setPdfFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Batch işlem başlatma
  const handleBatchStart = async () => {
    if (pdfFiles.length === 0) return;

    setIsProcessing(true);
    setError('');

    for (const pdfFile of pdfFiles) {
      if (pdfFile.status === 'completed') continue;

      // Dosyayı işleniyor olarak işaretle
      setPdfFiles(prev => prev.map(file => 
        file.id === pdfFile.id 
          ? { ...file, status: 'processing', progress: 0 }
          : file
      ));

      try {
        const startTime = Date.now();
        let compressedFile: File;

        // Web Worker ile sıkıştırma (daha performanslı)
        if (isWorkerReady) {
          const result = await compressWithWorker(
            pdfFile.file,
            {
              compressionLevel: pdfFile.compressionSettings.level,
              removeMetadata: true,
              optimizeStructure: true
            },
            // Progress callback
            (progressUpdate) => {
              setPdfFiles(prev => prev.map(file => 
                file.id === pdfFile.id 
                  ? { ...file, progress: progressUpdate.progress }
                  : file
              ));
            }
          );

          if (result.success && result.compressedBuffer) {
            compressedFile = arrayBufferToFile(
              result.compressedBuffer,
              pdfFile.file.name,
              'application/pdf'
            );
          } else {
            throw new Error(result.error || 'Web Worker compression failed');
          }
        } else {
          // Fallback: Ana thread'de sıkıştırma
          const progressInterval = setInterval(() => {
            setPdfFiles(prev => prev.map(file => 
              file.id === pdfFile.id 
                ? { ...file, progress: Math.min(file.progress + 10, 90) }
                : file
            ));
          }, 200);

          if (pdfFile.compressionSettings.useAI && pdfFile.compressionSettings.selectedPreset) {
            compressedFile = await compressPDFWithAI(pdfFile.file, pdfFile.compressionSettings.selectedPreset.settings);
          } else {
            const ratio = compressionLevels[pdfFile.compressionSettings.level].ratio;
            compressedFile = await compressPDF(pdfFile.file, ratio);
          }

          clearInterval(progressInterval);
        }

        // Firebase Storage'a yükleme (eğer kullanıcı giriş yaptıysa)
        let storageDownloadURL: string | undefined;
        if (user && uploadToStorage) {
          try {
            const compressedFileName = `compressed_${pdfFile.file.name}`;
            const renamedCompressed = new File([compressedFile], compressedFileName, {
              type: 'application/pdf',
              lastModified: Date.now(),
            });
            
            const uploadResult = await uploadToStorage(renamedCompressed, 'pdf', compressedFileName);
            storageDownloadURL = uploadResult.downloadURL;
          } catch (uploadError) {
            console.error('Firebase Storage upload failed:', uploadError);
          }
        }

        // Sonuçları hesapla
        const originalSize = pdfFile.file.size;
        const compressedSize = compressedFile.size;
        const savedBytes = originalSize - compressedSize;
        const savedPercentage = calculateCompressionRatio(originalSize, compressedSize);
        const processingTime = Date.now() - startTime;

        const compressionResult = {
          originalSize,
          compressedSize,
          savedBytes,
          savedPercentage,
          storageDownloadURL
        };

        // Dosyayı tamamlandı olarak işaretle
        setPdfFiles(prev => prev.map(file => 
          file.id === pdfFile.id 
            ? { 
                ...file, 
                status: 'completed', 
                progress: 100,
                result: {
                  file: compressedFile,
                  size: compressedFile.size,
                  type: 'application/pdf'
                },
                compressionResult,
                processingTime
              }
            : file
        ));

        // Activity tracking
        if (user) {
          try {
            await ActivityTracker.createActivity(user.uid, {
              type: 'pdf_compress',
              fileName: pdfFile.file.name,
              originalFileName: pdfFile.file.name,
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

      } catch (error) {
        console.error('Compression failed:', error);
        
        setPdfFiles(prev => prev.map(file => 
          file.id === pdfFile.id 
            ? { 
                ...file, 
                status: 'error', 
                progress: 0,
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
              }
            : file
        ));

        // Failed activity tracking
        if (user) {
          try {
            await ActivityTracker.createActivity(user.uid, {
              type: 'pdf_compress',
              fileName: pdfFile.file.name,
              originalFileName: pdfFile.file.name,
              fileSize: pdfFile.file.size,
              status: 'error',
              category: 'PDF',
              errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
          } catch (activityError) {
            console.error('Failed activity tracking failed:', activityError);
          }
        }
      }
    }

    setIsProcessing(false);
  };

  // Batch işlem durdurma
  const handleBatchPause = () => {
    setIsProcessing(false);
    setPdfFiles(prev => prev.map(file => 
      file.status === 'processing' 
        ? { ...file, status: 'pending', progress: 0 }
        : file
    ));
  };

  // Tümünü temizle
  const handleBatchClear = () => {
    setPdfFiles([]);
    setError('');
  };

  // Dosya indirme
  const downloadFile = (file: File, filename?: string) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tüm dosyaları indirme (ZIP olarak)
  const downloadAllCompressed = async () => {
    const completedFiles = pdfFiles.filter(file => file.status === 'completed' && file.result?.file);
    
    if (completedFiles.length === 0) {
      return;
    }
    
    if (completedFiles.length === 1) {
      // Tek dosya varsa normal indirme
      const file = completedFiles[0];
      if (file.result?.file) {
        downloadFile(file.result.file, `compressed_${file.file.name}`);
      }
      return;
    }
    
    try {
      // Birden fazla dosya varsa ZIP oluştur
      const zip = new JSZip();
      
      // Her dosyayı ZIP'e ekle
      completedFiles.forEach(file => {
        if (file.result?.file) {
          const fileName = `compressed_${file.file.name}`;
          zip.file(fileName, file.result.file);
        }
      });
      
      // ZIP dosyasını oluştur ve indir
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const currentDate = new Date().toISOString().split('T')[0];
      const zipFileName = `compressed-pdfs-${currentDate}.zip`;
      
      // ZIP dosyasını indir
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('ZIP oluşturma hatası:', error);
      setError('ZIP dosyası oluşturulurken hata oluştu');
    }
  };

  // Global ayarları dosyalara uygula
  const applyGlobalSettings = () => {
    setPdfFiles(prev => prev.map(file => ({
      ...file,
      compressionSettings: {
        ...file.compressionSettings,
        level: globalSettings.level,
        useAI: globalSettings.useAI
      }
    })));

    // AI açıksa yeniden analiz yap
    if (globalSettings.useAI) {
      pdfFiles.forEach(file => {
        if (!file.aiResult) {
          analyzeFileWithAI(file.id);
        }
      });
    }
  };

  // İstatistikler
  const stats = {
    total: pdfFiles.length,
    completed: pdfFiles.filter(f => f.status === 'completed').length,
    processing: pdfFiles.filter(f => f.status === 'processing').length,
    errors: pdfFiles.filter(f => f.status === 'error').length,
    pending: pdfFiles.filter(f => f.status === 'pending').length,
    totalOriginalSize: pdfFiles.reduce((sum, f) => sum + f.file.size, 0),
    totalCompressedSize: pdfFiles.reduce((sum, f) => {
      return sum + (f.compressionResult?.compressedSize || 0);
    }, 0)
  };

  const overallSavings = stats.totalOriginalSize > 0 
    ? ((stats.totalOriginalSize - stats.totalCompressedSize) / stats.totalOriginalSize) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-white page-transition">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumb />
          
          <StructuredData 
            page="pdf-compress"
            type="howto"
          />

          <div className="text-center animate-fade-in">
            {/* Main Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black text-white mb-8 shadow-lg">
              <DocumentDuplicateIcon className="h-12 w-12" />
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
              {t('subtitle')}
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="flex items-center space-x-2 text-gray-700">
                <UserGroupIcon className="h-5 w-5" />
                <span className="font-medium">{t('trustSignals.users')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{t('trustSignals.rating')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="font-medium">{t('trustSignals.ssl')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <BoltIcon className="h-5 w-5" />
                <span className="font-medium">{t('trustSignals.batch')}</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <DocumentDuplicateIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('features.batchTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('features.batchDesc')}</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <CpuChipIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('features.aiTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('features.aiDesc')}</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <DocumentArrowDownIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('zipDownload')}</h3>
                <p className="text-gray-700 text-sm">{t('batchZipFeature')}</p>
              </div>
            </div>

            {/* Free Badge */}
            <div className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full text-lg font-medium">
              ✨ {t('freeBadge').replace('{size}', getMaxFileSize().toString())}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tool Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Global Settings Panel */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-purple-600 p-3 rounded-lg mr-4">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  🎛️ {t('globalSettings')}
                </h3>
                <p className="text-gray-600">
                  {t('globalSettingsDesc')}
                </p>
                {/* Web Worker Status */}
                <div className="mt-2 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isWorkerReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs text-gray-600">
                    {isWorkerReady ? t('workerStatus.ready') : t('workerStatus.loading')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Toggle */}
            <div className="bg-white/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <CpuChipIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-gray-900">{t('aiMode')}</span>
                </div>
                <button
                  onClick={() => setGlobalSettings(prev => ({ ...prev, useAI: !prev.useAI }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    globalSettings.useAI ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`${
                      globalSettings.useAI ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {globalSettings.useAI 
                  ? t('aiModeDesc.enabled')
                  : t('aiModeDesc.disabled')
                }
              </p>
            </div>

            {/* Compression Level */}
            <div className="bg-white/60 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                📊 {t('compressionLevel')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(compressionLevels).map(([level, config]) => (
                  <label
                    key={level}
                    className={`cursor-pointer p-2 border-2 rounded-lg transition-all duration-200 text-center ${
                      globalSettings.level === level
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="globalCompressionLevel"
                      value={level}
                      checked={globalSettings.level === level}
                      onChange={(e) => setGlobalSettings(prev => ({ 
                        ...prev, 
                        level: e.target.value as 'light' | 'medium' | 'high' 
                      }))}
                      className="sr-only"
                    />
                    <div className="text-lg mb-1">{config.icon}</div>
                    <div className="text-xs font-medium text-gray-900">{config.label.split(' ')[0]}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Apply to All Button */}
          {pdfFiles.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={applyGlobalSettings}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🔄 {t('applyToAll')}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <InformationCircleIcon className="h-6 w-6 mr-3" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* iLovePDF Style File Upload Area */}
        {pdfFiles.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
            <div 
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                handleFilesSelect(files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelect(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />
              
              <div className="space-y-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-red-200 transition-colors">
                  <DocumentDuplicateIcon className="h-12 w-12 text-red-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('uploadTitle')}</h3>
                  <p className="text-gray-600 mb-6">{t('uploadDescription')}</p>
                  
                  <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>{t('uploadTitle')}</span>
                  </button>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• {t('maxFileSize').replace('{size}', getMaxFileSize().toString())}</p>
                  <p>• {t('maxFiles')}</p>
                  <p>• {t('aiCompressionZip')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Processing Controls */}
        {pdfFiles.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <DocumentDuplicateIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t('filesSelected').replace('{count}', pdfFiles.length.toString())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('totalSize').replace('{size}', formatFileSize(stats.totalOriginalSize))}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {!isProcessing ? (
                  <>
                    <button
                      onClick={handleBatchStart}
                      disabled={pdfFiles.length === 0}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>{t('startCompression')}</span>
                    </button>
                    <button
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
{t('moreFiles')}
                    </button>
                    <button
                      onClick={handleBatchClear}
                      className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg transition-colors"
                    >
{t('clear')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBatchPause}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <PauseIcon className="w-4 h-4" />
<span>{t('stop')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File Processing Area - iLovePDF Style */}
        {pdfFiles.length > 0 && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold text-gray-900">{t('progress.title')}</h3>
                                  <div className="text-sm text-gray-600">
                    {t('progress.completed').replace('{completed}', stats.completed.toString()).replace('{total}', stats.total.toString())}
                  </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-600">{t('totalFiles')}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-green-600">{t('completed')}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{formatFileSize(stats.totalOriginalSize)}</div>
                  <div className="text-sm text-yellow-600">{t('originalSize')}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {overallSavings > 0 ? `${overallSavings.toFixed(1)}%` : '-%'}
                  </div>
                  <div className="text-sm text-purple-600">{t('totalSavings')}</div>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* File Cards - iLovePDF Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pdfFiles.map((pdfFile) => (
                <div
                  key={pdfFile.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`h-2 w-full ${
                    pdfFile.status === 'completed' ? 'bg-green-500' :
                    pdfFile.status === 'error' ? 'bg-red-500' :
                    pdfFile.status === 'processing' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}>
                    {pdfFile.status === 'processing' && (
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${pdfFile.progress}%` }}
                      ></div>
                    )}
                  </div>

                  {/* File Content */}
                  <div className="p-6">
                    {/* File Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DocumentDuplicateIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {pdfFile.file.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(pdfFile.file.size)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex-shrink-0 ml-3">
                        {pdfFile.status === 'completed' ? (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          </div>
                        ) : pdfFile.status === 'error' ? (
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                          </div>
                        ) : pdfFile.status === 'processing' ? (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <ArrowsUpDownIcon className="h-5 w-5 text-blue-600 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <ClockIcon className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced AI Analysis Results */}
                    {pdfFile.aiResult && pdfFile.compressionSettings.useAI && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-full">
                              <CpuChipIcon className="h-4 w-4 text-white" />
                            </div>
<span className="text-sm font-semibold text-purple-900">🧠 {t('ai.analysis')}</span>
                          </div>
                          <div className="bg-purple-100 px-2.5 py-1 rounded-full">
                                                          <span className="text-xs font-medium text-purple-700">
                                {(pdfFile.aiResult.processingMetrics.aiConfidence * 100).toFixed(0)}% {t('ai.reliable')}
                              </span>
                          </div>
                        </div>
                        
                        {/* AI Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white/80 rounded-lg p-2 text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {pdfFile.aiResult.uiData.summaryStats.sizeReduction.toFixed(0)}%
                            </div>
<div className="text-xs text-gray-600">{t('ai.estimatedReduction')}</div>
                          </div>
                          <div className="bg-white/80 rounded-lg p-2 text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {(pdfFile.aiResult.uiData.summaryStats.qualityScore * 100).toFixed(0)}%
                            </div>
<div className="text-xs text-gray-600">{t('ai.qualityScore')}</div>
                          </div>
                        </div>

                        {/* AI Insights */}
                        {pdfFile.aiResult.uiData.insights.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-2 mb-2">
<div className="text-xs font-medium text-blue-900 mb-1">💡 {t('ai.suggestion')}</div>
                            <div className="text-xs text-blue-700">
                              {pdfFile.aiResult.uiData.insights[0]}
                            </div>
                          </div>
                        )}

                        {/* Processing Time */}
                        <div className="text-xs text-gray-500 text-center">
                          {t('ai.analysisTime').replace('{time}', pdfFile.aiResult.processingMetrics.totalProcessingTime.toFixed(0))}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Loading */}
                    {pdfFile.compressionSettings.useAI && !pdfFile.aiResult && pdfFile.status === 'pending' && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
<span className="text-sm font-medium text-purple-900">🔄 {t('ai.analyzing')}</span>
                        </div>
                        <div className="mt-2 w-full bg-purple-200 rounded-full h-1">
                          <div className="bg-purple-600 h-1 rounded-full animate-pulse w-1/2"></div>
                        </div>
                      </div>
                    )}

                    {/* Compression Settings */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-600" />
<span className="text-sm font-medium text-gray-900">{t('settings.title')}</span>
                      </div>
                                              <div className="text-xs text-gray-700">
                          <p>{t('settings.level')} {compressionLevels[pdfFile.compressionSettings.level].label}</p>
                          <p>Mod: {pdfFile.compressionSettings.useAI ? t('settings.mode.ai') : t('settings.mode.manual')}</p>
                        </div>
                    </div>

                    {/* Compression Results */}
                    {pdfFile.compressionResult && (
                      <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <SparklesIcon className="h-4 w-4 text-green-600" />
<span className="text-sm font-medium text-green-900">{t('results.title')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div>
                              <div className="text-gray-600">{t('results.newSize')}</div>
                              <div className="font-medium text-green-700">
                                {formatFileSize(pdfFile.compressionResult.compressedSize)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">{t('results.savings')}</div>
                              <div className="font-medium text-green-700">
                                {pdfFile.compressionResult.savedPercentage.toFixed(1)}%
                              </div>
                            </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {pdfFile.status === 'error' && pdfFile.error && (
                      <div className="bg-red-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
<span className="text-sm font-medium text-red-900">{t('error.title')}</span>
                        </div>
                        <p className="text-xs text-red-700">{pdfFile.error}</p>
                      </div>
                    )}

                    {/* Download Button */}
                    {pdfFile.status === 'completed' && pdfFile.result?.file && (
                      <button
                        onClick={() => downloadFile(pdfFile.result!.file!, `compressed_${pdfFile.file.name}`)}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
<span>{t('download.pdf')}</span>
                      </button>
                    )}

                    {/* Remove Button */}
                    {!isProcessing && pdfFile.status !== 'processing' && (
                      <button
                        onClick={() => handleFileRemove(pdfFile.id)}
                        className="w-full mt-2 text-gray-500 hover:text-red-600 text-sm py-2 transition-colors"
                      >
{t('remove.file')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Download */}
            {stats.completed > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">🎉 {t('filesReady').replace('{count}', stats.completed.toString())}</h4>
                    <p className="text-green-700 text-sm">
                      {t('totalCompressed').replace('{size}', formatFileSize(stats.totalCompressedSize))}
                    </p>
                    {stats.completed > 1 && (
                      <p className="text-green-600 text-xs mt-1">
                        {t('zipNotice')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={downloadAllCompressed}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>{stats.completed > 1 ? t('zipDownload') : t('downloadFile')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Benefits Section - iLovePDF Style */}
      <div className="bg-gray-50 py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('benefits.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DocumentDuplicateIcon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('benefits.batch.title')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('benefits.batch.desc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('benefits.batch.feature1')}</li>
                    <li>• {t('benefits.batch.feature2')}</li>
                    <li>• {t('zipFormatDownload')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CpuChipIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('benefits.ai.title')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('benefits.ai.desc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('benefits.ai.feature1')}</li>
                    <li>• {t('benefits.ai.feature2')}</li>
                    <li>• {t('benefits.ai.feature3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('benefits.security.title')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('benefits.security.desc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('benefits.security.feature1')}</li>
                    <li>• {t('benefits.security.feature2')}</li>
                    <li>• {t('benefits.security.feature3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BoltIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('benefits.performance.title')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('benefits.performance.desc')}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('benefits.performance.feature1')}</li>
                    <li>• {t('benefits.performance.feature2')}</li>
                    <li>• {t('benefits.performance.feature3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('stats.title')}</h3>
              <p className="text-gray-600">{t('stats.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">1M+</div>
                <div className="text-sm text-gray-600">{t('stats.monthlyUsers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50M+</div>
                <div className="text-sm text-gray-600">{t('stats.processedPdfs')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">4.8⭐</div>
                <div className="text-sm text-gray-600">{t('stats.userRating')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">{t('stats.uptime')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - iLovePDF Style */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
              <div className="absolute top-8 right-8 w-6 h-6 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-4 left-8 w-4 h-4 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-8 right-4 w-10 h-10 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentDuplicateIcon className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                {t('cta.title')}
              </h3>
              <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
                {t('cta.description').replace('{multipleFiles}', t('multipleFilesZip'))}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg text-lg flex items-center space-x-2"
                >
                  <CloudArrowUpIcon className="w-6 h-6" />
                  <span>{t('cta.selectFiles')}</span>
                </button>
                
                <div className="flex items-center space-x-4 text-red-100">
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="text-sm">{t('cta.features.free')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span className="text-sm">{t('cta.features.secure')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BoltIcon className="w-5 h-5" />
                    <span className="text-sm">{t('cta.features.fast')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-red-100 text-sm">
                {t('cta.notice')}
              </div>
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