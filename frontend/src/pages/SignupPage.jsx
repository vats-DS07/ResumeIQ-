import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldAlert, User, Mail, Lock, CheckCircle } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    }
  });

  const passwordVal = watch('password', '');

  // Calculate password strength segments (0 to 4)
  const getPasswordStrength = (val) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 6) score += 1;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(passwordVal);

  const getStrengthMeta = (score) => {
    switch (score) {
      case 0:
        return { text: 'Empty', colorClass: 'bg-border', labelColor: 'text-text-secondary' };
      case 1:
        return { text: 'Very Weak', colorClass: 'bg-score-red', labelColor: 'text-score-red' };
      case 2:
        return { text: 'Weak', colorClass: 'bg-score-amber', labelColor: 'text-score-amber' };
      case 3:
        return { text: 'Medium', colorClass: 'bg-yellow-400', labelColor: 'text-yellow-500' };
      case 4:
        return { text: 'Strong', colorClass: 'bg-score-emerald', labelColor: 'text-score-emerald' };
      default:
        return { text: 'Empty', colorClass: 'bg-border', labelColor: 'text-text-secondary' };
    }
  };

  const strengthMeta = getStrengthMeta(strength);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await signup(data.name, data.email, data.password);
      // Success redirects user to the dashboard, or respects redirectTo
      navigate(redirectTo || '/dashboard');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-bg via-bg to-primary/5 flex flex-col justify-center items-center p-6 selection:bg-primary/20">
      
      {/* Brand logo at the top of signup page */}
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
          <CardTitle className="text-2xl font-black tracking-tight">Create Account</CardTitle>
          <CardDescription>Get started with a free ATS analysis scan today.</CardDescription>
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

            {/* Name Input */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

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

            {/* Password Strength Meter */}
            {passwordVal && (
              <div className="flex flex-col gap-1.5 -mt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-secondary">Password strength:</span>
                  <span className={strengthMeta.labelColor}>{strengthMeta.text}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`h-full rounded-full transition-all duration-300 ${
                        index <= strength ? strengthMeta.colorClass : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Terms and Conditions Checkbox */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  {...register('terms')}
                />
                <span className="text-text-secondary leading-normal text-xs">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline font-semibold">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline font-semibold">
                    Privacy Policy
                  </a>.
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs font-medium text-danger">{errors.terms.message}</p>
              )}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full font-bold py-2.5 shadow-md">
              Create Free Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border bg-bg/20 py-4">
          <p className="text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>

    </div>
  );
};
