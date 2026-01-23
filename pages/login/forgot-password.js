import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';

export default function ForgotPassword() {
    const router = useRouter();
    const [ForgotPasswordError, setForgotPasswordError] = useState('');
    //redirect if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getSession(); //Get the logged in user with the current existing session
            if (user) {
                router.push('/');
            }
        };
        checkUser();
    }, [router]);
    const { register, handleSubmit, watch, formState: { isSubmitting, isSubmitSuccessful, errors  } } = useForm();
    const onSubmit = async (data) => {
        const { email } = data;
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:3000/login/reset',
                // Disable PKCE for email magic links - they don't work with code verifiers
                options: {
                    emailRedirectTo: 'http://localhost:3000/login/reset',
                }
            });
            if (error) {
                setForgotPasswordError(error.message);
            }
        } catch (error) {
            setForgotPasswordError(error.message);
        }
    };
const email = watch('email', '');//returns initially empty string instead of undefined

return (
    <>
        {!isSubmitSuccessful ? (
            <div>
                <Navbar />
                <Header bodyText = "Forgot Password" />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="email" placeholder="Email" {...register('email', { required: 'Email address is required', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} />
                    <button type="submit" disabled={isSubmitting}>Send Reset Link</button>
                    {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                </form>
                {ForgotPasswordError && <p className="text-red-500">{ForgotPasswordError}</p>}
            </div>
        ) : (
            <p>Successfully sent password reset link to {email}.</p>
        )}
    </>
);
} 
