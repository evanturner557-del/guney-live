"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { screenText } from "@/lib/moderation";
import { logAgent } from "@/lib/agentLog";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/join");
  const type = String(formData.get("type") || "update");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const eventDate = String(formData.get("event_date") || "");
  const eventLocation = String(formData.get("event_location") || "").trim();
  if (!title || !body) return;
  const scr = screenText(title, body);
  await supabase.from("posts").insert({
    author_id: user.id, type, title, body,
    event_date: type === "event" && eventDate ? new Date(eventDate).toISOString() : null,
    event_location: type === "event" && eventLocation ? eventLocation : null,
    flagged: scr.flagged, flag_reason: scr.reason,
  });
  await logAgent(supabase, {
    decision: scr.flagged ? "flagged" : "published", target_table: "posts",
    summary: `Post: ${title}`, reason: scr.reason,
  });
  revalidatePath("/community"); revalidatePath("/");
}

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/join");
  const postId = String(formData.get("post_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!postId || !body) return;
  await supabase.from("comments").insert({ post_id: postId, author_id: user.id, body });
  revalidatePath(`/community/${postId}`);
}

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/join");
  const type = String(formData.get("type") || "collaboration");
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const details = String(formData.get("details") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  if (!title || !summary) return;
  await supabase.from("opportunities").insert({
    type, title, summary, details: details || null, contact: contact || null, created_by: user.id,
  });
  revalidatePath("/opportunities");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/join");
  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const connection = String(formData.get("connection") || "newcomer");
  const skills = String(formData.get("skills") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name) return;
  await supabase.from("profiles").upsert({ id: user.id, name, bio: bio || null, connection, skills: skills || null, phone: phone || null });
  revalidatePath("/members"); revalidatePath("/dashboard");
}

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/join");
  const kind = String(formData.get("kind") || "sale");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  if (!title) return;
  const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
  const scr = screenText(title, description);
  await supabase.from("listings").insert({
    seller_id: user.id, seller_name: prof?.name ?? null, kind, title,
    description: description || null, price: priceRaw ? Number(priceRaw) : null,
    contact: contact || null, flagged: scr.flagged, flag_reason: scr.reason,
  });
  await logAgent(supabase, {
    decision: scr.flagged ? "flagged" : "published", target_table: "listings",
    summary: `Listing: ${title}`, reason: scr.reason,
  });
  revalidatePath("/community/marketplace");
}
