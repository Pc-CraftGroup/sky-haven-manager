import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, gameState } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from game state
    const context = `
Current Game State:
- Budget: €${gameState.budget.toLocaleString('de-DE')}
- Total Aircraft: ${gameState.totalAircraft}
- Active Flights: ${gameState.activeFlights}
- Total Revenue: €${gameState.totalRevenue.toLocaleString('de-DE')}
- Player Level: ${gameState.playerLevel}
- Reputation: ${gameState.reputation}%
`;

    const systemPrompt = `Du bist ein erfahrener Aviation Business Berater für ein Airline-Management-Spiel. 
Du hilfst Spielern dabei, ihre Airline zu optimieren und strategische Entscheidungen zu treffen.

Deine Aufgaben:
- Gebe kurze, prägnante Ratschläge (max 3-4 Sätze)
- Analysiere die aktuelle Situation und schlage konkrete Verbesserungen vor
- Motiviere den Spieler und feiere Erfolge
- Warne vor Risiken und schlage Lösungen vor
- Sei freundlich, professionell und ermutigend
- Nutze Emojis sparsam aber wirkungsvoll

Aktuelle Spielsituation:
${context}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI-Guthaben aufgebraucht. Bitte Credits hinzufügen." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-advisor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});