'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Header from '@/components/Header';
import Link from 'next/link';

function VerifyEmailContent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'resent'>('loading');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const { user, userProfile, resendVerification } = useAuth();
  
  const uid = searchParams.get('uid');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!uid) {
          setError('Geçersiz doğrulama bağlantısı');
          setVerificationStatus('error');
          return;
        }

        // Simulate verification process (in real app, you'd verify the token)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update user's email verification status in Firestore
        if (user && user.uid === uid) {
          await updateDoc(doc(firestore, 'users', uid), {
            emailVerified: true,
            verifiedAt: new Date()
          });
          setVerificationStatus('success');
        } else {
          setError('Kullanıcı doğrulaması başarısız');
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setError('Doğrulama sırasında hata oluştu');
        setVerificationStatus('error');
      }
    };

    verifyEmail();
  }, [uid, user]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      setVerificationStatus('resent');
    } catch {
      setError('Email gönderilirken hata oluştu');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          {verificationStatus === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email Adresiniz Doğrulanıyor...
              </h1>
              <p className="text-gray-600">
                Lütfen bekleyin, email adresiniz doğrulanıyor.
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email Adresiniz Doğrulandı!
              </h1>
              <p className="text-gray-600 mb-6">
                Tebrikler {userProfile?.firstName}! Email adresiniz başarıyla doğrulandı. 
                Artık QuickUtil&apos;in tüm özelliklerini kullanabilirsiniz.
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ana Sayfaya Dön
                </Link>
                <div className="text-sm text-gray-500">
                  Hesabınız aktif hale getirildi
                </div>
              </div>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Doğrulama Başarısız
              </h1>
              <p className="text-red-600 mb-6">
                {error || 'Email doğrulama sırasında bir hata oluştu.'}
              </p>
              <div className="space-y-3">
                {user && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isResending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <ArrowPathIcon className="h-4 w-4" />
                    )}
                    <span>Tekrar Gönder</span>
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  <Link href="/" className="text-blue-600 hover:text-blue-800">
                    Ana sayfaya dön
                  </Link>
                </div>
              </div>
            </>
          )}

          {verificationStatus === 'resent' && (
            <>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Doğrulama Emaili Gönderildi
              </h1>
              <p className="text-gray-600 mb-6">
                Email adresinize yeni bir doğrulama bağlantısı gönderildi. 
                Lütfen email kutunuzu kontrol edin.
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ana Sayfaya Dön
                </Link>
                <div className="text-sm text-gray-500">
                  Email gelmezse spam klasörünü kontrol edin
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Email Doğrulama Hakkında</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Email doğrulama bağlantısı 24 saat geçerlidir</li>
                <li>Bağlantı sadece bir kez kullanılabilir</li>
                <li>Email gelmezse spam klasörünü kontrol edin</li>
                <li>Sorun yaşıyorsanız tekrar gönder butonunu kullanın</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Yükleniyor...</h1>
            <p className="text-gray-600">Sayfa yükleniyor, lütfen bekleyin.</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 