<div align="center">

# 🍳 DormChef AI

### Quick Campus Cooking Assistant — Powered by Claude AI

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://reactjs.org)
[![Claude API](https://img.shields.io/badge/Claude-Sonnet_4.5-ff7a20?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-MIT-4caf7d?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635bff?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)

**Snap your fridge. Get 3 recipes. Cook in minutes.**

*Built for the 18 million college students who eat every day and barely know how to boil water.*

[🚀 Live Demo](#) · [📖 Docs](#setup) · [💬 Discord](#) · [🐛 Report Bug](issues)

---

```
📸 Snap Fridge  →  🤖 AI Analysis  →  🍳 3 Recipes  →  🎉 Cook & Share
```

</div>

---

## ✨ What Is This?

DormChef AI is a full-stack React web app that turns whatever's in your dorm fridge into real, cookable recipes — using Claude's vision AI. Students snap a photo (or type ingredients), and the app generates 1–3 personalized recipes with prep time, cost estimates, substitutions for missing items, and cooking tips.

It's built like a real consumer product with auth, gamification, social features, a pantry manager, analytics, and a full Stripe-powered subscription paywall.

---

## 📸 App Preview

| Home Screen | Recipe Results | Pricing Page |
|---|---|---|
| 🍳 Scan buttons + pantry preview | 📋 Tabbed recipes with stats | 💳 Free / Plus / Pro tiers |

| Social Feed | Profile & Badges | Pantry Manager |
|---|---|---|
| 🎉 Campus feed + challenges | 🏆 XP, levels, 8 badges | 🗄️ Saved ingredients |

---

## 🚀 Features

### 🤖 AI Core
- **Photo scan** — point camera at fridge, Claude Vision identifies ingredients automatically
- **Text entry** — type what you have for instant recipe generation
- **1–3 recipes** generated per scan with full details
- **Smart substitutions** — AI suggests cheaper/healthier alternatives for missing items
- **Flavor pairings** — seasoning suggestions and cooking hacks per recipe
- **Diet-aware** — recipes filtered by your dietary preferences and allergies
- **Health tags** — AI labels recipes as "Brain food", "Energy boost", "Hangover cure"

### 👤 User Accounts & Personalization
- Auth via Google, Apple, TikTok, or Email
- Profile with username, avatar, dietary preferences, allergy tags
- XP system with level progression
- 8 unlockable badges (First Cook, Snap Master, Budget Boss, etc.)

### 🗄️ Pantry & Recipe Management
- Save frequently used ingredients — auto-included in every AI scan
- Cooked recipe history with timestamps
- Saved recipes with inline expand-to-view
- Personal notes on any recipe ("Add more salt next time")
- Analytics: total cost spent, cooking time, calories, most-used ingredients

### 🎉 Social & Community
- Campus feed — see what others are cooking, like and share
- Weekly leaderboard with XP rankings
- Challenges: "3-Ingredient Challenge", "10-Minute Dinner", "$2 Meal Challenge"
- `#DormChefChallenge` social sharing integration

### 💳 Monetization (Stripe-ready)
| | Free | Plus $5.99/mo | Pro $9.99/mo |
|---|---|---|---|
| Recipe scans | 5/month | Unlimited | Unlimited |
| Pantry manager | ❌ | ✅ | ✅ |
| Recipe history | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Meal planner | ❌ | ❌ | ✅ |
| Macro tracking | ❌ | ❌ | ✅ |
| Shopping list export | ❌ | ❌ | ✅ |
| Priority AI | ❌ | ❌ | ✅ |
| Exclusive challenges | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite |
| **AI** | Anthropic Claude Sonnet (vision + text) |
| **Styling** | CSS-in-JS (inline styles, no framework dependency) |
| **Fonts** | Syne (display) + DM Sans (body) via Google Fonts |
| **Payments** | Stripe Checkout + Webhooks |
| **Auth** | Firebase Auth / Clerk (pluggable) |
| **Database** | Supabase / Firebase Firestore |
| **Deployment** | Vercel (recommended) |
| **Storage** | `window.storage` API (artifacts) / `localStorage` (standalone) |

---

## ⚡ Setup

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)
- (Optional) A [Stripe account](https://stripe.com) for payments

### 1. Clone & install

```bash
git clone https://github.com/yourusername/dormchef-ai.git
cd dormchef-ai
npm install
```

### 2. Environment variables

Create a `.env` file in the root:

```env
# Required
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Required for payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional: Auth
VITE_FIREBASE_API_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

### Vercel (recommended — 1 command)

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 💳 Setting Up Payments

### 1. Create Stripe products

Go to [stripe.com/products](https://dashboard.stripe.com/products) and create:

| Product | Price | Price ID |
|---|---|---|
| DormChef Plus | $5.99/month | `price_plus_monthly` |
| DormChef Plus | $57.50/year | `price_plus_annual` |
| DormChef Pro | $9.99/month | `price_pro_monthly` |
| DormChef Pro | $95.90/year | `price_pro_annual` |

### 2. Add backend checkout endpoint

```js
// server.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout', async (req, res) => {
  const { priceId, userId, email } = req.body;
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
    metadata: { userId },
  });
  res.json({ url: session.url });
});
```

### 3. Handle webhooks

```js
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'customer.subscription.created') {
    const { userId } = event.data.object.metadata;
    // Update user plan in your database
    await db.users.update(userId, { plan: 'plus' }); // or 'pro'
  }

  res.json({ received: true });
});
```

### 4. Test with Stripe CLI

```bash
stripe listen --forward-to localhost:3001/api/webhook
stripe trigger customer.subscription.created
```

---

## 📁 Project Structure

```
dormchef-ai/
├── src/
│   ├── App.jsx              # Main app (all components)
│   ├── main.jsx             # Entry point
│   └── index.css            # Global resets
├── public/
│   └── favicon.ico
├── server/
│   ├── index.js             # Express backend
│   ├── stripe.js            # Stripe routes
│   └── webhooks.js          # Stripe webhook handler
├── .env                     # Environment variables (never commit)
├── .env.example             # Template for env vars
├── .gitignore
├── vite.config.js
├── package.json
└── README.md
```

---

## 🔌 Swapping the Storage Layer

The app currently uses `window.storage` (Claude.ai artifact API). For standalone deployment, swap to `localStorage`:

```js
// utils/storage.js
export const loadState = async (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

export const saveState = async (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};
```

For a real production app, replace with Supabase:

```js
import { supabase } from './supabaseClient';

export const saveState = async (key, val, userId) => {
  await supabase.from('user_data').upsert({ user_id: userId, key, value: val });
};
```

---

## 🗺️ Roadmap

- [ ] **Native mobile app** via Capacitor (iOS + Android)
- [ ] **Weekly AI meal planner** (Pro tier feature)
- [ ] **Macro / calorie tracking** integration
- [ ] **Shopping list export** to Instacart / Amazon Fresh
- [ ] **Campus-specific feeds** by university
- [ ] **Referral program** (free month for both parties)
- [ ] **Affiliate links** for missing ingredient delivery
- [ ] **Admin dashboard** for usage analytics

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a pull request
```

Please follow the existing code style (inline styles, functional components, async storage helpers).

---

## 📄 License

MIT © 2025 DormChef AI

---

<div align="center">

**Built with 🍳 and Claude AI**

*If this helped you, star the repo — it means a lot!*

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/dormchef-ai?style=social)](https://github.com/yourusername/dormchef-ai)

</div>
