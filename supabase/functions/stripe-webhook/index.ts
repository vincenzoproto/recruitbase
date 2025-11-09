import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event = await req.json();
    console.log("Stripe webhook event:", event.type);

    // Handle subscription created or updated
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const subscriptionId = subscription.id;
      const status = subscription.status;

      console.log("Processing subscription:", subscriptionId, "Status:", status);

      // Find user by stripe customer ID
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: subscriptionId,
            status: status === "active" ? "active" : status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        // Update profile premium status
        await supabase
          .from("profiles")
          .update({ is_premium: status === "active" })
          .eq("id", existingSub.user_id);
      }
    }

    // Handle first successful payment (after trial) - trigger Ambassador commission
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;

      console.log("Payment succeeded for subscription:", subscriptionId);

      // Get subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("user_id, trial_end")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (subscription) {
        const trialEndDate = subscription.trial_end ? new Date(subscription.trial_end) : null;
        const now = new Date();

        // Check if this is the first payment after trial
        if (trialEndDate && now > trialEndDate) {
          console.log("First payment after trial detected for user:", subscription.user_id);

          // Find referral for this user
          const { data: referral } = await supabase
            .from("ambassador_referrals")
            .select("*, ambassador:profiles!ambassador_referrals_ambassador_id_fkey(full_name, id), referred:profiles!ambassador_referrals_referred_user_id_fkey(full_name)")
            .eq("referred_user_id", subscription.user_id)
            .eq("status", "pending")
            .single();

          if (referral) {
            console.log("Processing ambassador commission for referral:", referral.id);

            // Update referral status
            await supabase
              .from("ambassador_referrals")
              .update({
                status: "completed",
                first_payment_date: now.toISOString(),
              })
              .eq("id", referral.id);

            // Create earning record
            const { data: earning } = await supabase
              .from("ambassador_earnings")
              .insert({
                ambassador_id: referral.ambassador_id,
                referral_id: referral.id,
                amount: 10.00,
                status: "pending",
              })
              .select()
              .single();

            console.log("Ambassador earning created:", earning);

            // Send notification email to ambassador
            try {
              await resend.emails.send({
                from: "Recruit Base <onboarding@resend.dev>",
                to: [`user-${referral.ambassador.id}@example.com`], // You'll need to get email from auth.users
                subject: "🎉 Hai guadagnato 10€ su Recruit Base!",
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; margin-top: 20px; border-radius: 10px; }
                        .amount { font-size: 48px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>🎉 Complimenti ${referral.ambassador.full_name}!</h1>
                        </div>
                        <div class="content">
                          <p>Hai guadagnato grazie al tuo invito su Recruit Base!</p>
                          <div class="amount">+10€</div>
                          <p><strong>${referral.referred.full_name}</strong> ha completato il primo pagamento Premium.</p>
                          <p>Accedi al tuo dashboard per richiedere il pagamento quando vuoi.</p>
                          <p style="text-align: center; margin-top: 30px;">
                            <a href="https://recruitbase.app/dashboard" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Vai al Dashboard</a>
                          </p>
                        </div>
                      </div>
                    </body>
                  </html>
                `,
              });
            } catch (emailError) {
              console.error("Error sending ambassador email:", emailError);
            }
          }
        }
      }
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);

      // Update profile
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (sub) {
        await supabase
          .from("profiles")
          .update({ is_premium: false })
          .eq("id", sub.user_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
