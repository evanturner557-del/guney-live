import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenText } from "@/lib/moderation";

// Inbound-email webhook → writes each message into support_emails, which shows
// up in the /admin inbox. Accepts two shapes so it works with any provider:
//   1. JSON body: { secret, from, name?, subject?, text? }
//   2. A mail-parse service POSTing multipart/form-data or urlencoded
//      (CloudMailin, SendGrid Inbound Parse, Mailgun, etc.) — in that case the
//      shared secret comes from the ?secret= query param on the webhook URL.
//
// Required env vars (Vercel):
//   INBOUND_EMAIL_SECRET      — shared secret
//   SUPABASE_SERVICE_ROLE_KEY — lets the webhook insert past RLS
export async function POST(req: Request) {
  const secret = process.env.INBOUND_EMAIL_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const ctype = req.headers.get("content-type") || "";

  let from = "", name = "", subject = "", text = "", bodySecret = "";

  try {
    if (ctype.includes("application/json")) {
      const b = await req.json();
      bodySecret = String(b.secret ?? "");
      from = String(b.from ?? "");
      name = String(b.name ?? "");
      subject = String(b.subject ?? "");
      text = String(b.text ?? "");
    } else {
      // form-encoded / multipart from a mail-parse service
      const f = await req.formData();
      const g = (...keys: string[]) => {
        for (const k of keys) { const v = f.get(k); if (v) return String(v); }
        return "";
      };
      from = g("from", "sender", "From", "envelope_from");
      name = g("from_name", "name");
      subject = g("subject", "Subject");
      text = g("plain", "text", "body-plain", "stripped-text", "html");
    }
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  if ((bodySecret || querySecret) !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "no service key" }, { status: 503 });

  from = from.slice(0, 320); subject = subject.slice(0, 500); text = text.slice(0, 20000);
  const scr = screenText(subject, text);

  const { error } = await supabase.from("support_emails").insert({
    from_addr: from,
    from_name: name ? name.slice(0, 200) : null,
    subject: subject || "(no subject)",
    body: text,
    flagged: scr.flagged,
    flag_reason: scr.reason,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("agent_log").insert({
    actor: "ai", decision: scr.flagged ? "flagged" : "published",
    target_table: "support_emails", summary: `Email: ${subject || "(no subject)"}`, reason: scr.reason,
  });

  return NextResponse.json({ ok: true });
}
