import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { jobOfferId, candidateId } = await req.json();

    if (!jobOfferId || !candidateId) {
      throw new Error('Missing jobOfferId or candidateId');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get candidate profile
    const { data: candidate, error: candidateError } = await supabase
      .from('profiles')
      .select('full_name, job_title, skills, bio, city, years_experience')
      .eq('id', candidateId)
      .single();

    if (candidateError) throw candidateError;

    // Get job offer
    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('title, sector, description, city, experience_level')
      .eq('id', jobOfferId)
      .single();

    if (jobError) throw jobError;

    // Get ranking scores
    const { data: ranking, error: rankingError } = await supabase
      .from('candidate_rankings')
      .select('skills_match_score, experience_score, location_score, profile_completeness_score')
      .eq('job_offer_id', jobOfferId)
      .eq('candidate_id', candidateId)
      .single();

    if (rankingError) throw rankingError;

    // Generate match reasons using AI
    const prompt = `Sei un esperto recruiter AI. Analizza questo match candidato-lavoro e genera ESATTAMENTE 3 motivi brevi (max 60 caratteri ciascuno) del perché è un buon fit.

Candidato:
- Nome: ${candidate.full_name}
- Job Title: ${candidate.job_title || 'N/A'}
- Skills: ${candidate.skills?.join(', ') || 'N/A'}
- Esperienza: ${candidate.years_experience || 0} anni
- Città: ${candidate.city || 'N/A'}

Job Offer:
- Titolo: ${job.title}
- Settore: ${job.sector}
- Città: ${job.city}
- Livello: ${job.experience_level}
- Descrizione: ${job.description.substring(0, 200)}...

Punteggi:
- Skills Match: ${ranking.skills_match_score}/30
- Experience: ${ranking.experience_score}/25
- Location: ${ranking.location_score}/15
- Profile: ${ranking.profile_completeness_score}/10

Rispondi SOLO con un JSON array di 3 stringhe brevi e concrete. Esempio:
["Esperienza perfetta nel settore", "Skills allineate al 90%", "Stesso territorio"]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Sei un esperto recruiter. Rispondi sempre con JSON valido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse the AI response
    let reasons: string[];
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        reasons = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean
        reasons = content
          .split('\n')
          .filter((line: string) => line.trim())
          .slice(0, 3)
          .map((line: string) => line.replace(/^[-•*]\s*/, '').trim());
      }

      // Ensure we have exactly 3 reasons
      if (reasons.length < 3) {
        reasons = [
          ...reasons,
          'Profilo completo e professionale',
          'Esperienza rilevante nel settore',
          'Skills tecniche appropriate'
        ].slice(0, 3);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      reasons = [
        'Profilo in linea con requisiti',
        'Esperienza adeguata',
        'Competenze rilevanti'
      ];
    }

    // Update the ranking with AI-generated reasons
    const { error: updateError } = await supabase
      .from('candidate_rankings')
      .update({ match_reasons: reasons })
      .eq('job_offer_id', jobOfferId)
      .eq('candidate_id', candidateId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ reasons }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});