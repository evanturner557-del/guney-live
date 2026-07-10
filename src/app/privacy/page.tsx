import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Güney.live",
  description: "How Güney.live collects, uses, and protects your information.",
};

const UPDATED = "9 July 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 prose-md">
      <h1 className="display text-3xl font-semibold text-olive-deep">Privacy Policy</h1>
      <p className="text-faded text-sm">Last updated {UPDATED}</p>

      <p>
        Güney.live (&quot;we&quot;, &quot;us&quot;) is the community platform for the village of Güney
        (Yeşilova, Burdur, Turkey). This policy explains what information we collect, why, and the
        choices you have. We keep it plain because the village should be able to read it.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">What we collect</h2>
      <ul>
        <li><strong>Account details</strong> — your name, email address, and (optionally) your phone number when you create an account.</li>
        <li><strong>What you post</strong> — messages, photos, listings, comments, and your chosen connection to the village.</li>
        <li><strong>Sign-in data</strong> — if you sign in with Google or Facebook, we receive your name, email, and profile picture from that provider. We never receive your password.</li>
        <li><strong>Basic technical data</strong> — a login cookie to keep you signed in, and standard server logs needed to run and secure the site.</li>
      </ul>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Why we use it</h2>
      <ul>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To show your posts, photos, and listings to the community.</li>
        <li>To send you the notifications you opt into (village news and replies) — you can turn these off anytime.</li>
        <li>To let members contact each other, and — if you provide a phone number — to reach you about direct messages and important updates.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal information, and we do not show third-party advertising.</p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Who we share it with</h2>
      <p>
        We use trusted service providers to run the platform: Supabase (database, authentication, and
        file storage) and Vercel (hosting). They process data on our behalf under their own security and
        privacy terms. We share information with them only as needed to operate the site, and otherwise
        only where required by law.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Cookies</h2>
      <p>
        We use a single essential cookie to keep you signed in. We do not use advertising or
        cross-site tracking cookies. If you sign out, the cookie is cleared.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Your choices</h2>
      <ul>
        <li>Edit your profile, phone number, and notification settings anytime from your dashboard.</li>
        <li>Turn email notifications off with one click from any email or your settings.</li>
        <li>Ask us for a copy of your data, or to correct it.</li>
      </ul>

      <h2 id="data-deletion" className="display text-xl font-semibold text-olive-deep mt-8">Deleting your data</h2>
      <p>
        You can ask us to delete your account and all associated data at any time. Email{" "}
        <a href="mailto:support@guney.live" className="text-terra underline">support@guney.live</a>{" "}
        from the address on your account, or from your account&apos;s registered email, with the subject
        &quot;Delete my account&quot;. We will remove your account, posts, photos, listings, and personal
        details within 30 days and confirm by email. If you signed up with Google or Facebook, this same
        request removes the data we received from that provider.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Children</h2>
      <p>
        Güney.live is intended for people aged 16 and over. If you believe a child has created an
        account, contact us and we will remove it.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Changes</h2>
      <p>
        We may update this policy as the platform grows. We will change the date at the top and, for
        significant changes, let members know in the app.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Contact</h2>
      <p>
        Questions about your privacy? Email{" "}
        <a href="mailto:support@guney.live" className="text-terra underline">support@guney.live</a>.
      </p>
    </article>
  );
}
