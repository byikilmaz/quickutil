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

// Client component with SEO-optimized content
export default function PDFConvertClient({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();

  // Helper function for multi-language fallbacks including Japanese
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string, arText?: string, jaText?: string, koText?: string) => {
    console.log(`📄 PDF CONVERT DEBUG - getFallbackText called for locale: ${locale}`);
    console.log(`  - TR: ${trText}`);
    console.log(`  - EN: ${enText}`);
    console.log(`  - ES: ${esText || 'not provided'}`);
    console.log(`  - FR: ${frText || 'not provided'}`);
    console.log(`  - DE: ${deText || 'not provided'}`);
    console.log(`  - AR: ${arText || 'not provided'}`);
    console.log(`  - JA: ${jaText || 'not provided'}`);
    console.log(`  - KO: ${koText || 'not provided'}`);
    
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
      case 'ar':
        result = arText || enText;
        break;
      case 'ja':
        result = jaText || enText;
        break;
      case 'ko':
        result = koText || enText;
        break;
      default:
        result = enText;
    }
    
    console.log(`  - Selected: ${result}`);
    return result;
  };

  // Component state
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<'split' | 'merge' | 'text-extract' | 'images' | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResultDisplay | null>(null);
  const [selectedImageFormat, setSelectedImageFormat] = useState<'png' | 'jpeg'>('png');
  const [selectedImageQuality, setSelectedImageQuality] = useState(0.9);
  const [selectedImageScale, setSelectedImageScale] = useState(2.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Cancel processing
  const cancelProcessing = () => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setLoading(false);
  };

  // Handle file selection
  const handleFileSelect = (selectedFiles: File | File[]) => {
    const fileArray = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    setFiles(fileArray);
    setConversionResult(null);
    setError(null);
    setProgress(0);
    setShowOptions(true);
  };

  // Process files based on operation
  const processFiles = async () => {
    if (!operation || files.length === 0) return;

    setLoading(true);
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const startTime = Date.now();
      let results: ConversionResult[] = [];

      // Progress tracking
      const updateProgress = (value: number) => {
        setProgress(Math.min(value, 100));
      };

      updateProgress(10);

      switch (operation) {
        case 'split':
          if (files.length > 1) {
            throw new Error(getFallbackText(
              'PDF ayırma işlemi için sadece tek dosya seçiniz.',
              'Please select only one file for PDF splitting.',
              'Seleccione solo un archivo para dividir PDF.',
              'Veuillez sélectionner un seul fichier pour diviser le PDF.',
              'Bitte wählen Sie nur eine Datei zum Aufteilen der PDF aus.',
              'يرجى اختيار ملف واحد فقط لتقسيم PDF.',
              'PDF分割には1つのファイルのみを選択してください。',
              'PDF 분할을 위해 하나의 파일만 선택해 주세요.'
            ));
          }
          updateProgress(30);
          results = await splitPDF(files[0]);
          break;

        case 'merge':
          if (files.length < 2) {
            throw new Error(getFallbackText(
              'PDF birleştirme işlemi için en az 2 dosya seçiniz.',
              'Please select at least 2 files for PDF merging.',
              'Seleccione al menos 2 archivos para fusionar PDF.',
              'Veuillez sélectionner au moins 2 fichiers pour fusionner les PDF.',
              'Bitte wählen Sie mindestens 2 Dateien zum Zusammenführen von PDFs aus.',
              'يرجى اختيار ملفين على الأقل لدمج PDF.',
              'PDF結合には最低2つのファイルを選択してください。',
              'PDF 병합을 위해 최소 2개의 파일을 선택해 주세요.'
            ));
          }
          updateProgress(30);
          const mergedResult = await mergePDFs(files);
          results = [mergedResult];
          break;

        case 'text-extract':
          updateProgress(30);
          const extractPromises = files.map(async file => {
            const text = await extractTextFromPDF(file);
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            return {
              name: file.name.replace('.pdf', '.txt'),
              url,
              size: blob.size,
              type: 'text/plain'
            };
          });
          const extractedTexts = await Promise.all(extractPromises);
          results = extractedTexts;
          break;

        case 'images':
          updateProgress(30);
          const imagePromises = files.map(file => 
            convertPDFToImages(file, selectedImageFormat, selectedImageQuality, selectedImageScale)
          );
          const imageResults = await Promise.all(imagePromises);
          results = imageResults.flat();
          break;

        default:
          throw new Error(getFallbackText(
            'Geçersiz işlem türü.',
            'Invalid operation type.',
            'Tipo de operación inválido.',
            'Type d\'opération invalide.',
            'Ungültiger Operationstyp.',
            'نوع العملية غير صحيح.',
            '無効な操作タイプです。',
            '잘못된 작업 유형입니다.'
          ));
      }

      updateProgress(80);

      // Upload results to storage if user is logged in
      const downloadUrls: { name: string; url: string; size: number }[] = [];
      if (user && results.length > 0) {
        for (const result of results) {
          if (result.url) {
            const response = await fetch(result.url);
            const blob = await response.blob();
            const file = new File([blob], result.name, { type: result.type });
            const uploadResult = await uploadFile(file, 'pdf');
            downloadUrls.push({
              name: result.name,
              url: uploadResult.downloadURL,
              size: result.size
            });
          }
        }
      }

      updateProgress(100);

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      const totalSize = results.reduce((sum, r) => sum + r.size, 0);

      setConversionResult({
        results,
        totalSize,
        convertedCount: results.length,
        processingTime,
        downloadUrls
      });

      setShowOptions(false);
      
    } catch (error) {
      console.error('PDF conversion error:', error);
      setError(error instanceof Error ? error.message : getFallbackText(
        'Dosya işleme sırasında hata oluştu.',
        'Error occurred during file processing.',
        'Error durante el procesamiento del archivo.',
        'Erreur lors du traitement du fichier.',
        'Fehler bei der Dateiverarbeitung.',
        'خطأ أثناء معالجة الملف.',
        'ファイル処理中にエラーが発生しました。',
        '파일 처리 중 오류가 발생했습니다.'
      ));
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Clear files
  const clearFiles = () => {
    setFiles([]);
    setConversionResult(null);
    setError(null);
    setProgress(0);
    setShowOptions(false);
    setOperation(null);
  };

  // Download all results as ZIP
  const downloadAllAsZip = async () => {
    if (!conversionResult || conversionResult.results.length === 0) return;

    try {
      const zip = new JSZip();
      
      for (const result of conversionResult.results) {
        if (result.url) {
          const response = await fetch(result.url);
          const blob = await response.blob();
          zip.file(result.name, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `pdf-conversion-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('ZIP download error:', error);
      setError(getFallbackText(
        'ZIP dosyası oluşturulurken hata oluştu.',
        'Error creating ZIP file.',
        'Error al crear el archivo ZIP.',
        'Erreur lors de la création du fichier ZIP.',
        'Fehler beim Erstellen der ZIP-Datei.',
        'خطأ في إنشاء ملف ZIP.',
        'ZIPファイルの作成中にエラーが発生しました。',
        'ZIP 파일 생성 중 오류가 발생했습니다.'
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* SEO-optimized Header */}
        <div className="text-center mb-12">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {getFallbackText('Ana Sayfa', 'Home', 'Inicio', 'Accueil', 'Startseite', 'الصفحة الرئيسية', 'ホーム', '홈')}
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getFallbackText(
              'PDF Dönüştürme ve İşleme Araçları',
              'PDF Conversion and Processing Tools',
              'Herramientas de Conversión y Procesamiento de PDF',
              'Outils de Conversion et de Traitement PDF',
              'PDF-Konvertierungs- und Verarbeitungstools',
              'أدوات تحويل ومعالجة PDF',
              'PDF変換・処理ツール',
              'PDF 변환 및 처리 도구'
            )}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {getFallbackText(
              'Profesyonel PDF işleme araçları ile dosyalarınızı kolayca dönüştürün. Güvenli, hızlı ve kullanıcı dostu çözümler.',
              'Convert your files easily with professional PDF processing tools. Secure, fast, and user-friendly solutions.',
              'Convierta sus archivos fácilmente con herramientas profesionales de procesamiento de PDF. Soluciones seguras, rápidas y fáciles de usar.',
              'Convertissez facilement vos fichiers avec des outils professionnels de traitement PDF. Solutions sécurisées, rapides et conviviales.',
              'Konvertieren Sie Ihre Dateien einfach mit professionellen PDF-Verarbeitungstools. Sichere, schnelle und benutzerfreundliche Lösungen.',
              'قم بتحويل ملفاتك بسهولة باستخدام أدوات معالجة PDF المهنية. حلول آمنة وسريعة وسهلة الاستخدام.',
              'プロフェッショナルなPDF処理ツールでファイルを簡単に変換。安全で高速、使いやすいソリューション。',
              '전문적인 PDF 처리 도구로 파일을 쉽게 변환하세요. 안전하고 빠르며 사용자 친화적인 솔루션.'
            )}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">
                  {getFallbackText('Hata', 'Error', 'Error', 'Erreur', 'Fehler', 'خطأ', 'エラー', '오류')}
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-800 font-medium">
                  {getFallbackText('İşleniyor...', 'Processing...', 'Procesando...', 'Traitement...', 'Verarbeitung...', 'جاري المعالجة...', '処理中...', '처리 중...')}
                </span>
              </div>
              <button
                onClick={cancelProcessing}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {getFallbackText('İptal', 'Cancel', 'Cancelar', 'Annuler', 'Abbrechen', 'إلغاء', 'キャンセル', '취소')}
              </button>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-blue-700 text-sm mt-2">{progress}% {getFallbackText('tamamlandı', 'completed', 'completado', 'terminé', 'abgeschlossen', 'مكتمل', '完了', '완료')}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {getFallbackText('Dosya Yükleme', 'File Upload', 'Subir Archivo', 'Télécharger le Fichier', 'Datei Hochladen', 'رفع الملف', 'ファイルアップロード', '파일 업로드')}
              </h2>
              
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['.pdf']}
                maxSize={50 * 1024 * 1024} // 50MB
                title={getFallbackText('PDF Yükle', 'Upload PDF', 'Subir PDF', 'Télécharger PDF', 'PDF Hochladen', 'رفع PDF', 'PDFアップロード', 'PDF 업로드')}
                description={getFallbackText('PDF dosyalarını sürükle bırak veya seç', 'Drag & drop PDF files or select', 'Arrastra y suelta archivos PDF o selecciona', 'Glisser-déposer fichiers PDF ou sélectionner', 'PDF-Dateien ziehen & ablegen oder auswählen', 'اسحب وأفلت ملفات PDF أو حدد', 'PDFファイルをドラッグ&ドロップまたは選択', 'PDF 파일을 드래그 & 드롭하거나 선택')}
                multiple={true}
                locale={locale}
              />
              
              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getFallbackText('Seçilen Dosyalar', 'Selected Files', 'Archivos Seleccionados', 'Fichiers Sélectionnés', 'Ausgewählte Dateien', 'الملفات المحددة', '選択されたファイル', '선택된 파일')} ({files.length})
                    </h3>
                    <button
                      onClick={clearFiles}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      {getFallbackText('Temizle', 'Clear', 'Limpiar', 'Effacer', 'Löschen', 'مسح', 'クリア', '지우기')}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-red-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newFiles = files.filter((_, i) => i !== index);
                            setFiles(newFiles);
                            if (newFiles.length === 0) {
                              setShowOptions(false);
                              setOperation(null);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Operations */}
          <div className="space-y-6">
            {/* Operation Selection */}
            {showOptions && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {getFallbackText('İşlem Seçin', 'Select Operation', 'Seleccionar Operación', 'Sélectionner une Opération', 'Operation Auswählen', 'حدد العملية', '操作を選択', '작업 선택')}
                </h3>
                
                <div className="space-y-3">
                  {/* Split PDF */}
                  <button
                    onClick={() => setOperation('split')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      operation === 'split' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <ScissorsIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {getFallbackText('PDF Ayır', 'Split PDF', 'Dividir PDF', 'Diviser PDF', 'PDF Teilen', 'تقسيم PDF', 'PDF分割', 'PDF 분할')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getFallbackText('Sayfaları ayrı dosyalara böl', 'Split pages into separate files', 'Dividir páginas en archivos separados', 'Diviser les pages en fichiers séparés', 'Seiten in separate Dateien aufteilen', 'تقسيم الصفحات إلى ملفات منفصلة', 'ページを別ファイルに分割', '페이지를 별도 파일로 분할')}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Merge PDFs */}
                  <button
                    onClick={() => setOperation('merge')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      operation === 'merge' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Square2StackIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {getFallbackText('PDF Birleştir', 'Merge PDFs', 'Fusionar PDFs', 'Fusionner PDFs', 'PDFs Zusammenführen', 'دمج ملفات PDF', 'PDF結合', 'PDF 병합')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getFallbackText('Birden fazla PDF\'i birleştir', 'Combine multiple PDFs', 'Combinar múltiples PDFs', 'Combiner plusieurs PDFs', 'Mehrere PDFs kombinieren', 'دمج عدة ملفات PDF', '複数のPDFを結合', '여러 PDF 결합')}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Extract Text */}
                  <button
                    onClick={() => setOperation('text-extract')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      operation === 'text-extract' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {getFallbackText('Metin Çıkar', 'Extract Text', 'Extraer Texto', 'Extraire le Texte', 'Text Extrahieren', 'استخراج النص', 'テキスト抽出', '텍스트 추출')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getFallbackText('PDF\'den metin çıkar', 'Extract text from PDF', 'Extraer texto del PDF', 'Extraire le texte du PDF', 'Text aus PDF extrahieren', 'استخراج النص من PDF', 'PDFからテキストを抽出', 'PDF에서 텍스트 추출')}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Convert to Images */}
                  <button
                    onClick={() => setOperation('images')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      operation === 'images' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <PhotoIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {getFallbackText('Resimlere Dönüştür', 'Convert to Images', 'Convertir a Imágenes', 'Convertir en Images', 'In Bilder Konvertieren', 'تحويل إلى صور', '画像に変換', '이미지로 변환')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getFallbackText('PDF sayfalarını resimlere çevir', 'Convert PDF pages to images', 'Convertir páginas PDF a imágenes', 'Convertir les pages PDF en images', 'PDF-Seiten in Bilder konvertieren', 'تحويل صفحات PDF إلى صور', 'PDFページを画像に変換', 'PDF 페이지를 이미지로 변환')}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Advanced Options for Image Conversion */}
                {operation === 'images' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="font-medium text-gray-900">
                        {getFallbackText('Gelişmiş Seçenekler', 'Advanced Options', 'Opciones Avanzadas', 'Options Avancées', 'Erweiterte Optionen', 'خيارات متقدمة', '詳細オプション', '고급 옵션')}
                      </span>
                      <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </button>
                    
                    {showAdvanced && (
                      <div className="mt-4 space-y-4">
                        {/* Format Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getFallbackText('Format', 'Format', 'Formato', 'Format', 'Format', 'التنسيق', 'フォーマット', '포맷')}
                          </label>
                          <select
                            value={selectedImageFormat}
                            onChange={(e) => setSelectedImageFormat(e.target.value as 'png' | 'jpeg')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                          </select>
                        </div>

                        {/* Quality Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getFallbackText('Kalite', 'Quality', 'Calidad', 'Qualité', 'Qualität', 'الجودة', '品質', '품질')} ({Math.round(selectedImageQuality * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={selectedImageQuality}
                            onChange={(e) => setSelectedImageQuality(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* Scale Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getFallbackText('Ölçek', 'Scale', 'Escala', 'Échelle', 'Skalierung', 'المقياس', 'スケール', '스케일')} ({selectedImageScale}x)
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="4"
                            step="0.5"
                            value={selectedImageScale}
                            onChange={(e) => setSelectedImageScale(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Process Button */}
                {operation && (
                  <button
                    onClick={processFiles}
                    disabled={loading || !canUseFeature('pdf')}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {getFallbackText('İşleniyor...', 'Processing...', 'Procesando...', 'Traitement...', 'Verarbeitung...', 'جاري المعالجة...', '処理中...', '처리 중...')}
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        {getFallbackText('İşlemeyi Başlat', 'Start Processing', 'Comenzar Procesamiento', 'Commencer le Traitement', 'Verarbeitung Starten', 'بدء المعالجة', '処理を開始', '처리 시작')}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {conversionResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {getFallbackText('Sonuçlar', 'Results', 'Resultados', 'Résultats', 'Ergebnisse', 'النتائج', '結果', '결과')}
                  </h3>
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">
                        {getFallbackText('Dosya Sayısı', 'File Count', 'Número de Archivos', 'Nombre de Fichiers', 'Dateianzahl', 'عدد الملفات', 'ファイル数', '파일 수')}
                      </p>
                      <p className="font-semibold text-gray-900">{conversionResult.convertedCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">
                        {getFallbackText('Toplam Boyut', 'Total Size', 'Tamaño Total', 'Taille Totale', 'Gesamtgröße', 'الحجم الإجمالي', '総サイズ', '총 크기')}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {(conversionResult.totalSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">
                      {getFallbackText('İşlem Süresi', 'Processing Time', 'Tiempo de Procesamiento', 'Temps de Traitement', 'Verarbeitungszeit', 'وقت المعالجة', '処理時間', '처리 시간')}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {(conversionResult.processingTime / 1000).toFixed(2)} {getFallbackText('saniye', 'seconds', 'segundos', 'secondes', 'Sekunden', 'ثانية', '秒', '초')}
                    </p>
                  </div>

                  {/* Download All Button */}
                  <button
                    onClick={downloadAllAsZip}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    {getFallbackText('Tümünü ZIP Olarak İndir', 'Download All as ZIP', 'Descargar Todo como ZIP', 'Télécharger Tout en ZIP', 'Alles als ZIP Herunterladen', 'تحميل الكل كملف ZIP', 'すべてをZIPとしてダウンロード', '모든 것을 ZIP으로 다운로드')}
                  </button>

                  {/* Individual File Downloads */}
                  <div className="space-y-2">
                    {conversionResult.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{result.name}</p>
                            <p className="text-sm text-gray-500">
                              {(result.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <a
                          href={result.url}
                          download={result.name}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          {getFallbackText('İndir', 'Download', 'Descargar', 'Télécharger', 'Herunterladen', 'تحميل', 'ダウンロード', '다운로드')}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO-optimized Features Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {getFallbackText(
              'PDF İşleme Özellikleri',
              'PDF Processing Features',
              'Características de Procesamiento de PDF',
              'Fonctionnalités de Traitement PDF',
              'PDF-Verarbeitungsfunktionen',
              'ميزات معالجة PDF',
              'PDF処理機能',
              'PDF 처리 기능'
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ScissorsIcon,
                title: getFallbackText('PDF Ayırma', 'PDF Splitting', 'División de PDF', 'Division PDF', 'PDF-Aufteilung', 'تقسيم PDF', 'PDF分割', 'PDF 분할'),
                description: getFallbackText('Tek PDF dosyasını sayfa sayfa ayırın', 'Split single PDF into individual pages', 'Dividir PDF único en páginas individuales', 'Diviser un seul PDF en pages individuelles', 'Einzelne PDF in individuelle Seiten aufteilen', 'تقسيم PDF واحد إلى صفحات منفردة', '単一PDFを個別ページに分割', '단일 PDF를 개별 페이지로 분할')
              },
              {
                icon: Square2StackIcon,
                title: getFallbackText('PDF Birleştirme', 'PDF Merging', 'Fusión de PDF', 'Fusion PDF', 'PDF-Zusammenführung', 'دمج PDF', 'PDF結合', 'PDF 병합'),
                description: getFallbackText('Birden fazla PDF\'i tek dosyada birleştirin', 'Combine multiple PDFs into single file', 'Combinar múltiples PDFs en un solo archivo', 'Combiner plusieurs PDFs en un seul fichier', 'Mehrere PDFs in eine Datei kombinieren', 'دمج عدة ملفات PDF في ملف واحد', '複数のPDFを単一ファイルに結合', '여러 PDF를 단일 파일로 결합')
              },
              {
                icon: DocumentTextIcon,
                title: getFallbackText('Metin Çıkarma', 'Text Extraction', 'Extracción de Texto', 'Extraction de Texte', 'Textextraktion', 'استخراج النص', 'テキスト抽出', '텍스트 추출'),
                description: getFallbackText('PDF\'den düzenlenebilir metin çıkarın', 'Extract editable text from PDF', 'Extraer texto editable del PDF', 'Extraire le texte modifiable du PDF', 'Bearbeitbaren Text aus PDF extrahieren', 'استخراج النص القابل للتحرير من PDF', 'PDFから編集可能テキストを抽出', 'PDF에서 편집 가능한 텍스트 추출')
              },
              {
                icon: PhotoIcon,
                title: getFallbackText('Resim Dönüştürme', 'Image Conversion', 'Conversión de Imágenes', 'Conversion d\'Images', 'Bildkonvertierung', 'تحويل الصور', '画像変換', '이미지 변환'),
                description: getFallbackText('PDF sayfalarını yüksek kalite resimlere dönüştürün', 'Convert PDF pages to high-quality images', 'Convertir páginas PDF a imágenes de alta calidad', 'Convertir les pages PDF en images de haute qualité', 'PDF-Seiten in hochwertige Bilder konvertieren', 'تحويل صفحات PDF إلى صور عالية الجودة', 'PDFページを高品質画像に変換', 'PDF 페이지를 고품질 이미지로 변환')
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Structured Data */}
        <StructuredData type="howto" />
      </div>
    </div>
  );
} 