// Content screening for the "AI auto-publishes safe ones, flags suspicious" model.
//
// This is a fast, deterministic first-pass gate — it does NOT need an API key.
// Content that looks clean auto-publishes (flagged=false). Content that trips a
// rule still publishes but is flagged=true with a reason, so it surfaces in the
// ops panel review queue. A true LLM relevance/safety check can be layered on
// top later (set ANTHROPIC_API_KEY in Vercel) — this gives a working floor now.

const SPAM = [
  "viagra", "cialis", "casino", "porn", "sex cam", "crypto", "bitcoin", "forex",
  "loan", "investment opportunity", "make money", "click here", "free money",
  "whatsapp me", "telegram", "onlyfans", "escort", "betting", "bet now",
];
// Email addresses are normal in support/community content — never flag them.
const EMAIL = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
// Only real outbound URLs and known link-spam TLDs count as "external link" —
// NOT a bare mention of guney.live or a plain email address.
const URL = /(https?:\/\/|www\.)\S+/i;
const SUSPICIOUS_TLD = /\b[a-z0-9-]+\.(ru|xyz|top|tk|cn|click|loan|shop|monster)\b/i;
const OWN_DOMAIN = /guney\.live/gi;
const MANY_CAPS = /\b[A-Z]{6,}\b/;
const REPEAT = /(.)\1{6,}/; // same char 7+ times

export type Screen = { flagged: boolean; reason: string | null };

export function screenText(...parts: (string | null | undefined)[]): Screen {
  const raw = parts.filter(Boolean).join(" ");
  const text = raw.toLowerCase();
  // strip emails and our own domain so they never count as links
  const scrubbed = raw.replace(EMAIL, " ").replace(OWN_DOMAIN, " ");
  const hits: string[] = [];

  const spam = SPAM.find((w) => text.includes(w));
  if (spam) hits.push(`spam term ("${spam}")`);
  if (URL.test(scrubbed)) hits.push("external link");
  else if (SUSPICIOUS_TLD.test(scrubbed)) hits.push("suspicious domain");
  if (MANY_CAPS.test(raw)) hits.push("shouting / all-caps");
  if (REPEAT.test(raw)) hits.push("repeated characters");
  if (raw.trim().length < 3) hits.push("too short");

  return hits.length
    ? { flagged: true, reason: hits.join(", ") }
    : { flagged: false, reason: null };
}

// For photos: community uploads to our own storage are trusted; hotlinks to
// unknown domains are flagged for a human look.
const TRUSTED_IMG = /(supabase\.co|commons\.wikimedia\.org|images\.pexels\.com|images\.unsplash\.com|cdn\.pixabay\.com)/i;
export function screenPhoto(url: string, caption?: string | null): Screen {
  const cap = screenText(caption);
  if (!TRUSTED_IMG.test(url)) {
    return { flagged: true, reason: ["image from an unrecognised source", cap.reason].filter(Boolean).join(", ") };
  }
  return cap;
}
