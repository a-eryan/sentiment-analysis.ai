import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider,EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY); //load client-side function once 

function CheckoutForm({userEmail}) {
    const fetchClientSecret = async () => {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      return data.clientSecret;
    };
    return (
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options = {{fetchClientSecret}} //pass function reference as an object 
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    )
}
export default CheckoutForm;    