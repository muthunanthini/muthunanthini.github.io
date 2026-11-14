import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Standard CORS headers allowing secure POST requests from your GitHub Pages site
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // 1. Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 3. Secure backend environment variables (keys are never exposed to frontend)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "nanthini1772006@gmail.com";

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not set in backend secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Privacy compliance:
    // Zero visitor personal data, zero visitor email, zero IP address, zero device/fingerprint tracking.
    // Calculate accurate visit date and time in Indian Standard Time (IST)
    const now = new Date();
    const visitDate = now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const visitTime = now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // 5. Send Email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Portfolio Alert <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: "Someone Viewed Your Portfolio!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #172554; margin: 0 0 8px; font-size: 22px;">Someone Viewed Your Portfolio!</h2>
              <p style="color: #475569; font-size: 16px; margin: 0;">Good news! Someone has visited your portfolio.</p>
            </div>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748B; font-weight: 600; width: 110px;">Visit Date:</td>
                  <td style="padding: 6px 0; color: #172554; font-weight: 700;">${visitDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Visit Time:</td>
                  <td style="padding: 6px 0; color: #172554; font-weight: 700;">${visitTime} (IST)</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
              Privacy: Zero visitor personal data or IP addresses collected. Sent securely to ${NOTIFICATION_EMAIL}.
            </p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendData = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, message: "Notification delivered", id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
