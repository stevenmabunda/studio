import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import Link from "next/link";

// NOTE: These are mock users for demonstration. 
// For a real app, you'd fetch user suggestions from your backend.
// The IDs are based on real user IDs from the seed data to make them followable.
const usersToFollow = [
  {
    id: "JgLca61gECdY6O4k2kYxI0aV3zI3", // Mock ID for demo, replace with real user suggestion logic
    name: "John Doe",
    handle: "johndoe",
    avatar: "https://placehold.co/40x40.png",
    hint: "user avatar",
  },
  {
    id: "aSpLca3gECdY6O4k2kYxI0aV3zA4", // Mock ID for demo
    name: "Jane Smith",
    handle: "janesmith",
    avatar: "https://placehold.co/40x40.png",
    hint: "user avatar",
  },
  {
    id: "bVcLca3gECdY6O4k2kYxI0aV3zB5", // Mock ID for demo
    name: "Cristiano Ronaldo",
    handle: "cr7",
    avatar: "https://placehold.co/40x40.png",
    hint: "football player",
  },
];

export function WhoToFollow() {
  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-4">
          {usersToFollow.map((user) => (
            <div key={user.handle} className="flex items-center justify-between gap-2">
              <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} data-ai-hint={user.hint} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid">
                  <p className="font-semibold leading-none hover:underline">{user.name}</p>
                  <p className="text-sm text-muted-foreground">@{user.handle}</p>
                </div>
              </Link>
              <FollowButton profileId={user.id} />
            </div>
          ))}
           <Button variant="link" className="p-0 text-primary w-fit text-sm">Show more</Button>
        </div>
      </CardContent>
    </Card>
  );
}
