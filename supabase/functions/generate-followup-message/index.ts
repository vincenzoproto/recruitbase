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

    const { templateId, candidateId, recruiterId } = await req.json();

    if (!templateId || !candidateId || !recruiterId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('follow_up_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Get candidate profile
    const { data: candidate, error: candidateError } = await supabase
      .from('profiles')
      .select('full_name, job_title, pipeline_stage_id')
      .eq('id', candidateId)
      .single();

    if (candidateError) throw candidateError;

    // Get pipeline stage name
    let pipelineStageName = 'in valutazione';
    if (candidate.pipeline_stage_id) {
      const { data: stage } = await supabase
        .from('pipeline_stages')
        .select('name')
        .eq('id', candidate.pipeline_stage_id)
        .single();
      
      if (stage) pipelineStageName = stage.name;
    }

    // Get latest application for job title
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        job_offers (
          title
        )
      `)
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false })
      .limit(1);

    let jobTitle = candidate.job_title || 'la posizione';
    if (applications && applications.length > 0) {
      const jobOffersData: any = applications[0].job_offers;
      if (jobOffersData) {
        const title = Array.isArray(jobOffersData) ? jobOffersData[0]?.title : jobOffersData?.title;
        if (title) jobTitle = title;
      }
    }

    // Get meeting info if exists
    const { data: meeting } = await supabase
      .from('meetings')
      .select('scheduled_date, scheduled_time')
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .eq('status', 'pending')
      .order('scheduled_date', { ascending: false })
      .limit(1)
      .single();

    const meetingTime = meeting ? `${meeting.scheduled_time}` : 'orario da confermare';

    // Prepare AI prompt
    const aiPrompt = template.ai_prompt
      .replace('{candidate_name}', candidate.full_name)
      .replace('{job_title}', jobTitle)
      .replace('{pipeline_stage}', pipelineStageName)
      .replace('{meeting_time}', meetingTime);

    console.log('AI Prompt:', aiPrompt);

    // Generate personalized message using AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Sei un esperto recruiter. Genera messaggi professionali, cordiali e personalizzati. Rispondi SOLO con il testo del messaggio, senza virgolette o formattazioni aggiuntive.' 
          },
          { role: 'user', content: aiPrompt }
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
    let generatedMessage = aiData.choices[0].message.content.trim();
    
    // Clean up the message (remove quotes if present)
    generatedMessage = generatedMessage.replace(/^["']|["']$/g, '');

    // Log automation
    await supabase
      .from('automation_logs')
      .insert({
        recruiter_id: recruiterId,
        candidate_id: candidateId,
        action_type: 'template_generated',
        status: 'success',
        details: {
          template_id: templateId,
          template_name: template.name,
          candidate_name: candidate.full_name
        }
      });

    return new Response(
      JSON.stringify({ 
        message: generatedMessage,
        candidateName: candidate.full_name,
        jobTitle: jobTitle
      }),
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