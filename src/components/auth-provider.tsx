'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from './spinner';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Define the pages that do not require authentication
const UNPROTECTED_PATHS = ['/login', '/'];

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading, don't do anything yet.
    if (loading) {
      return;
    }

    // If there is no user and the current path is protected, redirect to login.
    if (!user && !UNPROTECTED_PATHS.includes(pathname)) {
      router.push('/login');
    }

    // If there is a user and they are on the login page, redirect to forms.
    if (user && pathname === '/login') {
      router.push('/forms');
    }
  }, [user, loading, router, pathname]);
  
  // While loading, show a spinner to prevent content flashing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // If there's no user and the path is protected, the redirect is in progress, so we can render null or a loading indicator.
  if (!user && !UNPROTECTED_PATHS.includes(pathname)) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Spinner className="h-8 w-8" />
        </div>
    )
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
        <AuthGuard>{children}</AuthGuard>
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
