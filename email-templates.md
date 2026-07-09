# Güney.live branded auth email templates

STATUS:
- ✅ **Confirm signup** — branded & live in Supabase (applied in-browser).
- ✅ **Reset password** — branded & live in Supabase (applied in-browser).
- ⬜ **Magic link / OTP** — optional (only used by the "email me a one-time link"
  fallback). Paste the HTML below into Supabase → Authentication → Email
  Templates → "Magic link or OTP" if you want it branded too.

All use `{{ .ConfirmationURL }}`, which Supabase fills in.

NOTE: these change how the emails LOOK. They still send *from* Supabase's shared
address with a low hourly rate limit until custom SMTP is set up (a free Resend/
SendGrid account) — that's the sender-side fix, separate from styling.

---

## Magic link / OTP — Subject: `Your Güney.live sign-in link`

```html
<div style="background:#faf6ef;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2b2721"><div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #f0e9db;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#5c6b3f,#43512c);padding:24px 28px"><div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#faf6ef">Güney<span style="color:#e0a97a">.live</span></div><div style="color:#aab894;font-size:12px;margin-top:2px">The village of Güney, online</div></div><div style="padding:28px"><h1 style="font-family:Georgia,serif;font-size:20px;color:#43512c;margin:0 0 12px">Your sign-in link</h1><p style="font-size:14px;line-height:1.6;color:#6f6759;margin:0 0 20px">Here's your one-time link to sign in to Güney.live. It only works once and expires soon.</p><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#b85c38;color:#faf6ef;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:999px">Sign in to Güney.live</a></div><div style="border-top:1px solid #f0e9db;padding:16px 28px;font-size:11px;color:#9a938a">Güney, Yeşilova, Burdur. Built by the community, for the community.</div></div></div>
```

Tip when pasting into Supabase's code editor: it sometimes appends one stray
`>` at the very end — delete it so the body ends with `</div></div></div>`.
