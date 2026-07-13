import CommunityTabs from "@/components/CommunityTabs";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
      <CommunityTabs />
      <div>{children}</div>
    </div>
  );
}
