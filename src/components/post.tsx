import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Repeat, Heart, Share2 } from "lucide-react";
import Link from "next/link";

type PostProps = {
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  comments: number;
  reposts: number;
  likes: number;
};

export function Post({
  authorName,
  authorHandle,
  authorAvatar,
  content,
  timestamp,
  comments,
  reposts,
  likes,
}: PostProps) {
  return (
    <Card className="rounded-none border-x-0 border-t-0 sm:rounded-xl sm:border">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar"/>
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href="/profile" className="font-bold hover:underline">
                {authorName}
              </Link>
              <span className="text-sm text-muted-foreground">@{authorHandle}</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{timestamp}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{content}</p>
            <div className="mt-4 flex justify-between text-muted-foreground">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{comments}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span>{reposts}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{likes}</span>
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
