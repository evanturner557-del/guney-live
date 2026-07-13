"use server";

import { revalidatePath } from "next/cache";
import { getAdminState } from "@/lib/admin";
import { logAgent } from "@/lib/agentLog";

const TABLES = ["posts", "photos", "listings", "opportunities", "messages"] as const;
type Table = (typeof TABLES)[number];

export async function removeContent(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const table = String(formData.get("table") || "") as Table;
  const id = String(formData.get("id") || "");
  if (!TABLES.includes(table) || !id) return;
  await supabase.from(table).delete().eq("id", id);
  await logAgent(supabase, { actor: "admin", decision: "removed", target_table: table, target_id: id, summary: `Removed ${table} item` });
  revalidatePath("/admin");
}

export async function clearFlag(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const table = String(formData.get("table") || "") as Table;
  const id = String(formData.get("id") || "");
  if (!["posts", "photos", "listings"].includes(table) || !id) return;
  await supabase.from(table).update({ flagged: false, flag_reason: null }).eq("id", id);
  await logAgent(supabase, { actor: "admin", decision: "approved", target_table: table, target_id: id, summary: `Approved ${table} item` });
  revalidatePath("/admin");
}

export async function editPost(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!id || !title) return;
  await supabase.from("posts").update({ title, body }).eq("id", id);
  revalidatePath("/admin"); revalidatePath("/community"); revalidatePath("/");
}

export async function editPhoto(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const id = String(formData.get("id") || "");
  const caption = String(formData.get("caption") || "").trim();
  const category = String(formData.get("category") || "").trim();
  if (!id) return;
  await supabase.from("photos").update({ caption: caption || null, category }).eq("id", id);
  revalidatePath("/admin"); revalidatePath("/guide");
}

export async function markEmailRead(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("support_emails").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteEmail(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("support_emails").delete().eq("id", id);
  revalidatePath("/admin");
}
