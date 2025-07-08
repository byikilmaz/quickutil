'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Graceful fallback instead of throwing error
    console.warn('useAuth called outside AuthProvider, returning mock values');
    return {
      user: null,
      userProfile: null,
      isAdmin: false,
      emailVerified: false,
      loading: false,
      error: null,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      resendVerification: async () => {}
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple mount detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Minimal auth listener
  useEffect(() => {
    if (!mounted) return;

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        
        if (user) {
          // Basic profile from auth user
          setUserProfile({
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            email: user.email || '',
            createdAt: new Date()
          });
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth setup error:', error);
      setLoading(false);
    }
  }, [mounted]);

  // Simple auth functions
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const resendVerification = async () => {
    try {
      if (user) {
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
    isAdmin: false, // Simplified for now
    emailVerified: user?.emailVerified || false,
    loading,
    error,
    login,
    register,
    logout,
    resendVerification
  };

  // Prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 