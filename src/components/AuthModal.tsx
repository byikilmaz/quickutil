'use client';
import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Adınız"
                  required={!isLogin}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Soyadınız"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                placeholder="En az 6 karakter"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Yükleniyor...
              </div>
            ) : (
              isLogin ? 'Giriş Yap' : 'Kayıt Ol'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
              }}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            {isLogin ? (
              'Giriş yaparak dosyalarınızı 30 gün boyunca saklayabilirsiniz.'
            ) : (
              'Kayıt olduğunuzda dosyalarınız 30 gün boyunca saklanır.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
} 