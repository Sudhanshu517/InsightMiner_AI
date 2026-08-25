import connectDB from "@/app/utils/db";
import ResponseModel from "@/app/models/Response";
import { analyzeSentimentWithModel } from "@/app/utils/sentimentAnalyzer";
import Groq from "groq-sdk";

// Fallback responses based on sentiment when offline/API unavailable
const FALLBACK_RESPONSES = {
  Positive:
    "Thank you for your positive feedback! We're delighted to hear that you had a great experience with our product. Your satisfaction is our priority, and we appreciate you taking the time to share your thoughts.",
  Negative:
    "We sincerely apologize for your experience. Your feedback is important to us, and we'll use it to improve our products and services. Please reach out to our customer service team if there's anything we can do to address your concerns.",
  Neutral:
    "Thank you for sharing your feedback. We appreciate your honest assessment and will take your comments into consideration as we continue to improve our products and services. Please don't hesitate to reach out if you have any other thoughts.",
};

export async function POST(req) {
  try {
    const { feedback, price, rating, projectName, category } = await req.json();

    if (!feedback || feedback.length < 3) {
      return Response.json(
        { error: "Feedback is too short." },
        { status: 400 }
      );
    }

    // Step 1: Analyze sentiment using the original ML model
    const sentimentResult = await analyzeSentimentWithModel(
      feedback,
      price,
      rating
    );
    console.log("Sentiment analysis result:", sentimentResult);

    // Generate a fallback response based on the sentiment
    const fallbackResponse =
      FALLBACK_RESPONSES[sentimentResult.sentiment] ||
      "Thank you for your feedback. We value your input and will use it to improve our products and services.";

    // Get the API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    let customerResponse = fallbackResponse;
    let apiCallSuccessful = false;

    // Initialize result with default values
    let result = {
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      rating: sentimentResult.rating,
      customerResponse: fallbackResponse,
      keyInsights: [],
      keywords: sentimentResult.keywords || [],
      offline: true,
    };

    // Check if API key is valid and try to call Groq API
    if (apiKey && apiKey !== "YOUR_ACTUAL_GROQ_API_KEY_HERE") {
      try {
        const groq = new Groq({ apiKey });

        // Step 2: Use Groq Llama 3 API for generating customer response and extracting insights
        const prompt = `
          Analyze the following customer feedback which has been analyzed as ${sentimentResult.sentiment}:
          
          Customer feedback: "${feedback}"
          ${projectName ? `\n          Project Name: "${projectName}"` : ""}
          ${category ? `\n          Category: "${category}"` : ""}
          
          Provide the following:
          
          1. RATING: Rate the feedback on a scale of 1 to 5, where 1 is highly negative and 5 is highly positive. Provide ONLY the number.
          
          2. RESPONSE: A professional, empathetic and personalized response to the customer that acknowledges their feedback and matches the sentiment of their experience. Keep it under 3 sentences, natural and sincere.
          
          3. KEY_INSIGHTS: Identify 2-4 key insights from this feedback that would be valuable for the business. Each insight should be a short, actionable takeaway.
          
          4. KEYWORDS: Extract 3-6 most important keywords or phrases from the feedback that represent the main topics.
          
          Format your response exactly as:
          RATING: [number 1-5]
          RESPONSE: [your customer response]
          KEY_INSIGHTS: [insight 1]; [insight 2]; [etc]
          KEYWORDS: [keyword1], [keyword2], [etc]
        `;

        console.log("Attempting to call Groq API...");

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_completion_tokens: 1024,
        });

        if (chatCompletion.choices && chatCompletion.choices.length > 0) {
          const aiResponse = chatCompletion.choices[0].message.content.trim();
          apiCallSuccessful = true;
          console.log("Groq API response:", aiResponse);

          // Parse the structured response
          const ratingPart = aiResponse.match(/RATING:\s*(\d+)/i);
          const responsePart = aiResponse.match(
            /RESPONSE:(.*?)(?=KEY_INSIGHTS:|$)/s
          );
          const insightsPart = aiResponse.match(
            /KEY_INSIGHTS:(.*?)(?=KEYWORDS:|$)/s
          );
          const keywordsPart = aiResponse.match(/KEYWORDS:(.*?)(?=$)/s);

          // Calculate combined rating
          let groqRating = ratingPart ? parseInt(ratingPart[1], 10) : sentimentResult.rating;
          if (isNaN(groqRating) || groqRating < 1 || groqRating > 5) {
            groqRating = sentimentResult.rating;
          }
          const combinedRating = Math.round((sentimentResult.rating + groqRating) / 2);

            customerResponse = responsePart
              ? responsePart[1].trim()
              : fallbackResponse;

            // Extract insights and convert to array
            const keyInsights = insightsPart
              ? insightsPart[1]
                  .split(";")
                  .map((insight) => insight.trim())
                  .filter(Boolean)
              : [];

            // Extract keywords and convert to array
            const keywords = keywordsPart
              ? keywordsPart[1]
                  .split(",")
                  .map((keyword) => keyword.trim())
                  .filter(Boolean)
              : [];

            result = {
              sentiment: sentimentResult.sentiment,
              confidence: sentimentResult.confidence,
              rating: combinedRating,
              localRating: sentimentResult.rating,
              groqRating: groqRating,
              customerResponse: customerResponse,
              keyInsights: keyInsights,
              keywords: keywords,
              offline: false,
            };
          } else {
            console.error("Unexpected Groq API response format");
            result = {
              sentiment: sentimentResult.sentiment,
              confidence: sentimentResult.confidence,
              rating: sentimentResult.rating,
              customerResponse: fallbackResponse,
              offline: true,
            };
          }
      } catch (apiError) {
        console.error("Failed to call Groq API:", apiError.message);
        // Continue with fallback response
      }
    } else {
      console.log("Using offline mode with fallback response");
    }

    // Update the final result with current values
    result = {
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      rating: result.rating || sentimentResult.rating,
      localRating: result.localRating || sentimentResult.rating,
      groqRating: result.groqRating || sentimentResult.rating,
      customerResponse: customerResponse,
      offline: !apiCallSuccessful,
      keyInsights: result.keyInsights || [],
      keywords: apiCallSuccessful
        ? result.keywords
        : sentimentResult.keywords || [],
    };

    // Save the response to MongoDB
    try {
      await connectDB();

      const newResponse = new ResponseModel({
        feedback: feedback,
        price: price || null,
        sentiment: result.sentiment,
        confidence: result.confidence,
        rating: result.rating,
        projectName: projectName || null,
        category: category || null,
        topics: result.keywords || [],
        recommendations: result.keyInsights || [],
        customerResponse: result.customerResponse,
      });

      await newResponse.save();
      console.log("Response saved to database");
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
    }

    return Response.json(result);
  } catch (error) {
    console.error("Server error:", error);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
