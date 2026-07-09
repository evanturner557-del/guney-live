import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions";

export const dynamic = "force-dynamic";

const connLabel: Record<string, string> = {
  villager: "Villager",
  diaspora: "Diaspora",
  newcomer: "Newcomer",
  visitor: "Visitor",
};

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/join");

  const { data: members } = await supabase
    .from("profiles").select("*").order("created_at");
  const me = members?.find((m) => m.id === user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">Members</h1>
      <p className="text-faded mt-2">The people of Güney — here, abroad, and on the way.</p>

      {/* My profile */}
      <details className="mt-6 bg-white rounded-xl border border-sand">
        <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">
          My profile {me ? `— ${me.name}` : ""}
        </summary>
        <form action={updateProfile} className="px-5 pb-5 space-y-3">
          <input name="name" required defaultValue={me?.name ?? ""} placeholder="Name"
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
          <select name="connection" defaultValue={me?.connection ?? "newcomer"}
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm bg-white">
            {Object.entries(connLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <textarea name="bio" rows={2} defaultValue={me?.bio ?? ""}
            placeholder="A line about you and your connection to the village"
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
          <input name="skills" defaultValue={me?.skills ?? ""}
            placeholder="Skills you can offer (e.g. building, translation, farming, design)"
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
          <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">
            Save
          </button>
        </form>
      </details>

      <div className="grid sm:grid-cols-2 gap-3 mt-8">
        {(members ?? []).map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-sand p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage/40 flex items-center justify-center display font-semibold text-olive-deep">
                {m.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-semibold leading-tight">{m.name}</p>
                <p className="text-xs text-faded">{connLabel[m.connection] ?? m.connection}</p>
              </div>
            </div>
            {m.bio && <p className="text-sm text-faded mt-3">{m.bio}</p>}
            {m.skills && (
              <p className="text-xs mt-2">
                <span className="font-medium text-olive-deep">Skills:</span> {m.skills}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
