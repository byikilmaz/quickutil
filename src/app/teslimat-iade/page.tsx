'use client';

import StructuredData from '@/components/StructuredData';
import { 
  TruckIcon, 
  ArrowUturnLeftIcon, 
  ClockIcon, 
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function TeslimatIadePage() {
  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <TruckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                📦 Teslimat ve İade Şartları
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dijital hizmetlerimizin teslimatı ve iade koşulları hakkında detaylı bilgiler
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Önemli Not */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="w-6 h-6 text-yellow-600 mr-3" />
                <h2 className="text-xl font-bold text-yellow-800">⚠️ Önemli Bilgilendirme</h2>
              </div>
              <p className="text-yellow-700 leading-relaxed">
                QuickUtil.app tamamen <strong>dijital hizmet platformu</strong>dur. 
                Fiziksel ürün teslimatı yapılmamaktadır. Tüm hizmetlerimiz anlık olarak 
                web platformu üzerinden sunulmaktadır.
              </p>
            </div>

            {/* Hizmet Teslimatı */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <CheckCircleIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">1. Hizmet Teslimatı</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Anlık Teslimat</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• PDF sıkıştırma ve dönüştürme işlemleri</li>
                      <li>• Görsel işleme araçları</li>
                      <li>• Batch işleme hizmetleri</li>
                      <li>• E-imza işlemleri</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Teslimat Süresi:</strong> Anlık (0-30 saniye)
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Premium Hizmetler</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hesap aktivasyonu</li>
                      <li>• Premium özellik erişimi</li>
                      <li>• Cloud storage erişimi</li>
                      <li>• API entegrasyonu</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Aktivasyon Süresi:</strong> Ödeme onayından sonra 24 saat içinde
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Erişim Şekilleri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Web tarayıcısı üzerinden</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Mobil cihazlar ile uyumlu</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">24/7 erişim imkanı</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">İnternet bağlantısı gerekli</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* İade Koşulları */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <ArrowUturnLeftIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">2. İade Koşulları</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800 mb-3">✅ İade Edilebilir Hizmetler</h3>
                      <ul className="space-y-2 text-green-700">
                        <li>• Premium abonelik bedelleri</li>
                        <li>• Business planı ödemeleri</li>
                        <li>• Henüz kullanılmamış ödeme planları</li>
                      </ul>
                      <p className="text-sm text-green-600 mt-3 font-medium">
                        İade süresi: Satın alma tarihinden itibaren 14 gün
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">❌ İade Edilemeyen Hizmetler</h3>
                      <ul className="space-y-2 text-red-700">
                        <li>• Tamamlanmış dosya işleme hizmetleri</li>
                        <li>• İndirilmiş işlenmiş dosyalar</li>
                        <li>• Kullanılmış API çağrıları</li>
                        <li>• Kısmi kullanılan abonelik süreleri</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 İade Süreci</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-1">1</div>
                          <p className="text-gray-700">E-posta ile başvuru: destek@quickutil.app</p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-1">2</div>
                          <p className="text-gray-700">İade gerekçesini belirtme</p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-1">3</div>
                          <p className="text-gray-700">48 saat içinde değerlendirme</p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-1">4</div>
                          <p className="text-gray-700">Onay sonrası 7-14 gün içinde iade</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ödeme ve Faturalama */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">3. Ödeme ve Faturalama</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <CreditCardIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Ödeme Yöntemleri</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Kredi Kartı</li>
                    <li>• Banka Kartı</li>
                    <li>• PayPal</li>
                    <li>• İyzico Güvencesi</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <DocumentTextIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Fatura Bilgileri</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• E-fatura gönderimi</li>
                    <li>• Kurumsal fatura</li>
                    <li>• USD bazlı fiyatlar</li>
                    <li>• Otomatik faturalama</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <ClockIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Ödeme Zamanı</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Anlık ödeme</li>
                    <li>• Güvenli işlem</li>
                    <li>• SSL koruması</li>
                    <li>• 3D Secure</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cayma Hakkı */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Cayma Hakkı (Mesafeli Satış)</h2>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚖️ Yasal Haklar</h3>
                  <p className="text-yellow-700 leading-relaxed">
                    6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, 
                    tüketicilerin dijital hizmetlerde <strong>14 günlük cayma hakkı</strong> bulunmaktadır.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Cayma Hakkı Şartları</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hizmet henüz başlatılmamışsa</li>
                      <li>• Ödeme tarihinden itibaren 14 gün içinde</li>
                      <li>• Yazılı bildirim (e-posta)</li>
                      <li>• Gerekçe belirtme zorunluluğu yok</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Cayma Hakkının Sona Erdiği Durumlar</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hizmet tamamlandıktan sonra</li>
                      <li>• Dosya işleme tamamlandıktan sonra</li>
                      <li>• Premium özellik kullanıldıktan sonra</li>
                      <li>• 14 günlük süre geçtikten sonra</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* İletişim ve Destek */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. İletişim ve Müşteri Desteği</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">İletişim Bilgileri</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>E-posta:</strong> destek@quickutil.app</p>
                    <p><strong>Web Sitesi:</strong> https://quickutil.app</p>
                    <p><strong>Adres:</strong> Halkalı Merkez Mah. 1438. Sk. D No: 2 D İç Kapı No: 2, Küçükçekmece/İstanbul</p>
                    <p><strong>Vergi No:</strong> 9530416885</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Destek Saatleri</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Pazartesi - Cuma:</strong> 09:00 - 18:00</li>
                      <li><strong>Cumartesi:</strong> 09:00 - 14:00</li>
                      <li><strong>Pazar:</strong> Kapalı</li>
                      <li><strong>Yanıt Süresi:</strong> En geç 24 saat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Yasal Uyarılar */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📋 Yasal Uyarılar ve Bildirimler
              </h2>
              
              <div className="space-y-4 text-center text-gray-600">
                <p>
                  Bu sayfa 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 
                  Mesafeli Sözleşmeler Yönetmeliği uyarınca hazırlanmıştır.
                </p>
                <p>
                  Uyuşmazlık durumunda İstanbul mahkemeleri yetkilidir.
                </p>
                <p className="font-semibold text-gray-700">
                  Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
} 