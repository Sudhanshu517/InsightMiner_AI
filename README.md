# AI Feedback Analyzer

A full-stack Next.js 15 application that analyzes customer feedback using a trained Python ML model (scikit-learn) + Gemini AI for enhanced insights. Provides sentiment analysis, trend detection, topic extraction, and automated customer response generation.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS v3, Recharts |
| **Backend** | Next.js API Routes, NextAuth.js v4 |
| **Database** | MongoDB (Mongoose) |
| **ML Model** | Python (scikit-learn): TF-IDF + Logistic Regression/Naive Bayes/SVM with SMOTE |
| **External AI** | Google Gemini 2.0 Flash API |
| **State** | Recoil (global), React Context (session/notifications) |
| **Auth** | Credentials (bcryptjs) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Pages                                                 │
│  ├── / (Landing)                                                │
│  ├── /feedback (Submit & Analyze)                               │
│  ├── /dashboard (Analytics: charts, trends, topics)             │
│  ├── /login, /signup, /profile (Auth)                          │
│                                                                 │
│  Components                                                     │
│  ├── Navbar, Footer, FeedbackWidget, NotificationSystem        │
│  └── SessionWrapper (NextAuth context)                         │
├─────────────────────────────────────────────────────────────────┤
│  API Routes                                                     │
│  ├── POST /api/analyze-feedback  → Python ML + Gemini          │
│  ├── GET  /api/sentiment-stats   → Aggregated sentiment data   │
│  ├── GET  /api/trends            → Time-series sentiment       │
│  ├── GET  /api/topics            → Extracted keywords/topics   │
│  ├── GET  /api/recent-feedback   → Latest submissions          │
│  └── /api/auth/[...nextauth]     → NextAuth credentials        │
├─────────────────────────────────────────────────────────────────┤
│  Python ML Service (spawned via child_process)                 │
│  ├── app/model/prediction.py   → Loads .pkl model + vectorizer │
│  ├── app/model/main.py         → Training pipeline             │
│  └── Models: best_sentiment_model.pkl, tfidf_vectorizer.pkl   │
├─────────────────────────────────────────────────────────────────┤
│  Database (MongoDB)                                             │
│  ├── User: email, password (bcrypt)                            │
│  └── Response: feedback, sentiment, confidence, topics, etc.   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Sentiment Analysis** — Classifies feedback as Positive/Neutral/Negative with confidence scores (via trained TF-IDF + Logistic Regression model)
2. **Automated Customer Responses** — Gemini AI generates empathetic, personalized replies
3. **Key Insights Extraction** — Business-actionable takeaways from feedback
4. **Keyword/Topic Detection** — TF-IDF + Gemini identifies main topics
5. **Analytics Dashboard** — Recharts visualizations: bar/pie/area charts for sentiment distribution, trends over time, top topics
6. **Authentication** — Secure email/password with bcrypt + JWT sessions
7. **Offline Fallback** — Works without Gemini API (uses local ML model only)

---

## ML Model Details (`app/model/main.py`)

- **Dataset**: Flipkart product reviews (11M+ rows CSV)
- **Preprocessing**: Contraction expansion, negation handling (NOT_ prefix), custom stopwords preserving sentiment modifiers
- **Features**: TF-IDF (unigrams + bigrams, min_df=5, max_df=0.8, sublinear_tf)
- **Class Balance**: SMOTE oversampling
- **Models Compared**: Logistic Regression, Naive Bayes, LinearSVC (GridSearchCV)
- **Best Model Saved**: `best_sentiment_model.pkl` + `tfidf_vectorizer.pkl`

---

## Data Flow: Analyze Feedback

```
User submits feedback (POST /api/analyze-feedback)
        │
        ▼
┌───────────────────────┐
│ 1. Python ML Model    │  ← spawn child_process → prediction.py
│    (sentiment, rating,│     Returns: sentiment, confidence, rating
│     keywords)         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 2. Gemini API (opt)   │  ← Generates: customerResponse, keyInsights, keywords
│    (enrichment)       │     Falls back to local if unavailable
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 3. Save to MongoDB    │  ← Response collection
└───────────┬───────────┘
            │
            ▼
       Return JSON to UI
```

---

## Project Structure

```
AIFEEDBACK/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── analyze-feedback/   # Core ML + Gemini pipeline
│   │   ├── auth/[...nextauth]/ # NextAuth credentials
│   │   ├── sentiment-stats/    # Dashboard aggregations
│   │   ├── trends/             # Time-series data
│   │   ├── topics/             # Keyword extraction
│   │   └── recent-feedback/    # Latest entries
│   ├── components/             # Shared UI (Navbar, Footer, etc.)
│   ├── dashboard/              # Analytics page (Recharts)
│   ├── feedback/               # Submit & analyze page
│   ├── model/                  # Python ML (main.py, prediction.py, .pkl files)
│   ├── models/                 # Mongoose schemas (User, Response)
│   ├── utils/                  # db.js, sentimentAnalyzer.js
│   ├── login/signup/profile/   # Auth pages
│   ├── globals.css             # Tailwind v4 + custom CSS vars
│   ├── layout.js               # Root layout + providers
│   └── page.js                 # Landing page
├── package.json
└── README.md
```

---

## Environment Variables Required

```env
MONGODB_URI=mongodb://...
NEXTAUTH_SECRET=your-secret
GEMINI_API_KEY=your-gemini-key  # Optional (fallback works without)
```

---

## Strengths

- Hybrid ML + LLM approach (local model for speed/cost, Gemini for richness)
- Full authentication + user-specific data isolation
- Comprehensive analytics dashboard with multiple chart types
- Graceful offline degradation
- Clean separation of concerns (Python ML, Next.js API, React UI)

---

## Potential Improvements

- Add rate limiting on `/api/analyze-feedback`
- Implement feedback batching/bulk upload
- Add export (CSV/PDF) for dashboard
- WebSocket for real-time updates
- Unit/integration tests
- Dockerize Python ML service for production scaling