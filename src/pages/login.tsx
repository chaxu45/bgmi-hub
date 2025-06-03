'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared/page-header';
import { Lock } from 'lucide-react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Add debug information
    console.log('Attempting to sign in with email:', email);

    try {
      // Log before sign-in attempt
      console.log('Calling signIn function...');
      
      const user = await signIn(email, password);
      
      // Log after successful sign-in
      console.log('Sign-in successful, user:', user);
      
      // Set cookies for middleware authentication
      // In a production app, you would use a more secure approach with Firebase Admin SDK
      Cookies.set('session', 'authenticated', { expires: 1 }); // 1 day expiry
      Cookies.set('user_email', user.email || '', { expires: 1 });
      
      console.log('Cookies set, redirecting to admin page...');
      
      // Redirect to admin dashboard or home
      router.push('/admin/add-news');
    } catch (error: any) {
      // More detailed error logging
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Show more specific error messages based on Firebase error codes
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(`Authentication error: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-6 w-6 text-accent" />
      </div>
      <PageHeader
        title="Admin Login"
        description="Please sign in to access the admin area"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
