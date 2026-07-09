// Records a moderation/agent decision to agent_log so it can be watched live
// in the admin panel. Best-effort — never throws into the calling action.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logAgent(supabase: any, entry: {
  actor?: "ai" | "admin";
  decision: "published" | "flagged" | "approved" | "removed";
  target_table?: string;
  target_id?: string | null;
  summary?: string | null;
  reason?: string | null;
}) {
  try {
    await supabase.from("agent_log").insert({
      actor: entry.actor ?? "ai",
      decision: entry.decision,
      target_table: entry.target_table ?? null,
      target_id: entry.target_id ?? null,
      summary: entry.summary ?? null,
      reason: entry.reason ?? null,
    });
  } catch {
    // logging must never break the underlying action
  }
}
