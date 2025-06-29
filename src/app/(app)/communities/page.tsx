import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users } from "lucide-react";
import Image from "next/image";

const sampleCommunities = [
  {
    name: "Manchester United Fans",
    members: "1.2M",
    bannerUrl: "https://placehold.co/600x200.png",
    hint: "stadium crowd",
  },
  {
    name: "The Transfer Hub",
    members: "850K",
    bannerUrl: "https://placehold.co/600x200.png",
    hint: "football jersey",
  },
  {
    name: "Fantasy Premier League",
    members: "500K",
    bannerUrl: "https://placehold.co/600x200.png",
    hint: "grass pitch",
  },
  {
    name: "FC Barcelona Supporters",
    members: "980K",
    bannerUrl: "https://placehold.co/600x200.png",
    hint: "team crest",
  },
  {
    name: "Classic Football Matches",
    members: "250K",
    bannerUrl: "https://placehold.co/600x200.png",
    hint: "vintage football",
  },
  {
    name: "Women's Football World",
    members: "180K",
    bannerUrl: "https://placehold.co/600x200.png",
    hint: "women playing soccer",
  },
];

export default function CommunitiesPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Communities</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </header>
      <main className="flex-1 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleCommunities.map((community) => (
            <Card key={community.name} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-28 w-full">
                <Image
                  src={community.bannerUrl}
                  alt={`${community.name} banner`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={community.hint}
                />
              </div>
              <CardContent className="p-4">
                <h2 className="text-lg font-bold truncate">{community.name}</h2>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{community.members} members</span>
                </div>
                <Button className="w-full mt-4">Join Community</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
