import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TrendingTopics } from "@/components/trending-topics";

export default function ExplorePage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search Goal Chatter" className="pl-10" />
        </div>
      </header>
      <main className="flex-1 p-4">
        <TrendingTopics />
      </main>
    </div>
  );
}
