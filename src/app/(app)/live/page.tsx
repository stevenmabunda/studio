
'use client';
import { getTodaysFixtures } from "@/app/(app)/home/actions";
import { FixturesWidget } from "@/components/fixtures-widget";
import { useEffect, useState } from "react";
import type { MatchType } from "@/lib/data";

export default function LivePage() {
    const [todaysMatches, setTodaysMatches] = useState<MatchType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFixtures = async () => {
            setLoading(true);
            try {
                const matches = await getTodaysFixtures();
                setTodaysMatches(matches);
            } catch (error) {
                console.error("Failed to fetch today's fixtures:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFixtures();
         // Refresh every 5 minutes
        const intervalId = setInterval(fetchFixtures, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Match Centre</h1>
            </header>
            <main className="flex-1">
                <FixturesWidget isPage={true} matches={todaysMatches} loading={loading} emptyMessage="No fixtures scheduled for today." />
            </main>
        </div>
    );
}
