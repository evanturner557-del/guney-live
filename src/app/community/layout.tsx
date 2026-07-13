import { createClient } from "@/lib/supabase/server";
import CommunityTabs from "@/components/CommunityTabs";
import YourCorner from "@/components/YourCorner";

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
      {user && <YourCorner userId={user.id} />}
      <CommunityTabs />
      <div>{children}</div>
    </div>
  );
}
