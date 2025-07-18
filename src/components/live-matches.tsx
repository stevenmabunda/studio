
'use client';

import { useState, useEffect } from 'react';
import { getLiveMatches } from '@/app/(app)/home/actions';
import type { MatchType } from '@/lib/data';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { TrendingTopics } from './trending-topics';

function MatchSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-2/5">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-8" />
                <div className="flex items-center gap-2 justify-end w-2/5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </div>
            </div>
        </div>
    );
}


export function LiveMatches({ isPage = false }: { isPage?: boolean }) {
    const [matches, setMatches] = useState<MatchType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const liveMatches = await getLiveMatches();
                setMatches(liveMatches);
            } catch (error) {
                console.error("Failed to fetch live matches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const content = (
        <div className="flex flex-col gap-4">
            {loading ? (
                <>
                    <MatchSkeleton />
                    <MatchSkeleton />
                    <MatchSkeleton />
                </>
            ) : matches.length > 0 ? (
                matches.map((match) => (
                    <div key={match.id} className="flex flex-col gap-2 text-sm">
                        <p className="text-xs text-muted-foreground font-semibold">{match.league}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 w-2/5 truncate">
                                <Image src={match.team1.logo || 'https://placehold.co/20x20.png'} alt={match.team1.name} width={20} height={20} className="rounded-full" />
                                <span className="font-bold truncate">{match.team1.name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-base">
                                <span className="font-bold">{match.score?.split('-')[0].trim()}</span>
                                <span className="text-muted-foreground text-xs">{match.time}</span>
                                <span className="font-bold">{match.score?.split('-')[1].trim()}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-end w-2/5 truncate">
                                <span className="font-bold truncate text-right">{match.team2.name}</span>
                                <Image src={match.team2.logo || 'https://placehold.co/20x20.png'} alt={match.team2.name} width={20} height={20} className="rounded-full" />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-4">
                    <h2 className="text-lg font-bold">NO LIVE MATCHES RIGHT NOW</h2>
                    <p className="text-muted-foreground">But there are live conversations, dive in!</p>
                    <div className="mt-4 text-left">
                        <TrendingTopics />
                    </div>
                </div>
            )}
            
            {!isPage && matches.length > 0 && (
                <Button variant="link" className="p-0 text-primary w-fit text-sm" asChild>
                    <Link href="/live">View all</Link>
                </Button>
            )}
        </div>
    );

    if (isPage) {
        return <div className="p-4">{content}</div>;
    }

    return (
        <Card className="bg-secondary">
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold text-primary">Live Events</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {content}
            </CardContent>
        </Card>
    );
}
