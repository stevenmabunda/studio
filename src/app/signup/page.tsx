
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignupForm } from '@/components/auth/signup-form';
import { useEffect } from 'react';

export default function SignupPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
        if (!loading && user) {
          router.replace('/');
        }
    }, [user, loading, router]);
  
    if (loading || user) {
      return null; // Or a loading spinner, handled by AuthProvider
    }

    return (
        <AuthLayout>
            <SignupForm />
        </AuthLayout>
    );
}
