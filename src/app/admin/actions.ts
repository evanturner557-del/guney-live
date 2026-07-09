"use server";

import { revalidatePath } from "next/cache";
import { getAdminState } from "@/lib/admin";

const TABLES = ["posts", "photos", "listings", "opportunities", "messages"] as const;
type Table = (typeof TABLES)[number];

export async function removeContent(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const table = String(formData.get("table") || "") as Table;
  const id = String(formData.get("id") || "");
  if (!TABLES.includes(table) || !id) return;
  await supabase.from(table).delete().eq("id", id);
  revalidatePath("/admin");
}

export async function clearFlag(formData: FormData) {
  const { isAdmin, supabase } = await getAdminState();
  if (!isAdmin) return;
  const table = String(formData.get("table") || "") as Table;
  const id = String(formData.get("id") || "");
  if (!["posts", "photos", "listings"].includes(table) || !id) return;
  await supabase.from(table).update({ flagged: false, flag_reason: null }).eq("id", id);
  revalidatePath("/admin");
}
