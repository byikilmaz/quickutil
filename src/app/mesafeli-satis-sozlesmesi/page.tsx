'use client';

import StructuredData from '@/components/StructuredData';
import { 
  DocumentTextIcon, 
  ScaleIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  CreditCardIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <ScaleIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                ⚖️ Mesafeli Satış Sözleşmesi
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca hazırlanmış dijital hizmet sözleşmesi
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

            {/* Taraflar */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <UserIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">1. Sözleşmenin Tarafları</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">SATICI</h3>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Unvan:</strong> Bilal Yıkılmaz</p>
                    <p><strong>Adres:</strong> Halkalı Merkez Mah. 1438. Sk. D No: 2 D İç Kapı No: 2, Küçükçekmece/İstanbul</p>
                    <p><strong>Vergi No:</strong> 9530416885</p>
                    <p><strong>TC Kimlik No:</strong> 12645032148</p>
                    <p><strong>E-posta:</strong> destek@quickutil.app</p>
                    <p><strong>Telefon:</strong> İletişim formu ile</p>
                    <p><strong>Web Sitesi:</strong> https://quickutil.app</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <UserIcon className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">ALICI (TÜKETİCİ)</h3>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p>Platform üzerinden kayıt olan ve hizmet satın alan gerçek veya tüzel kişi</p>
                    <p><strong>Tanım:</strong> 6502 sayılı TKHK kapsamında tüketici</p>
                    <p><strong>Kayıt Bilgileri:</strong> Platform hesabında kayıtlı</p>
                    <p><strong>İletişim:</strong> Hesap e-posta adresi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hizmetin Konusu */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">2. Hizmetin Konusu ve Özellikleri</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 Hizmet Türü</h3>
                  <p className="text-gray-700 mb-4">
                    <strong>Ana Konu:</strong> Web tabanlı dosya işleme ve yönetim hizmetleri
                  </p>
                  <p className="text-gray-700">
                    <strong>Hizmet Kategorisi:</strong> Dijital platform hizmeti (Fiziksel teslimat yoktur)
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">📄 PDF Hizmetleri</h3>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• PDF dosya sıkıştırma</li>
                      <li>• PDF format dönüştürme</li>
                      <li>• PDF birleştirme ve ayırma</li>
                      <li>• PDF e-imza ekleme</li>
                      <li>• PDF sayfa düzenleme</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">🖼️ Görsel Hizmetleri</h3>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Görsel sıkıştırma</li>
                      <li>• Format dönüştürme</li>
                      <li>• Boyut değişikliği</li>
                      <li>• Batch işleme</li>
                      <li>• Filtre uygulamaları</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Fiyat ve Ödeme */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">3. Fiyat ve Ödeme Koşulları</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <h3 className="font-semibold text-gray-900 mb-3">💵 Fiyat Bilgileri</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>Premium: $10.10/yıl</li>
                      <li>Premium: $13.10/ay</li>
                      <li>Business: $30.10/yıl</li>
                      <li>Business: $40.10/ay</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <h3 className="font-semibold text-gray-900 mb-3">💳 Ödeme Yöntemleri</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>Kredi Kartı</li>
                      <li>Banka Kartı</li>
                      <li>PayPal</li>
                      <li>İyzico Ödeme Sistemi</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <h3 className="font-semibold text-gray-900 mb-3">🛡️ Ödeme Güvenliği</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>SSL 256-bit şifreleme</li>
                      <li>3D Secure doğrulama</li>
                      <li>İyzico güvencesi</li>
                      <li>PCI DSS uyumluluğu</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-3">💰 Önemli Fiyat Bilgileri</h3>
                  <ul className="space-y-2 text-yellow-700">
                    <li>• Tüm fiyatlar USD (Amerikan Doları) bazındadır</li>
                    <li>• KDV dahil fiyatlardır (Türkiye&apos;de geçerli KDV oranları)</li>
                    <li>• Otomatik yenileme aktiftir (iptal edilmediği sürece)</li>
                    <li>• Yıllık ödemelerde %20-25 tasarruf sağlanır</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hizmet Süresi ve Teslimat */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <ClockIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">4. Hizmet Süresi ve Teslimat</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Hizmet Başlangıcı</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Ücretsiz hizmetler:</strong> Anında</li>
                      <li>• <strong>Premium aktivasyon:</strong> Ödeme onayından sonra 24 saat içinde</li>
                      <li>• <strong>İşlem süreleri:</strong> 0-30 saniye arası</li>
                      <li>• <strong>Erişim süresi:</strong> 7/24 platform erişimi</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Hizmet Süresi</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Aylık abonelik:</strong> 30 gün</li>
                      <li>• <strong>Yıllık abonelik:</strong> 365 gün</li>
                      <li>• <strong>Otomatik yenileme:</strong> Aktif (iptal edilmediği sürece)</li>
                      <li>• <strong>İptal:</strong> İstediğiniz zaman</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Dijital Teslimat</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Web platformu üzerinden anlık erişim</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Hesap aktivasyonu e-posta bildirimi</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">İşlem sonuçlarının anında indirilmesi</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Cloud storage erişimi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cayma Hakkı */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <ScaleIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">5. Cayma Hakkı</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">✅ Yasal Cayma Hakkı</h3>
                  <p className="text-green-700 leading-relaxed mb-4">
                    6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 15. maddesi uyarınca, 
                    tüketiciler herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin 
                    <strong> 14 (on dört) gün</strong> içinde cayma hakkını kullanabilir.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Cayma Hakkı Koşulları:</h4>
                      <ul className="space-y-1 text-green-700 text-sm">
                        <li>• Sözleşme tarihinden itibaren 14 gün</li>
                        <li>• Yazılı bildirim (e-posta kabul edilir)</li>
                        <li>• Hizmet henüz başlatılmamışsa</li>
                        <li>• Gerekçe belirtme zorunluluğu yoktur</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">İade Süreci:</h4>
                      <ul className="space-y-1 text-green-700 text-sm">
                        <li>• Cayma bildiriminden sonra 14 gün</li>
                        <li>• Aynı ödeme yöntemi ile iade</li>
                        <li>• Ek ücret talep edilmez</li>
                        <li>• Banka işlem süreci 7-14 gün</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-800 mb-3">❌ Cayma Hakkının Kullanılamadığı Durumlar</h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• Tüketicinin onayı ile hizmetin ifasına başlanması durumunda</li>
                    <li>• Dosya işleme hizmetinin tamamlanması halinde</li>
                    <li>• Digital içeriklerin indirilmesi sonrasında</li>
                    <li>• Kişiselleştirilmiş hizmetlerin sunulması durumunda</li>
                    <li>• 14 günlük sürenin geçmesi halinde</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Yükümlülükler */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Tarafların Yükümlülükleri</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border border-blue-200 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">🏢 SATICI Yükümlülükleri</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hizmeti sözleşmeye uygun sunmak</li>
                      <li>• Platform güvenliğini sağlamak</li>
                      <li>• Veri koruma standartlarına uymak</li>
                      <li>• Müşteri desteği sağlamak</li>
                      <li>• Yasal düzenlemelere uymak</li>
                      <li>• Fatura ve belge düzenlemek</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="border border-green-200 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-900 mb-4">👤 ALICI Yükümlülükleri</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Ödemeyi zamanında yapmak</li>
                      <li>• Doğru bilgi vermek</li>
                      <li>• Kullanım şartlarına uymak</li>
                      <li>• Telif hakkı ihlali yapmamak</li>
                      <li>• Hesap güvenliğini sağlamak</li>
                      <li>• Platform kurallarına uymak</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Uyuşmazlık Çözümü */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">7. Uyuşmazlık Çözümü</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">⚖️ Yetkili Merciler</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Tüketici Hakem Heyetleri</li>
                      <li>• Tüketici Mahkemeleri</li>
                      <li>• İstanbul Mahkemeleri (genel)</li>
                      <li>• Alternatif uyuşmazlık çözümü</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">💰 Mali Limitler</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hakem Heyeti: Değere göre</li>
                      <li>• İl Müdürlüğü: 2024 yılı limitli</li>
                      <li>• Mahkeme: Tüm değerler</li>
                      <li>• Online başvuru imkanı</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-3">📋 Başvuru Bilgileri</h3>
                  <p className="text-yellow-700 mb-3">
                    Tüketici şikayetleri için öncelikle <strong>destek@quickutil.app</strong> adresine başvurulması önerilir.
                  </p>
                  <p className="text-yellow-700">
                    Çözüm sağlanamadığı durumda Tüketici Hakem Heyetleri veya mahkemelere başvuru yapılabilir.
                  </p>
                </div>
              </div>
            </div>

            {/* Sözleşme Bilgileri */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📄 Sözleşme Bilgileri
              </h2>
              
              <div className="space-y-4 text-center text-gray-600">
                <p>
                  Bu sözleşme 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 
                  Mesafeli Sözleşmeler Yönetmeliği uyarınca hazırlanmıştır.
                </p>
                <p>
                  Sözleşme elektronik ortamda kabul edilmekte ve 
                  platform kayıtlarında muhafaza edilmektedir.
                </p>
                <p>
                  Sözleşme Türkçe olarak düzenlenmiştir ve Türk hukuku uygulanır.
                </p>
                <p className="font-semibold text-gray-700">
                  Düzenleme Tarihi: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
} 