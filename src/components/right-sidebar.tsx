import { TrendingTopics } from "@/components/trending-topics";
import { WhoToFollow } from "./who-to-follow";

export function RightSidebar() {
  return (
    <aside className="sticky top-0 h-screen w-[350px] flex-shrink-0 border-l p-6 hidden lg:flex flex-col gap-6 overflow-y-auto">
      <TrendingTopics />
      <WhoToFollow />
    </aside>
  );
}
