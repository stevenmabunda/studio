
'use client';

import { useState, useEffect } from "react";
import { getBettingOdds } from "@/app/(app)/betting/actions";
import type { OddsFixture } from "@/services/sportmonks-service";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

function OddsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-2/5" />
                </div>
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-2/5" />
                </div>
            </div>
             <div className="flex justify-around items-center pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

export function BettingOddsWidget() {
    const [fixtures, setFixtures] = useState<OddsFixture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOdds = async () => {
            setLoading(true);
            try {
                const oddsFixtures = await getBettingOdds();
                setFixtures(oddsFixtures);
            } catch (error) {
                console.error("Failed to fetch betting odds:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOdds();
    }, []);

    return (
        <div className="p-4 space-y-6">
            <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                <Image
                    src="https://picsum.photos/seed/bet-ad/600/200"
                    alt="Advertisement placeholder"
                    fill
                    className="object-cover"
                    data-ai-hint="betting ad"
                />
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl drop-shadow-md">Advertiser Slot</span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <OddsSkeleton />
                    <OddsSkeleton />
                </div>
            ) : fixtures.length > 0 ? (
                fixtures.map((fixture) => {
                    const homeTeam = fixture.participants.find(p => p.meta.location === 'home');
                    const awayTeam = fixture.participants.find(p => p.meta.location === 'away');
                    const matchOdds = fixture.odds.find(o => o.market.name === 'Match Winner')?.bookmaker.odds.data;
                    
                    const homeOdd = matchOdds?.find(o => o.label === '1');
                    const drawOdd = matchOdds?.find(o => o.label === 'X');
                    const awayOdd = matchOdds?.find(o => o.label === '2');

                    return (
                        <Card key={fixture.id} className="bg-secondary">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">{fixture.league.country.name} &middot; {fixture.league.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 w-2/5 truncate">
                                        <Image src={homeTeam?.image_path || ''} alt={homeTeam?.name || ''} width={24} height={24} className="rounded-full" />
                                        <span className="font-bold truncate">{homeTeam?.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">VS</span>
                                    <div className="flex items-center gap-2 w-2/5 justify-end truncate">
                                        <span className="font-bold truncate text-right">{awayTeam?.name}</span>
                                        <Image src={awayTeam?.image_path || ''} alt={awayTeam?.name || ''} width={24} height={24} className="rounded-full" />
                                    </div>
                                </div>
                                <div className="flex justify-around items-center text-center bg-background p-2 rounded-md">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Home Win</p>
                                        <p className="font-bold text-lg text-primary">{homeOdd?.value || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Draw</p>
                                        <p className="font-bold text-lg text-primary">{drawOdd?.value || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Away Win</p>
                                        <p className="font-bold text-lg text-primary">{awayOdd?.value || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <p>No betting odds available at the moment.</p>
                </div>
            )}
        </div>
    );
}
