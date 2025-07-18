
'use client';
import { TrendingTopics } from "@/components/trending-topics";
import { WhoToFollow } from "./who-to-follow";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreatorProgramPromo } from "./creator-program-promo";

export function RightSidebar() {
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
    <aside className="sticky top-0 h-screen w-full flex-shrink-0 p-4 flex flex-col gap-6 overflow-y-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search BHOLO" 
            className="pl-11 rounded-full bg-secondary"
            onKeyDown={handleSearch}
        />
      </div>
      <CreatorProgramPromo />
      <TrendingTopics />
      <WhoToFollow />
    </aside>
  );
}
