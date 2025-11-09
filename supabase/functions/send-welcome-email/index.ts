import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WelcomeEmailRequest = await req.json();
    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Recruit Base <onboarding@resend.dev>",
      to: [email],
      subject: "Benvenuto su Recruit Base – connetti talenti e aziende in modo intelligente",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              h1 { margin: 0; font-size: 28px; }
              p { margin: 15px 0; }
              .highlight { background: #EFF6FF; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💼 Benvenuto su Recruit Base!</h1>
              </div>
              <div class="content">
                <p>Ciao <strong>${name}</strong>,</p>
                <p>Siamo felici di averti con noi! 🎉</p>
                <p>Da oggi puoi:</p>
                <ul>
                  <li>✅ Creare offerte di lavoro professionali</li>
                  <li>✅ Trovare i migliori talenti</li>
                  <li>✅ Connettere recruiter e candidati</li>
                </ul>
                <div class="highlight">
                  <strong>🎁 Prova Premium GRATIS per 30 giorni!</strong><br>
                  Accedi a tutte le funzionalità avanzate senza impegno.
                </div>
                <p style="text-align: center;">
                  <a href="https://recruitbase.app/dashboard" class="button">Accedi al tuo profilo 👉</a>
                </p>
                <p>Se hai domande, siamo qui per aiutarti!</p>
                <p>A presto,<br><strong>Il Team di Recruit Base</strong></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Recruit Base. Tutti i diritti riservati.</p>
                <p><a href="https://recruitbase.app" style="color: #3B82F6;">recruitbase.app</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
