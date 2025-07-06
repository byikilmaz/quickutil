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

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: user.email || '',
              createdAt: userData.createdAt?.toDate() || new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
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
      } catch (emailError) {
        console.error('Custom email sending failed, falling back to Firebase default:', emailError);
        // Fallback to Firebase default verification email
        await sendEmailVerification(user);
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
      } catch (emailError) {
        console.error('Custom email resend failed, falling back to Firebase default:', emailError);
        // Fallback to Firebase default verification email
        await sendEmailVerification(user);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 