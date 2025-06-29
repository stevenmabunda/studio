import { CreatePost } from "@/components/create-post";
import { Post } from "@/components/post";
import { Separator } from "@/components/ui/separator";

const posts = [
  {
    authorName: "The Athletic",
    authorHandle: "TheAthletic",
    authorAvatar: "https://placehold.co/40x40.png",
    content: "BREAKING: Kylian Mbappé to Real Madrid is a done deal. ¡Bienvenido a Madrid! ⚪️ #RealMadrid #Mbappe",
    timestamp: "2h",
    comments: 1200,
    reposts: 5400,
    likes: 22000,
  },
  {
    authorName: "Fabrizio Romano",
    authorHandle: "FabrizioRomano",
    authorAvatar: "https://placehold.co/40x40.png",
    content: "Cole Palmer was absolutely sensational today. What a signing for Chelsea. Here we go! 🔵 #CFC #Chelsea",
    timestamp: "4h",
    comments: 876,
    reposts: 2300,
    likes: 15000,
  },
    {
    authorName: "Jane Doe",
    authorHandle: "janedoe_footy",
    authorAvatar: "https://placehold.co/40x40.png",
    content: "Can't believe that VAR decision in the United game. Robbed. 😡 #MUNLIV #VAR",
    timestamp: "5h",
    comments: 302,
    reposts: 45,
    likes: 530,
  },
  {
    authorName: "Football Fans",
    authorHandle: "FootyHumor",
    authorAvatar: "https://placehold.co/40x40.png",
    content: "Who is the most underrated player in the Premier League right now? 🤔",
    timestamp: "8h",
    comments: 1500,
    reposts: 200,
    likes: 1800,
  },
];


export default function HomePage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Home</h1>
      </header>
      <main className="flex-1">
        <CreatePost />
        <Separator />
        <div className="divide-y divide-border">
          {posts.map((post, index) => (
            <Post key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
}
