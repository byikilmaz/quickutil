'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
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

  // Helper function for multi-language fallbacks including French
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
    console.log(`📄 PDF CONVERT DEBUG - getFallbackText called for locale: ${locale}`);
    console.log(`  - TR: ${trText}`);
    console.log(`  - EN: ${enText}`);
    console.log(`  - ES: ${esText || 'not provided'}`);
    console.log(`  - FR: ${frText || 'not provided'}`);
    console.log(`  - DE: ${deText || 'not provided'}`);
    
    let result: string;
    switch (locale) {
      case 'tr': 
        result = trText;
        break;
      case 'en': 
        result = enText;
        break;
      case 'es': 
        result = esText || enText;
        break;
      case 'fr': 
        result = frText || enText;
        break;
      case 'de': 
        result = deText || enText;
        break;
      default: 
        result = enText; // Default to English for any other locales
        break;
    }
    
    console.log(`  - Final result: ${result}`);
    return result;
  };

  // Get localized text helper function
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };
  
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
  const processButtonRef = useRef<HTMLButtonElement>(null);

  // Enhanced debug logging with browser detection for French support
  useEffect(() => {
    console.log('📄 PDF CONVERT DEBUG - Enhanced Translation System:');
    console.log('  - Current locale:', locale);
    console.log('  - Browser language:', typeof navigator !== 'undefined' ? navigator.language : 'server-side');
    console.log('  - Browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'server-side');
    console.log('  - URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server-side');
    console.log('  - Is French detected:', typeof navigator !== 'undefined' ? navigator.language.startsWith('fr') : false);
    
    console.log('📄 PDF CONVERT DEBUG - Sample Translation Values:');
    console.log('  - Title:', getText('pdfConvert.title', getFallbackText('AI PDF Dönüştürme', 'AI PDF Conversion', 'Conversión de PDF con IA', 'Conversion PDF IA')));
    console.log('  - Subtitle:', getText('pdfConvert.subtitle', getFallbackText('PDF dosyalarınızı yapay zeka destekli araçlarla istediğiniz formata dönüştürün', 'Convert your PDF files to any format with AI-powered tools', 'Convierte tus archivos PDF a cualquier formato con herramientas impulsadas por IA', 'Convertissez vos fichiers PDF en tout format avec des outils alimentés par IA')));
    console.log('  - Select Files:', getText('pdfConvert.selectFiles', getFallbackText('PDF Dosyalarını Seç', 'Select PDF Files', 'Selecciona Archivos PDF', 'Sélectionner Fichiers PDF')));
    console.log('  - Processing:', getText('pdfConvert.processing', getFallbackText('Yapay Zeka ile İşleniyor...', 'Processing with AI...', 'Procesando con IA...', 'Traitement avec IA...')));
    console.log('  - Success Title:', getText('pdfConvert.successTitle', getFallbackText('Başarıyla Tamamlandı!', 'Successfully Completed!', '¡Completado Exitosamente!', 'Terminé avec Succès!')));
    
    // Browser language auto-detection and redirect
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
      
      console.log('📄 PDF CONVERT DEBUG - Browser Language Detection:');
      const currentPath = window.location.pathname;
      const browserLang = navigator.language.toLowerCase();
      const supportedLangs = ['tr', 'en', 'es', 'fr', 'de'];
      
      console.log('  - Current path:', currentPath);
      console.log('  - Browser language:', browserLang);
      console.log('  - Browser languages array:', navigator.languages);
      
      // Detect target language
      let targetLang = 'en'; // default
      
      if (browserLang.startsWith('tr')) targetLang = 'tr';
      else if (browserLang.startsWith('es')) targetLang = 'es';
      else if (browserLang.startsWith('fr')) targetLang = 'fr';
      else if (browserLang.startsWith('de')) targetLang = 'de';
      
      console.log('  - Target language detected:', targetLang);
      console.log('  - Current locale:', locale);
      
      // Check if already on correct language path
      const currentLangFromPath = currentPath.split('/')[1];
      if (supportedLangs.includes(currentLangFromPath)) {
        console.log('  - Already on language-specific path:', currentLangFromPath);
        
        // Save preference
        localStorage.setItem('quickutil_preferred_locale', currentLangFromPath);
        console.log('  - Saved preference:', currentLangFromPath);
        return;
      }
      
      // Check localStorage preference
      const savedLang = localStorage.getItem('quickutil_preferred_locale');
      if (savedLang && supportedLangs.includes(savedLang)) {
        console.log('  - Using saved language preference:', savedLang);
        targetLang = savedLang;
      }
      
      // Only redirect if not already on the correct language
      if (locale !== targetLang) {
        const newPath = `/${targetLang}${currentPath.startsWith('/') ? currentPath : '/' + currentPath}`;
        console.log('  - Redirecting to:', newPath);
        
        // Save preference before redirect
        localStorage.setItem('quickutil_preferred_locale', targetLang);
        
        // Perform redirect
        window.location.href = newPath;
      } else {
        console.log('  - Already on correct language, no redirect needed');
      }
    };
    
    // Run detection
    detectAndRedirectLanguage();
  }, [locale]);

  // Conversion tools configuration
  const conversionTools = [
    {
      id: 'pdf-to-images',
      title: getText('pdfToImages.title', getFallbackText('PDF\'den Görsellere', 'PDF to Images', 'PDF a Imágenes', 'PDF vers Images')),
      description: getText('pdfToImages.description', getFallbackText('Yüksek kaliteli görsel çıktı, akıllı format optimizasyonu', 'High quality image output, smart format optimization', 'Salida de imagen de alta calidad, optimización de formato inteligente', 'Sortie d\'image haute qualité, optimisation de format intelligente')),
      icon: PhotoIcon,
      color: 'from-blue-500 to-cyan-500',
      multiple: false,
      formats: ['PNG', 'JPG'],
      features: [
        getText('pdfTools.features.highQuality', getFallbackText('Yüksek Kaliteli Çıktı', 'High Quality Output', 'Salida de Alta Calidad', 'Sortie Haute Qualité')),
        getText('pdfTools.features.maxSize', getFallbackText('20MB Dosya Boyutu', '20MB File Size', 'Tamaño de Archivo 20MB', 'Taille de Fichier 20MB')),
        getText('pdfTools.features.fastProcessing', getFallbackText('Hızlı İşlem', 'Fast Processing', 'Procesamiento Rápido', 'Traitement Rapide'))
      ]
    },
    {
      id: 'pdf-to-text',
      title: getText('pdfToText.title', getFallbackText('PDF\'den Metne', 'PDF to Text', 'PDF a Texto', 'PDF vers Texte')),
      description: getText('pdfToText.description', getFallbackText('OCR teknolojisi, çoklu dil desteği, akıllı metin tanıma', 'OCR technology, multi-language support, smart text recognition', 'Tecnología OCR, soporte multiidioma, reconocimiento de texto inteligente', 'Technologie OCR, support multilingue, reconnaissance de texte intelligente')),
      icon: DocumentTextIcon,
      color: 'from-green-500 to-emerald-500',
      multiple: false,
      formats: ['TXT'],
      features: [
        getText('pdfTools.features.highQuality', getFallbackText('Yüksek Kaliteli Çıktı', 'High Quality Output', 'Salida de Alta Calidad', 'Sortie Haute Qualité')),
        getText('pdfTools.features.maxSize', getFallbackText('20MB Dosya Boyutu', '20MB File Size', 'Tamaño de Archivo 20MB', 'Taille de Fichier 20MB')),
        getText('pdfTools.features.fastProcessing', getFallbackText('Hızlı İşlem', 'Fast Processing', 'Procesamiento Rápido', 'Traitement Rapide'))
      ]
    },
    {
      id: 'pdf-split',
      title: getText('pdfSplit.title', getFallbackText('PDF Böl', 'PDF Split', 'Dividir PDF', 'Diviser PDF')),
      description: getText('pdfSplit.description', getFallbackText('Akıllı sayfa tanıma, çoklu bölme seçenekleri, toplu işlem', 'Smart page recognition, multiple split options, batch processing', 'Reconocimiento inteligente de páginas, múltiples opciones de división, procesamiento por lotes', 'Reconnaissance intelligente de pages, options de division multiples, traitement par lots')),
      icon: ScissorsIcon,
      color: 'from-purple-500 to-violet-500',
      multiple: false,
      formats: ['PDF'],
      features: [
        getText('pdfTools.features.highQuality', getFallbackText('Yüksek Kaliteli Çıktı', 'High Quality Output', 'Salida de Alta Calidad', 'Sortie Haute Qualité')),
        getText('pdfTools.features.maxSize', getFallbackText('20MB Dosya Boyutu', '20MB File Size', 'Tamaño de Archivo 20MB', 'Taille de Fichier 20MB')),
        getText('pdfTools.features.fastProcessing', getFallbackText('Hızlı İşlem', 'Fast Processing', 'Procesamiento Rápido', 'Traitement Rapide'))
      ]
    },
    {
      id: 'pdf-merge',
      title: getText('pdfMerge.title', getFallbackText('PDF Birleştir', 'PDF Merge', 'Combinar PDF', 'Fusionner PDF')),
      description: getText('pdfMerge.description', getFallbackText('Sürükle-bırak sıralama, otomatik optimizasyon, çoklu dosya desteği', 'Drag-drop ordering, automatic optimization, multiple file support', 'Ordenación de arrastrar y soltar, optimización automática, soporte de múltiples archivos', 'Classement glisser-déposer, optimisation automatique, support de fichiers multiples')),
      icon: Square2StackIcon,
      color: 'from-orange-500 to-red-500',
      multiple: true,
      formats: ['PDF'],
      features: [
        getText('pdfTools.features.highQuality', getFallbackText('Yüksek Kaliteli Çıktı', 'High Quality Output', 'Salida de Alta Calidad', 'Sortie Haute Qualité')),
        getText('pdfTools.features.maxSize', getFallbackText('20MB Dosya Boyutu', '20MB File Size', 'Tamaño de Archivo 20MB', 'Taille de Fichier 20MB')),
        getText('pdfTools.features.fastProcessing', getFallbackText('Hızlı İşlem', 'Fast Processing', 'Procesamiento Rápido', 'Traitement Rapide')),
        getText('pdfTools.features.multipleFileSupport', getFallbackText('Çoklu Dosya Desteği', 'Multiple File Support', 'Soporte de Múltiples Archivos', 'Support de Fichiers Multiples'))
      ]
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
      setError(getText('pdfConvert.errorQuota', getFallbackText('Günlük PDF dönüştürme limitiniz doldu. Lütfen yarın tekrar deneyin.', 'Daily PDF conversion limit reached. Please try again tomorrow.', 'Límite diario de conversión de PDF alcanzado. Inténtalo de nuevo mañana.', 'Limite quotidien de conversion PDF atteint. Veuillez réessayer demain.')));
      return;
    }

    const tool = conversionTools.find(t => t.id === selectedTool);
    if (!tool) return;

    // File size validation (20MB limit)
    const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(getText('pdfTools.errors.fileTooLarge', getFallbackText('Dosya boyutu 20MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.', 'File size cannot exceed 20MB. Please select a smaller file.', 'El tamaño del archivo no puede exceder 20MB. Selecciona un archivo más pequeño.', 'La taille du fichier ne peut pas dépasser 20MB. Veuillez sélectionner un fichier plus petit.')));
      return;
    }

    // Multiple file validation
    if (!tool.multiple && files.length > 1) {
      setError(getText('pdfTools.errors.singleFileOnly', getFallbackText('Bu araç için sadece tek dosya seçebilirsiniz.', 'You can only select one file for this tool.', 'Solo puedes seleccionar un archivo para esta herramienta.', 'Vous ne pouvez sélectionner qu\'un seul fichier pour cet outil.')));
      return;
    }

    setSelectedFiles(files);
    setError(null);
    
    // Auto-scroll to process button after file selection
    setTimeout(() => {
      if (processButtonRef.current) {
        processButtonRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        processButtonRef.current.focus();
      }
    }, 500); // Small delay to allow UI to update
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
      setError(error instanceof Error ? error.message : getText('pdfTools.errors.conversionFailed', getFallbackText('Dönüştürme başarısız oldu.', 'Conversion failed.', 'La conversión falló.', 'La conversion a échoué.')));
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
      setError(getText('pdfConvert.errorZip', getFallbackText('ZIP dosyası oluşturulamadı.', 'ZIP file could not be created.', 'No se pudo crear el archivo ZIP.', 'Le fichier ZIP n\'a pas pu être créé.')));
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <StructuredData 
        page="pdf-convert"
        type="tool"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* STEP 1: UPLOAD - Clean Design Like PDF Compress */}
        <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
                {getText('pdfConvert.title', getFallbackText('AI PDF Dönüştürme', 'AI PDF Conversion', 'Conversión de PDF con IA', 'Conversion PDF IA'))}
              </h1>
              <p className="text-base md:text-xl text-gray-700 max-w-2xl mx-auto px-4">
                {getText('pdfConvert.subtitle', getFallbackText('PDF dosyalarınızı yapay zeka destekli araçlarla istediğiniz formata dönüştürün', 'Convert your PDF files to any format with AI-powered tools', 'Convierte tus archivos PDF a cualquier formato con herramientas impulsadas por IA', 'Convertissez vos fichiers PDF en tout format avec des outils alimentés par IA'))}
              </p>
            </div>

            {/* Tool Selection Grid - Visual Cards with Large Icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
              {conversionTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setCurrentStep('configure');
                  }}
                  className={`group relative bg-white rounded-2xl border-2 p-8 text-left transition-all duration-300 hover:shadow-2xl hover:scale-105 transform ${
                    selectedTool === tool.id 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl' 
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  {/* Large Tool Icon with Gradient Background */}
                  <div className="text-center mb-6">
                    <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <tool.icon className="h-10 w-10 text-white" />
                      
                      {/* Sparkle Effect */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <SparklesIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    {/* Tool Title with Gradient Text */}
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  
                  {/* Visual Features with Icons */}
                  <div className="space-y-3">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckCircleIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Format Badges */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {tool.formats.map(format => (
                      <span key={format} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                        📄 {format}
                      </span>
                    ))}
                  </div>

                  {/* Selected indicator with Animation */}
                  {selectedTool === tool.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              ))}
            </div>

            {/* Continue Button with Enhanced Visual */}
            {selectedTool && (
              <div className="max-w-sm mx-auto animate-bounce-in">
                <button
                  onClick={() => setCurrentStep('configure')}
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-2xl px-8 py-5 text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 flex items-center justify-center transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <span>{getText('pdfConvert.continue', getFallbackText('Devam Et', 'Continue', 'Continuar', 'Continuer'))}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowLeftIcon className="h-5 w-5 text-white rotate-180" />
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: CONFIGURE - Clean Upload Like PDF Compress */}
        <div ref={configureRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'configure' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {selectedTool && (
            <div className="max-w-4xl mx-auto px-4">
              
              {/* Header */}
              <div className="text-center mb-12">
                <div className="mb-4">
                  <p className="text-purple-600 font-medium text-sm md:text-base">
                    ✨ {conversionTools.find(t => t.id === selectedTool)?.title} {getText('pdfConvert.toolSelected', getFallbackText('seçildi! Dosya yükleniyor...', 'selected! Uploading file...', '¡seleccionado! Subiendo archivo...', 'sélectionné! Téléchargement du fichier...'))}
                  </p>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {getText('pdfConvert.uploadFiles', getFallbackText('Dosya Yükleme', 'File Upload', 'Subida de Archivo', 'Téléchargement de Fichier'))}
                </h1>
              </div>

              {/* Enhanced Upload Button with Visuals */}
              <div className="max-w-md mx-auto text-center">
                <div className="relative group cursor-pointer">
                  {/* Main Upload Button with Gradient and Effects */}
                  <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-3xl px-12 py-8 text-xl font-bold transition-all duration-500 shadow-2xl hover:shadow-purple-500/40 flex flex-col items-center justify-center transform hover:scale-105 group-hover:rotate-1">
                    
                    {/* Animated Upload Icon */}
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CloudArrowUpIcon className="h-8 w-8 text-white group-hover:animate-bounce" />
                      </div>
                      
                      {/* Floating Plus Icons */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center animate-ping opacity-75">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    
                    {/* Dynamic Text */}
                    <div className="text-center">
                      <div className="text-lg font-bold mb-2">
                        {conversionTools.find(t => t.id === selectedTool)?.multiple 
                          ? `📂 ${getText('pdfConvert.selectFiles', getFallbackText('PDF Dosyalarını Seç', 'Select PDF Files', 'Selecciona Archivos PDF', 'Sélectionner Fichiers PDF'))}`
                          : `📄 ${getText('pdfConvert.selectFile', getFallbackText('PDF Dosyasını Seç', 'Select PDF File', 'Selecciona Archivo PDF', 'Sélectionner Fichier PDF'))}`
                        }
                      </div>
                      <div className="text-sm opacity-90">
                        ✨ {getText('pdfConvert.aiPowered', getFallbackText('Yapay Zeka Destekli Dönüştürme', 'AI-Powered Conversion', 'Conversión Impulsada por IA', 'Conversion Alimentée par IA'))}
                      </div>
                    </div>

                    {/* Animated Border */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                  </div>

                  {/* Hidden FileUpload Component */}
                  <FileUpload
                    onFileSelect={(file) => {
                      const files = Array.isArray(file) ? file : [file];
                      handleFileSelect(files);
                    }}
                    acceptedTypes={['application/pdf']}
                    maxSize={20 * 1024 * 1024}
                    multiple={conversionTools.find(t => t.id === selectedTool)?.multiple || false}
                    title=""
                    description=""
                  />

                  {/* Orbit Animation */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-dashed border-purple-300 rounded-full animate-spin opacity-30 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                
                                  {/* Enhanced Description with Icons */}
                  <div className="mt-6 space-y-3">
                    <p className="text-lg text-gray-700 font-medium">
                      🎯 {getText('pdfConvert.dragDrop', getFallbackText('veya PDF\'i buraya sürükle & bırak', 'or drag & drop PDF here', 'o arrastra y suelta PDF aquí', 'ou glisser-déposer PDF ici'))}
                    </p>
                  
                  {/* File Requirements with Visual Elements */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto flex items-center justify-center">
                          <DocumentIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-xs text-gray-600">PDF Format</div>
                      </div>
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto flex items-center justify-center">
                          <span className="text-white text-xs font-bold">20</span>
                        </div>
                        <div className="text-xs text-gray-600">Max 20MB</div>
                      </div>
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto flex items-center justify-center">
                          <SparklesIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-xs text-gray-600">AI Powered</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* File List - If files selected */}
              {selectedFiles.length > 0 && (
                <div className="mt-8 max-w-2xl mx-auto">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {getText('pdfConvert.selectedFiles', getFallbackText('Seçilen Dosyalar', 'Selected Files', 'Archivos Seleccionados', 'Fichiers Sélectionnés'))} ({selectedFiles.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DocumentIcon className="h-8 w-8 text-red-500 mr-3" />
                            <div>
                              <p className="font-medium text-sm text-gray-900 truncate max-w-48">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newFiles = selectedFiles.filter((_, i) => i !== index);
                              setSelectedFiles(newFiles);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Process Button */}
                    <button
                      ref={processButtonRef}
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-4 focus:ring-purple-300 focus:outline-none"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      {isProcessing 
                        ? getText('pdfConvert.processing', getFallbackText('İşleniyor...', 'Processing...', 'Procesando...', 'Traitement...')) 
                        : getText('pdfConvert.startConversion', getFallbackText('Dönüştürmeyi Başlat', 'Start Conversion', 'Iniciar Conversión', 'Démarrer la Conversion'))
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-red-800 text-center">{error}</p>
                </div>
              )}

              {/* Back Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setCurrentStep('upload');
                    setSelectedTool('');
                    setSelectedFiles([]);
                    setError(null);
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  {getText('pdfConvert.backToTools', getFallbackText('Araç Seçimine Dön', 'Back to Tool Selection', 'Volver a Selección de Herramientas', 'Retour à la Sélection d\'Outils'))}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: PROCESSING - Enhanced Visual Processing */}
        <div ref={processingRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'processing' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            
            {/* Processing Header with Animations */}
            <div className="mb-12">
              <div className="relative mb-8">
                {/* Central Processing Icon with Rotation */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                  <SparklesIcon className="h-12 w-12 text-white animate-spin" />
                </div>
                
                {/* Orbital Animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-dotted border-purple-300 rounded-full animate-spin opacity-60 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-dashed border-pink-300 rounded-full animate-spin opacity-40 transform -translate-x-1/2 -translate-y-1/2" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-0 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.5s' }}>
                  <span className="text-xs">📄</span>
                </div>
                <div className="absolute bottom-0 right-1/4 w-4 h-4 bg-green-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '1s' }}>
                  <span className="text-xs">✨</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {getText('pdfConvert.processing', getFallbackText('Yapay Zeka ile İşleniyor...', 'Processing with AI...', 'Procesando con IA...', 'Traitement avec IA...'))}
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                {getText('pdfConvert.processingDesc', getFallbackText('AI algoritmaları dosyalarınızı optimize ediyor', 'AI algorithms are optimizing your files', 'Los algoritmos de IA están optimizando tus archivos', 'Les algorithmes IA optimisent vos fichiers'))}
              </p>
            </div>

            {/* Enhanced Progress Section */}
            <div className="max-w-2xl mx-auto mb-12">
              {/* Progress Bar with Gradient */}
              <div className="relative mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 h-4 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${processingProgress}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress Percentage with Visual */}
                <div className="flex items-center justify-center mt-3">
                  <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-purple-200">
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {processingProgress}% 
                    </span>
                    <span className="text-sm text-gray-600 ml-1">
                      {getText('pdfTools.progress.completed', 'tamamlandı')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Processing Steps with Icons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: '📄', label: getText('pdfConvert.fileUploading', getFallbackText('Dosya Yükleniyor', 'File Uploading', 'Subiendo Archivo', 'Téléchargement du Fichier')), step: 1 },
                  { icon: '🤖', label: getText('pdfConvert.aiAnalyzing', getFallbackText('AI Analiz Yapıyor', 'AI Analyzing', 'IA Analizando', 'IA en cours d\'Analyse')), step: 2 },
                  { icon: '⚡', label: getText('pdfConvert.conversionCompleting', getFallbackText('Dönüştürme Tamamlanıyor', 'Conversion Completing', 'Conversión Completándose', 'Conversion en cours de Finalisation')), step: 3 }
                ].map((item, idx) => (
                  <div key={idx} className={`relative p-4 rounded-2xl border-2 transition-all duration-500 ${
                    processingProgress > (idx + 1) * 33 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 scale-105' 
                      : processingProgress > idx * 33 
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 animate-pulse' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                    </div>
                    
                    {/* Step completion indicator */}
                    {processingProgress > (idx + 1) * 33 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fun Processing Messages */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-center space-x-3 text-blue-700">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-lg font-medium">
                  ✨ {getText('pdfConvert.aiOptimizingBest', getFallbackText('Yapay zeka dosyalarınızı en iyi şekilde optimize ediyor...', 'AI is optimizing your files in the best way...', 'La IA está optimizando tus archivos de la mejor manera...', 'L\'IA optimise vos fichiers de la meilleure façon...'))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: RESULT - Enhanced Visual Success */}
        {currentStep === 'result' && (
          <div ref={resultRef} className="min-h-screen flex flex-col justify-center px-4">
            <div className="text-center max-w-4xl mx-auto">
              
              {/* Success Animation */}
              <div className="relative mb-12">
                {/* Celebration Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-70"
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${10 + (i % 2) * 20}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    >
                      {['🎉', '✨', '🎊', '⭐'][i % 4]}
                    </div>
                  ))}
                </div>
                
                {/* Main Success Icon */}
                <div className="relative z-10 w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-full animate-pulse shadow-2xl"></div>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 animate-bounce" />
                  </div>
                  
                  {/* Success Rings */}
                  <div className="absolute inset-0 border-4 border-green-300 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -inset-4 border-2 border-green-200 rounded-full animate-pulse opacity-50"></div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  🎉 {getText('pdfConvert.successTitle', getFallbackText('Başarıyla Tamamlandı!', 'Successfully Completed!', '¡Completado Exitosamente!', 'Terminé avec Succès!'))}
                </h2>
                <p className="text-xl text-gray-700 mb-8">
                  ✨ {getText('pdfConvert.successDesc', getFallbackText('PDF dosyalarınız yapay zeka ile dönüştürüldü', 'Your PDF files have been converted with AI', 'Tus archivos PDF han sido convertidos con IA', 'Vos fichiers PDF ont été convertis avec IA'))}
                </p>
              </div>

              {/* Conversion Results */}
              {conversionResult && conversionResult.results.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center justify-center">
                    <span className="mr-3">📁</span>
                    {getText('pdfConvert.convertedFiles', getFallbackText('Dönüştürülen Dosyalar', 'Converted Files', 'Archivos Convertidos', 'Fichiers Convertis'))}
                    <span className="ml-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-lg">
                      {conversionResult.convertedCount}
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conversionResult.results.map((result, index) => (
                      <div key={index} className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
                        {/* File Icon */}
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            {result.type.includes('image') ? (
                              <PhotoIcon className="h-8 w-8 text-white" />
                            ) : result.type.includes('text') ? (
                              <DocumentTextIcon className="h-8 w-8 text-white" />
                            ) : (
                              <DocumentIcon className="h-8 w-8 text-white" />
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2 truncate">
                            {result.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            📏 {(result.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        
                        {/* Download Button */}
                        <a
                          href={result.url}
                          download={result.name}
                          className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                          ⬇️ {getText('pdfConvert.download', getFallbackText('İndir', 'Download', 'Descargar', 'Télécharger'))}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => {
                    setCurrentStep('upload');
                    setSelectedFiles([]);
                    setConversionResult(null);
                    setSelectedTool('');
                    setError(null);
                  }}
                  className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 flex items-center justify-center transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <span>🔄 {getText('pdfConvert.newConversion', getFallbackText('Yeni Dönüştürme', 'New Conversion', 'Nueva Conversión', 'Nouvelle Conversion'))}</span>
                  </div>
                </button>
                
                {/* ZIP Download Button - Only show if multiple files */}
                {conversionResult && conversionResult.results.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    disabled={isDownloadingZip}
                    className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 disabled:opacity-50 text-white rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-orange-500/30 flex items-center justify-center transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {isDownloadingZip ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ArrowDownTrayIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <span>
                        {isDownloadingZip ? '📦 ZIP Hazırlanıyor...' : `📦 ${getText('pdfConvert.downloadAllZip', getFallbackText('Hepsini İndir (ZIP)', 'Download All (ZIP)', 'Descargar Todo (ZIP)', 'Tout Télécharger (ZIP)'))}`}
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Other Tools Section - Enhanced */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                  <span className="mr-3">🛠️</span>
                  {getText('pdfConvert.otherTools', getFallbackText('Diğer PDF Araçları', 'Other PDF Tools', 'Otras Herramientas PDF', 'Autres Outils PDF'))}
                  <span className="ml-3">✨</span>
                </h3>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { 
                      href: '/pdf-compress', 
                      icon: '📦', 
                      title: getFallbackText('PDF Sıkıştır', 'PDF Compress', 'Comprimir PDF', 'Compresser PDF'), 
                      color: 'from-red-500 to-orange-500' 
                    },
                    { 
                      href: '/pdf-merge', 
                      icon: '📑', 
                      title: getFallbackText('PDF Birleştir', 'PDF Merge', 'Combinar PDF', 'Fusionner PDF'), 
                      color: 'from-green-500 to-emerald-500' 
                    },
                    { 
                      href: '/pdf-split', 
                      icon: '✂️', 
                      title: getFallbackText('PDF Böl', 'PDF Split', 'Dividir PDF', 'Diviser PDF'), 
                      color: 'from-blue-500 to-cyan-500' 
                    },
                    { 
                      href: '/image-convert', 
                      icon: '🖼️', 
                      title: getFallbackText('Resim Dönüştür', 'Convert Image', 'Convertir Imagen', 'Convertir Image'), 
                      color: 'from-purple-500 to-pink-500' 
                    },
                    { 
                      href: '/image-compress', 
                      icon: '📷', 
                      title: getFallbackText('Resim Sıkıştır', 'Compress Image', 'Comprimir Imagen', 'Compresser Image'), 
                      color: 'from-yellow-500 to-orange-500' 
                    },
                    { 
                      href: '/image-resize', 
                      icon: '📐', 
                      title: getFallbackText('Resim Boyutlandır', 'Resize Image', 'Redimensionar Imagen', 'Redimensionner Image'), 
                      color: 'from-indigo-500 to-purple-500' 
                    }
                  ].map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group bg-white rounded-2xl p-4 text-center hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 transform hover:scale-105"
                    >
                      <div className={`w-12 h-12 mx-auto bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <span className="text-2xl">{tool.icon}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                        {tool.title}
                      </p>
                    </Link>
                  ))}
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