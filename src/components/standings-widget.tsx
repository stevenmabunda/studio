'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';
import { getLeagueStandings, type Standing } from '@/app/(app)/standings/actions';

function StandingRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
            <TableCell className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
        </TableRow>
    );
}

export function StandingsWidget() {
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStandings = async () => {
            setLoading(true);
            try {
                const data = await getLeagueStandings();
                setStandings(data);
            } catch (error) {
                console.error("Failed to fetch league standings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, []);

    return (
        <Card className="bg-secondary">
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold text-primary">Premier League</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="text-xs">
                            <TableHead className="w-8 p-2 text-center">#</TableHead>
                            <TableHead className="p-2">Team</TableHead>
                            <TableHead className="w-10 p-2 text-center">P</TableHead>
                            <TableHead className="w-10 p-2 text-center">GD</TableHead>
                            <TableHead className="w-10 p-2 text-center">Pts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <StandingRowSkeleton key={i} />)
                        ) : standings.length > 0 ? (
                            standings.slice(0, 10).map((team) => ( // Show top 10
                                <TableRow key={team.position} className="text-sm">
                                    <TableCell className="p-2 text-center font-medium">{team.position}</TableCell>
                                    <TableCell className="p-2 flex items-center gap-2 font-semibold">
                                        <Image src={team.team.logo} alt={team.team.name} width={20} height={20} className="h-5 w-5" />
                                        <span className="truncate">{team.team.name}</span>
                                    </TableCell>
                                    <TableCell className="p-2 text-center text-muted-foreground">{team.played}</TableCell>
                                    <TableCell className="p-2 text-center text-muted-foreground">{team.goalDifference}</TableCell>
                                    <TableCell className="p-2 text-center font-bold">{team.points}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="p-4 text-center text-muted-foreground">
                                    Standings not available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
