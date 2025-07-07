import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teslimat ve İade Koşulları | QuickUtil.app',
  description: 'QuickUtil.app teslimat ve iade koşulları, dijital hizmet şartları',
  keywords: 'teslimat, iade, şartlar, koşullar, dijital hizmet',
  openGraph: {
    title: 'Teslimat ve İade Koşulları',
    description: 'QuickUtil.app dijital hizmetler için teslimat ve iade koşulları',
    type: 'website',
    url: 'https://quickutil.app/teslimat-iade'
  }
};

export default function TeslimatIadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Teslimat ve İade Koşulları
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            QuickUtil.app dijital dosya işleme hizmetleri için teslimat ve iade koşulları
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          
          {/* Digital Service Delivery */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dijital Hizmet Teslimatı</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                QuickUtil.app, tamamen dijital bir platform olarak hizmet vermektedir. 
                Tüm dosya işleme hizmetleri online olarak gerçekleştirilir ve sonuçlar anında teslim edilir.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Hizmet Teslimat Süreci</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Dosya yükleme işlemi tamamlandığında hizmet başlar</li>
                  <li>İşleme süresi dosya boyutuna göre değişir (ortalama 30 saniye)</li>
                  <li>İşlenmiş dosya anında indirilebilir hale gelir</li>
                  <li>Hizmet teslimi işlem tamamlandığında gerçekleşmiş sayılır</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Service Types */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sunulan Hizmetler</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">PDF İşleme</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• PDF sıkıştırma</li>
                  <li>• Format dönüştürme</li>
                  <li>• Sayfa birleştirme/ayırma</li>
                  <li>• OCR metin çıkarma</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Görsel İşleme</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Resim sıkıştırma</li>
                  <li>• Boyutlandırma</li>
                  <li>• Format dönüştürme</li>
                  <li>• Batch işleme</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Return Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">İade Politikası</h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Önemli Bilgilendirme</h3>
                <p className="text-yellow-700">
                  QuickUtil.app tamamen ücretsiz bir platform olduğundan, 
                  herhangi bir ödeme alınmamakta ve dolayısıyla iade işlemi söz konusu değildir.
                </p>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Hizmet Kalitesi Garantisi</h3>
              <ul className="space-y-2">
                <li>• Teknik sorun durumunda işlem ücretsiz olarak tekrarlanır</li>
                <li>• Platform hatası durumunda destek ekibi yardımcı olur</li>
                <li>• Dosya güvenliği tam olarak sağlanır</li>
                <li>• İşlem sonrası dosyalar otomatik olarak silinir</li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kullanıcı Sorumlulukları</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Platform kullanıcıları aşağıdaki konularda sorumludur:
              </p>
              <ul className="space-y-2">
                <li>• Yüklenen dosyaların telif haklarına uygunluğu</li>
                <li>• Dosya içeriğinin yasal mevzuata uygunluğu</li>
                <li>• Kişisel verilerin korunması hakkında bilinçli olma</li>
                <li>• Platform kurallarına uygun kullanım</li>
              </ul>
            </div>
          </section>

          {/* Technical Support */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Teknik Destek</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Herhangi bir teknik sorun yaşadığınızda veya hizmet kalitesi ile ilgili 
                geri bildiriminiz olduğunda bizimle iletişime geçebilirsiniz.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Destek Kanalları</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• E-posta: hello@quickutil.app</li>
                  <li>• Website: https://quickutil.app</li>
                  <li>• Yanıt süresi: 24 saat içinde</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Veri Gizliliği</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Kullanıcı dosyalarının gizliliği ve güvenliği en önemli önceliğimizdir:
              </p>
              <ul className="space-y-2">
                <li>• Yüklenen dosyalar şifrelenerek işlenir</li>
                <li>• İşlem sonrası dosyalar otomatik olarak silinir</li>
                <li>• Hiçbir dosya kalıcı olarak saklanmaz</li>
                <li>• SSL şifreleme ile güvenli veri transferi</li>
              </ul>
            </div>
          </section>

          {/* Terms Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Değişiklik Bildirimi</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Bu teslimat ve iade koşulları, hizmet kalitesini artırmak amacıyla 
                güncellenebilir. Değişiklikler web sitesi üzerinden duyurulur.
              </p>
              <p>
                Kullanıcılar, platformu kullanmaya devam ederek güncellenen koşulları 
                kabul etmiş sayılırlar.
              </p>
              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-600">
                  <strong>Son Güncelleme:</strong> Ocak 2025
                </p>
                <p className="text-sm text-gray-600">
                  <strong>İletişim:</strong> hello@quickutil.app
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
} 