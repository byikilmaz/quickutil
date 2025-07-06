import Link from 'next/link';
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
            <h4 className="text-lg font-semibold mb-4">Güvenli Ödeme Yöntemleri</h4>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {/* Visa */}
              <div className="bg-white rounded-lg px-4 py-2">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                  <rect width="60" height="20" fill="white" rx="4"/>
                  <path d="M25.54 6.33L23.77 13.67H22.04L21.03 9.58C20.96 9.29 20.82 9.02 20.58 8.88C20.01 8.58 19.34 8.31 18.63 8.12L18.76 7.67H22.3C22.8 7.67 23.2 8.02 23.28 8.52L24.15 13.67H25.88L27.65 6.33H25.54ZM31.3 11.93C31.31 10.13 29.35 10.02 29.37 9.27C29.38 9.05 29.62 8.81 30.16 8.74C30.43 8.71 31.2 8.69 32.08 9.1L32.37 7.81C31.99 7.67 31.49 7.54 30.84 7.54C28.84 7.54 27.41 8.55 27.4 9.98C27.39 11.04 28.36 11.62 29.08 11.96C29.82 12.31 30.07 12.53 30.07 12.84C30.06 13.3 29.5 13.51 28.99 13.52C28.21 13.53 27.78 13.33 27.47 13.19L27.17 14.5C27.48 14.64 28.06 14.76 28.66 14.76C30.84 14.76 32.26 13.77 32.27 12.24C32.28 11.04 31.3 11.93 31.3 11.93ZM37.32 6.33L35.85 13.67H34.3L32.83 6.33H37.32ZM42.36 7.9C42.02 7.75 41.5 7.59 40.84 7.59C39.69 7.59 38.9 8.14 38.9 8.95C38.9 9.55 39.4 9.93 40.33 10.39C41.01 10.73 41.38 10.95 41.38 11.29C41.38 11.78 40.8 12 40.28 12C39.59 12 39.22 11.84 38.94 11.7L38.64 13.01C38.96 13.15 39.54 13.27 40.14 13.27C41.42 13.27 42.22 12.74 42.22 11.87C42.22 11.21 41.68 10.77 40.71 10.29C40.1 9.98 39.76 9.77 39.76 9.47C39.76 9.04 40.25 8.84 40.84 8.84C41.42 8.84 41.85 8.97 42.14 9.09L42.36 7.9Z" fill="#1434CB"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="bg-white rounded-lg px-4 py-2">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                  <rect width="60" height="20" fill="white" rx="4"/>
                  <circle cx="22" cy="10" r="6" fill="#EB001B"/>
                  <circle cx="30" cy="10" r="6" fill="#F79E1B"/>
                  <path d="M26 6.5C27.4 7.6 28.3 9.2 28.3 11S27.4 14.4 26 15.5C24.6 14.4 23.7 12.8 23.7 11S24.6 7.6 26 6.5Z" fill="#FF5F00"/>
                </svg>
              </div>

              {/* iyzico */}
              <div className="bg-white rounded-lg px-4 py-2">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                  <rect width="60" height="20" fill="white" rx="4"/>
                  <path d="M8 6H12V14H8V6ZM16 10L20 6V8.5L17.5 10.5L20 12.5V15L16 11V10ZM22 6H44V8H24V10H42V12H24V14H44V16H22V6Z" fill="#1BB3E8"/>
                </svg>
              </div>

              {/* PayPal */}
              <div className="bg-white rounded-lg px-4 py-2">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                  <rect width="60" height="20" fill="white" rx="4"/>
                  <path d="M20 6C22.2 6 24 7.8 24 10S22.2 14 20 14H16L15 16H13L16 6H20ZM20 8H17.5L16.5 12H20C21.1 12 22 11.1 22 10S21.1 8 20 8Z" fill="#003087"/>
                  <path d="M26 8C28.2 8 30 9.8 30 12S28.2 16 26 16H22L21 18H19L22 8H26ZM26 10H23.5L22.5 14H26C27.1 14 28 13.1 28 12S27.1 10 26 10Z" fill="#009CDE"/>
                </svg>
              </div>

              {/* SSL Certificate */}
              <div className="flex items-center bg-green-600 rounded-lg px-3 py-2">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">SSL Güvenli</span>
              </div>
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