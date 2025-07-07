'use client';

import StructuredData from '@/components/StructuredData';
import { 
  BuildingOfficeIcon, 
  GlobeAltIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon
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
                🏢 Hakkımızda
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                QuickUtil.app olarak, dosya işleme ve PDF yönetimi alanında 
                modern çözümler sunuyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Şirket Bilgileri */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Şirket Bilgileri</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Şirket Sahibi</h3>
                    <p className="text-gray-600">Bilal Yıkılmaz</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Faaliyet Alanı</h3>
                    <p className="text-gray-600">
                      Bina Projelerine Yönelik Mühendislik ve Danışmanlık Faaliyetleri
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kuruluş Tarihi</h3>
                    <p className="text-gray-600">24 Mayıs 2017</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Adres</h3>
                    <p className="text-gray-600">
                      Halkalı Merkez Mah. 1438. Sk. D No: 2 D İç Kapı No: 2<br />
                      Küçükçekmece / İstanbul
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vergi Bilgileri</h3>
                    <p className="text-gray-600">
                      Vergi No: 9530416885<br />
                      TC Kimlik No: 12645032148
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Misyonumuz */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <GlobeAltIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Misyonumuz</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                QuickUtil.app olarak, dijital dosya yönetimi ve işleme süreçlerini 
                herkes için basit, hızlı ve güvenli hale getirmeyi hedefliyoruz. 
                PDF sıkıştırma, dönüştürme ve düzenleme araçlarımızla kullanıcılarımızın 
                iş verimliliğini artırmayı amaçlıyoruz.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CpuChipIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Teknoloji</h3>
                  <p className="text-sm text-gray-600">
                    Modern web teknolojileri ile güçlü araçlar
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Güvenlik</h3>
                  <p className="text-sm text-gray-600">
                    SSL şifrelemesi ile tam güvenlik
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <UserGroupIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Kullanıcı Odaklı</h3>
                  <p className="text-sm text-gray-600">
                    Basit ve sezgisel kullanıcı deneyimi
                  </p>
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
                  <h3 className="text-xl font-semibold text-gray-900">PDF İşlemleri</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• PDF Sıkıştırma</li>
                    <li>• PDF Dönüştürme</li>
                    <li>• PDF Birleştirme ve Ayırma</li>
                    <li>• PDF E-İmza</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Görsel İşlemler</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Görsel Sıkıştırma</li>
                    <li>• Format Dönüştürme</li>
                    <li>• Yeniden Boyutlandırma</li>
                    <li>• Batch İşleme</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* İletişim */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">İletişim</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İş Adresi</h3>
                  <p className="text-gray-600 mb-4">
                    Halkalı Merkez Mah. 1438. Sk. D No: 2 D İç Kapı No: 2<br />
                    Küçükçekmece / İstanbul
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Web Sitesi</h3>
                  <p className="text-blue-600">
                    <a href="https://quickutil.app" className="hover:underline">
                      https://quickutil.app
                    </a>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">E-posta</h3>
                  <p className="text-gray-600 mb-4">
                    hello@quickutil.app
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Çalışma Saatleri</h3>
                  <p className="text-gray-600">
                    Pazartesi - Cuma: 09:00 - 18:00<br />
                    Cumartesi: 09:00 - 14:00
                  </p>
                </div>
              </div>
            </div>

            {/* Yasal Uyum */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📋 Yasal Uyum ve Sertifikalar
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <ShieldCheckIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">SSL Sertifikası</h3>
                  <p className="text-sm text-gray-600">
                    256-bit SSL şifrelemesi ile güvenli veri aktarımı
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <DocumentTextIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">KVKK Uyumu</h3>
                  <p className="text-sm text-gray-600">
                    Kişisel Verilerin Korunması Kanunu&apos;na tam uyum
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