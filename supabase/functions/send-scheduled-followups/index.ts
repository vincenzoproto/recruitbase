import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting scheduled follow-ups check...');

    // Get all follow-ups that are due and not sent
    const now = new Date().toISOString();
    const { data: dueFollowUps, error: fetchError } = await supabase
      .from('follow_ups')
      .select(`
        id,
        candidate_id,
        recruiter_id,
        followup_message,
        profiles!follow_ups_candidate_id_fkey(full_name)
      `)
      .eq('followup_sent', false)
      .not('followup_due', 'is', null)
      .lte('followup_due', now);

    if (fetchError) {
      console.error('Error fetching follow-ups:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${dueFollowUps?.length || 0} follow-ups to send`);

    if (!dueFollowUps || dueFollowUps.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No follow-ups due' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: any[] = [];

    for (const followUp of dueFollowUps) {
      try {
        // Send message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: followUp.recruiter_id,
            receiver_id: followUp.candidate_id,
            content: followUp.followup_message,
          });

        if (messageError) {
          console.error(`Error sending message for follow-up ${followUp.id}:`, messageError);
          errors.push({ followUpId: followUp.id, error: messageError });
          continue;
        }

        // Create notification for candidate
        await supabase
          .from('notifications')
          .insert({
            user_id: followUp.candidate_id,
            type: 'message',
            title: 'Nuovo messaggio',
            message: `Hai ricevuto un follow-up`,
            link: `/messages`,
          });

        // Mark as sent
        const { error: updateError } = await supabase
          .from('follow_ups')
          .update({
            followup_sent: true,
            last_contact: new Date().toISOString(),
          })
          .eq('id', followUp.id);

        if (updateError) {
          console.error(`Error updating follow-up ${followUp.id}:`, updateError);
          errors.push({ followUpId: followUp.id, error: updateError });
          continue;
        }

        sentCount++;
        console.log(`✓ Sent follow-up ${followUp.id}`);
      } catch (error) {
        console.error(`Error processing follow-up ${followUp.id}:`, error);
        errors.push({ followUpId: followUp.id, error });
      }
    }

    console.log(`Completed: ${sentCount} messages sent, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: dueFollowUps.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-scheduled-followups:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
