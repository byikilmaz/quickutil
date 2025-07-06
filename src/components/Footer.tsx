import Link from 'next/link';
import Image from 'next/image';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-bold">QuickUtil</span>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Profesyonel dosya işleme ve PDF yönetimi çözümleri sunan modern web platformu. 
              Güvenli, hızlı ve kullanıcı dostu deneyim.
            </p>

            {/* Company Details */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                <span>Bilal Yıkılmaz</span>
              </div>
              <div className="flex items-start">
                <GlobeAltIcon className="w-4 h-4 mr-2 mt-0.5" />
                <span>Halkalı Merkez Mah. 1438. Sk. D No: 2 D İç Kapı No: 2<br />Küçükçekmece / İstanbul</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                <span>destek@quickutil.app</span>
              </div>
              <div className="text-xs">
                <span>Vergi No: 9530416885 | TC: 12645032148</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/pdf-compress" className="hover:text-blue-400 transition-colors">PDF Sıkıştırma</Link></li>
              <li><Link href="/pdf-convert" className="hover:text-blue-400 transition-colors">PDF Dönüştürme</Link></li>
              <li><Link href="/pdf-esign" className="hover:text-blue-400 transition-colors">PDF E-İmza</Link></li>
              <li><Link href="/image-convert" className="hover:text-blue-400 transition-colors">Görsel Dönüştürme</Link></li>
              <li><Link href="/image-compress" className="hover:text-blue-400 transition-colors">Görsel Sıkıştırma</Link></li>
              <li><Link href="/image-batch" className="hover:text-blue-400 transition-colors">Batch İşleme</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Yasal Sayfalar</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/hakkimizda" className="hover:text-blue-400 transition-colors flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-sozlesmesi" className="hover:text-blue-400 transition-colors flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Gizlilik Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/teslimat-iade" className="hover:text-blue-400 transition-colors flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Teslimat ve İade
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-blue-400 transition-colors flex items-center">
                  <ScaleIcon className="w-4 h-4 mr-2" />
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition-colors">
                  Fiyatlandırma
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold mb-4 text-white">💳 Güvenli Ödeme Yöntemleri</h4>
            <p className="text-gray-300 mb-6">
              İyzico güvencesi ile güvenli ödeme. SSL şifrelemesi ve 3D Secure koruması.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-6">
              {/* Visa */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <Image 
                  src="/images/payment-methods/visa.png" 
                  alt="Visa"
                  width={120}
                  height={38}
                  className="h-9 w-auto"
                />
              </div>

              {/* Mastercard */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <Image 
                  src="/images/payment-methods/mastercard.svg" 
                  alt="MasterCard"
                  width={120}
                  height={38}
                  className="h-9 w-auto"
                />
              </div>

              {/* iyzico */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <Image 
                  src="/images/payment-methods/iyzico.svg" 
                  alt="İyzico ile Öde"
                  width={120}
                  height={38}
                  className="h-9 w-auto"
                />
              </div>

              {/* SSL Certificate */}
              <div className="flex items-center bg-green-600 rounded-lg px-4 py-3 text-white shadow-sm hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">SSL Güvenli</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                256-bit SSL şifrelemesi • 3D Secure doğrulama • PCI DSS uyumluluğu
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>&copy; {currentYear} QuickUtil.app - Tüm hakları saklıdır.</p>
              <p className="mt-1">Bilal Yıkılmaz | Vergi No: 9530416885</p>
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