
'use client';

import { useEffect, useState } from 'react';
import { getStandingsBySeasonId, type SportMonksStanding } from '@/services/sportmonks-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

// Helper to extract a specific detail from the standings details array
const getDetail = (details: SportMonksStanding['details'], name: string) => {
    return details.find(d => d.type.name === name)?.value || 0;
};

export function StandingsTable() {
    const [standings, setStandings] = useState<SportMonksStanding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStandings = async () => {
            setLoading(true);
            try {
                // Using the default Premier League Season ID
                const data = await getStandingsBySeasonId();
                setStandings(data);
            } catch (error) {
                console.error("Failed to fetch standings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, []);

    return (
        <Card className="bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-primary">PSL Standings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Club</TableHead>
                            <TableHead className="text-center">MP</TableHead>
                            <TableHead className="text-center">W</TableHead>
                            <TableHead className="text-center">D</TableHead>
                            <TableHead className="text-center">L</TableHead>
                            <TableHead className="text-center">GD</TableHead>
                            <TableHead className="text-center">Pts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             Array.from({ length: 16 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                                    <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            standings.map((standing) => (
                                <TableRow key={standing.participant_id}>
                                    <TableCell>{standing.position}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Image src={standing.participant.image_path} alt={standing.participant.name} width={24} height={24} className="h-6 w-6" />
                                            <span className="font-semibold">{standing.participant.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{getDetail(standing.details, 'matches_played')}</TableCell>
                                    <TableCell className="text-center">{getDetail(standing.details, 'wins')}</TableCell>
                                    <TableCell className="text-center">{getDetail(standing.details, 'draws')}</TableCell>
                                    <TableCell className="text-center">{getDetail(standing.details, 'losses')}</TableCell>
                                    <TableCell className="text-center">{getDetail(standing.details, 'goal_difference')}</TableCell>
                                    <TableCell className="text-center font-bold">{standing.points}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
