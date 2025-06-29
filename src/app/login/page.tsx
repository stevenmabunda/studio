
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null; // Or a loading spinner, handled by AuthProvider
  }

  if (user) {
    router.replace('/');
    return null;
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
