
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
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
            title="Create an account"
            description="Join the conversation on Goal Chatter today."
        >
            <SignupForm />
        </AuthLayout>
    );
}
