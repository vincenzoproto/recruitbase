import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId } = await req.json();

    if (!candidateId) {
      return new Response(
        JSON.stringify({ error: 'candidateId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get candidate profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (profileError) throw profileError;

    // Get related data
    const { data: experiences } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('candidate_id', candidateId);

    const { data: education } = await supabase
      .from('education_records')
      .select('*')
      .eq('candidate_id', candidateId);

    const { data: languages } = await supabase
      .from('candidate_languages')
      .select('*')
      .eq('candidate_id', candidateId);

    // Build AI matching vector
    const vector = {
      // Skills (high weight)
      skills: profile.skills || [],
      skillsCount: (profile.skills || []).length,
      
      // Experience (high weight)
      experienceYears: profile.years_experience || 0,
      seniority: profile.seniority_level || '',
      experienceCount: experiences?.length || 0,
      
      // Job preferences
      desiredRoles: profile.desired_roles || [],
      contractTypes: profile.contract_type_preference || [],
      
      // Salary
      salaryMin: profile.salary_min || 0,
      salaryMax: profile.salary_max || 0,
      
      // Availability
      availabilityDays: profile.availability_days || 0,
      remotePreference: profile.remote_preference || 0,
      relocationAvailable: profile.relocation_available || false,
      
      // Location
      city: profile.city || '',
      
      // Languages
      languages: languages?.map(l => ({ language: l.language, level: l.proficiency_level })) || [],
      
      // Education
      educationLevel: education?.[0]?.degree_title || '',
      
      // Profile completeness
      profileCompletion: profile.profile_completion_percentage || 0,
      
      // Core values / soft skills
      coreValues: profile.core_values || []
    };

    // Calculate matching score components for quick filtering
    const matchingScores = {
      skillsWeight: Math.min((profile.skills?.length || 0) * 10, 100),
      experienceWeight: Math.min((profile.years_experience || 0) * 5, 100),
      profileWeight: profile.profile_completion_percentage || 0,
      languagesWeight: Math.min((languages?.length || 0) * 20, 100)
    };

    // Update profile with vector
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        ai_matching_vector: vector,
        updated_at: new Date().toISOString()
      })
      .eq('id', candidateId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        vector,
        matchingScores 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error calculating candidate vector:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
