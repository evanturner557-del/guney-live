"use client";

import { LANGUAGES } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";

// Shared grid of languages (flag + native name). Active locales are selectable;
// the rest are shown greyed with a "soon" tag. Used by the header menu and the
// newcomer welcome modal.
export default function LanguagePicker({ onPick, columns = 2 }: { onPick?: (code: string) => void; columns?: number }) {
  const { lang, t, setLang } = useLang();

  function pick(code: string, active: boolean) {
    if (!active) return;
    if (onPick) onPick(code);
    setLang(code);
  }

  return (
    <div className={`grid gap-1.5 ${columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
      {LANGUAGES.map((l) => {
        const current = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            disabled={!l.active}
            onClick={() => pick(l.code, l.active)}
            title={l.active ? l.native : t("lang.soon")}
            className={[
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left transition-colors",
              l.active ? "cursor-pointer hover:bg-sand" : "opacity-45 cursor-not-allowed",
              current ? "bg-olive/10 ring-1 ring-olive/40" : "",
            ].join(" ")}
          >
            <span className="text-lg leading-none">{l.flag}</span>
            <span className="flex-1 min-w-0 truncate">{l.native}</span>
            {current && <span className="text-olive-deep text-xs">✓</span>}
            {!l.active && <span className="text-[10px] uppercase tracking-wide text-faded">{t("welcome.soon")}</span>}
          </button>
        );
      })}
    </div>
  );
}
