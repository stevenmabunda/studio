
import { PinnedContent } from "@/components/pinned-content";
import { TrendingTopics } from "@/components/trending-topics";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search BHOLO" className="pl-11 rounded-full bg-secondary" />
        </div>
      </header>
      <main className="flex-1 space-y-6 pt-4">
        <PinnedContent />
        <div className="px-4">
          <TrendingTopics />
        </div>
      </main>
    </div>
  );
}
