import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  message: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages, model = "gpt-4o", temperature = 0.7, max_tokens = 1000 }: ChatRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required and must not be empty" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    const result: ChatResponse = {
      message: data.choices[0].message.content,
      usage: data.usage,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
