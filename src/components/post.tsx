import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Repeat, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type PostProps = {
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  comments: number;
  reposts: number;
  likes: number;
  imageUrl?: string;
  imageHint?: string;
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
  imageUrl,
  imageHint,
}: PostProps) {
  return (
    <div className="p-4">
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
          {imageUrl && (
            <div className="mt-3 mr-4 rounded-2xl overflow-hidden border">
              <Image
                src={imageUrl}
                alt="Post image"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
                data-ai-hint={imageHint}
              />
            </div>
          )}
          <div className="mt-4 flex justify-between text-muted-foreground">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-primary">
              <MessageCircle className="h-5 w-5" />
              <span>{comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-primary">
              <Repeat className="h-5 w-5" />
              <span>{reposts}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-primary">
              <Heart className="h-5 w-5" />
              <span>{likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-primary">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
