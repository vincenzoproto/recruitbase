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
    console.log('Starting scheduled followup processing...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all pending messages that should be sent now
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching pending messages:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingMessages?.length || 0} pending messages to send`);

    if (!pendingMessages || pendingMessages.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending messages to send', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each message
    for (const scheduled of pendingMessages) {
      try {
        console.log(`Processing message ${scheduled.id} for candidate ${scheduled.candidate_id}`);

        // Insert message into messages table
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: scheduled.recruiter_id,
            receiver_id: scheduled.candidate_id,
            content: scheduled.message_content,
            read: false,
            message_type: 'text'
          });

        if (messageError) {
          console.error('Error inserting message:', messageError);
          throw messageError;
        }

        // Update scheduled message status
        const { error: updateError } = await supabase
          .from('scheduled_messages')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', scheduled.id);

        if (updateError) {
          console.error('Error updating scheduled message:', updateError);
          throw updateError;
        }

        // Update pipeline stage if provided
        if (scheduled.pipeline_stage) {
          await supabase
            .from('profiles')
            .update({ 
              pipeline_stage_id: scheduled.pipeline_stage,
              last_contact_date: new Date().toISOString()
            })
            .eq('id', scheduled.candidate_id);
        } else {
          // Just update last contact date
          await supabase
            .from('profiles')
            .update({ last_contact_date: new Date().toISOString() })
            .eq('id', scheduled.candidate_id);
        }

        // Log success
        await supabase
          .from('automation_logs')
          .insert({
            recruiter_id: scheduled.recruiter_id,
            candidate_id: scheduled.candidate_id,
            action_type: 'follow_up_sent',
            status: 'success',
            details: {
              scheduled_message_id: scheduled.id,
              sent_at: new Date().toISOString()
            }
          });

        successCount++;
        console.log(`Successfully sent message ${scheduled.id}`);

      } catch (error) {
        console.error(`Error processing message ${scheduled.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('scheduled_messages')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', scheduled.id);

        // Log failure
        await supabase
          .from('automation_logs')
          .insert({
            recruiter_id: scheduled.recruiter_id,
            candidate_id: scheduled.candidate_id,
            action_type: 'follow_up_sent',
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            details: {
              scheduled_message_id: scheduled.id
            }
          });

        failureCount++;
      }
    }

    console.log(`Processing complete. Success: ${successCount}, Failed: ${failureCount}`);

    return new Response(
      JSON.stringify({ 
        message: 'Follow-up messages processed',
        processed: successCount + failureCount,
        successful: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-scheduled-followup:', error);
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