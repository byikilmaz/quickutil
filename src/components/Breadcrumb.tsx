'use client';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { generateBreadcrumbData } from '@/lib/seoUtils';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  href: string;
  current: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Auto-generate breadcrumbs if not provided
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    if (items) return items;

    const routes: Record<string, string> = {
      '/pdf-compress': 'PDF Sıkıştırma',
      '/pdf-convert': 'PDF Dönüştürme',
      '/image-convert': 'Resim Dönüştürme',
    };

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        name: 'Ana Sayfa',
        href: '/',
        current: pathname === '/',
      }
    ];

    if (pathname !== '/' && routes[pathname]) {
      breadcrumbItems.push({
        name: routes[pathname],
        href: pathname,
        current: true,
      });
    }

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems();
  const structuredData = generateBreadcrumbData(pathname);

  // Don't show breadcrumb on home page
  if (pathname === '/') return null;

  return (
    <>
      {/* Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav 
        className="flex mb-6" 
        aria-label="Breadcrumb"
        role="navigation"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRightIcon 
                  className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" 
                  aria-hidden="true"
                />
              )}
              
              {item.current ? (
                <span 
                  className="ml-1 text-gray-500 font-medium"
                  aria-current="page"
                >
                  {index === 0 && (
                    <HomeIcon className="h-4 w-4 inline mr-1" aria-hidden="true" />
                  )}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {index === 0 && (
                    <HomeIcon className="h-4 w-4 inline mr-1" aria-hidden="true" />
                  )}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 