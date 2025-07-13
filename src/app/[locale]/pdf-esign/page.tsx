'use client';
import { useState, useEffect } from 'react';
import { 
  PencilSquareIcon, 
  DocumentTextIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';

export default async function PDFESign({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFESignContent locale={locale} />;
}

function PDFESignContent({ locale }: { locale: string }) {
  const [currentStep] = useState(1);
  const t = getTranslations(locale);

  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  // Helper function for multi-language fallbacks including French
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
    console.log(`🔏 PDF ESIGN DEBUG - getFallbackText called for locale: ${locale}`);
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
        console.log(`🇫🇷 FRENCH DETECTED - Using: ${result}`);
        break;
      case 'de': 
        result = deText || enText;
        break;
      default: 
        result = enText;
    }
    
    console.log(`  → Selected: ${result}`);
    return result;
  };

  // Enhanced debug logging with browser detection for French support
  useEffect(() => {
    console.log('🔏 PDF ESIGN DEBUG - Enhanced Translation System:');
    console.log('  - Current locale:', locale);
    console.log('  - Browser language:', typeof navigator !== 'undefined' ? navigator.language : 'server-side');
    console.log('  - Browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'server-side');
    console.log('  - URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server-side');
    console.log('  - Is French detected:', typeof navigator !== 'undefined' ? navigator.language.startsWith('fr') : false);
    
    console.log('🔏 PDF ESIGN DEBUG - Sample Translation Values:');
    console.log('  - Title:', getText('pdfEsign.title', getFallbackText('PDF E-İmza', 'PDF E-Sign', 'Firma PDF', 'Signature PDF Électronique')));
    console.log('  - Page ready for French translations');
  }, [locale]);

  const steps = [
    { id: 1, name: getText('pdfEsign.steps.upload', getFallbackText('PDF Yükle', 'Upload PDF', 'Subir PDF', 'Télécharger PDF')), icon: DocumentTextIcon },
    { id: 2, name: getText('pdfEsign.steps.position', getFallbackText('İmza Konumu', 'Signature Position', 'Posición de Firma', 'Position Signature')), icon: PencilSquareIcon },
    { id: 3, name: getText('pdfEsign.steps.email', getFallbackText('Email Gönder', 'Send Email', 'Enviar Email', 'Envoyer Email')), icon: EnvelopeIcon },
    { id: 4, name: getText('pdfEsign.steps.complete', getFallbackText('İmza Tamamla', 'Complete Signature', 'Completar Firma', 'Compléter Signature')), icon: CheckCircleIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white mb-4 shadow-lg">
            <PencilSquareIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {getText('pdfEsign.title', getFallbackText('PDF E-İmza', 'PDF E-Sign', 'Firma PDF', 'Signature PDF Électronique'))}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {getText('pdfEsign.subtitle', getFallbackText('PDF belgelerinizi dijital olarak imzalayın ve kolayca gönderin', 'Digitally sign your PDF documents and send them easily', 'Firme digitalmente sus documentos PDF y envíelos fácilmente', 'Signez numériquement vos documents PDF et envoyez-les facilement'))}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            <span>✨ {getText('pdfEsign.newFeature', getFallbackText('YENİ ÖZELLİK', 'NEW FEATURE', 'NUEVA FUNCIÓN', 'NOUVELLE FONCTIONNALITÉ'))}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center">
            <nav aria-label="Progress" className="max-w-2xl w-full">
              <ol className="flex items-center justify-between">
                {steps.map((step, stepIdx) => (
                  <li key={step.id} className="relative flex-1">
                    <div className="flex items-center">
                      <div
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          step.id <= currentStep
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 bg-white text-gray-500'
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3 text-left">
                        <p className={`text-sm font-medium ${
                          step.id <= currentStep ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                      </div>
                      {stepIdx !== steps.length - 1 && (
                        <div
                          className={`ml-4 flex-1 border-t-2 ${
                            step.id < currentStep ? 'border-green-600' : 'border-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <PencilSquareIcon className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {getText('pdfEsign.developing.title', getFallbackText('E-İmza Sistemi Geliştiriliyor', 'E-Signature System in Development', 'Sistema de Firma Electrónica en Desarrollo', 'Système de Signature Électronique en Développement'))}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {getText('pdfEsign.developing.description', getFallbackText('PDF e-imza özelliği yakında kullanıma hazır olacak. Bu güçlü sistem ile PDF belgelerinizi dijital olarak imzalayabilecek ve kolayca gönderebileceksiniz.', 'PDF e-signature feature will be ready for use soon. With this powerful system, you will be able to digitally sign your PDF documents and send them easily.', 'La función de firma electrónica de PDF estará lista para usar pronto. Con este potente sistema, podrá firmar digitalmente sus documentos PDF y enviarlos fácilmente.', 'La fonctionnalité de signature électronique PDF sera bientôt prête à l\'emploi. Avec ce système puissant, vous pourrez signer numériquement vos documents PDF et les envoyer facilement.'))}
            </p>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <DocumentTextIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{getText('pdfEsign.features.viewer.title', getFallbackText('PDF Viewer', 'PDF Viewer', 'Visor PDF', 'Visionneuse PDF'))}</h3>
                <p className="text-sm text-gray-600">{getText('pdfEsign.features.viewer.description', getFallbackText('PDF dosyalarınızı görüntüleyin ve imza konumlarını seçin', 'View your PDF files and select signature positions', 'Vea sus archivos PDF y seleccione posiciones de firma', 'Visualisez vos fichiers PDF et sélectionnez les positions de signature'))}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <PencilSquareIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{getText('pdfEsign.features.signature.title', getFallbackText('Dijital İmza', 'Digital Signature', 'Firma Digital', 'Signature Numérique'))}</h3>
                <p className="text-sm text-gray-600">{getText('pdfEsign.features.signature.description', getFallbackText('Canvas üzerinde el yazısı imza oluşturun', 'Create handwritten signatures on canvas', 'Crear firmas manuscritas en canvas', 'Créez des signatures manuscrites sur canevas'))}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <EnvelopeIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{getText('pdfEsign.features.email.title', getFallbackText('Email Workflow', 'Email Workflow', 'Flujo de Email', 'Flux de Courrier'))}</h3>
                <p className="text-sm text-gray-600">{getText('pdfEsign.features.email.description', getFallbackText('İmza için belgeleri güvenle email ile gönderin', 'Send documents securely via email for signature', 'Envíe documentos de forma segura por email para firmar', 'Envoyez des documents en toute sécurité par email pour signature'))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 