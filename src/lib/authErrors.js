// Maps Supabase Auth error codes to user-friendly messages.
// https://supabase.com/docs/guides/auth/debugging/error-codes
const AUTH_ERROR_MESSAGES = {
  invalid_credentials: 'Incorrect email or password. Please try again.',
  email_not_confirmed: 'Please verify your email address before logging in.',
  user_banned: 'This account has been suspended. Please contact support.',
  user_not_found: 'No account found with that email address.',
  user_already_exists: 'An account with this email already exists.',
  weak_password: 'Password is too weak. Please choose a stronger password.',
  email_address_invalid: 'Please enter a valid email address.',
  signup_disabled: 'Sign ups are currently disabled.',
  over_email_send_rate_limit: 'Too many attempts. Please wait a moment before trying again.',
  over_request_rate_limit: 'Too many attempts. Please wait a moment before trying again.',
  same_password: 'New password must be different from your current password.',
};

export function getAuthErrorMessage(error) {
  if (!error) return '';
  return AUTH_ERROR_MESSAGES[error.code] || error.message;
}
