import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">QuickUtil.app</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              PDF ve görsel dosyalarınızı hızlı, güvenli ve profesyonel şekilde işleyin. 
              Sıkıştırma, dönüştürme ve düzenleme araçlarımızla iş akışınızı optimize edin.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">🛠️ Araçlar</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pdf-compress" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  PDF Sıkıştırma
                </Link>
              </li>
              <li>
                <Link href="/pdf-convert" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  PDF Dönüştürme
                </Link>
              </li>
              <li>
                <Link href="/image-convert" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Görsel Dönüştürme
                </Link>
              </li>
              <li>
                <Link href="/image-compress" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Görsel Sıkıştırma
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">🏢 Şirket</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/hakkimizda" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-sozlesmesi" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Gizlilik Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/teslimat-iade" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Teslimat & İade
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">💬 Destek</h4>
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                📧 hello@quickutil.app
              </p>
              <p className="text-gray-300 text-sm">
                🌐 QuickUtil.app
              </p>
              <p className="text-gray-300 text-sm">
                ⏰ 7/24 Online Destek
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>&copy; {currentYear} QuickUtil.app - Tüm hakları saklıdır.</p>
              <p className="mt-1">Profesyonel dosya işleme platformu</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Powered by</span>
              <div className="flex items-center space-x-2">
                <span>Firebase</span>
                <span>•</span>
                <span>Next.js</span>
                <span>•</span>
                <span>Vercel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 