
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { AuthFormError } from './auth-form-error';
import { firebaseConfig } from '@/lib/firebase/clientConfig';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if the Firebase API key is still the placeholder
  const isConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' && firebaseConfig.apiKey !== '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    if (!auth) {
      setError('Authentication service is not available. Please try again later.');
      console.error('Firebase auth is not initialized.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/api-key-not-valid') {
        setError('Invalid login credentials. Please check your email, password, and Firebase configuration.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!isConfigured && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Needed</AlertTitle>
          <AlertDescription>
            The Firebase configuration is incomplete. Please update the file at{' '}
            <code className="font-mono text-xs font-bold">src/lib/firebase/clientConfig.ts</code> with your project's credentials.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthFormError message={error} />
          <fieldset disabled={!isConfigured || loading}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4" disabled={!isConfigured || loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </fieldset>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
