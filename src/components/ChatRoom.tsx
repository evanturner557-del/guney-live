"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Msg = { id: string; author_id: string | null; author_name: string | null; body: string; created_at: string };

export default function ChatRoom({ userId, name }: { userId: string | null; name: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    supabase.from("messages").select("*").eq("room", "square").order("created_at").limit(100)
      .then(({ data }) => { if (active) { setMsgs((data ?? []) as Msg[]); setLoading(false); } });

    const ch = supabase.channel("room:square")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "room=eq.square" },
        (payload) => setMsgs((m) => [...m, payload.new as Msg]))
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !userId) return;
    setText("");
    await supabase.from("messages").insert({ room: "square", author_id: userId, author_name: name, body });
  }

  return (
    <div>
      <h1 className="display text-2xl sm:text-3xl font-semibold text-olive-deep">Town Square</h1>
      <p className="text-faded mt-1 text-sm">The village chat — everyone&apos;s here. Live, all at once.</p>

      <div className="mt-5 bg-white rounded-xl border border-sand flex flex-col" style={{ height: "60vh" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <p className="text-sm text-faded">Connecting…</p>}
          {!loading && msgs.length === 0 && <p className="text-sm text-faded">No messages yet — say hello 👋</p>}
          {msgs.map((m) => {
            const mine = m.author_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${mine ? "bg-olive text-cream" : "bg-sand text-ink"}`}>
                  {!mine && <p className="text-[11px] font-medium text-olive-deep mb-0.5">{m.author_name ?? "A member"}</p>}
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-0.5 ${mine ? "text-cream/70" : "text-faded"}`}>
                    {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        {userId ? (
          <form onSubmit={send} className="border-t border-sand p-3 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the village…"
              className="flex-1 border border-sand rounded-full px-4 py-2.5 text-sm" />
            <button className="px-5 py-2.5 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">Send</button>
          </form>
        ) : (
          <div className="border-t border-sand p-4 text-sm text-center text-faded">
            <Link href="/join" className="text-terra font-medium hover:underline">Join</Link> to join the conversation.
          </div>
        )}
      </div>
    </div>
  );
}
