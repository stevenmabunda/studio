
'use client';
import { getLiveMatches } from "@/app/(app)/home/actions";
import { FixturesWidget } from "@/components/fixtures-widget";
import { useEffect, useState } from "react";
import type { MatchType } from "@/lib/data";

export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<MatchType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLiveMatches = async () => {
            setLoading(true);
            try {
                const matches = await getLiveMatches();
                setLiveMatches(matches);
            } catch (error) {
                console.error("Failed to fetch live matches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveMatches();
         // Refresh every 60 seconds
        const intervalId = setInterval(fetchLiveMatches, 60000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Live Matches</h1>
            </header>
            <main className="flex-1">
                <FixturesWidget isPage={true} matches={liveMatches} loading={loading} emptyMessage="No matches are currently live." />
            </main>
        </div>
    );
}
