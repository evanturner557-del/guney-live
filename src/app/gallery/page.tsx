import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Gallery, { type Photo } from "@/components/Gallery";
import PhotoUpload from "@/components/PhotoUpload";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const supabase = await createClient();
  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("photos").select("*").order("created_at", { ascending: false }),
  ]);
  const photos = (data ?? []) as Photo[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">The village in pictures</h1>
      <p className="text-faded mt-2 max-w-2xl">
        Güney and Lake Salda through the seasons. Some photos are openly-licensed from
        Wikimedia Commons; the rest come from the community. Add your own — old family
        photos from the diaspora are especially welcome.
      </p>

      {user ? (
        <div className="mt-6"><PhotoUpload userId={user.id} /></div>
      ) : (
        <p className="mt-6 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">Join</Link>{" "}
          to add photos to the village archive.
        </p>
      )}

      <div className="mt-8"><Gallery photos={photos} /></div>
    </div>
  );
}
