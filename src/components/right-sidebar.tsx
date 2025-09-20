'use client';
import { TrendingTopics } from "@/components/trending-topics";
import { WhoToFollow } from "./who-to-follow";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreatorProgramPromo } from "./creator-program-promo";
import Link from "next/link";
import { LiveMatches } from "./live-matches";

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
    <aside className="h-screen flex-shrink-0 p-4 flex flex-col gap-6 overflow-y-auto sticky top-0">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search BHOLO" 
            className="pl-11 rounded-full bg-secondary"
            onKeyDown={handleSearch}
        />
      </div>
      <CreatorProgramPromo />
      <LiveMatches />
      <TrendingTopics />
      <WhoToFollow />
       <footer className="mt-auto text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-2">
                <Link href="/terms" className="hover:underline">Terms</Link>
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/help" className="hover:underline">Help</Link>
                <Link href="/feedback" className="hover:underline">Feedback</Link>
            </div>
            <p>© 2025 BHOLO Sports.</p>
        </footer>
    </aside>
  );
}
