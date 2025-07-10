import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClockIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🔒 {(t as any)['privacy.title']}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {(t as any)['privacy.subtitle']}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          
          {/* Data Controller */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <UserCircleIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.dataController']}</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {locale === 'tr' ? 'Platform Bilgileri' : 
                     locale === 'en' ? 'Platform Information' :
                     locale === 'es' ? 'Información de la Plataforma' :
                     locale === 'fr' ? 'Informations sur la Plateforme' :
                     locale === 'de' ? 'Plattform-Informationen' :
                     locale === 'ar' ? 'معلومات المنصة' :
                     locale === 'ja' ? 'プラットフォーム情報' :
                     '플랫폼 정보'}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Platform:</strong> QuickUtil.app</p>
                    <p><strong>Website:</strong> https://quickutil.app</p>
                    <p><strong>E-posta:</strong> hello@quickutil.app</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {locale === 'tr' ? 'Veri Sorumlusu' : 
                     locale === 'en' ? 'Data Controller' :
                     locale === 'es' ? 'Controlador de Datos' :
                     locale === 'fr' ? 'Contrôleur de Données' :
                     locale === 'de' ? 'Datenverantwortlicher' :
                     locale === 'ar' ? 'مراقب البيانات' :
                     locale === 'ja' ? 'データ管理者' :
                     '데이터 관리자'}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>{locale === 'tr' ? 'Lokasyon' : locale === 'en' ? 'Location' : locale === 'es' ? 'Ubicación' : locale === 'fr' ? 'Emplacement' : locale === 'de' ? 'Standort' : locale === 'ar' ? 'الموقع' : locale === 'ja' ? '所在地' : '위치'}:</strong> İstanbul, {locale === 'tr' ? 'Türkiye' : 'Turkey'}</p>
                    <p><strong>{locale === 'tr' ? 'İletişim' : locale === 'en' ? 'Contact' : locale === 'es' ? 'Contacto' : locale === 'fr' ? 'Contact' : locale === 'de' ? 'Kontakt' : locale === 'ar' ? 'اتصال' : locale === 'ja' ? '連絡先' : '연락처'}:</strong> hello@quickutil.app</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collected Data */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.collectedData']}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {locale === 'tr' ? '📊 Otomatik Toplanan Veriler' :
                   locale === 'en' ? '📊 Automatically Collected Data' :
                   locale === 'es' ? '📊 Datos Recopilados Automáticamente' :
                   locale === 'fr' ? '📊 Données Collectées Automatiquement' :
                   locale === 'de' ? '📊 Automatisch Erfasste Daten' :
                   locale === 'ar' ? '📊 البيانات المجمعة تلقائياً' :
                   locale === 'ja' ? '📊 自動収集データ' :
                   '📊 자동 수집 데이터'}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• IP {locale === 'tr' ? 'Adresi' : locale === 'en' ? 'Address' : locale === 'es' ? 'Dirección' : locale === 'fr' ? 'Adresse' : locale === 'de' ? 'Adresse' : locale === 'ar' ? 'عنوان' : locale === 'ja' ? 'アドレス' : '주소'}</li>
                  <li>• {locale === 'tr' ? 'Tarayıcı bilgileri' : locale === 'en' ? 'Browser information' : locale === 'es' ? 'Información del navegador' : locale === 'fr' ? 'Informations du navigateur' : locale === 'de' ? 'Browser-Informationen' : locale === 'ar' ? 'معلومات المتصفح' : locale === 'ja' ? 'ブラウザ情報' : '브라우저 정보'}</li>
                  <li>• {locale === 'tr' ? 'İşletim sistemi' : locale === 'en' ? 'Operating system' : locale === 'es' ? 'Sistema operativo' : locale === 'fr' ? 'Système d\'exploitation' : locale === 'de' ? 'Betriebssystem' : locale === 'ar' ? 'نظام التشغيل' : locale === 'ja' ? 'オペレーティングシステム' : '운영 체제'}</li>
                  <li>• {locale === 'tr' ? 'Cihaz türü' : locale === 'en' ? 'Device type' : locale === 'es' ? 'Tipo de dispositivo' : locale === 'fr' ? 'Type d\'appareil' : locale === 'de' ? 'Gerätetyp' : locale === 'ar' ? 'نوع الجهاز' : locale === 'ja' ? 'デバイスタイプ' : '기기 유형'}</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {locale === 'tr' ? '📁 Dosya İşleme Verileri' :
                   locale === 'en' ? '📁 File Processing Data' :
                   locale === 'es' ? '📁 Datos de Procesamiento de Archivos' :
                   locale === 'fr' ? '📁 Données de Traitement de Fichiers' :
                   locale === 'de' ? '📁 Dateiverarbeitungsdaten' :
                   locale === 'ar' ? '📁 بيانات معالجة الملفات' :
                   locale === 'ja' ? '📁 ファイル処理データ' :
                   '📁 파일 처리 데이터'}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• {locale === 'tr' ? 'Dosya boyutu' : locale === 'en' ? 'File size' : locale === 'es' ? 'Tamaño del archivo' : locale === 'fr' ? 'Taille du fichier' : locale === 'de' ? 'Dateigröße' : locale === 'ar' ? 'حجم الملف' : locale === 'ja' ? 'ファイルサイズ' : '파일 크기'}</li>
                  <li>• {locale === 'tr' ? 'Dosya türü' : locale === 'en' ? 'File type' : locale === 'es' ? 'Tipo de archivo' : locale === 'fr' ? 'Type de fichier' : locale === 'de' ? 'Dateityp' : locale === 'ar' ? 'نوع الملف' : locale === 'ja' ? 'ファイルタイプ' : '파일 유형'}</li>
                  <li>• {locale === 'tr' ? 'İşlem türü' : locale === 'en' ? 'Operation type' : locale === 'es' ? 'Tipo de operación' : locale === 'fr' ? 'Type d\'opération' : locale === 'de' ? 'Vorgangstyp' : locale === 'ar' ? 'نوع العملية' : locale === 'ja' ? '操作タイプ' : '작업 유형'}</li>
                  <li>• {locale === 'tr' ? 'İşlem süresi' : locale === 'en' ? 'Processing time' : locale === 'es' ? 'Tiempo de procesamiento' : locale === 'fr' ? 'Temps de traitement' : locale === 'de' ? 'Verarbeitungszeit' : locale === 'ar' ? 'وقت المعالجة' : locale === 'ja' ? '処理時間' : '처리 시간'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing Purposes */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <LockClosedIcon className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.processingPurpose']}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-6 py-3">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'tr' ? '🎯 Hizmet Sunumu' :
                   locale === 'en' ? '🎯 Service Delivery' :
                   locale === 'es' ? '🎯 Entrega de Servicios' :
                   locale === 'fr' ? '🎯 Prestation de Services' :
                   locale === 'de' ? '🎯 Servicebereitstellung' :
                   locale === 'ar' ? '🎯 تقديم الخدمة' :
                   locale === 'ja' ? '🎯 サービス提供' :
                   '🎯 서비스 제공'}
                </h3>
                <p className="text-gray-700">
                  {locale === 'tr' ? 'PDF ve görsel dosya işleme araçlarının sunulması, dosya dönüştürme ve optimizasyon hizmetlerinin sağlanması.' :
                   locale === 'en' ? 'Providing PDF and image file processing tools, file conversion and optimization services.' :
                   locale === 'es' ? 'Proporcionar herramientas de procesamiento de archivos PDF e imágenes, servicios de conversión y optimización de archivos.' :
                   locale === 'fr' ? 'Fournir des outils de traitement de fichiers PDF et d\'images, des services de conversion et d\'optimisation de fichiers.' :
                   locale === 'de' ? 'Bereitstellung von PDF- und Bilddatei-Verarbeitungstools, Dateikonvertierungs- und Optimierungsdiensten.' :
                   locale === 'ar' ? 'توفير أدوات معالجة ملفات PDF والصور، وخدمات تحويل وتحسين الملفات.' :
                   locale === 'ja' ? 'PDFおよび画像ファイル処理ツールの提供、ファイル変換および最適化サービスの提供。' :
                   'PDF 및 이미지 파일 처리 도구 제공, 파일 변환 및 최적화 서비스 제공.'}
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-6 py-3">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'tr' ? '📈 Performans Analizi' :
                   locale === 'en' ? '📈 Performance Analysis' :
                   locale === 'es' ? '📈 Análisis de Rendimiento' :
                   locale === 'fr' ? '📈 Analyse de Performance' :
                   locale === 'de' ? '📈 Leistungsanalyse' :
                   locale === 'ar' ? '📈 تحليل الأداء' :
                   locale === 'ja' ? '📈 パフォーマンス分析' :
                   '📈 성능 분석'}
                </h3>
                <p className="text-gray-700">
                  {locale === 'tr' ? 'Platform performansının izlenmesi, hizmet kalitesinin artırılması ve kullanıcı deneyiminin geliştirilmesi.' :
                   locale === 'en' ? 'Monitoring platform performance, improving service quality and enhancing user experience.' :
                   locale === 'es' ? 'Monitorear el rendimiento de la plataforma, mejorar la calidad del servicio y mejorar la experiencia del usuario.' :
                   locale === 'fr' ? 'Surveiller les performances de la plateforme, améliorer la qualité du service et améliorer l\'expérience utilisateur.' :
                   locale === 'de' ? 'Überwachung der Plattform-Performance, Verbesserung der Servicequalität und Verbesserung der Benutzererfahrung.' :
                   locale === 'ar' ? 'مراقبة أداء المنصة وتحسين جودة الخدمة وتعزيز تجربة المستخدم.' :
                   locale === 'ja' ? 'プラットフォームパフォーマンスの監視、サービス品質の向上、ユーザーエクスペリエンスの向上。' :
                   '플랫폼 성능 모니터링, 서비스 품질 향상 및 사용자 경험 개선.'}
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-6 py-3">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'tr' ? '🔒 Güvenlik' :
                   locale === 'en' ? '🔒 Security' :
                   locale === 'es' ? '🔒 Seguridad' :
                   locale === 'fr' ? '🔒 Sécurité' :
                   locale === 'de' ? '🔒 Sicherheit' :
                   locale === 'ar' ? '🔒 الأمان' :
                   locale === 'ja' ? '🔒 セキュリティ' :
                   '🔒 보안'}
                </h3>
                <p className="text-gray-700">
                  {locale === 'tr' ? 'Platform güvenliğinin sağlanması, spam ve kötüye kullanımın önlenmesi, güvenlik ihlallerinin tespiti.' :
                   locale === 'en' ? 'Ensuring platform security, preventing spam and abuse, detecting security breaches.' :
                   locale === 'es' ? 'Garantizar la seguridad de la plataforma, prevenir spam y abuso, detectar brechas de seguridad.' :
                   locale === 'fr' ? 'Assurer la sécurité de la plateforme, prévenir le spam et les abus, détecter les failles de sécurité.' :
                   locale === 'de' ? 'Gewährleistung der Plattform-Sicherheit, Verhinderung von Spam und Missbrauch, Erkennung von Sicherheitsverletzungen.' :
                   locale === 'ar' ? 'ضمان أمان المنصة ومنع الرسائل العشوائية وسوء الاستخدام واكتشاف الانتهاكات الأمنية.' :
                   locale === 'ja' ? 'プラットフォームセキュリティの確保、スパムおよび悪用の防止、セキュリティ侵害の検出。' :
                   '플랫폼 보안 확보, 스팸 및 악용 방지, 보안 침해 탐지.'}
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.dataSecurity']}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">SSL {locale === 'tr' ? 'Şifrelemesi' : locale === 'en' ? 'Encryption' : locale === 'es' ? 'Cifrado' : locale === 'fr' ? 'Chiffrement' : locale === 'de' ? 'Verschlüsselung' : locale === 'ar' ? 'التشفير' : locale === 'ja' ? '暗号化' : '암호화'}</h3>
                <p className="text-sm text-gray-600">256-bit SSL {locale === 'tr' ? 'ile güvenli veri transferi' : locale === 'en' ? 'secure data transfer' : locale === 'es' ? 'transferencia segura de datos' : locale === 'fr' ? 'transfert de données sécurisé' : locale === 'de' ? 'sichere Datenübertragung' : locale === 'ar' ? 'نقل آمن للبيانات' : locale === 'ja' ? 'セキュアデータ転送' : '보안 데이터 전송'}</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <ClockIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{locale === 'tr' ? 'Otomatik Silme' : locale === 'en' ? 'Auto Deletion' : locale === 'es' ? 'Eliminación Automática' : locale === 'fr' ? 'Suppression Automatique' : locale === 'de' ? 'Automatische Löschung' : locale === 'ar' ? 'الحذف التلقائي' : locale === 'ja' ? '自動削除' : '자동 삭제'}</h3>
                <p className="text-sm text-gray-600">{locale === 'tr' ? 'İşlem sonrası dosyalar otomatik silinir' : locale === 'en' ? 'Files are automatically deleted after processing' : locale === 'es' ? 'Los archivos se eliminan automáticamente después del procesamiento' : locale === 'fr' ? 'Les fichiers sont automatiquement supprimés après traitement' : locale === 'de' ? 'Dateien werden nach der Verarbeitung automatisch gelöscht' : locale === 'ar' ? 'يتم حذف الملفات تلقائياً بعد المعالجة' : locale === 'ja' ? 'ファイルは処理後に自動的に削除されます' : '파일은 처리 후 자동으로 삭제됩니다'}</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <LockClosedIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{locale === 'tr' ? 'Veri Minimizasyonu' : locale === 'en' ? 'Data Minimization' : locale === 'es' ? 'Minimización de Datos' : locale === 'fr' ? 'Minimisation des Données' : locale === 'de' ? 'Datenminimierung' : locale === 'ar' ? 'تقليل البيانات' : locale === 'ja' ? 'データ最小化' : '데이터 최소화'}</h3>
                <p className="text-sm text-gray-600">{locale === 'tr' ? 'Sadece gerekli veriler toplanır' : locale === 'en' ? 'Only necessary data is collected' : locale === 'es' ? 'Solo se recopilan los datos necesarios' : locale === 'fr' ? 'Seules les données nécessaires sont collectées' : locale === 'de' ? 'Es werden nur notwendige Daten gesammelt' : locale === 'ar' ? 'يتم جمع البيانات الضرورية فقط' : locale === 'ja' ? '必要なデータのみが収集されます' : '필요한 데이터만 수집됩니다'}</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📧 {(t as any)['privacy.contact']}</h2>
              <p className="text-lg text-gray-600">
                {locale === 'tr' ? 'Gizlilik ile ilgili sorularınız için' :
                 locale === 'en' ? 'For privacy-related questions' :
                 locale === 'es' ? 'Para preguntas relacionadas con la privacidad' :
                 locale === 'fr' ? 'Pour les questions liées à la confidentialité' :
                 locale === 'de' ? 'Für datenschutzbezogene Fragen' :
                 locale === 'ar' ? 'للأسئلة المتعلقة بالخصوصية' :
                 locale === 'ja' ? 'プライバシーに関するご質問' :
                 '개인정보 관련 질문'}
              </p>
            </div>
            
            <div className="text-center text-gray-600 mb-6">
              <p><strong>E-posta:</strong> hello@quickutil.app</p>
              <p><strong>Website:</strong> https://quickutil.app</p>
            </div>
            
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-500">
                <strong>
                  {locale === 'tr' ? 'Son Güncelleme' : 
                   locale === 'en' ? 'Last Updated' :
                   locale === 'es' ? 'Última Actualización' :
                   locale === 'fr' ? 'Dernière Mise à Jour' :
                   locale === 'de' ? 'Zuletzt Aktualisiert' :
                   locale === 'ar' ? 'آخر تحديث' :
                   locale === 'ja' ? '最終更新' :
                   '마지막 업데이트'}:
                </strong> {new Date().toLocaleDateString(locale)} • 
                <strong>KVKK & GDPR {locale === 'tr' ? 'Uyumlu' : locale === 'en' ? 'Compliant' : locale === 'es' ? 'Cumple' : locale === 'fr' ? 'Conforme' : locale === 'de' ? 'Konform' : locale === 'ar' ? 'متوافق' : locale === 'ja' ? '準拠' : '준수'}</strong>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
} 