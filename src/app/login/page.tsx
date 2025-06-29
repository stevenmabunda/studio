
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';
import { useEffect } from 'react';

export default function LoginPage() {
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
    <AuthLayout
      title="Welcome Back!"
      description="Sign in to your Goal Chatter account."
    >
      <LoginForm />
    </AuthLayout>
  );
}
