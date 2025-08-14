
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { AuthFormError } from './auth-form-error';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!auth || !db) {
      setError('Authentication service is not available. Please try again later.');
      console.error('Firebase auth or db is not initialized.');
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      await updateProfile(user, {
        displayName: values.name,
      });

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: values.name,
        email: user.email,
        photoURL: user.photoURL,
        handle: user.email?.split('@')[0] || 'user',
        joined: new Date().toISOString(),
        bio: 'Passionate football fan. Discussing all things football. ⚽',
        location: '',
        country: '',
        favouriteClub: '',
        bannerUrl: 'https://placehold.co/1200x400.png',
        followersCount: 0,
        followingCount: 0,
      });
      
      setSuccess(true);
      
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  if (success) {
    return (
        <div className="space-y-4">
            <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-700 dark:[&>svg]:text-green-400">
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Welcome to BHOLO!</AlertTitle>
                <AlertDescription>
                   Your account has been created. We've sent a verification link to your email address. Please click the link to continue.
                </AlertDescription>
            </Alert>
             <Button onClick={() => router.push('/login')} className="w-full">
                Back to Sign In
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthFormError message={error} />
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
