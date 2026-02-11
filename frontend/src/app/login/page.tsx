"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MagicCard } from '@/components/ui/magic-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { Database, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Store Token & User
      localStorage.setItem('token', data.token);
      localStorage.setItem('tt_session', JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role
      }));

      if (data.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/participant/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/assets/logo.png"
              alt="DataSprint 3.0 Logo"
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--p-400)] to-[var(--p-600)]">DATASPRINT 3.0</h1>
          <p className="text-muted-foreground">Gather → Transform → Build → Predict</p>
        </div>

        <MagicCard className="shadow-2xl border-none ring-1 ring-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-500">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to start your SPRINT.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-green-400">Username</Label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                  <Input
                    id="username"
                    placeholder="Enter username"
                    className="pl-9 bg-black/20 border-white/10 focus-visible:ring-green-400 focus-visible:ring-offset-0 focus:border-green-400/50 transition-all duration-300 placeholder:!text-green-400/50 text-green-400"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-400">Password</Label>
                <div className="relative group">
                  <Database className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10 bg-black/20 border-white/10 focus-visible:ring-green-400 focus-visible:ring-offset-0 focus:border-green-400/50 transition-all duration-300 placeholder:!text-green-400/50 text-green-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-green-400 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-green-400 font-medium animate-pulse">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </MagicCard>
      </div>
    </div>
  );
}
