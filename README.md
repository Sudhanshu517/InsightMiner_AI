# InsightMiner AI

A full-stack Next.js 15 application that turns raw customer feedback into structured, actionable intelligence. InsightMiner AI combines a trained Python ML model with an optional LLM enrichment layer (Groq / Llama 3.3) to deliver sentiment classification, trend detection, topic extraction, and automated customer response generation — all surfaced through an analytics dashboard.

---

## Live Demo

> Deploy your own instance in under 10 minutes — see [Setup](#setup) below.

---

## What It Does

| Capability | Detail |
|---|---|
| **Sentiment Analysis** | Classifies feedback as Positive / Neutral / Negative with a confidence score |
| **Trend Detection** | Time-series chart showing sentiment volume over the last week / month / quarter / year |
| **Topic Extraction** | Identifies the most frequently mentioned keywords and topics across all feedback |
| **Response Generation** | Generates a professional, empathetic reply to each piece of feedback |
| **Key Insights** | Extracts 2–4 business-actionable takeaways per submission |
| **Analytics Dashboard** | Bar, pie, and area charts with time-range filtering and one-click refresh |
| **Authentication** | Email/password signup and login with JWT sessions |
| **Demo Mode** | Fully functional with pre-seeded data — no AI keys required to evaluate |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Frontend** | React 19, Tailwind CSS v4, Recharts |
| **Backend** | Next.js API Routes, NextAuth.js v4 |
| **Database** | MongoDB (Mongoose) |
| **ML Model** | Python · scikit-learn · TF-IDF + Logistic Regression / Naive Bayes / SVM · SMOTE |
| **AI Enrichment** | Groq API · Llama 3.3-70b-versatile (optional) |
| **Auth** | Credentials provider · bcryptjs · JWT |
| **Icons** | Lucide React |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Next.js 15 App                          │
├──────────────────────────────────────────────────────────────┤
│  Pages                                                       │
│  ├── /             Landing page                              │
│  ├── /feedback     Submit & analyze feedback                 │
│  ├── /dashboard    Analytics: charts, trends, topics         │
│  ├── /login        Sign in                                   │
│  ├── /signup       Create account                            │
│  └── /profile      User profile                              │
├──────────────────────────────────────────────────────────────┤
│  API Routes                                                  │
│  ├── POST /api/analyze-feedback   ML pipeline + LLM          │
│  ├── GET  /api/sentiment-stats    Aggregated sentiment        │
│  ├── GET  /api/trends             Time-series sentiment       │
│  ├── GET  /api/topics             Top keywords / topics       │
│  ├── GET  /api/recent-feedback    Latest submissions          │
│  ├── POST /api/signup             User registration           │
│  └── /api/auth/[...nextauth]      NextAuth credentials        │
├──────────────────────────────────────────────────────────────┤
│  ML Layer (Node → Python child_process)                      │
│  ├── app/model/prediction.py      Loads .pkl model           │
│  ├── app/model/main.py            Training pipeline           │
│  └── *.pkl                        Pre-trained model files    │
│                                                              │
│  JS Fallback (no Python required)                            │
│  └── app/utils/sentimentAnalyzer.js   Keyword-based scoring  │
├──────────────────────────────────────────────────────────────┤
│  Database · MongoDB                                          │
│  ├── User     email, password (bcrypt)                       │
│  └── Response feedback, sentiment, confidence, topics, …     │
└──────────────────────────────────────────────────────────────┘
```

---

## Feedback Analysis Flow

```
POST /api/analyze-feedback
        │
        ▼
┌─────────────────────┐
│  1. ML Sentiment    │  Python child_process → prediction.py
│     (or JS fallback)│  Returns: sentiment · confidence · rating · keywords
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Groq LLM (opt.) │  llama-3.3-70b-versatile
│     Enrichment      │  Returns: customerResponse · keyInsights · keywords
│     + fallback      │  Falls back to pre-written responses if unavailable
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Save to MongoDB │  Response collection
└──────────┬──────────┘
           │
           ▼
      Return JSON → UI
```

---

## Project Structure

```
InsightMiner_AI/
├── app/
│   ├── api/
│   │   ├── analyze-feedback/     Core ML + LLM pipeline
│   │   ├── auth/[...nextauth]/   Authentication
│   │   ├── sentiment-stats/      Dashboard aggregations
│   │   ├── trends/               Time-series data
│   │   ├── topics/               Keyword extraction
│   │   ├── recent-feedback/      Latest entries
│   │   └── signup/               User registration
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── FeedbackWidget.js
│   │   ├── NotificationSystem.js
│   │   ├── SessionWrapper.js
│   │   └── LoadingSpinner.js
│   ├── dashboard/                Analytics page
│   ├── feedback/                 Submit & analyze page
│   ├── login/                    Sign in page
│   ├── signup/                   Registration page
│   ├── profile/                  User profile page
│   ├── model/                    Python ML scripts + .pkl files
│   ├── models/                   Mongoose schemas (User, Response)
│   ├── utils/
│   │   ├── db.js                 MongoDB connection (cached)
│   │   ├── sentimentAnalyzer.js  Python spawn + JS fallback
│   │   └── seedDemoData.js       Auto-seeds demo data on startup
│   ├── layout.js                 Root layout + providers
│   ├── page.js                   Landing page
│   └── globals.css               Tailwind + CSS variables
├── instrumentation.js            Next.js startup hook (runs seeder)
├── .env.example                  Environment variable template
├── next.config.mjs
├── package.json
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free M0 tier) — [cloud.mongodb.com](https://cloud.mongodb.com)
- Python 3.8+ with `scikit-learn`, `numpy`, `pandas`, `joblib` *(optional — JS fallback works without it)*
- Groq API key *(optional — demo mode works without it)*

### 1. Clone and install

```bash
git clone https://github.com/your-username/InsightMiner_AI.git
cd InsightMiner_AI
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/insightminer
NEXTAUTH_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">
GROQ_API_KEY=          # Optional — get free at console.groq.com
```

### 3. Run locally

```bash
npm run dev
```

On first start, the server automatically seeds 30 demo feedback entries into your database so the dashboard is immediately populated. No manual data entry needed.

Open [http://localhost:3000](http://localhost:3000), sign up, and explore.

---

## Environment Variables

| Variable | Required | Purpose | How to obtain |
|---|---|---|---|
| `MONGODB_URI` | Yes | Database connection | [MongoDB Atlas](https://cloud.mongodb.com) — free M0 cluster |
| `NEXTAUTH_SECRET` | Yes | JWT session signing | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Production only | Canonical base URL for NextAuth callbacks | Set to your deployed URL (e.g. `https://your-app.vercel.app`). Not needed on Vercel — auto-detected. |
| `GROQ_API_KEY` | No | LLM enrichment (Llama 3.3-70b) | [console.groq.com](https://console.groq.com) — free tier |

---

## Contributing

InsightMiner AI is open to contributions of all kinds: bug fixes, new features, UX improvements, or documentation updates.

If you find an issue or have an idea, open an issue to start a conversation. Pull requests are welcome. Please keep changes focused and describe what problem they solve.

Built with curiosity. Improved with community.