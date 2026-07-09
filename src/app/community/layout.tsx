import { Suspense } from "react";
import CommunityNav from "@/components/CommunityNav";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <Suspense fallback={<div />}>
          <CommunityNav />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
