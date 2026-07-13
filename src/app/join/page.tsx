import { createClient } from "@/lib/supabase/server";
import JoinForm from "./JoinForm";
import AccountPanel from "@/components/AccountPanel";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <JoinForm />;

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return <AccountPanel me={me} email={user.email ?? ""} userId={user.id} />;
}
