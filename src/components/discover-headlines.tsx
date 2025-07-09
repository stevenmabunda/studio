import { Button } from "./ui/button";
import Image from "next/image";

const sampleHeadlines = [
  {
    category: "Transfers",
    topic: "Man United agree terms with Jarrad Branthwaite",
    postCount: "21.3K posts",
    image: "https://placehold.co/100x100.png",
    hint: "football player signing",
  },
  {
    category: "Euro 2024",
    topic: "Germany thrash Scotland in tournament opener",
    postCount: "55.7K posts",
    image: "https://placehold.co/100x100.png",
    hint: "stadium celebration",
  },
  {
    category: "La Liga",
    topic: "Mbappé presented as new Real Madrid player",
    postCount: "102K posts",
    image: "https://placehold.co/100x100.png",
    hint: "player presentation",
  },
  {
    category: "Premier League",
    topic: "Chelsea in talks to sign Michael Olise from Crystal Palace",
    postCount: "12.1K posts",
    image: "https://placehold.co/100x100.png",
    hint: "football manager",
  },
  {
    category: "Serie A",
    topic: "Inter Milan look to defend their title",
    postCount: "8.9K posts",
    image: "https://placehold.co/100x100.png",
    hint: "team celebrating trophy",
  },
];

export function DiscoverHeadlines() {
  return (
    <div>
      {sampleHeadlines.map((item, index) => (
        <div key={index} className="group cursor-pointer p-4 hover:bg-accent flex items-start justify-between gap-4 border-b">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{item.category} • Trending</p>
            <p className="font-bold text-base group-hover:underline">{item.topic}</p>
            <p className="text-sm text-muted-foreground">{item.postCount}</p>
          </div>
          <Image src={item.image} alt={item.topic} width={80} height={80} className="w-20 h-20 rounded-lg object-cover" data-ai-hint={item.hint} />
        </div>
      ))}
      <div className="p-4 hover:bg-accent cursor-pointer">
         <Button variant="link" className="p-0 text-primary text-sm">Show more</Button>
      </div>
    </div>
  );
}
