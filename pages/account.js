import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';


export default function Account() {
    //redirect if user is not logged in
    const [session, setSession] = useState(null);
    const [changePasswordClicked, setChangePasswordClicked] = useState(false);
    const [deleteAccountClicked, setDeleteAccountClicked] = useState(false);
    const [changePasswordResult, setChangePasswordResult] = useState('');
    const [deleteAccountResult, setDeleteAccountResult] = useState('');
    const {register: registerPassword, handleSubmit: handleSubmitPassword, watch: watchPassword, formState: { errors: passwordErrors, isSubmitSuccessful: isPasswordSubmitSuccessful } } = useForm();
    const {register: registerDelete, handleSubmit: handleSubmitDelete, watch: watchDelete, formState: { errors: deleteErrors, isSubmitSuccessful: isDeleteSubmitSuccessful } } = useForm();

  const router = useRouter();
  useEffect(() => {
        const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession(); //client-level trust: check local auth token
        setSession(session);
        if (!session?.user || session.user.is_anonymous) {
          router.push('/login');
        }
        };
        checkUser();
  }, [router]);
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
                  {passwordErrors.password && <span style={{ color: 'red' }}>{passwordErrors.password.message}</span>}
                  {passwordErrors.confirmPassword && <span style={{ color: 'red' }}>{passwordErrors.confirmPassword.message}</span>}
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
                  {deleteErrors.password && <span style={{ color: 'red' }}>{deleteErrors.password.message}</span>}
                  {deleteErrors.confirmPassword && <span style={{ color: 'red' }}>{deleteErrors.confirmPassword.message}</span>}
                  <button type="submit">Confirm Account Deletion</button>                  
                </form>
                <button onClick={() => setDeleteAccountClicked(false)}> Cancel </button>
              </>
            )}
          </>
        ) : (<p>You must be logged in to view this page.</p>)}
    </>
  );
}