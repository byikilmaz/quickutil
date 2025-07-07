'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, firestore, functions } from '@/lib/firebase';
import { analyzeFirebaseError } from '@/lib/errorAnalyzer';
import { EmailEvents, UserEmailData } from '@/lib/emailService';
import { isAdminUser } from '@/lib/adminAuth';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  emailVerified: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        setUser(user);
        
        if (user) {
          try {
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as {
                firstName?: string;
                lastName?: string;
                createdAt?: { toDate(): Date };
              };
              setUserProfile({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: user.email || '',
                createdAt: userData.createdAt?.toDate() || new Date()
              });
              console.log('User profile loaded successfully');
            } else {
              console.log('User document not found, creating basic profile');
              // Create basic profile if document doesn't exist
              setUserProfile({
                firstName: '',
                lastName: '',
                email: user.email || '',
                createdAt: new Date()
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            
            // 🔍 Analyze Firebase error
            analyzeFirebaseError(error as Error, {
              code: (error as { code?: string }).code || 'unknown',
              customData: { 
                operation: 'fetch_user_profile',
                userId: user.uid 
              }
            });
            
            // Set basic profile even if Firestore fails
            setUserProfile({
              firstName: '',
              lastName: '',
              email: user.email || '',
              createdAt: new Date()
            });
          }
        } else {
          setUserProfile(null);
          console.log('User logged out, profile cleared');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        
        // 🔍 Analyze authentication error
        analyzeFirebaseError(error as Error, {
          code: (error as { code?: string }).code || 'unknown',
          customData: { operation: 'auth_state_change' }
        });
      } finally {
        setLoading(false);
        console.log('Auth loading completed');
      }
    });

    return unsubscribe;
  }, [mounted]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      
      // 🔍 Analyze login error with detailed context
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'unknown',
        customData: { 
          operation: 'login',
          email,
          timestamp: new Date().toISOString()
        }
      });
      
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(user, { 
        displayName: `${firstName} ${lastName}` 
      });

      // Create user profile in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      });

      // Send custom verification email via Firebase Functions
      try {
        if (typeof window !== 'undefined') {
          const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
          const actionCodeSettings = {
            url: `${window.location.origin}/verify-email?uid=${user.uid}`,
            handleCodeInApp: true,
          };

          await sendVerificationEmail({
            email,
            firstName,
            lastName,
            verificationLink: actionCodeSettings.url
          });
          
          console.log('Custom verification email sent successfully');
        } else {
          // Fallback to Firebase default if window is not available
          await sendEmailVerification(user);
        }
      } catch (emailError) {
        console.error('Custom email sending failed, falling back to Firebase default:', emailError);
        
        // 🔍 Analyze email sending error
        analyzeFirebaseError(emailError as Error, {
          code: (emailError as { code?: string }).code || 'email-send-failed',
          customData: { 
            operation: 'send_verification_email',
            email,
            userId: user.uid
          }
        });
        
        // Fallback to Firebase default verification email
        await sendEmailVerification(user);
      }

      // Send welcome email after successful registration
      try {
        const emailData: UserEmailData = {
          firstName,
          lastName,
          email
        };
        
        const emailResult = await EmailEvents.onUserRegistered(emailData);
        if (emailResult.success) {
          console.log('Welcome email sent successfully:', emailResult.messageId);
        } else {
          console.error('Welcome email failed:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
        // Don't throw - registration should succeed even if email fails
      }

      // Update local state
      setUserProfile({
        firstName,
        lastName,
        email,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // 🔍 Analyze registration error with comprehensive context
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'unknown',
        customData: { 
          operation: 'register',
          email,
          hasFirstName: !!firstName,
          hasLastName: !!lastName,
          passwordLength: password.length,
          timestamp: new Date().toISOString()
        }
      });
      
      throw error;
    }
  };

  const resendVerification = async () => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Try custom email first
      try {
        if (typeof window !== 'undefined') {
          const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
          const actionCodeSettings = {
            url: `${window.location.origin}/verify-email?uid=${user.uid}`,
            handleCodeInApp: true,
          };

          await sendVerificationEmail({
            email: user.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            verificationLink: actionCodeSettings.url
          });
          
          console.log('Custom verification email resent successfully');
        } else {
          // Fallback to Firebase default
          await sendEmailVerification(user);
        }
      } catch (emailError) {
        console.error('Custom email resend failed, falling back to Firebase default:', emailError);
        
        // 🔍 Analyze resend verification error
        analyzeFirebaseError(emailError as Error, {
          code: (emailError as { code?: string }).code || 'email-resend-failed',
          customData: { 
            operation: 'resend_verification_email',
            email: user.email,
            userId: user.uid
          }
        });
        
        // Fallback to Firebase default verification email
        await sendEmailVerification(user);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      // 🔍 Analyze general resend error
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'resend-verification-failed',
        customData: { 
          operation: 'resend_verification',
          hasUser: !!user,
          hasUserProfile: !!userProfile
        }
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      
      // 🔍 Analyze logout error
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'logout-failed',
        customData: { 
          operation: 'logout',
          userId: user?.uid
        }
      });
      
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isAdmin: isAdminUser(user?.email),
    emailVerified: user?.emailVerified || false,
    loading,
    login,
    register,
    logout,
    resendVerification
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 