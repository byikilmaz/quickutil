'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ChevronDownIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onAuthClick: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Get current locale from URL using Next.js hook
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'tr';
  
  // Browser language auto-detection system
  useEffect(() => {
    // Skip on server-side
    if (typeof window === 'undefined') return;
    
    const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'fr', 'de'];
    const LOCALE_STORAGE_KEY = 'quickutil_preferred_locale';
    
    // Check if user already has a saved preference
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    
    console.log('🌍 BROWSER LANGUAGE AUTO-DETECTION:');
    console.log('  - Current URL locale:', locale);
    console.log('  - Saved locale preference:', savedLocale);
    console.log('  - Browser language:', navigator.language);
    console.log('  - Browser languages:', navigator.languages);
    
    // If user already has a saved preference, respect it
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      console.log('  - Using saved locale preference:', savedLocale);
      return;
    }
    
    // Detect browser language
    const browserLanguages = navigator.languages || [navigator.language];
    let detectedLocale = 'tr'; // Default fallback
    
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      if (SUPPORTED_LOCALES.includes(langCode)) {
        detectedLocale = langCode;
        console.log(`  - Detected supported language: ${browserLang} → ${langCode}`);
        break;
      }
    }
    
    console.log('  - Final detected locale:', detectedLocale);
    
    // Only redirect if current locale is different from detected locale
    if (locale !== detectedLocale) {
      console.log(`  - Redirecting from /${locale}/ to /${detectedLocale}/`);
      
      // Save preference to localStorage
      localStorage.setItem(LOCALE_STORAGE_KEY, detectedLocale);
      
      // Construct new URL with detected locale
      const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      const newUrl = `/${detectedLocale}${pathWithoutLocale}`;
      
      console.log('  - New URL:', newUrl);
      
      // Redirect to detected language
      window.location.href = newUrl;
    } else {
      console.log('  - Current locale matches detected locale, no redirect needed');
      // Save current locale as preference
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  }, [pathname, locale]);
  
  // Translation hooks
  const t = useTranslations('navigation', locale);
  const tProfile = useTranslations('profile', locale);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'K';
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3 group">
              <div className="relative w-8 h-8 transition-transform duration-200 group-hover:scale-110">
                <Image
                  src="/images/logo.svg"
                  alt="QuickUtil"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuickUtil
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href={`/${locale}/pdf-compress`} 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              {t('pdfTools')}
            </Link>
            <Link 
              href={`/${locale}/image-convert`} 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              {t('imageTools')}
            </Link>
            <Link 
              href={`/${locale}/blog`} 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              {t('blog')}
            </Link>
            
            {/* Admin Link */}
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>{t('admin')}</span>
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* User Account */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : user.email}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    
                    <Link 
                      href={`/${locale}/profile`} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      {tProfile('title')}
                    </Link>
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="mr-2">↗️</span>
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div ref={menuRef} className="lg:hidden border-t border-gray-200 py-4 bg-white">
            <div className="space-y-2">
              <Link 
                href={`/${locale}/pdf-compress`} 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('pdfTools')}
              </Link>
              <Link 
                href={`/${locale}/image-convert`} 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('imageTools')}
              </Link>
              <Link 
                href={`/${locale}/blog`} 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('blog')}
              </Link>
              
              {/* Mobile Admin Link */}
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  <span>{t('admin')}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 