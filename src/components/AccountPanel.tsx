import { updateProfile } from "@/app/actions";
import { signOut } from "@/app/actions";
import AvatarEdit from "@/components/AvatarEdit";

const connLabel: Record<string, string> = {
  villager: "Villager", diaspora: "Diaspora", newcomer: "Newcomer", visitor: "Visitor",
};

export default function AccountPanel({ me, email, userId }: {
  me: { name: string | null; bio: string | null; connection: string | null; skills: string | null; phone: string | null; avatar_url: string | null } | null;
  email: string;
  userId: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display text-3xl font-semibold text-olive-deep text-center">Your account</h1>
      <p className="text-faded mt-2 mb-8 text-center text-sm">{email}</p>

      <div className="bg-white rounded-2xl border border-sand p-6 sm:p-8 space-y-5">
        <div className="flex justify-center">
          <AvatarEdit userId={userId} name={me?.name ?? null} avatarUrl={me?.avatar_url ?? null} />
        </div>

        <form action={updateProfile} className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input name="name" required defaultValue={me?.name ?? ""} className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Your connection to Güney</span>
            <select name="connection" defaultValue={me?.connection ?? "newcomer"} className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm bg-white">
              {Object.entries(connLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Bio</span>
            <textarea name="bio" rows={2} defaultValue={me?.bio ?? ""} placeholder="A line about you and your connection to the village" className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Skills you can offer</span>
            <input name="skills" defaultValue={me?.skills ?? ""} placeholder="e.g. building, translation, farming, design" className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Phone (private)</span>
            <input name="phone" defaultValue={me?.phone ?? ""} className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <button className="w-full py-3 rounded-full bg-olive text-cream font-medium hover:bg-olive-deep transition-colors cursor-pointer">Save profile</button>
        </form>

        <form action={signOut}>
          <button className="w-full py-2.5 rounded-full border border-sand text-sm text-faded hover:bg-sand transition-colors cursor-pointer">Sign out</button>
        </form>
      </div>
    </div>
  );
}
