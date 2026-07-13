import { redirect } from "next/navigation";

export default async function OldGalleryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  redirect(`/guide/gallery/${category}`);
}
