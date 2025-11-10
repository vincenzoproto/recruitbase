import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateName, tone, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // System prompts per tono
    const systemPrompts = {
      professional: "Sei un recruiter professionale. Scrivi messaggi formali, rispettosi e diretti che trasmettono serietà e competenza.",
      empathetic: "Sei un recruiter empatico e umano. Scrivi messaggi caldi, personali e motivanti che creano connessione autentica.",
      direct: "Sei un recruiter diretto ed efficiente. Scrivi messaggi brevi, chiari e pragmatici che vanno dritti al punto."
    };

    const systemPrompt = systemPrompts[tone as keyof typeof systemPrompts] || systemPrompts.professional;

    const userPrompt = context 
      ? `Scrivi un messaggio di follow-up per ${candidateName}. Contesto: ${context}. Mantieni il messaggio sotto 100 parole, friendly ma professionale.`
      : `Scrivi un messaggio di primo contatto per ${candidateName}. Presenta te stesso come recruiter interessato al profilo, chiedi disponibilità per una call. Massimo 80 parole.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit raggiunto. Riprova tra poco.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Crediti esauriti. Aggiungi crediti al workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Errore nella generazione del messaggio');
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-message-suggest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
