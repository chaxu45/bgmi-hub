'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// List of admin emails that are allowed to access admin routes
// You can move this to a secure database in production
const ADMIN_EMAILS: string[] = [
  'onevalo66@gmail.com' // Your admin email
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user ? ADMIN_EMAILS.includes(user.email || '') : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting to sign in with Firebase');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Firebase sign-in successful');
      
      const isAdminUser = ADMIN_EMAILS.includes(email);
      console.log('AuthContext: Is admin email?', isAdminUser, 'Email:', email);
      setIsAdmin(isAdminUser);
      
      return result.user;
    } catch (error: any) {
      console.error('AuthContext: Error signing in:', error);
      console.error('AuthContext: Error code:', error.code);
      console.error('AuthContext: Error message:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
