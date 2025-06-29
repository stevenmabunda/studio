import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const liveMatches = [
    {
        team1: 'Manchester City',
        team2: 'Arsenal',
        score: '1 - 1',
        time: "78'",
        league: 'Premier League',
        isLive: true,
    },
    {
        team1: 'Real Madrid',
        team2: 'FC Barcelona',
        score: '0 - 0',
        time: "25'",
        league: 'La Liga',
        isLive: true,
    },
];

const upcomingMatches = [
    {
        team1: 'Liverpool',
        team2: 'Chelsea',
        time: 'Tomorrow, 8:00 PM',
        league: 'Premier League',
    },
    {
        team1: 'Bayern Munich',
        team2: 'Borussia Dortmund',
        time: 'Saturday, 3:30 PM',
        league: 'Bundesliga',
    }
]

export default function MatchThreadsPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Match Threads</h1>
      </header>
      <main className="flex-1 p-4 space-y-8">
        <div>
            <h2 className="text-lg font-semibold mb-4">Live Now</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {liveMatches.map((match, index) => (
                    <Card key={index} className="hover:bg-secondary/50 cursor-pointer">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">{match.league}</CardTitle>
                                <Badge variant="destructive" className="bg-accent text-accent-foreground">LIVE</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="flex justify-around items-center">
                                <span className="font-medium">{match.team1}</span>
                                <span className="text-2xl font-bold">{match.score}</span>
                                <span className="font-medium">{match.team2}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{match.time}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {upcomingMatches.map((match, index) => (
                    <Card key={index} className="hover:bg-secondary/50 cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-base">{match.league}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="flex justify-around items-center font-medium">
                                <span>{match.team1}</span>
                                <span className="text-lg font-bold">VS</span>
                                <span>{match.team2}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{match.time}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
