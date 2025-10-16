
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase/clientConfig';
import Image from 'next/image';

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
export const auth: Auth = getAuth(app);


type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
        interval = setInterval(() => {
            setProgress(prev => {
                // If auth is loaded, jump to 100 and finish.
                if (authLoaded) {
                    if (prev < 100) return 100;
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 300); // Small delay for the 100% to show
                    return 100;
                }
                
                // Animate up to 90% and wait
                if (prev >= 90) {
                    return 90;
                }
                // Animate quickly at the start, then slow down
                const increment = prev < 50 ? 15 : 5;
                return Math.min(prev + increment, 90);
            });
        }, 100);
    }
    
    return () => clearInterval(interval);

  }, [loading, authLoaded]);


  const value = { user, loading };

  if (loading) {
    const displayProgress = Math.min(progress, 100);
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-48">
                   <Image src="/bholo_logo.png" alt="BHOLO Logo" width={200} height={80} priority />
                </div>
                <p className="text-muted-foreground font-semibold">Banter them up in a few... {displayProgress}%</p>
                <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-150" style={{ width: `${displayProgress}%` }} />
                </div>
            </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}
