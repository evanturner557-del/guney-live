import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Güney.live",
  description: "The community ground rules for using Güney.live.",
};

const UPDATED = "9 July 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 prose-md">
      <h1 className="display text-3xl font-semibold text-olive-deep">Terms of Use</h1>
      <p className="text-faded text-sm">Last updated {UPDATED}</p>

      <p>
        Welcome to Güney.live, the community platform for the village of Güney (Yeşilova, Burdur,
        Turkey). By creating an account or using the site, you agree to these terms. They exist to keep
        the village a good place to be — online as well as off.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Your account</h2>
      <ul>
        <li>You must be 16 or older to create an account.</li>
        <li>Give accurate information and keep your login details to yourself.</li>
        <li>You are responsible for what happens under your account.</li>
      </ul>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">How to behave here</h2>
      <p>This is a neighbourly space. When you post, please:</p>
      <ul>
        <li>Be respectful. No harassment, hate speech, threats, or bullying.</li>
        <li>Post only content you have the right to share, and keep it truthful.</li>
        <li>No spam, scams, or misleading listings in the marketplace.</li>
        <li>No illegal content, and nothing that endangers or exploits anyone — especially children.</li>
        <li>Respect others&apos; privacy; don&apos;t share someone&apos;s personal details without consent.</li>
      </ul>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Your content</h2>
      <p>
        You keep ownership of what you post. By posting, you give Güney.live permission to display and
        share it within the platform so the community can see it. You can delete your content, and
        deleting your account removes it (see our{" "}
        <a href="/privacy#data-deletion" className="text-terra underline">data deletion</a> section).
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Moderation</h2>
      <p>
        To keep the village safe, content may be reviewed — by people and by automated checks — before
        or after it appears. We may hide or remove content, or suspend accounts, that break these terms.
        If we get it wrong, tell us and we&apos;ll take another look.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">The marketplace</h2>
      <p>
        Listings and exchanges between members are between those members. Güney.live provides the space
        but is not a party to your deals and is not responsible for them. Trade with the same care you
        would in person.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">No warranty</h2>
      <p>
        Güney.live is offered as-is, by and for the community. We work to keep it running and accurate,
        but we can&apos;t promise it will always be available or error-free.
      </p>

      <h2 className="display text-xl font-semibold text-olive-deep mt-8">Changes and contact</h2>
      <p>
        We may update these terms as the platform grows; we&apos;ll change the date above and flag big
        changes in the app. Questions? Email{" "}
        <a href="mailto:support@guney.live" className="text-terra underline">support@guney.live</a>.
      </p>
    </article>
  );
}
