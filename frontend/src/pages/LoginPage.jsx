import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { ShieldAlert, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await login(data.email, data.password);
      // Redirect to dashboard on successful login, or respect redirectTo if present
      navigate(redirectTo || '/dashboard');
    } catch (err) {
      setApiError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-bg via-bg to-primary/5 flex flex-col justify-center items-center p-6 selection:bg-primary/20">
      
      {/* Brand logo */}
      <div className="flex items-center gap-2 cursor-pointer mb-6" onClick={() => navigate('/')}>
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-extrabold text-lg">
          R
        </div>
        <span className="font-extrabold text-lg tracking-tight text-text">
          Resume<span className="text-primary">IQ</span>
        </span>
      </div>

      <Card className="w-full max-w-[440px] shadow-elevated border-border bg-surface">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black tracking-tight">Welcome Back</CardTitle>
          <CardDescription>Log in to access your resume analysis dashboard.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
            
            {/* API Error Box */}
            {apiError && (
              <div className="bg-danger/10 border border-danger/20 rounded-md p-3.5 flex items-start gap-2.5 text-danger text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember Me and Forgot Password row */}
            <div className="flex items-center justify-between text-xs font-semibold select-none">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-text-secondary">Remember me</span>
              </label>
              
              <a href="#" className="text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full font-bold py-2.5 shadow-md">
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border bg-bg/20 py-4">
          <p className="text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-bold">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>

    </div>
  );
};
