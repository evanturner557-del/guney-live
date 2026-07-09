import { createClient } from "@/lib/supabase/server";
import ChatRoom from "@/components/ChatRoom";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let name: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
    name = data?.name ?? null;
  }
  return <ChatRoom userId={user?.id ?? null} name={name} />;
}
