import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | QuickUtil.app',
  description: 'QuickUtil.app mesafeli satış sözleşmesi ve kullanım koşulları',
  keywords: 'mesafeli satış, sözleşme, şartlar, koşullar',
  openGraph: {
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'QuickUtil.app dijital hizmetler için mesafeli satış sözleşmesi',
    type: 'website',
    url: 'https://quickutil.app/mesafeli-satis-sozlesmesi'
  }
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            QuickUtil.app dijital dosya işleme hizmetleri için geçerli olan mesafeli satış sözleşmesi
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Giriş</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bu sözleşme, QuickUtil.app platformu üzerinden sunulan dijital dosya işleme hizmetleri için 
              mesafeli satış koşullarını düzenler. Platform tamamen ücretsiz olarak hizmet vermektedir.
            </p>
          </section>

          {/* Service Definition */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hizmet Tanımı</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">PDF İşleme Hizmetleri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>PDF sıkıştırma ve optimizasyon</li>
                  <li>PDF to Images dönüştürme</li>
                  <li>PDF birleştirme ve ayırma</li>
                  <li>PDF düzenleme araçları</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Görsel İşleme Hizmetleri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Resim sıkıştırma ve optimizasyon</li>
                  <li>Format dönüştürme (JPG, PNG, WebP)</li>
                  <li>Boyutlandırma ve kırpma</li>
                  <li>Döndürme ve filtreler</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Terms of Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kullanım Koşulları</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Ücretsiz Hizmet:</strong> Tüm dosya işleme hizmetleri ücretsiz olarak sunulmaktadır.
              </p>
              <p>
                <strong>Dosya Güvenliği:</strong> Yüklenen dosyalar işlem sonrası otomatik olarak silinir.
              </p>
              <p>
                <strong>Kullanım Sınırları:</strong> Hizmetin kötüye kullanımını önlemek için makul kullanım limitleri uygulanabilir.
              </p>
              <p>
                <strong>Veri Sorumluluğu:</strong> Kullanıcılar yükledikleri dosyaların içeriğinden tamamen sorumludur.
              </p>
            </div>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kullanıcı Hakları</h2>
            <div className="space-y-3 text-gray-700">
              <p>• Hizmetleri ücretsiz olarak kullanma hakkı</p>
              <p>• Kişisel verilerin korunması hakkı</p>
              <p>• Dosya gizliliği ve güvenliği hakkı</p>
              <p>• Hizmet kalitesi talep etme hakkı</p>
              <p>• Şikayet ve öneri bildirme hakkı</p>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sorumluluk Sınırları</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                QuickUtil.app, teknik arızalar, internet kesintileri veya force majeure durumlarından 
                kaynaklanan hizmet kesintilerinden sorumlu değildir.
              </p>
              <p>
                Platform, kullanıcıların yüklediği dosyaların içeriği, telif hakları veya yasal 
                durumu hakkında herhangi bir sorumluluk kabul etmez.
              </p>
              <p>
                Hizmet &quot;olduğu gibi&quot; sunulmakta olup, kesintisiz çalışma garantisi verilmemektedir.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim</h2>
            <div className="text-gray-700">
              <p className="mb-2">
                <strong>E-posta:</strong> hello@quickutil.app
              </p>
              <p className="mb-2">
                <strong>Website:</strong> https://quickutil.app
              </p>
              <p className="text-sm text-gray-600 mt-4">
                Son Güncelleme: Ocak 2025
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
} 