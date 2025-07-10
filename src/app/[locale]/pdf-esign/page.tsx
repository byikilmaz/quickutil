'use client';
import { useState } from 'react';
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

  const steps = [
    { id: 1, name: getText('pdfEsign.steps.upload', 'PDF Yükle'), icon: DocumentTextIcon },
    { id: 2, name: getText('pdfEsign.steps.position', 'İmza Konumu'), icon: PencilSquareIcon },
    { id: 3, name: getText('pdfEsign.steps.email', 'Email Gönder'), icon: EnvelopeIcon },
    { id: 4, name: getText('pdfEsign.steps.complete', 'İmza Tamamla'), icon: CheckCircleIcon }
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
            {getText('pdfEsign.title', 'PDF E-İmza')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {getText('pdfEsign.subtitle', 'PDF belgelerinizi dijital olarak imzalayın ve kolayca gönderin')}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            <span>✨ {getText('pdfEsign.newFeature', 'YENİ ÖZELLİK')}</span>
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
              {getText('pdfEsign.developing.title', 'E-İmza Sistemi Geliştiriliyor')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {getText('pdfEsign.developing.description', 'PDF e-imza özelliği yakında kullanıma hazır olacak. Bu güçlü sistem ile PDF belgelerinizi dijital olarak imzalayabilecek ve kolayca gönderebileceksiniz.')}
            </p>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <DocumentTextIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{getText('pdfEsign.features.viewer.title', 'PDF Viewer')}</h3>
                <p className="text-sm text-gray-600">{getText('pdfEsign.features.viewer.description', 'PDF dosyalarınızı görüntüleyin ve imza konumlarını seçin')}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <PencilSquareIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{getText('pdfEsign.features.signature.title', 'Dijital İmza')}</h3>
                <p className="text-sm text-gray-600">{getText('pdfEsign.features.signature.description', 'Canvas üzerinde el yazısı imza oluşturun')}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <EnvelopeIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{getText('pdfEsign.features.email.title', 'Email Workflow')}</h3>
                <p className="text-sm text-gray-600">{getText('pdfEsign.features.email.description', 'İmza için belgeleri güvenle email ile gönderin')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 