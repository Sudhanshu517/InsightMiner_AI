import connectDB from "@/app/utils/db";
import ResponseModel from "@/app/models/Response";

// ---------------------------------------------------------------------------
// Demo seed data — 30 realistic feedback entries spread across the last 30
// days. Intentional sentiment distribution:
//   ~50 % Positive · ~25 % Neutral · ~25 % Negative
// This gives the dashboard charts a visible, meaningful spread.
// ---------------------------------------------------------------------------

const DEMO_ENTRIES = [
  // --- Positive ---
  {
    feedback: "The product is absolutely fantastic. It solved our problem immediately and the onboarding was smooth.",
    projectName: "InsightMiner",
    category: "Product",
    sentiment: "Positive",
    confidence: 92,
    rating: 5,
    topics: ["onboarding", "problem-solving", "product quality"],
    recommendations: ["Highlight onboarding experience in marketing", "Use as case study"],
    customerResponse: "Thank you! We're thrilled the onboarding experience felt seamless.",
    daysAgo: 1,
  },
  {
    feedback: "Love the dashboard — gives me exactly the insights I need at a glance. Very well designed.",
    projectName: "InsightMiner",
    category: "UX",
    sentiment: "Positive",
    confidence: 89,
    rating: 5,
    topics: ["dashboard", "insights", "design"],
    recommendations: ["Continue investing in data visualisation", "Add export features"],
    customerResponse: "We're glad the dashboard is hitting the mark for you!",
    daysAgo: 2,
  },
  {
    feedback: "Really impressed by how fast the sentiment analysis runs. Saves us hours of manual review.",
    projectName: "InsightMiner",
    category: "Performance",
    sentiment: "Positive",
    confidence: 88,
    rating: 5,
    topics: ["speed", "sentiment analysis", "efficiency"],
    recommendations: ["Promote speed as a key differentiator", "Add bulk analysis option"],
    customerResponse: "Speed is one of our top priorities — great to see it making a real difference.",
    daysAgo: 3,
  },
  {
    feedback: "The trend charts are incredibly useful for our weekly team reviews. Exactly what we needed.",
    projectName: "InsightMiner",
    category: "Analytics",
    sentiment: "Positive",
    confidence: 91,
    rating: 5,
    topics: ["trends", "charts", "team collaboration"],
    recommendations: ["Add shareable report links", "Introduce scheduled email digests"],
    customerResponse: "We love hearing the trend charts are part of your workflow!",
    daysAgo: 4,
  },
  {
    feedback: "Sign-up was painless and I was analysing feedback within minutes. Great first impression.",
    projectName: "InsightMiner",
    category: "Onboarding",
    sentiment: "Positive",
    confidence: 87,
    rating: 5,
    topics: ["signup", "onboarding", "first impression"],
    recommendations: ["A/B test onboarding flow for conversion optimisation"],
    customerResponse: "A smooth first impression matters a lot to us — thank you!",
    daysAgo: 5,
  },
  {
    feedback: "The keyword extraction is surprisingly accurate. It catches things I would have missed.",
    projectName: "InsightMiner",
    category: "AI Features",
    sentiment: "Positive",
    confidence: 85,
    rating: 4,
    topics: ["keywords", "accuracy", "NLP"],
    recommendations: ["Expose keyword frequency over time", "Add topic clustering"],
    customerResponse: "Keyword accuracy is something we've worked hard on — glad it shows.",
    daysAgo: 7,
  },
  {
    feedback: "Customer response generation saves my team so much time. The tone is always appropriate.",
    projectName: "InsightMiner",
    category: "AI Features",
    sentiment: "Positive",
    confidence: 90,
    rating: 5,
    topics: ["response generation", "tone", "time saving"],
    recommendations: ["Add custom tone options (formal/casual)", "Allow response templates"],
    customerResponse: "We're delighted the generated responses are hitting the right tone!",
    daysAgo: 8,
  },
  {
    feedback: "Really clean interface, no clutter. I can find everything without hunting for it.",
    projectName: "InsightMiner",
    category: "UX",
    sentiment: "Positive",
    confidence: 86,
    rating: 4,
    topics: ["interface", "navigation", "clarity"],
    recommendations: ["Keep UI minimal as features grow", "Add keyboard shortcuts"],
    customerResponse: "Clean and intuitive is exactly what we aim for — thank you!",
    daysAgo: 10,
  },
  {
    feedback: "The confidence scores help me prioritise which feedback actually needs attention. Very useful.",
    projectName: "InsightMiner",
    category: "Analytics",
    sentiment: "Positive",
    confidence: 83,
    rating: 4,
    topics: ["confidence score", "prioritisation", "analytics"],
    recommendations: ["Add filtering by confidence threshold", "Alert on low-confidence entries"],
    customerResponse: "Confidence scores are designed exactly for that — great use case!",
    daysAgo: 12,
  },
  {
    feedback: "Solid product. Does what it promises and the API is reliable. Will recommend to colleagues.",
    projectName: "InsightMiner",
    category: "Product",
    sentiment: "Positive",
    confidence: 84,
    rating: 4,
    topics: ["reliability", "API", "recommendation"],
    recommendations: ["Create a referral programme", "Publish API documentation"],
    customerResponse: "Reliability is non-negotiable for us. Thanks for recommending us!",
    daysAgo: 14,
  },
  {
    feedback: "The pie chart breakdown of sentiment distribution is a great quick summary for stakeholders.",
    projectName: "InsightMiner",
    category: "Analytics",
    sentiment: "Positive",
    confidence: 88,
    rating: 5,
    topics: ["charts", "stakeholders", "summary"],
    recommendations: ["Add one-click presentation mode", "Support custom date ranges"],
    customerResponse: "Stakeholder-ready summaries are exactly what we had in mind!",
    daysAgo: 16,
  },
  {
    feedback: "The dark mode is a nice touch. I use it for long sessions and my eyes are grateful.",
    projectName: "InsightMiner",
    category: "UX",
    sentiment: "Positive",
    confidence: 80,
    rating: 4,
    topics: ["dark mode", "accessibility", "UX"],
    recommendations: ["Add system-preference detection for theme", "Test contrast ratios"],
    customerResponse: "Dark mode was highly requested — glad to hear it's getting use!",
    daysAgo: 18,
  },
  {
    feedback: "Really appreciate how the app handles errors gracefully rather than just crashing.",
    projectName: "InsightMiner",
    category: "Reliability",
    sentiment: "Positive",
    confidence: 82,
    rating: 4,
    topics: ["error handling", "reliability", "UX"],
    recommendations: ["Add error reporting dashboard", "Improve error messages further"],
    customerResponse: "Graceful error handling is a priority for us. Thank you for noticing!",
    daysAgo: 20,
  },
  {
    feedback: "Great value for what it does. Our customer support team now reviews feedback twice as fast.",
    projectName: "InsightMiner",
    category: "Product",
    sentiment: "Positive",
    confidence: 91,
    rating: 5,
    topics: ["value", "support team", "efficiency"],
    recommendations: ["Build a team/multi-user tier", "Add role-based access"],
    customerResponse: "Doubling review speed for your support team is a fantastic outcome!",
    daysAgo: 22,
  },
  {
    feedback: "Impressive how it handles both short one-liners and long detailed reviews equally well.",
    projectName: "InsightMiner",
    category: "AI Features",
    sentiment: "Positive",
    confidence: 86,
    rating: 4,
    topics: ["input length", "robustness", "NLP"],
    recommendations: ["Test with multilingual input", "Add character count guidance"],
    customerResponse: "Handling the full range of feedback lengths is a deliberate design choice!",
    daysAgo: 25,
  },

  // --- Neutral ---
  {
    feedback: "The product works as described. Nothing surprising, does the job.",
    projectName: "InsightMiner",
    category: "Product",
    sentiment: "Neutral",
    confidence: 68,
    rating: 3,
    topics: ["functionality", "expectations"],
    recommendations: ["Survey users on unmet needs", "Add differentiation messaging"],
    customerResponse: "Thank you for the honest assessment. We're always working to go beyond expectations.",
    daysAgo: 2,
  },
  {
    feedback: "Setup was straightforward. I'd like to see more customisation options down the line.",
    projectName: "InsightMiner",
    category: "Onboarding",
    sentiment: "Neutral",
    confidence: 65,
    rating: 3,
    topics: ["setup", "customisation", "feature requests"],
    recommendations: ["Introduce custom category labels", "Allow dashboard layout preferences"],
    customerResponse: "Customisation is on our roadmap — stay tuned for upcoming releases.",
    daysAgo: 6,
  },
  {
    feedback: "It does what I need but I wish the recent feedback panel showed more entries at once.",
    projectName: "InsightMiner",
    category: "UX",
    sentiment: "Neutral",
    confidence: 62,
    rating: 3,
    topics: ["recent feedback", "pagination", "UX"],
    recommendations: ["Add configurable page size for feedback list", "Implement infinite scroll"],
    customerResponse: "Noted! Pagination controls for the feedback panel are something we'll prioritise.",
    daysAgo: 9,
  },
  {
    feedback: "Average experience so far. The core analysis is good but the reporting feels basic.",
    projectName: "InsightMiner",
    category: "Analytics",
    sentiment: "Neutral",
    confidence: 60,
    rating: 3,
    topics: ["reporting", "analytics", "features"],
    recommendations: ["Add CSV/PDF export", "Introduce scheduled reports"],
    customerResponse: "We appreciate the candid feedback. Richer reporting is actively in development.",
    daysAgo: 13,
  },
  {
    feedback: "The API response time is acceptable. Not the fastest I've seen but reliable enough.",
    projectName: "InsightMiner",
    category: "Performance",
    sentiment: "Neutral",
    confidence: 64,
    rating: 3,
    topics: ["performance", "API", "reliability"],
    recommendations: ["Profile slow endpoints", "Add caching layer for dashboard queries"],
    customerResponse: "Reliability over raw speed is our current priority, but we're actively optimising.",
    daysAgo: 17,
  },
  {
    feedback: "It covers the basics well. Would be great to see integration with Slack or email alerts.",
    projectName: "InsightMiner",
    category: "Integrations",
    sentiment: "Neutral",
    confidence: 66,
    rating: 3,
    topics: ["integrations", "Slack", "notifications"],
    recommendations: ["Build Slack/webhook integration", "Add email digest feature"],
    customerResponse: "Integrations are highly requested — Slack support is on our near-term roadmap.",
    daysAgo: 21,
  },
  {
    feedback: "Decent tool. I'm waiting to see how it handles a larger volume of feedback before committing.",
    projectName: "InsightMiner",
    category: "Product",
    sentiment: "Neutral",
    confidence: 61,
    rating: 3,
    topics: ["scalability", "volume", "evaluation"],
    recommendations: ["Publish performance benchmarks", "Offer a high-volume trial plan"],
    customerResponse: "We'd love to show you what InsightMiner looks like at scale — reach out anytime.",
    daysAgo: 26,
  },

  // --- Negative ---
  {
    feedback: "The analysis gave a completely wrong sentiment for sarcastic feedback. Needs improvement.",
    projectName: "InsightMiner",
    category: "AI Features",
    sentiment: "Negative",
    confidence: 78,
    rating: 2,
    topics: ["sarcasm detection", "accuracy", "NLP"],
    recommendations: ["Train on sarcasm/irony dataset", "Add confidence warning for ambiguous text"],
    customerResponse: "We sincerely apologise for the inaccuracy. Sarcasm detection is a known challenge we're actively working on.",
    daysAgo: 3,
  },
  {
    feedback: "The dashboard takes too long to load when I have a lot of data. Needs to be faster.",
    projectName: "InsightMiner",
    category: "Performance",
    sentiment: "Negative",
    confidence: 82,
    rating: 2,
    topics: ["load time", "performance", "dashboard"],
    recommendations: ["Paginate dashboard queries", "Add loading skeletons", "Cache aggregation results"],
    customerResponse: "We apologise for the slow load times. Performance improvements are our immediate priority.",
    daysAgo: 8,
  },
  {
    feedback: "I keep getting logged out unexpectedly. Very frustrating when I'm in the middle of reviewing feedback.",
    projectName: "InsightMiner",
    category: "Auth",
    sentiment: "Negative",
    confidence: 85,
    rating: 1,
    topics: ["session", "auth", "stability"],
    recommendations: ["Extend session TTL", "Add silent token refresh", "Notify user before session expires"],
    customerResponse: "We're very sorry for the session interruptions. This is being investigated as a priority bug.",
    daysAgo: 11,
  },
  {
    feedback: "No bulk import option. I have thousands of reviews and have to paste them one by one.",
    projectName: "InsightMiner",
    category: "Features",
    sentiment: "Negative",
    confidence: 76,
    rating: 2,
    topics: ["bulk import", "CSV", "feature gap"],
    recommendations: ["Build CSV/JSON bulk upload", "Add API endpoint for batch processing"],
    customerResponse: "This is a valid and highly requested gap. Bulk import is now at the top of our backlog.",
    daysAgo: 15,
  },
  {
    feedback: "The mobile experience is quite poor. Buttons are hard to tap and the charts don't resize well.",
    projectName: "InsightMiner",
    category: "UX",
    sentiment: "Negative",
    confidence: 80,
    rating: 2,
    topics: ["mobile", "responsive design", "charts"],
    recommendations: ["Audit Tailwind responsive breakpoints", "Replace fixed chart widths with fluid containers"],
    customerResponse: "We apologise for the poor mobile experience. A dedicated responsive pass is in our next sprint.",
    daysAgo: 19,
  },
  {
    feedback: "Topics extracted are often too generic — words like 'product' and 'good' tell me nothing.",
    projectName: "InsightMiner",
    category: "AI Features",
    sentiment: "Negative",
    confidence: 74,
    rating: 2,
    topics: ["keyword quality", "NLP", "topic extraction"],
    recommendations: ["Filter common stopwords from topics", "Use TF-IDF scoring for relevance"],
    customerResponse: "That's a fair point. We're refining the topic extraction to filter out low-signal terms.",
    daysAgo: 23,
  },
  {
    feedback: "Tried to access the dashboard on Safari and several charts simply didn't render.",
    projectName: "InsightMiner",
    category: "Compatibility",
    sentiment: "Negative",
    confidence: 83,
    rating: 1,
    topics: ["Safari", "browser compatibility", "charts"],
    recommendations: ["Run cross-browser test suite", "Check Recharts Safari compatibility"],
    customerResponse: "We're sorry for the Safari rendering issues. This is being tracked and will be fixed promptly.",
    daysAgo: 28,
  },
];

