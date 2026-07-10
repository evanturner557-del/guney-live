import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLang, makeT, type Lang } from "@/lib/i18n";

// Read the visitor's locale from the cookie in a Server Component.
export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  return normalizeLang(store.get(LANG_COOKIE)?.value);
}

// Convenience: locale + its translator in one call.
export async function getServerT() {
  const lang = await getServerLang();
  return { lang, t: makeT(lang) };
}
