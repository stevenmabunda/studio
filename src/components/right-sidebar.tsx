import { TrendingTopics } from "@/components/trending-topics";
import { WhoToFollow } from "./who-to-follow";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function RightSidebar() {
  return (
    <aside className="sticky top-0 h-screen w-[350px] flex-shrink-0 p-4 hidden lg:flex flex-col gap-6 overflow-y-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search Goal Chatter" className="pl-11 rounded-full bg-secondary" />
      </div>
      <TrendingTopics />
      <WhoToFollow />
    </aside>
  );
}
