import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';

export default function ReturnCheckout() {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(null);

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  useEffect(() => {
    if (!sessionId) return;

    const handleCheckoutReturn = async () => {
      try {
        const response = await fetch(`/api/handle-checkout-return?session_id=${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to verify checkout session');
        }
        const data = await response.json();
        setStatus(data.status);
        setCustomerEmail(data.customer_email);
      } catch (error) {
        console.error('Checkout return error:', error);
        setStatus('error');
      }
    };
    handleCheckoutReturn();
  }, [sessionId]);
  if (!sessionId) {
    return null;
  }

  if (!status) {
    return <div>Verifying your payment...</div>;
  }

  if (status === 'complete') {
    return <div>Your subscription was successful! An email confirmation has been sent to {customerEmail}.</div>;
  }
  if (status === 'expired') {
    return <div>Your checkout session has expired. Please try again.</div>;
  }
  if (status === 'error') {
    return <div>Something went wrong verifying your payment. Please contact support.</div>;
  }

  return <div>Payment status: {status}</div>;
}