import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TipsEmailRequest {
  name: string;
  email: string;
  role: "recruiter" | "candidate";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role }: TipsEmailRequest = await req.json();

    const tips = role === "recruiter" ? {
      title: "3 consigli per trovare i candidati perfetti",
      tips: [
        { icon: "🎯", title: "Usa i filtri avanzati", description: "Cerca candidati per città, competenze e livello di esperienza" },
        { icon: "⭐", title: "Salva i preferiti", description: "Aggiungi i candidati migliori ai tuoi preferiti per contattarli in seguito" },
        { icon: "💬", title: "Rispondi velocemente", description: "I candidati apprezzano risposte rapide - usa la chat integrata!" }
      ]
    } : {
      title: "3 consigli per trovare il lavoro dei tuoi sogni",
      tips: [
        { icon: "📝", title: "Completa il tuo profilo", description: "Un profilo completo aumenta del 70% le visualizzazioni da parte dei recruiter" },
        { icon: "🔔", title: "Attiva le notifiche", description: "Ricevi alert immediati quando un'offerta match con il tuo profilo" },
        { icon: "🎯", title: "Candidati rapidamente", description: "Le prime candidature hanno il 3x di probabilità di essere visualizzate" }
      ]
    };

    const emailResponse = await resend.emails.send({
      from: "Recruit Base <onboarding@resend.dev>",
      to: [email],
      subject: `💡 ${tips.title}`,
      html: `
        <div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #0A84FF; font-size: 32px; margin: 0;">Recruit Base</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);">
            <h2 style="color: #111827; font-size: 24px; margin-top: 0;">Ciao ${name}! 👋</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Ecco alcuni consigli per aiutarti a ottenere il massimo da Recruit Base:
            </p>
            
            ${tips.tips.map(tip => `
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
                <div style="font-size: 32px; margin-bottom: 8px;">${tip.icon}</div>
                <h3 style="color: #111827; font-size: 18px; margin: 0 0 8px 0;">${tip.title}</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">${tip.description}</p>
              </div>
            `).join('')}
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://recruitbase.app/dashboard" 
                 style="background: linear-gradient(135deg, #0A84FF 0%, #0066CC 100%); 
                        color: white; 
                        padding: 16px 32px; 
                        border-radius: 12px; 
                        text-decoration: none; 
                        font-weight: 600; 
                        display: inline-block;
                        box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);">
                🚀 Vai alla Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 14px;">
            <p>Hai domande? Rispondi a questa email!</p>
            <p style="margin-top: 16px;">
              <a href="https://recruitbase.app" style="color: #0A84FF; text-decoration: none;">Recruit Base</a>
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
    console.error("Error in send-tips-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
