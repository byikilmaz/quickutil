'use client';

import StructuredData from '@/components/StructuredData';
import { 
  RocketLaunchIcon,
  EyeIcon,
  HeartIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function HakkimizdaPage() {
  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🚀 Hakkımızda
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                QuickUtil.app - Modern dosya işleme deneyimini herkes için erişilebilir kılan ücretsiz platform
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Proje Amacı */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <RocketLaunchIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Proje Amacı</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                QuickUtil.app, günlük hayatta karşılaştığımız dosya işleme sorunlarına modern, hızlı ve ücretsiz 
                çözümler sunmak amacıyla geliştirilmiş bir web platformudur. PDF sıkıştırma, görsel dönüştürme 
                ve dosya düzenleme gibi temel ihtiyaçları karmaşık yazılım kurulumları olmadan, doğrudan 
                tarayıcıda gerçekleştirebilmenizi sağlar.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">⭐ Temel Hedefimiz</h3>
                <p className="text-blue-800">
                  Herkesin kaliteli dosya işleme araçlarına ücretsiz erişebilmesi ve günlük iş akışlarını 
                  kolaylaştırabilmesi için kullanıcı dostu bir platform oluşturmak.
                </p>
              </div>
            </div>

            {/* Vizyonumuz */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <EyeIcon className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Vizyonumuz</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Dünya çapında en çok tercih edilen ücretsiz dosya işleme platformu olmak. Her kullanıcının, 
                teknik bilgi seviyesi ne olursa olsun, profesyonel kalitede araçlara erişebileceği 
                bir ekosistem yaratmak.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <GlobeAltIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Global Erişim</h3>
                  <p className="text-sm text-gray-600">
                    Dünyanın her yerinden erişilebilir platform
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <UserGroupIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Herkes İçin</h3>
                  <p className="text-sm text-gray-600">
                    Tüm teknik seviyeler için uygun araçlar
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <HeartIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Sürdürülebilir</h3>
                  <p className="text-sm text-gray-600">
                    Uzun vadeli ücretsiz hizmet garantisi
                  </p>
                </div>
              </div>
            </div>

            {/* Misyonumuz */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <HeartIcon className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Misyonumuz</h2>
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  PDF ve görsel dosya işleme süreçlerini demokratikleştirmek. Kullanıcılarımıza güvenli, 
                  hızlı ve kaliteli araçlar sunarak günlük hayatlarını kolaylaştırmak.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 Kalite</h3>
                    <p className="text-green-800 text-sm">
                      Profesyonel düzeyde dosya işleme kalitesi sunan algoritmaları ücretsiz erişime açıyoruz.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">🔒 Güvenlik</h3>
                    <p className="text-green-800 text-sm">
                      Dosyalarınızın gizliliği ve güvenliği için en üst düzey koruma önlemleri alıyoruz.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">⚡ Hız</h3>
                    <p className="text-green-800 text-sm">
                      Modern web teknolojileri ile saniyeler içinde dosya işleme imkanı sunuyoruz.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">🆓 Ücretsiz</h3>
                    <p className="text-green-800 text-sm">
                      Temel dosya işleme araçlarının her zaman ücretsiz kalması konusunda kararlıyız.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hizmetlerimiz */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Hizmetlerimiz</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">📄 PDF İşlemleri</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• PDF Sıkıştırma - Dosya boyutunu optimize etme</li>
                    <li>• PDF Dönüştürme - Görsel formatlarına çevirme</li>
                    <li>• PDF Birleştirme - Çoklu dosyaları tek PDF yapma</li>
                    <li>• PDF Ayırma - Sayfa bazında dosya bölme</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">🖼️ Görsel İşlemler</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Görsel Sıkıştırma - Kalite koruyarak boyut azaltma</li>
                    <li>• Format Dönüştürme - JPG, PNG, WebP arası çevirme</li>
                    <li>• Yeniden Boyutlandırma - Özel ölçülerde ayarlama</li>
                    <li>• Batch İşleme - Toplu dosya işleme</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Teknoloji & Güvenlik */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🛡️ Teknoloji ve Güvenlik
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <CpuChipIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Modern Stack</h3>
                  <p className="text-sm text-gray-600">
                    Next.js, React, Firebase ile güçlü altyapı
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <ShieldCheckIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">SSL Güvenlik</h3>
                  <p className="text-sm text-gray-600">
                    256-bit şifreleme ile tam güvenlik
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <DocumentTextIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">KVKK Uyumu</h3>
                  <p className="text-sm text-gray-600">
                    Kişisel Verilerin Korunması Kanunu&apos;na tam uyum
                  </p>
                </div>
              </div>
            </div>

            {/* İletişim */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                📞 İletişim
              </h2>
              
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">E-posta Desteği</h3>
                  <p className="text-blue-600 text-lg">
                    <a href="mailto:hello@quickutil.app" className="hover:underline">
                      hello@quickutil.app
                    </a>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Web Sitesi</h3>
                  <p className="text-blue-600 text-lg">
                    <a href="https://quickutil.app" className="hover:underline">
                      https://quickutil.app
                    </a>
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                  <p className="text-blue-800">
                    📧 Sorularınız, önerileriniz ve geri bildirimleriniz için her zaman buradayız!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
} 