"use client";

import { useRef } from "react";

// A moderation action button that summons the ops robot to scrub the row
// before the server action fires. `action` is a server action passed down.
export default function RobotButton({ action, table, id, label, tone = "remove" }: {
  action: (fd: FormData) => void; table: string; id: string; label: string; tone?: "remove" | "approve";
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const row = (e.currentTarget.closest("[data-robot-row]") as HTMLElement) ?? e.currentTarget;
    const r = row.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("robot:clean", {
      detail: {
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        label: tone === "approve" ? "Approving that one…" : "On it — scrubbing that out…",
        run: () => formRef.current?.requestSubmit(),
      },
    }));
  }

  const cls = tone === "approve"
    ? "bg-sage/30 text-olive-deep hover:bg-olive hover:text-cream"
    : "bg-terra/10 text-terra-deep hover:bg-terra hover:text-cream";

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button onClick={onClick} className={`text-[11px] px-2 py-1 rounded-full transition-colors cursor-pointer ${cls}`}>
        🤖 {label}
      </button>
    </form>
  );
}
