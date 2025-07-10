'use client';

import { TrendingTopics } from "@/components/trending-topics";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { WhoToFollow } from "@/components/who-to-follow";
import { ActiveLiveMatches } from "@/components/active-live-matches";
import { UpcomingMatches } from "@/components/live-matches";
import { SuggestedCommunities } from "@/components/suggested-communities";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const router = useRouter();
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value;
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search BHOLO" 
            className="pl-11 rounded-full bg-secondary"
            onKeyDown={handleSearch}
          />
        </div>
      </header>
      <main className="flex-1 space-y-6 pt-4">
        <div className="px-4">
          <TrendingTopics />
        </div>
        <div className="px-4">
          <SuggestedCommunities />
        </div>
        <div className="px-4">
          <ActiveLiveMatches />
        </div>
        <div className="px-4">
          <UpcomingMatches />
        </div>
        <div className="px-4">
          <WhoToFollow />
        </div>
      </main>
    </div>
  );
}
