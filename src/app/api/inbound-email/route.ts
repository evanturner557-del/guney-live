import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenText } from "@/lib/moderation";

// Inbound-email webhook. Point a free email provider at this URL
// (Cloudflare Email Routing → an Email Worker that POSTs here). It writes each
// message into support_emails, which shows up in the /admin inbox.
//
// Required env vars (set in Vercel):
//   INBOUND_EMAIL_SECRET      — shared secret; the worker must send it
//   SUPABASE_SERVICE_ROLE_KEY — lets the webhook insert past RLS
//
// Expected JSON body: { secret, from, name?, subject?, text? }
export async function POST(req: Request) {
  const secret = process.env.INBOUND_EMAIL_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (body.secret !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "no service key" }, { status: 503 });

  const from = String(body.from ?? "").slice(0, 320);
  const subject = String(body.subject ?? "").slice(0, 500);
  const text = String(body.text ?? "").slice(0, 20000);
  const scr = screenText(subject, text);

  const { error } = await supabase.from("support_emails").insert({
    from_addr: from,
    from_name: body.name ? String(body.name).slice(0, 200) : null,
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
