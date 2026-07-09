"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AvatarEdit({ userId, name, avatarUrl }: {
  userId: string; name: string | null; avatarUrl: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "up" | "err">("idle");
  const [err, setErr] = useState("");
  const initial = (name?.[0] ?? "?").toUpperCase();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("up");
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `avatars/${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
    if (upErr) { setErr(upErr.message); setState("err"); return; }
    const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", userId);
    if (updErr) { setErr(updErr.message); setState("err"); return; }
    setState("idle");
    router.refresh();
  }

  return (
    <div className="relative group">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-sage/40 flex items-center justify-center display text-2xl font-semibold text-olive-deep ring-4 ring-white/70 shadow">
        {avatarUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={avatarUrl} alt={name ?? "avatar"} className="w-full h-full object-cover" />
          : initial}
      </div>
      <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-olive text-cream text-xs flex items-center justify-center cursor-pointer shadow hover:bg-olive-deep transition-colors" title="Change avatar">
        {state === "up" ? "…" : "✎"}
        <input type="file" accept="image/*" onChange={onFile} className="hidden" />
      </label>
      {state === "err" && <p className="absolute top-full mt-1 text-[10px] text-red-600 w-32">{err}</p>}
    </div>
  );
}
