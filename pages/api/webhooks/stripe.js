import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export const config = {
  api: {
    bodyParser: false, // Must disable for webhook signature verification
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Webhook event received:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      // Get the user ID passed via client_reference_id
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription;

      console.log('Checkout completed for user:', userId);

      // Update user's subscription_id to mark them as premium
      const { error } = await supabase
        .from('users')
        .update({ subscription_id: subscriptionId })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user subscription:', error);
      } else {
        console.log('User subscription activated:', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      console.log('Subscription canceled:', subscription.id);

      // Remove subscription_id to revoke premium access
      const { error } = await supabase
        .from('users')
        .update({ subscription_id: null })
        .eq('subscription_id', subscription.id);

      if (error) {
        console.error('Error canceling subscription:', error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}