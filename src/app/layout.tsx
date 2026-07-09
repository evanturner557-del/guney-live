import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guney.live — the digital home of Güney village",
  description:
    "The community platform for Güney (Yeşilova, Burdur, Turkey). What's happening, who needs help, what you can build — 8 km from Lake Salda.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let name: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
    name = data?.name ?? null;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header signedIn={!!user} name={name} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-sand mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-faded flex flex-wrap gap-4 justify-between">
            <p>Güney, Yeşilova, Burdur — the village, online.</p>
            <p>Built by the community, for the community.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
