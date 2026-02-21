import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase
      .from("waitlist_emails")
      .insert({ email });

    if (dbError && dbError.code !== "23505") {
      throw dbError;
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    await resend.emails.send({
      from: "donotreply@bendersaas.ai",
      to: "spasta+FMSH@gmail.com",
      subject: `New FindMySh waitlist signup: ${email}`,
      html: `
        <div style="font-family: monospace; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
          <h2 style="color: #A788FA; margin: 0 0 16px;">FindMySh — New Waitlist Signup</h2>
          <p style="color: #cbd5e1;"><strong>Email:</strong> ${email}</p>
          <p style="color: #64748b; font-size: 12px;">Submitted at ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, alreadyExists: dbError?.code === "23505" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Waitlist signup error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
