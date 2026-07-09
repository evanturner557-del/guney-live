"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PhotoUpload({ userId, category = "village" }: { userId: string; category?: string }) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "up" | "err">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setState("up");
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("photos").upload(path, file, { upsert: false });
    if (upErr) { setErr(upErr.message); setState("err"); return; }
    const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
    const { error: insErr } = await supabase.from("photos").insert({
      url: pub.publicUrl, caption: caption.trim() || null, category,
      credit: "Community", is_external: false, uploaded_by: userId,
    });
    if (insErr) { setErr(insErr.message); setState("err"); return; }
    setCaption(""); setFile(null); setState("idle");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-sand p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-sand file:text-ink file:cursor-pointer" />
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)"
        className="flex-1 border border-sand rounded-lg px-3 py-2 text-sm min-w-0 w-full sm:w-auto" />
      <button disabled={!file || state === "up"}
        className="px-4 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer disabled:opacity-50 whitespace-nowrap">
        {state === "up" ? "Uploading…" : "Share photo"}
      </button>
      {state === "err" && <p className="text-xs text-red-700">{err}</p>}
    </form>
  );
}
