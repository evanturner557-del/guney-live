import { createClient } from "@/lib/supabase/server";

// Returns the signed-in user and whether they're an admin.
export async function getAdminState() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false, supabase };
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return { user, isAdmin: Boolean(data?.is_admin), supabase };
}
