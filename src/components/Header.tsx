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
  CpuChipIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import CacheManager from './CacheManager';
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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo with AI Badge */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/logo.svg"
                  alt="QuickUtil.app AI-Powered Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-xl sm:text-2xl font-bold text-black group-hover:text-blue-600 transition-colors duration-300">
                  QuickUtil
                </span>
                {/* AI Badge */}
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                  <CpuChipIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">AI</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation with AI Icons */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link href={`/${locale}/pdf-compress`} className="text-gray-800 hover:text-blue-600 px-3 py-2 apple-link-hover flex items-center space-x-1 transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <span>🤖</span>
              <span>{t('aiPdfTools')}</span>
            </Link>
            <Link href={`/${locale}/image-compress`} className="text-gray-800 hover:text-blue-600 px-3 py-2 apple-link-hover flex items-center space-x-1 transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <span>✨</span>
              <span>{t('aiImageTools')}</span>
            </Link>
            <Link href={`/${locale}/image-batch`} className="text-gray-800 hover:text-blue-600 px-3 py-2 apple-link-hover flex items-center space-x-1 transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <span>⚡</span>
              <span>{t('aiBatchProcessing')}</span>
            </Link>
            <Link href={`/${locale}/blog`} className="text-gray-800 hover:text-blue-600 px-3 py-2 apple-link-hover flex items-center space-x-1 transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <span>🧠</span>
              <span>{t('aiBlog')}</span>
            </Link>

            {process.env.NODE_ENV === 'development' && (
              <CacheManager className="ml-4" />
            )}
          </nav>

          {/* Right Side: Language Switcher & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* User Account Area */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Admin Panel Button - sadece admin kullanıcılar için */}
                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    className="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-1"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>{t('admin')}</span>
                  </Link>
                )}
                
                {/* Profile Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 max-w-24 truncate">
                        {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : user.email}
                      </div>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : user.email}
                        </div>
                        <div className="text-xs text-gray-700">{user.email}</div>
                      </div>
                      
                      <Link 
                        href={`/${locale}/profile`} 
                        className="block px-4 py-2 text-gray-800 apple-link-hover"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        👤 {tProfile('title')}
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 apple-link-hover"
                      >
                        🚪 {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-1"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>{t('loginAI')}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-800 hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with AI Icons */}
        {isMenuOpen && (
          <div ref={menuRef} className="lg:hidden border-t border-gray-100 py-4 animate-fade-in">
            <div className="space-y-2">
              <Link href={`/${locale}/pdf-compress`} className="block px-3 py-2 text-gray-800 hover:text-blue-600 apple-link-hover flex items-center space-x-2">
                <span>🤖</span>
                <span>{t('aiPdfTools')}</span>
              </Link>
              <Link href={`/${locale}/image-compress`} className="block px-3 py-2 text-gray-800 hover:text-blue-600 apple-link-hover flex items-center space-x-2">
                <span>✨</span>
                <span>{t('aiImageTools')}</span>
              </Link>
              <Link href={`/${locale}/image-batch`} className="block px-3 py-2 text-gray-800 hover:text-blue-600 apple-link-hover flex items-center space-x-2">
                <span>⚡</span>
                <span>{t('aiBatchProcessing')}</span>
              </Link>
              <Link href={`/${locale}/blog`} className="block px-3 py-2 text-gray-800 hover:text-blue-600 apple-link-hover flex items-center space-x-2">
                <span>🧠</span>
                <span>{t('aiBlog')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 