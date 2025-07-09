import { Button } from "./ui/button";
import Image from "next/image";

const sampleHeadlines = [
  {
    category: "Transfers",
    topic: "Man United agree terms with Jarrad Branthwaite",
    postCount: "21.3K posts",
    image: "https://placehold.co/600x300.png",
    hint: "football stadium",
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
  const [heroHeadline, ...otherHeadlines] = sampleHeadlines;

  return (
    <div className="border-b">
      {/* Hero Section */}
      <div className="relative w-full h-64 cursor-pointer group mb-2">
        <Image
          src={heroHeadline.image}
          alt={heroHeadline.topic}
          layout="fill"
          objectFit="cover"
          className="group-hover:opacity-90 transition-opacity"
          data-ai-hint={heroHeadline.hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <p className="text-sm font-semibold">{heroHeadline.category} • Trending</p>
          <h2 className="text-2xl font-bold leading-tight mt-1">{heroHeadline.topic}</h2>
          <p className="text-sm mt-1">{heroHeadline.postCount}</p>
        </div>
      </div>

      {/* List of other headlines */}
      {otherHeadlines.map((item, index) => (
        <div key={index} className="group cursor-pointer p-4 hover:bg-accent flex items-start justify-between gap-4 border-t">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{item.category} • Trending</p>
            <p className="font-bold text-base group-hover:underline">{item.topic}</p>
            <p className="text-sm text-muted-foreground">{item.postCount}</p>
          </div>
          <Image src={item.image} alt={item.topic} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" data-ai-hint={item.hint} />
        </div>
      ))}
      <div className="p-4 hover:bg-accent cursor-pointer border-t">
         <Button variant="link" className="p-0 text-primary text-sm">Show more</Button>
      </div>
    </div>
  );
}
