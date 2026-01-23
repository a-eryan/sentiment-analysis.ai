import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { createServerClient } from '@supabase/ssr'
import { useSearchParams } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm';
import ReturnCheckout from '@/components/ReturnCheckout';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export default function Account({ isPremiumUser, subscriptionPrice, userEmail }) {
    //redirect if user is not logged in
    const [session, setSession] = useState(undefined);
    const [changePasswordClicked, setChangePasswordClicked] = useState(false);
    const [deleteAccountClicked, setDeleteAccountClicked] = useState(false);
    const [changePasswordResult, setChangePasswordResult] = useState('');
    const [deleteAccountResult, setDeleteAccountResult] = useState('');
    const {register: registerPassword, handleSubmit: handleSubmitPassword, watch: watchPassword, formState: { errors: passwordErrors, isSubmitSuccessful: isPasswordSubmitSuccessful } } = useForm();
    const {register: registerDelete, handleSubmit: handleSubmitDelete, watch: watchDelete, formState: { errors: deleteErrors, isSubmitSuccessful: isDeleteSubmitSuccessful } } = useForm();
    const [isBuyingSubscription, setIsBuyingSubscription] = useState(false);
  const router = useRouter();

  const buyingSubscription = useSearchParams();
  const getBuyingSubscription = buyingSubscription.get('buyingSubscription');
  const boughtSubscription = buyingSubscription.get('session_id');
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();
  }, []);
  useEffect(() => {
    if (session === null) {
      const timeout = setTimeout(() => {
        router.push(isBuyingSubscription ? '/login?buyingSubscription=true' : '/login');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [session, isBuyingSubscription, router]);

  useEffect(() => {
    if (getBuyingSubscription === 'true') {
      setIsBuyingSubscription(true);
    }
  }, [getBuyingSubscription]);

  const password = watchPassword('password', '');
  const confirmPassword = watchPassword('confirmPassword', '');    
  const passwordRequirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const onSubmitChangePassword = async (data) => {
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: data.password }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating password:', result.error);
        setChangePasswordResult(`Error: ${result.error}`);
      } else {
        console.log('Password updated successfully');
        setChangePasswordClicked(false);
        setChangePasswordResult('Password updated successfully.');
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      setSession(null);
      router.push('/login');
    }
  });
const onSubmitDeleteAccount = async (data) => {
  try {
    const response = await fetch('/api/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: data.password }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Error deleting account:', result.error);
      setDeleteAccountResult(`Error: ${result.error}`);
    } else {
      console.log('Account deleted successfully');
      setDeleteAccountClicked(false);
      setDeleteAccountResult('Account deleted successfully. You will be redirected to the homepage shortly.');
      setTimeout(() => {
      router.push('/');
      }, 3000); // Redirect after 3 seconds
    }
  } catch (error) {
    console.error('Request failed:', error);
    setDeleteAccountResult('Request failed. Please try again later.');
  }
};

  return ( //make sure any changes for account is checked via supabase.auth.getUser() in API routes
    <>
      {session ? (
        <>
          <h1>Your Account</h1>
            {/* Account details and settings go here */}
            <button onClick={() => setChangePasswordClicked(true)}>Change Password</button>
            {changePasswordClicked && (
              <>
                <form onSubmit={handleSubmitPassword(onSubmitChangePassword)}>
                  <input type="password" placeholder="New Password" {...registerPassword('password', {
                    required: 'Password is required',
                    validate: () => allRequirementsMet || 'Password does not meet all requirements'
                  })} />
                  <input type="password" placeholder="Confirm New Password" {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })} />
                  {passwordErrors.password && <span className='text-red-500'>{passwordErrors.password.message}</span>}
                  {passwordErrors.confirmPassword && <span className='text-red-500'>{passwordErrors.confirmPassword.message}</span>}
                  <button type="submit">Update Password</button>
                </form>
                <button onClick={() => setChangePasswordClicked(false)}> Cancel </button>
              </>
            )}
            {changePasswordResult && <p>{changePasswordResult}</p>}
            <button onClick={() => setDeleteAccountClicked(true)}>Delete Account</button>
            {deleteAccountResult && <p>{deleteAccountResult}</p>}
            {deleteAccountClicked && (
              <>
                <form onSubmit={handleSubmitDelete(onSubmitDeleteAccount)}>
                  <input type="password" placeholder="Password" {...registerDelete('password', {
                    required: 'Password is required',
                  })} />
                  {deleteErrors.password && <span className='text-red-500'>{deleteErrors.password.message}</span>}
                  {deleteErrors.confirmPassword && <span className='text-red-500'>{deleteErrors.confirmPassword.message}</span>}
                  <button type="submit">Confirm Account Deletion</button>
                </form>
                <button onClick={() => setDeleteAccountClicked(false)}> Cancel </button>
              </>
            )}
            {!isPremiumUser && 
              <button onClick={() => setIsBuyingSubscription(true)}>Buy Subscription</button>}
            {isBuyingSubscription && !isPremiumUser && (
              <div className='flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded'>
                <h2>You’re one step to unlocking all of sentiment-analysis.ai.</h2>
                <p>Upgrade to premium for more features and insights.</p>
                <CheckoutForm userEmail={userEmail} />
              </div>
            )}
            {/* {boughtSubscription && !isPremiumUser && (
              <div>
                <h2>Thank you for your purchase!</h2>
                <p>Your subscription is now active.</p>
              </div>
            )} */}
            {boughtSubscription && (
              <ReturnCheckout/>
            )}
          </>
        ) : (
        <div>
          <h1> You must be logged in to view your account.</h1>
          <p>You will be redirected shortly.</p>
        </div>
        )}
    </>
  );
}


export async function getServerSideProps({ params, req, res }) { 
  let isPremiumUser = false;
  let userInfo = null;
  let subscriptionPrice = null;
  try {
    // 1. Create Supabase client (may set auth cookies)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return Object.keys(req.cookies).map(name => ({
              name,
              value: req.cookies[name]
            }));
          },
          setAll(cookiesToSet) {
            const cookies = cookiesToSet.map(({ name, value, options }) => {
              const optStr = options ? Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ') : '';
              return `${name}=${value}; Path=/; ${optStr}`;
            });
            
            const existing = res.getHeader('Set-Cookie') || [];
            const existingArray = Array.isArray(existing) ? existing : [existing];
            
            // Append new cookies
            res.setHeader('Set-Cookie', [...existingArray, ...cookies]);
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    
    userInfo = user;
    if (user) {
      // Check if user exists in users table and has subscription_id
      const { data: userData, error } = await supabase
        .from('users')
        .select('subscription_id')
        .eq('id', user.id)
        .single();
      
      if (!error && userData?.subscription_id) {
        isPremiumUser = true;
      }
    }


  } catch (error) {
    console.error('Error checking user subscription:', error);
    isPremiumUser = false;
  }

  try {
  subscriptionPrice = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID, {
    expand: ['product'],
  });
  } catch (error) {
    console.error('Error finding Stripe price:', error);

  }
  return {
    props: {
      userEmail: userInfo ? userInfo.email : null,
      subscriptionPrice: subscriptionPrice, //const displayPrice = `$${price.unit_amount / 100}/${price.recurring.interval}`;
      isPremiumUser,
    },
  };
}

