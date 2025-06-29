
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const liveMatches = [
    {
        team1: 'Chelsea',
        team2: 'Man U',
        score: '1 - 0',
        time: "78'",
        league: 'Premier League',
        isLive: true,
    },
];

const upcomingMatches = [
    {
        team1: 'Liverpool',
        team2: 'Man City',
        time: 'Tomorrow, 8:00 PM',
        league: 'Premier League',
    },
];

export function LiveMatches() {
  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold">Matches</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Live</h3>
            {liveMatches.map((match, index) => (
                <div key={index} className="space-y-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{match.league}</span>
                        <span>{match.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2 font-bold">
                           <span>{match.team1}</span>
                           <span>{match.score}</span>
                           <span>{match.team2}</span>
                       </div>
                       <Badge variant="destructive" className="bg-accent text-accent-foreground">LIVE</Badge>
                    </div>
                     <Button variant="link" size="sm" className="p-0 h-auto text-primary">Join discussion</Button>
                </div>
            ))}
        </div>
         <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Upcoming</h3>
            {upcomingMatches.map((match, index) => (
                <div key={index} className="space-y-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{match.league}</span>
                        <span>{match.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2 font-bold">
                           <span>{match.team1}</span>
                           <span>vs</span>
                           <span>{match.team2}</span>
                       </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Bell className="h-3 w-3 mr-1"/>
                        Set reminder
                    </Button>
                </div>
            ))}
        </div>
        <Button variant="link" className="p-0 text-primary w-fit text-sm">Show more</Button>
      </CardContent>
    </Card>
  );
}
