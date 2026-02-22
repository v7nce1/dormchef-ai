import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const anthropic = new Anthropic();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.APP_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// ─── AI Proxy ─────────────────────────────────────────────────────────────────
// Proxies Claude API calls so your API key stays server-side
app.post('/api/recipes', async (req, res) => {
  try {
    const { messages, system } = req.body;
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system,
      messages,
    });
    res.json(response);
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// ─── Stripe: Create Checkout Session ─────────────────────────────────────────
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { priceId, userId, email } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      metadata: { userId },
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: { userId },
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// ─── Stripe: Customer Portal ──────────────────────────────────────────────────
app.post('/api/customer-portal', async (req, res) => {
  try {
    const { customerId } = req.body;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL}/profile`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Portal failed' });
  }
});

// ─── Stripe: Webhook ──────────────────────────────────────────────────────────
// Webhook must use raw body — keep this BEFORE express.json()
app.post('/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const { type, data } = event;
    const subscription = data.object;
    const userId = subscription.metadata?.userId;

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        // TODO: Update user plan in your database
        // await db.users.update(userId, { plan, stripeCustomerId: subscription.customer });
        console.log(`User ${userId} upgraded to ${plan}`);
        break;
      }
      case 'customer.subscription.deleted': {
        // TODO: Downgrade user to free
        // await db.users.update(userId, { plan: 'free' });
        console.log(`User ${userId} downgraded to free`);
        break;
      }
      case 'invoice.payment_failed': {
        // TODO: Notify user of failed payment
        console.log(`Payment failed for user ${userId}`);
        break;
      }
    }

    res.json({ received: true });
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPlanFromPriceId(priceId) {
  const plusIds = [
    process.env.STRIPE_PRICE_PLUS_MONTHLY,
    process.env.STRIPE_PRICE_PLUS_ANNUAL,
  ];
  const proIds = [
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_ANNUAL,
  ];
  if (plusIds.includes(priceId)) return 'plus';
  if (proIds.includes(priceId)) return 'pro';
  return 'free';
}

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🍳 DormChef server running on port ${PORT}`));
