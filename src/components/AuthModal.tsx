'use client';
import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, SparklesIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

// Firebase error code'larını Türkçe mesajlara çeviren fonksiyon
const getFirebaseErrorMessage = (error: unknown): string => {
  const errorCode = (error as { code?: string; message?: string })?.code || 
                   (error as { code?: string; message?: string })?.message || '';
  
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda. Giriş yapmayı deneyin.',
    'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter kullanın.',
    'auth/invalid-email': 'Geçersiz e-posta adresi. Lütfen kontrol edin.',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
    'auth/user-not-found': 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Hatalı şifre. Lütfen tekrar deneyin.',
    'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
    'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
    'auth/invalid-credential': 'Geçersiz giriş bilgileri. E-posta ve şifrenizi kontrol edin.',
    'auth/missing-password': 'Şifre alanı boş bırakılamaz.',
    'auth/missing-email': 'E-posta adresi boş bırakılamaz.',
    'auth/requires-recent-login': 'Bu işlem için tekrar giriş yapmanız gerekiyor.',
    'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor.',
    'auth/popup-closed-by-user': 'İşlem iptal edildi.',
    'auth/unauthorized-domain': 'Bu domain yetkili değil.',
    'Firebase: Error (auth/email-already-in-use).': 'Bu e-posta adresi zaten kullanımda. Giriş yapmayı deneyin.',
    'Firebase: Error (auth/weak-password).': 'Şifre çok zayıf. En az 6 karakter kullanın.',
    'Firebase: Error (auth/invalid-email).': 'Geçersiz e-posta adresi. Lütfen kontrol edin.',
    'Firebase: Error (auth/user-not-found).': 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.',
    'Firebase: Error (auth/wrong-password).': 'Hatalı şifre. Lütfen tekrar deneyin.',
    'Firebase: Error (auth/too-many-requests).': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.'
  };

  // Önce exact match ara
  if (errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // Error message'da code varsa extract et
  const codeMatch = errorCode.match(/auth\/[\w-]+/);
  if (codeMatch && errorMessages[codeMatch[0]]) {
    return errorMessages[codeMatch[0]];
  }

  // Default message
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
      onClose();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Enhanced Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-purple-900/95 backdrop-blur-sm">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${5 + (i * 3.8) % 90}%`,
                top: `${10 + (i * 6) % 80}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            />
          ))}
        </div>
        
        {/* Orbital Rings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-pink-400/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-28 h-28 border border-purple-400/20 rounded-full animate-spin" style={{ animationDuration: '25s' }}></div>
        </div>
      </div>

      {/* Modal Container */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md transform transition-all">
          {/* Enhanced Modal */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 overflow-hidden">
            {/* Floating Sparkles */}
            <div className="absolute top-4 right-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute top-8 left-6 text-purple-400 animate-bounce" style={{ animationDelay: '1s' }}>💫</div>
            <div className="absolute bottom-8 right-8 text-pink-400 animate-bounce" style={{ animationDelay: '2s' }}>⭐</div>
            
            {/* Header */}
            <div className="relative z-10 text-center mb-8">
              <button
                onClick={onClose}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl mb-6">
                {isLogin ? (
                  <ArrowRightOnRectangleIcon className="h-8 w-8 text-white" />
                ) : (
                  <UserPlusIcon className="h-8 w-8 text-white" />
                )}
              </div>
              
              {/* Title */}
              <h2 className="text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
                </span>
              </h2>
              
              <p className="text-gray-600 text-lg">
                {isLogin ? 'QuickUtil hesabınıza giriş yapın' : 'QuickUtil ailesine katılın'}
              </p>
              
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mt-4">
                <SparklesIcon className="h-4 w-4 text-purple-600 mr-2" />
                30 Gün Ücretsiz Depolama
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {!isLogin && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-800 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                      placeholder="Adınız"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-800 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                      placeholder="Soyadınız"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 text-red-700 px-4 py-4 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-4 focus:ring-purple-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    İşleniyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {isLogin ? (
                      <>
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Giriş Yap
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Hesap Oluştur
                      </>
                    )}
                  </div>
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-8 text-center relative z-10">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-700 text-base font-medium mb-3">
                  {isLogin ? 'Henüz hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                </p>
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setEmail('');
                    setPassword('');
                    setFirstName('');
                    setLastName('');
                  }}
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLogin ? (
                    <>
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Kayıt Ol
                    </>
                  ) : (
                    <>
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      Giriş Yap
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-6 text-center relative z-10">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center justify-center space-x-6 text-sm text-purple-800">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="font-medium">30 Gün Depolama</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                    <span className="font-medium">Güvenli İşlem</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="font-medium">Hızlı Erişim</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 