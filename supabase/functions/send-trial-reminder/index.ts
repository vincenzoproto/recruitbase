import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  name: string;
  email: string;
  daysLeft: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, daysLeft }: ReminderEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Recruit Base <onboarding@resend.dev>",
      to: [email],
      subject: `⏰ Mancano solo ${daysLeft} giorni alla fine del tuo periodo di prova!`,
      html: `
        <div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #0A84FF; font-size: 32px; margin: 0;">Recruit Base</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);">
            <h2 style="color: #111827; font-size: 24px; margin-top: 0;">Ciao ${name}! 👋</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Il tuo periodo di prova gratuito sta per scadere tra <strong>${daysLeft} giorni</strong>.
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Non perdere l'accesso a tutte le funzionalità premium di Recruit Base:
            </p>
            
            <ul style="color: #6b7280; font-size: 16px; line-height: 1.8;">
              <li>✨ Match intelligente con candidati perfetti</li>
              <li>📊 Analytics avanzate e insights</li>
              <li>💬 Chat diretta con candidati/recruiter</li>
              <li>🔔 Notifiche real-time</li>
              <li>🎯 Ricerca avanzata e filtri</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://buy.stripe.com/7sYfZh2br4aUfNW24GabK00" 
                 style="background: linear-gradient(135deg, #0A84FF 0%, #0066CC 100%); 
                        color: white; 
                        padding: 16px 32px; 
                        border-radius: 12px; 
                        text-decoration: none; 
                        font-weight: 600; 
                        display: inline-block;
                        box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);">
                🚀 Continua con Premium
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 24px;">
              Il pagamento partirà solo dopo i 30 giorni di prova
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 14px;">
            <p>Hai domande? Rispondi a questa email, siamo qui per aiutarti!</p>
            <p style="margin-top: 16px;">
              <a href="https://recruitbase.app" style="color: #0A84FF; text-decoration: none;">Recruit Base</a> - 
              Il modo più smart di trovare lavoro
            </p>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-trial-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
