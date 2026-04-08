import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Squares from '@/components/Squares';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const handleEmailVerification = async () => {
      try {
        const { code } = router.query;

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setMessage('Email verification failed or link expired. Please try again.');
            setIsError(true);
            setTimeout(() => router.push('/signup'), 3000);
            return;
          }
        }

        //check if email is confirmed, if not wait and refresh session to get updated user info
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.email_confirmed_at) {
          setMessage('✓ Email verified successfully! Redirecting...');
          setIsError(false);
          setTimeout(() => router.push('/create'), 2000);
        } else {
          setMessage('Email verification in progress. Please wait...');
          // If not confirmed yet, refresh and check again
          await supabase.auth.refreshSession();
          setTimeout(() => router.push('/create'), 1500);
        }
      } catch (err) {
        setMessage('An error occurred during verification.');
        setIsError(true);
        console.error('Callback error:', err);
      }
    };

    handleEmailVerification();
  }, [router]);

  return (
    <>
      <div className="fixed inset-0 -z-10 blur-[1.5px]">
        <Squares speed={0.2} cellWidth={100} cellHeight={40} direction="up" />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 my-12">
        <div className="w-full max-w-md outlined p-8 text-center">
          <div className={`${isError ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'} border rounded p-6`}>
            <p className={isError ? 'text-red-600' : 'text-blue-600'}>
              {message}
            </p>
            {isError && (
              <button
                onClick={() => router.push('/signup')}
                className="mt-4 outlined p-2 cursor-pointer hover:underline"
              >
                Back to Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
