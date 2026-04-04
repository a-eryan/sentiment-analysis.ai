import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm();

  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  const passwordRequirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    let mounted = true;

    const syncRecoverySession = async (sessionOverride) => {
      const session =
        sessionOverride ??
        (await supabase.auth.getSession()).data.session;

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setError('');
      } else {
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasRecoveryParams =
          queryParams.get('code') ||
          hashParams.get('access_token') ||
          hashParams.get('refresh_token');

        if (!hasRecoveryParams) {
          setError("We're sorry, but this reset password link is expired or invalid.");
        }
      }

      setIsCheckingSession(false);
    };

    syncRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        ['PASSWORD_RECOVERY', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)
      ) {
        if (!mounted) return;

        setUser(session?.user ?? null);
        setError('');
        setIsCheckingSession(false);
        window.history.replaceState(null, '', window.location.pathname);
      }

      if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (data) => {
    setError('');

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.replace('/account');
  };

  if (isCheckingSession) {
    return (
      <>
        <Navbar />
        <div className="border max-w-4xl mx-auto p-6 mt-12 rounded outlined">
          <h1>Reset Your Password</h1>
          <p>Validating your recovery session...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="border max-w-4xl mx-auto p-6 mt-12 rounded outlined">
          <h1>Reset Your Password</h1>
          <p className="text-red-500">
            {error || "We couldn't validate your recovery session. Please request a new reset link."}
          </p>
          <p>
            <a href="/login">Go back to login</a>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="border max-w-4xl mx-auto p-6 mt-12 rounded outlined">
        <h1>Reset Your Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 justify-center items-center mt-8">
          <label className="flex flex-col gap-1">
            Email
            <input
              type="email"
              value={user.email || ''}
              readOnly
              className="cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col gap-1">
            New Password
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                validate: () =>
                  allRequirementsMet || 'Password does not meet all requirements',
              })}
            />
            {errors.password && <span className="text-red-500">{errors.password.message}</span>}
          </label>

          <label className="flex flex-col gap-1">
            Confirm New Password
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <span className="text-red-500">{errors.confirmPassword.message}</span>
            )}
          </label>

          {password && (
            <div className="mt-2.5 p-2.5 border border-gray-300 rounded bg-gray-50">
              <h4>Password Requirements:</h4>
              <ul className="m-0 pl-5">
                <li className={passwordRequirements.minLength ? 'text-green-600' : 'text-red-600'}>
                  {passwordRequirements.minLength ? '✓' : '✗'} At least 12 characters
                </li>
                <li className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-600'}>
                  {passwordRequirements.hasUppercase ? '✓' : '✗'} One uppercase letter (A-Z)
                </li>
                <li className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-600'}>
                  {passwordRequirements.hasLowercase ? '✓' : '✗'} One lowercase letter (a-z)
                </li>
                <li className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-600'}>
                  {passwordRequirements.hasNumber ? '✓' : '✗'} One number (0-9)
                </li>
                <li className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}>
                  {passwordRequirements.hasSpecialChar ? '✓' : '✗'} One special character (!@#$%^&*)
                </li>
                <li className={passwordsMatch ? 'text-green-600' : 'text-red-600'}>
                  {passwordsMatch ? '✓' : '✗'} Passwords match
                </li>
              </ul>
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </>
  );
}
