
import { TrendingTopics } from "@/components/trending-topics";

export default function TrendingPage() {
    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Trending</h1>
            </header>
            <main className="flex-1 p-4">
                <TrendingTopics />
            </main>
        </div>
    );
}
