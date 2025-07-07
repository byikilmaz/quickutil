'use client';

import StructuredData from '@/components/StructuredData';
import { ShieldCheckIcon, DocumentTextIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function GizlilikSozlesmesiPage() {
  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🔒 Gizlilik Sözleşmesi
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kişisel verilerinizin korunması ve işlenmesi hakkında detaylı bilgiler
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            
            {/* Veri Sorumlusu */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">1. Veri Sorumlusu</h2>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Platform Bilgileri:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Platform:</strong> QuickUtil.app</li>
                  <li><strong>Lokasyon:</strong> İstanbul, Türkiye</li>
                  <li><strong>E-posta:</strong> hello@quickutil.app</li>
                  <li><strong>Web Sitesi:</strong> https://quickutil.app</li>
                </ul>
              </div>
            </section>

            {/* Toplanan Veriler */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">2. Toplanan Kişisel Veriler</h2>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-3">2.1 Kimlik Bilgileri</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Ad, soyad</li>
                    <li>E-posta adresi</li>
                    <li>Şifre (şifrelenmiş)</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-3">2.2 Hizmet Kullanım Bilgileri</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Yüklenen dosya bilgileri (boyut, format, işlem türü)</li>
                    <li>Hizmet kullanım geçmişi</li>
                    <li>İşlem tarihleri ve süreleri</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-3">2.3 Teknik Bilgiler</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>IP adresi</li>
                    <li>Tarayıcı bilgileri</li>
                    <li>Cihaz bilgileri</li>
                    <li>Log kayıtları</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Veri İşleme Amaçları */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Kişisel Verilerin İşlenme Amaçları</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Temel Amaçlar</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Hizmet sunumu ve yönetimi</li>
                    <li>Kullanıcı hesabı oluşturma</li>
                    <li>Dosya işleme hizmetleri</li>
                    <li>Teknik destek sağlama</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">İkincil Amaçlar</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Hizmet kalitesini artırma</li>
                    <li>Güvenlik önlemleri</li>
                    <li>İstatistiksel analiz</li>
                    <li>Yasal yükümlülükler</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Veri Saklama */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Veri Saklama Süreleri</h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Hesap Bilgileri</h3>
                  <p className="text-gray-700">Hesap aktif olduğu sürece saklanır.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">İşlenen Dosyalar</h3>
                  <p className="text-gray-700">Ücretsiz kullanıcılar: 30 gün, Premium kullanıcılar: 1 yıl</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Log Kayıtları</h3>
                  <p className="text-gray-700">Güvenlik amaçlı 1 yıl saklanır.</p>
                </div>
              </div>
            </section>

            {/* Veri Güvenliği */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">5. Veri Güvenliği</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">SSL Şifrelemesi</h3>
                  <p className="text-sm text-gray-600">256-bit SSL ile veri aktarımı</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <EyeIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Erişim Kontrolü</h3>
                  <p className="text-sm text-gray-600">Sıkı erişim yetkilendirmesi</p>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <DocumentTextIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Şifreleme</h3>
                  <p className="text-sm text-gray-600">Veritabanı şifrelemesi</p>
                </div>
              </div>
            </section>

            {/* Kullanıcı Hakları */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. KVKK Kapsamında Haklarınız</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Kanuni haklarınız:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>İşlenen veriler hakkında bilgi talep etme</li>
                    <li>İşleme amacını öğrenme</li>
                    <li>Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                  </ul>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Kanunlarda öngörülen şartlar çerçevesinde silme veya yok etme</li>
                    <li>Düzeltme, silme veya yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                    <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhte bir sonucun ortaya çıkmasına itiraz etme</li>
                    <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookie Politikası */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Cookie Politikası</h2>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Web sitemizde kullanıcı deneyimini iyileştirmek amacıyla çerezler (cookies) kullanılmaktadır.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Kullanılan Çerez Türleri:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Gerekli Çerezler:</strong> Sitenin temel işlevselliği için</li>
                    <li><strong>Performans Çerezleri:</strong> Site performansı analizi için</li>
                    <li><strong>İşlevsellik Çerezleri:</strong> Kullanıcı tercihlerini hatırlama</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* İletişim */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. İletişim ve Başvuru</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yollarla bizimle iletişime geçebilirsiniz:
                </p>
                
                <div className="space-y-2 text-gray-700">
                  <p><strong>E-posta:</strong> hello@quickutil.app</p>
                  <p><strong>Lokasyon:</strong> İstanbul, Türkiye</p>
                  <p><strong>Başvuru Süresi:</strong> En geç 30 gün içinde yanıtlanır</p>
                </div>
              </div>
            </section>

            {/* Son Notlar */}
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center text-sm text-gray-500 space-y-2">
                <p>Bu gizlilik sözleşmesi 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca hazırlanmıştır.</p>
                <p>Sözleşme değişiklikleri web sitesi üzerinden duyurulacaktır.</p>
                <p className="font-semibold">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
} 