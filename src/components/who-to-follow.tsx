import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const usersToFollow = [
  {
    name: "Premier League",
    handle: "premierleague",
    avatar: "https://placehold.co/40x40.png",
    hint: "league logo",
  },
  {
    name: "Champions League",
    handle: "ChampionsLeague",
    avatar: "https://placehold.co/40x40.png",
    hint: "cup logo",
  },
  {
    name: "LaLiga",
    handle: "LaLiga",
    avatar: "https://placehold.co/40x40.png",
    hint: "league logo",
  },
];

export function WhoToFollow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {usersToFollow.map((user) => (
            <div key={user.handle} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} data-ai-hint={user.hint} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid">
                  <p className="font-semibold leading-none">{user.name}</p>
                  <p className="text-sm text-muted-foreground">@{user.handle}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
