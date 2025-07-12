'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  ArrowDownTrayIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentIcon,
  SwatchIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import { isHEICFormat, convertHEICToJPEG } from '@/lib/imageUtils';

interface ConversionResult {
  name: string;
  url: string;
  size: number;
  originalFormat: string;
  newFormat: string;
}

interface ImageFormatConvertClientProps {
  locale: string;
}

export default function ImageFormatConvertClient({ locale }: ImageFormatConvertClientProps) {
  console.log('🐛 DEBUG - Image Format Convert Client locale:', locale);
  
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Refs for auto-scroll focus
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Translations alma
  const translations = getTranslations(locale);
  
  // Language detection
  const isTurkish = locale === 'tr';
  const isFrench = locale === 'fr';
  const isSpanish = locale === 'es';
  
  // Step 1 - Upload texts with Spanish support
  const badgeText = isTurkish ? '2M+ Resim Dönüştürüldü • AI Destekli' : (isFrench ? '2M+ Images Converties • Alimente par l\'IA' : (isSpanish ? '2M+ Imágenes Convertidas • Alimentado por IA' : '2M+ Images Converted • AI-Powered'));
  const titleText = isTurkish ? '🔄 Resim Format Dönüştürücü' : (isFrench ? '🔄 Convertisseur de Format d\'Image' : (isSpanish ? '🔄 Convertidor de Formato de Imagen' : '🔄 Image Format Converter'));
  const descriptionText = isTurkish ? 'JPEG, PNG, WebP ve diğer resim formatları arasında dönüştürün ve görsellerinizi optimize edin' : (isFrench ? 'Convertissez entre JPEG, PNG, WebP et d\'autres formats d\'image et optimisez vos visuels' : (isSpanish ? 'Convierte entre JPEG, PNG, WebP y otros formatos de imagen y optimiza tus visuales' : 'Convert between JPEG, PNG, WebP and other image formats and optimize your visuals'));
  const uploadTitleText = isTurkish ? 'Resimlerinizi Yükleyin' : (isFrench ? 'Telecharger Vos Images' : (isSpanish ? 'Subir Tus Imágenes' : 'Upload Your Images'));
  const dropText = isTurkish ? 'Resimlerinizi buraya bırakın' : (isFrench ? 'Deposez vos images ici' : (isSpanish ? 'Arrastra tus imágenes aquí' : 'Drop your images here'));
  const supportedFormatsText = isTurkish ? 'JPG, PNG, WebP, GIF ve daha fazlasını destekler' : (isFrench ? 'Supporte JPG, PNG, WebP, GIF et plus' : (isSpanish ? 'Soporta JPG, PNG, WebP, GIF y más' : 'Supports JPG, PNG, WebP, GIF and more'));
  const chooseFileText = isTurkish ? 'Dosya Seç' : (isFrench ? 'Choisir Fichiers' : (isSpanish ? 'Elegir Archivos' : 'Choose Files'));

  // Step 2 - Configure texts with Spanish support  
  const selectedFilesText = isTurkish ? 'Seçilen Dosyalar' : (isFrench ? 'Fichiers Selectionnes' : (isSpanish ? 'Archivos Seleccionados' : 'Selected Files'));
  const configureTitleText = isTurkish ? 'Çıktı Formatını Seçin' : (isFrench ? 'Choisir Format de Sortie' : (isSpanish ? 'Elegir Formato de Salida' : 'Choose Output Format'));
  const backText = isTurkish ? 'Geri' : (isFrench ? 'Retour' : (isSpanish ? 'Atrás' : 'Back'));
  const startConversionText = isTurkish ? 'Dönüştürmeyi Başlat' : (isFrench ? 'Commencer la Conversion' : (isSpanish ? 'Iniciar Conversión' : 'Start Conversion'));

  // Step 3 - Processing texts with Spanish support
  const processingTitleText = isTurkish ? '🤖 AI Resimlerinizi Dönüştürüyor' : (isFrench ? '🤖 IA Convertit Vos Images' : (isSpanish ? '🤖 IA Convirtiendo Tus Imágenes' : '🤖 AI Converting Your Images'));
  const processingDescText = isTurkish ? 'Resimlerinizi işlerken lütfen bekleyin...' : (isFrench ? 'Veuillez patienter pendant que nous traitons vos images...' : (isSpanish ? 'Por favor espera mientras procesamos tus imágenes...' : 'Please wait while we process your images...'));

  // Step 4 - Results texts with Spanish support
  const resultTitleText = isTurkish ? '✅ Dönüştürme Tamamlandı!' : (isFrench ? '✅ Conversion Terminee !' : (isSpanish ? '✅ ¡Conversión Completada!' : '✅ Conversion Complete!'));
  const resultDescText = isTurkish ? 'Resimleriniz başarıyla dönüştürüldü' : (isFrench ? 'Vos images ont ete converties avec succes' : (isSpanish ? 'Tus imágenes han sido convertidas exitosamente' : 'Your images have been successfully converted'));
  const downloadText = isTurkish ? 'İndir' : (isFrench ? 'Telecharger' : (isSpanish ? 'Descargar' : 'Download'));
  const convertMoreText = isTurkish ? 'Başka Resim Dönüştür' : (isFrench ? 'Convertir Plus d\'Images' : (isSpanish ? 'Convertir Más Imágenes' : 'Convert More Images'));
  
  // Format descriptions with Spanish support
  const pngDescText = isTurkish ? 'Şeffaflık desteği' : (isFrench ? 'Support de transparence' : (isSpanish ? 'Soporte de transparencia' : 'Transparency support'));
  const jpgDescText = isTurkish ? 'Küçük dosya boyutu' : (isFrench ? 'Petite taille de fichier' : (isSpanish ? 'Tamaño de archivo pequeño' : 'Small file size'));
  const jpegDescText = isTurkish ? 'Fotoğraflar için ideal' : (isFrench ? 'Ideal pour les photos' : (isSpanish ? 'Ideal para fotos' : 'Ideal for photos'));
  const webpDescText = isTurkish ? 'Modern web formatı' : (isFrench ? 'Format web moderne' : (isSpanish ? 'Formato web moderno' : 'Modern web format'));
  const gifDescText = isTurkish ? 'Animasyon desteği' : (isFrench ? 'Support d\'animation' : (isSpanish ? 'Soporte de animación' : 'Animation support'));
  const bmpDescText = isTurkish ? 'Sıkıştırmasız kalite' : (isFrench ? 'Qualite sans compression' : (isSpanish ? 'Calidad sin compresión' : 'Uncompressed quality'));

  // Other tools section with Spanish support
  const otherToolsText = isTurkish ? 'Diğer Araçlar' : (isFrench ? 'Autres Outils' : (isSpanish ? 'Otras Herramientas' : 'Other Tools'));
  const compressToolText = isTurkish ? 'Sıkıştır' : (isFrench ? 'Comprimer' : (isSpanish ? 'Comprimir' : 'Compress'));
  const resizeToolText = isTurkish ? 'Boyutlandır' : (isFrench ? 'Redimensionner' : (isSpanish ? 'Redimensionar' : 'Resize'));
  const cropToolText = isTurkish ? 'Kırp' : (isFrench ? 'Recadrer' : (isSpanish ? 'Recortar' : 'Crop'));
  const rotateToolText = isTurkish ? 'Döndür' : (isFrench ? 'Pivoter' : (isSpanish ? 'Rotar' : 'Rotate'));
  const filtersToolText = isTurkish ? 'Filtreler' : (isFrench ? 'Filtres' : (isSpanish ? 'Filtros' : 'Filters'));
  const pdfConvertToolText = isTurkish ? 'PDF Dönüştür' : (isFrench ? 'Convertir PDF' : (isSpanish ? 'Convertir PDF' : 'PDF Convert'));
  
  // Error messages with Spanish support
  const noFilesErrorText = isTurkish ? 'Dosya seçilmedi' : (isFrench ? 'Aucun fichier selectionne' : (isSpanish ? 'No se seleccionaron archivos' : 'No files selected'));
  const conversionErrorText = isTurkish ? 'Dönüştürme hatası' : (isFrench ? 'Erreur de conversion' : (isSpanish ? 'Error de conversión' : 'Conversion error'));

  // Debug console logs
  console.log('🐛 DEBUG - Locale:', locale);
  console.log('🐛 DEBUG - isSpanish:', isSpanish);
  console.log('🐛 DEBUG - Badge text:', badgeText);
  console.log('🐛 DEBUG - Title text:', titleText);
  console.log('🐛 DEBUG - Upload title:', uploadTitleText);
  console.log('🐛 DEBUG - Processing title:', processingTitleText);
  console.log('🐛 DEBUG - Result title:', resultTitleText);

  // getText function - FIX: Support flat key structure
  const getText = (key: string, fallback?: string): string => {
    try {
      // FIXED: Use direct flat key access instead of nested object traversal
      const result = (translations as any)?.[key];
      return typeof result === 'string' ? result : (fallback || key);
    } catch (error) {
      console.error('getText error:', error);
      return fallback || key;
    }
  };

  // Auto-scroll focus when step changes
  useEffect(() => {
    const scrollToStep = () => {
      setTimeout(() => {
        switch (currentStep) {
          case 1:
            uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          case 2:
            configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          case 3:
            processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          case 4:
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
      }, 100);
    };

    scrollToStep();
  }, [currentStep]);

  useEffect(() => {
    // Debug removed - getText function fixed for flat key structure
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setCurrentStep(2);
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFiles(imageFiles);
      setCurrentStep(2);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const convertImages = async () => {
    
    if (files.length === 0) {
      setError(noFilesErrorText);
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3);
    setProcessingProgress(0);
    setError(null);

    try {
      const conversionResults: ConversionResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Progress update
        setProcessingProgress(Math.round((i / files.length) * 100));

        // NEW: Handle HEIC format first
        let processedFile = file;
        if (isHEICFormat(file)) {
          try {
            console.log('📱 HEIC format detected in image-format-convert, converting to JPEG first...');
            processedFile = await convertHEICToJPEG(file);
            console.log('✅ HEIC converted to JPEG successfully for format conversion');
          } catch (error) {
            console.error('❌ HEIC conversion failed in image-format-convert:', error);
            throw new Error(isFrench ? `Format HEIC non traite: ${error instanceof Error ? error.message : 'Erreur inconnue'}` : `HEIC format işlenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
              if (blob) {
                const convertedFileName = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
                const url = URL.createObjectURL(blob);
                
                conversionResults.push({
                  name: convertedFileName,
                  url: url,
                  size: blob.size,
                  originalFormat: file.type.split('/')[1] || (isHEICFormat(file) ? 'heic' : 'unknown'),
                  newFormat: outputFormat
                });
                
                resolve(blob);
              } else {
                reject(new Error('Conversion failed'));
              }
            }, `image/${outputFormat}`, 0.9);
          };

          img.onerror = () => {
            console.error('❌ Image load failed in image-format-convert');
            reject(new Error('Image load failed'));
          };
          
          // Use processed file (converted from HEIC if needed)
          img.src = URL.createObjectURL(processedFile);
        });
      }

      setProcessingProgress(100);
      setTimeout(() => {
        setResults(conversionResults);
        setCurrentStep(4);
      }, 500);
      
    } catch (error) {
      console.error('❌ Image format conversion error:', error);
      setError(`${conversionErrorText}: ${error instanceof Error ? error.message : (isFrench ? 'Erreur inconnue' : 'Bilinmeyen hata')}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setFiles([]);
    setResults([]);
    setCurrentStep(1);
    setError(null);
    setProcessingProgress(0);
  };

  const formatOptions = [
    { value: 'png', label: 'PNG', description: pngDescText },
    { value: 'jpg', label: 'JPG', description: jpgDescText },
    { value: 'jpeg', label: 'JPEG', description: jpegDescText },
    { value: 'webp', label: 'WebP', description: webpDescText },
    { value: 'gif', label: 'GIF', description: gifDescText },
    { value: 'bmp', label: 'BMP', description: bmpDescText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4 mr-2" />
            {badgeText}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            {titleText}
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            {descriptionText}
          </p>
        </div>

        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div ref={uploadRef} className="animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-8 md:p-12 mb-8">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg mr-4">
                  1
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {uploadTitleText}
                </h2>
              </div>

              <div
                className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <CloudArrowUpIcon className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {dropText}
                </h3>
                <p className="text-gray-600 mb-6">
                  {supportedFormatsText}
                </p>
                
                <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer">
                  <PhotoIcon className="w-6 h-6 mr-3" />
                  {chooseFileText}
                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {currentStep === 2 && (
          <div ref={configureRef} className="animate-fade-in">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* File Preview */}
              <div className="md:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentIcon className="w-5 h-5 mr-2 text-purple-600" />
                    {selectedFilesText}
                  </h3>
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-purple-50 rounded-xl">
                        <PhotoIcon className="w-8 h-8 text-purple-600 mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div className="md:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-8">
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg mr-4">
                      2
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {configureTitleText}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {formatOptions.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          outputFormat === format.value
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                        <SwatchIcon className={`w-8 h-8 mx-auto mb-3 ${
                          outputFormat === format.value ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <div className="text-center">
                          <p className={`font-semibold ${
                            outputFormat === format.value ? 'text-purple-900' : 'text-gray-900'
                          }`}>
                            {format.label}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{format.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      {backText}
                    </button>
                    <button
                      onClick={convertImages}
                      className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <CogIcon className="w-6 h-6 mr-3" />
                      {startConversionText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 3 && (
          <div ref={processingRef} className="animate-fade-in min-h-screen flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-12 text-center max-w-2xl w-full">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-xl mr-4">
                  3
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {processingTitleText}
                </h2>
              </div>

              {/* Animated rings */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                <div className="absolute inset-2 rounded-full border-4 border-purple-300 animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-4 rounded-full border-4 border-pink-300 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-6 rounded-full border-4 border-purple-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CogIcon className="w-16 h-16 text-purple-600 animate-spin" />
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-purple-100 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <p className="text-lg font-semibold text-purple-600">{processingProgress}%</p>
              </div>

              <p className="text-gray-600">
                {processingDescText}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && (
          <div ref={resultRef} className="animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-8 md:p-12 mb-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white mx-auto mb-6">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {resultTitleText}
                </h2>
                <p className="text-gray-600">
                  {resultDescText}
                </p>
              </div>

              <div className="grid gap-4 mb-8">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-center">
                      <PhotoIcon className="w-8 h-8 text-purple-600 mr-4" />
                      <div>
                        <p className="font-semibold text-gray-900">{result.name}</p>
                        <p className="text-sm text-gray-600">
                          {result.originalFormat.toUpperCase()} → {result.newFormat.toUpperCase()} • {(result.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={result.url}
                      download={result.name}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                      {downloadText}
                    </a>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetProcess}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {convertMoreText}
                </button>
              </div>
            </div>

            {/* Other Tools Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {otherToolsText}
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <Link href={`/${locale}/image-compress`} className="group flex flex-col items-center p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    {compressToolText}
                  </span>
                </Link>

                <Link href={`/${locale}/image-resize`} className="group flex flex-col items-center p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <RectangleGroupIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    {resizeToolText}
                  </span>
                </Link>

                <Link href={`/${locale}/image-crop`} className="group flex flex-col items-center p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <RectangleGroupIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    {cropToolText}
                  </span>
                </Link>

                <Link href={`/${locale}/image-rotate`} className="group flex flex-col items-center p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <ArrowPathIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    {rotateToolText}
                  </span>
                </Link>

                <Link href={`/${locale}/image-filters`} className="group flex flex-col items-center p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <PaintBrushIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    {filtersToolText}
                  </span>
                </Link>

                <Link href={`/${locale}/pdf-convert`} className="group flex flex-col items-center p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <DocumentIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    {pdfConvertToolText}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 