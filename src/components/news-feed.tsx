import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const newsItems = [
  {
    source: "ESPN FC",
    headline: "Man United agree terms with Jarrad Branthwaite.",
    handle: "ESPNFC",
  },
  {
    source: "Sky Sports",
    headline: "Chelsea in talks to sign Michael Olise from Crystal Palace.",
    handle: "SkySports",
  },
  {
    source: "BBC Sport",
    headline: "Euro 2024: Germany thrash Scotland in tournament opener.",
    handle: "BBCSport",
  },
  {
    source: "The Guardian",
    headline: "Jude Bellingham ready to carry England's hopes at Euro 2024.",
    handle: "GuardianSport",
  }
];

export function NewsFeed() {
  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold">News Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-3">
          {newsItems.slice(0, 3).map((item) => (
            <div key={item.handle} className="flex items-start justify-between gap-3 group cursor-pointer">
              <div className="flex-1">
                <p className="font-bold text-sm">{item.source}</p>
                <p className="text-sm text-muted-foreground group-hover:underline">{item.headline}</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full text-xs h-7 bg-foreground text-background hover:bg-foreground/90">
                Follow
              </Button>
            </div>
          ))}
           <Button variant="link" className="p-0 text-primary w-fit text-sm">Show more</Button>
        </div>
      </CardContent>
    </Card>
  );
}