// ---------------------------------------------------------------------------
// Spread entries across the last N days by mutating createdAt before insert.
// ---------------------------------------------------------------------------
function buildDocuments() {
  const now = new Date();
  return DEMO_ENTRIES.map(({ daysAgo, ...entry }) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    // Add a few random hours so multiple same-day entries aren't identical timestamps
    date.setHours(Math.floor(Math.random() * 14) + 8); // 08:00–22:00
    date.setMinutes(Math.floor(Math.random() * 60));
    return { ...entry, createdAt: date };
  });
}

// ---------------------------------------------------------------------------
// Main export: called from instrumentation.js on server startup.
// Checks for any existing Response documents first — skips seeding if found.
// ---------------------------------------------------------------------------
export async function seedDemoDataIfEmpty() {
  try {
    await connectDB();

    const existingCount = await ResponseModel.countDocuments();

    if (existingCount > 0) {
      console.log(
        `[seed] Database already has ${existingCount} response(s). Skipping demo seed.`
      );
      return;
    }

    const documents = buildDocuments();
    await ResponseModel.insertMany(documents);

    console.log(
      `[seed] Demo data inserted: ${documents.length} entries across the last 30 days.`
    );
  } catch (err) {
    // Never crash the server over a seed failure — just warn.
    console.warn("[seed] Demo seed failed (non-fatal):", err.message);
  }
}
