import { Suspense } from "react";
import OpportunitiesNav from "@/components/OpportunitiesNav";

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <Suspense fallback={<div />}>
          <OpportunitiesNav />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
