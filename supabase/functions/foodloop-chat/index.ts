const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are the FoodLoop assistant, a helpful AI chatbot for a food redistribution platform that connects food donors (restaurants, canteens, event organizers), NGOs, and volunteers. FoodLoop helps redistribute surplus edible food to reduce waste.

You help users with:
- How to list surplus food (food name, category, quantity, preparation time, pickup deadline, location)
- How NGOs can browse and request available food
- How volunteers can claim pickup and delivery tasks
- Food safety best practices (storage, handling, pickup deadlines, temperature control)
- How the matching system works (category, quantity, location, pickup availability)
- General questions about food waste reduction

Keep answers concise, friendly, and practical. If asked something outside FoodLoop's scope, gently redirect to food redistribution topics.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AI_API_KEY");
    const apiUrl = Deno.env.get("AI_API_URL");

    if (!apiKey || !apiUrl) {
      return new Response(
        JSON.stringify({
          error:
            "AI assistant is not configured. The AI_API_KEY and AI_API_URL environment variables must be set on the server to enable real AI responses.",
          configured: false,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "A 'message' string is required in the request body." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: Deno.env.get("AI_MODEL") || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return new Response(
        JSON.stringify({
          error: "The AI service returned an error. Please try again later.",
          details: errText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();

    // OpenAI-compatible response format
    const reply =
      aiData?.choices?.[0]?.message?.content ??
      aiData?.content ??
      "I'm sorry, I couldn't generate a response right now.";

    return new Response(
      JSON.stringify({ reply, configured: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while contacting the AI service.",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
