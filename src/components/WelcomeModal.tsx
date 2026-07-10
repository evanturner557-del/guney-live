"use client";

import { useEffect, useState } from "react";
import { WELCOME_COOKIE } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";
import LanguagePicker from "@/components/LanguagePicker";

// First-visit welcome for newcomers: a big box greeting them in Turkish and
// asking them to choose a language (which presets the whole site). Shows only
// when the visitor is signed out AND hasn't seen it before. Picking a language
// or dismissing sets the `guney_welcome_seen` cookie so it never shows again.
export default function WelcomeModal({ signedIn }: { signedIn: boolean }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (signedIn) return;
    const seen = document.cookie.split("; ").some((c) => c.startsWith(`${WELCOME_COOKIE}=`));
    if (!seen) setOpen(true);
  }, [signedIn]);

  function dismiss() {
    document.cookie = `${WELCOME_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button aria-hidden onClick={dismiss} className="absolute inset-0 bg-ink/50 backdrop-blur-sm cursor-default" />
      <div className="relative w-full max-w-lg bg-cream rounded-3xl border border-sand shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-olive to-olive-deep px-6 py-7 text-center">
          <div className="text-3xl mb-1">🫒</div>
          <h2 className="display text-2xl sm:text-3xl font-semibold text-cream leading-tight">
            {t("welcome.title")}
          </h2>
          <p className="text-sage text-sm mt-2">{t("welcome.subtitle")}</p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-faded mb-3">{t("welcome.pick")}</p>
          <div className="max-h-[46vh] overflow-y-auto pr-1">
            <LanguagePicker columns={2} onPick={() => { /* setLang handles reload */ }} />
          </div>
          <button
            onClick={dismiss}
            className="mt-4 w-full text-sm text-faded hover:text-ink py-2 cursor-pointer"
          >
            {t("welcome.continue")} →
          </button>
        </div>
      </div>
    </div>
  );
}
