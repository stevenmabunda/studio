'use client';

import { useState, useMemo } from 'react';
import { dummyPlayers, type FantasyPlayer } from '@/lib/dummy-players';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MinusCircle, Shirt } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const POSITIONS = ['GKP', 'DEF', 'MID', 'FWD'] as const;
const SQUAD_LIMITS: Record<typeof POSITIONS[number], number> = {
  GKP: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
};
const TOTAL_BUDGET = 100.0;
const TOTAL_PLAYERS = 15;

const TEAMS = [...new Set(dummyPlayers.map(p => p.team))].sort();

export default function FantasyPage() {
  const [squad, setSquad] = useState<FantasyPlayer[]>([]);
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<keyof FantasyPlayer>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const budgetRemaining = useMemo(() => {
    return squad.reduce((acc, player) => acc - player.price, TOTAL_BUDGET);
  }, [squad]);

  const playersByPosition = useMemo(() => {
    const counts = { GKP: 0, DEF: 0, MID: 0, FWD: 0 };
    squad.forEach(p => counts[p.position]++);
    return counts;
  }, [squad]);

  const filteredPlayers = useMemo(() => {
    return dummyPlayers
      .filter(p => positionFilter === 'all' || p.position === positionFilter)
      .filter(p => teamFilter === 'all' || p.team === teamFilter)
      .sort((a, b) => {
        if (sortKey === 'price') {
            return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        }
        return 0;
      });
  }, [positionFilter, teamFilter, sortKey, sortOrder]);
  
  const canAddPlayer = (player: FantasyPlayer) => {
      if (squad.length >= TOTAL_PLAYERS) return false;
      if (player.price > budgetRemaining) return false;
      if (playersByPosition[player.position] >= SQUAD_LIMITS[player.position]) return false;
      return !squad.some(p => p.id === player.id);
  }

  const addPlayer = (player: FantasyPlayer) => {
    if (canAddPlayer(player)) {
      setSquad(prev => [...prev, player]);
    }
  };

  const removePlayer = (player: FantasyPlayer) => {
    setSquad(prev => prev.filter(p => p.id !== player.id));
  };
  
  const handleSort = (key: keyof FantasyPlayer) => {
      if (key === sortKey) {
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortKey(key);
          setSortOrder('desc');
      }
  }

  const renderPitchPosition = (position: typeof POSITIONS[number], count: number) => {
    const players = squad.filter(p => p.position === position);
    const placeholders = Array(SQUAD_LIMITS[position] - players.length).fill(null);
    return (
        <div className={`flex justify-center items-center gap-1 md:gap-2 h-full`}>
            {players.map(p => (
                <div key={p.id} className="text-center group" onClick={() => removePlayer(p)}>
                    <div className="relative w-8 h-8 md:w-10 md:h-10 mx-auto cursor-pointer">
                        <Shirt className="w-full h-full text-primary" fill="currentColor" />
                        <MinusCircle className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 text-red-500 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs font-bold truncate w-8 md:w-10">{p.name.split(' ').pop()}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{p.team.substring(0,3).toUpperCase()}</p>
                </div>
            ))}
            {placeholders.map((_, i) => (
                <div key={`${position}-placeholder-${i}`} className="text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 mx-auto">
                        <Shirt className="w-full h-full text-white/10" />
                    </div>
                    <p className="text-xs font-bold text-white/20 h-4"> </p>
                    <p className="text-xs text-muted-foreground h-3"> </p>
                </div>
            ))}
        </div>
    )
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Fantasy League</h1>
      </header>
      <main className="flex-1 p-2 md:p-4">
        <div className="flex flex-col gap-4">
            {/* Top Row: Pitch and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-secondary/50">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-center text-sm">
                            <div>
                                <p className="font-bold text-lg">{squad.length}/{TOTAL_PLAYERS}</p>
                                <p className="text-muted-foreground">Players</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg">£{budgetRemaining.toFixed(1)}m</p>
                                <p className="text-muted-foreground">Budget</p>
                            </div>
                            <div className="hidden md:block">
                                <p className="font-bold text-lg">{playersByPosition['GKP']}/{SQUAD_LIMITS['GKP']}</p>
                                <p className="text-muted-foreground">GKP</p>
                            </div>
                            <div className="hidden md:block">
                                <p className="font-bold text-lg">{playersByPosition['DEF']}/{SQUAD_LIMITS['DEF']}</p>
                                <p className="text-muted-foreground">DEF</p>
                            </div>
                             <div className="md:hidden">
                                <p className="font-bold text-lg">{playersByPosition['MID']}/{SQUAD_LIMITS['MID']}</p>
                                <p className="text-muted-foreground">MID</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-green-800/20 p-2 md:p-4 rounded-lg relative aspect-[4/5] md:aspect-video">
                    <Image src="/pitch-vertical.svg" alt="Football pitch" fill className="object-contain opacity-20" />
                     <div className="relative h-full flex flex-col justify-around">
                        {renderPitchPosition('FWD', 3)}
                        {renderPitchPosition('MID', 5)}
                        {renderPitchPosition('DEF', 5)}
                        {renderPitchPosition('GKP', 2)}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Player List */}
            <Card>
                <CardHeader>
                    <CardTitle>Players</CardTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
                        <Select value={positionFilter} onValueChange={setPositionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                {POSITIONS.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={teamFilter} onValueChange={setTeamFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teams</SelectItem>
                                {TEAMS.map(team => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={String(sortKey)} onValueChange={(val) => handleSort(val as keyof FantasyPlayer)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price">Price</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Descending</SelectItem>
                                <SelectItem value="asc">Ascending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[60vh] md:h-auto">
                         <Table>
                            <TableHeader className="sticky top-0 bg-secondary z-10">
                                <TableRow>
                                    <TableHead>Player</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>Price</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPlayers.map(player => (
                                    <TableRow key={player.id}>
                                        <TableCell>
                                            <p className="font-bold">{player.name}</p>
                                            <p className="text-xs text-muted-foreground">{player.team} - {player.position}</p>
                                        </TableCell>
                                        <TableCell>£{player.price.toFixed(1)}m</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={() => addPlayer(player)}
                                                disabled={!canAddPlayer(player)}
                                                className="h-8 w-8 text-green-500 disabled:text-muted-foreground/30"
                                            >
                                                <PlusCircle />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
