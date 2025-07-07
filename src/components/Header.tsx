'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import CacheManager from './CacheManager';

interface HeaderProps {
  onAuthClick: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickUtil.app
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            
            {/* PDF Tools Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                📄 PDF Araçları
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2">
                  <Link href="/pdf-compress" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="font-medium">🗜️ PDF Sıkıştırma</div>
                    <div className="text-sm text-gray-500">Dosya boyutunu küçültün</div>
                  </Link>
                  <Link href="/pdf-convert" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="font-medium">🔄 PDF Dönüştürme</div>
                    <div className="text-sm text-gray-500">Farklı formatlara çevirin</div>
                  </Link>
                  <Link href="/pdf-esign" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="font-medium">✍️ E-İmza</div>
                    <div className="text-sm text-gray-500">Dijital imza ekleyin</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Image Tools Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                🖼️ Resim Araçları
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              <div className="absolute left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2">
                  <div className="grid grid-cols-2 gap-1">
                    <Link href="/image-compress" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <div className="font-medium">🗜️ Sıkıştırma</div>
                      <div className="text-xs text-gray-500">Boyut küçültme</div>
                    </Link>
                    <Link href="/image-resize" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <div className="font-medium">📏 Boyutlandırma</div>
                      <div className="text-xs text-gray-500">Ölçek değiştirme</div>
                    </Link>
                    <Link href="/image-crop" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <div className="font-medium">✂️ Kırpma</div>
                      <div className="text-xs text-gray-500">Alan seçme</div>
                    </Link>
                    <Link href="/image-rotate" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <div className="font-medium">🔄 Döndürme</div>
                      <div className="text-xs text-gray-500">Açı değiştirme</div>
                    </Link>
                    <Link href="/image-format-convert" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <div className="font-medium">⚡ Format</div>
                      <div className="text-xs text-gray-500">JPG/PNG dönüştürme</div>
                    </Link>
                    <Link href="/image-filters" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <div className="font-medium">🎨 Filtreler</div>
                      <div className="text-xs text-gray-500">Efekt uygulama</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Tools */}
            <Link href="/image-batch" className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
              ⚡ Toplu İşlem
            </Link>



            {process.env.NODE_ENV === 'development' && (
              <CacheManager className="ml-4" />
            )}
          </nav>

          {/* Right Side: User Menu */}
          <div className="flex items-center space-x-4">
            
            {/* User Account Area */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Admin Panel Button - sadece admin kullanıcılar için */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-1"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Admin</span>
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
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
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
                        href="/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        👤 Profilim
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        🚪 Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md hover:shadow-lg"
              >
                Giriş / Kayıt
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
          <div ref={menuRef} className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              
              {/* PDF Tools */}
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-900 px-3 py-2">📄 PDF Araçları</div>
                <Link href="/pdf-compress" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  🗜️ PDF Sıkıştırma
                </Link>
                <Link href="/pdf-convert" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  🔄 PDF Dönüştürme
                </Link>
                <Link href="/pdf-esign" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  ✍️ E-İmza
                </Link>
              </div>

              {/* Image Tools */}
              <div className="space-y-1 pt-4 border-t border-gray-100">
                <div className="text-sm font-semibold text-gray-900 px-3 py-2">🖼️ Resim Araçları</div>
                <Link href="/image-compress" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  🗜️ Resim Sıkıştırma
                </Link>
                <Link href="/image-resize" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  📏 Boyutlandırma
                </Link>
                <Link href="/image-crop" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  ✂️ Resim Kırpma
                </Link>
                <Link href="/image-rotate" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  🔄 Döndürme
                </Link>
                <Link href="/image-format-convert" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  ⚡ Format Dönüştürme
                </Link>
                <Link href="/image-filters" className="block px-6 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  🎨 Filtreler
                </Link>
              </div>

              {/* Other Tools */}
              <div className="space-y-1 pt-4 border-t border-gray-100">
                <Link href="/image-batch" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  ⚡ Toplu İşlem
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 