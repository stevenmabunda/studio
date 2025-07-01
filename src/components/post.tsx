
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Repeat, Heart, Share2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { cn, linkify } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CommentDialogContent } from './comment-dialog';
import { useRouter } from "next/navigation";
import type { PostType } from "@/lib/data";
import { Progress } from "./ui/progress";
import { usePosts } from "@/contexts/post-context";

type PostProps = PostType & {
  isStandalone?: boolean;
};

function Poll({ poll, postId }: { poll: NonNullable<PostType['poll']>, postId: string }) {
  const [votedChoice, setVotedChoice] = useState<number | null>(null);
  const { addVote } = usePosts();

  const totalVotes = useMemo(() => {
    return poll.choices.reduce((acc, choice) => acc + choice.votes, 0);
  }, [poll.choices]);

  const handleVote = (index: number) => {
    if (votedChoice !== null) return;
    setVotedChoice(index);
    addVote(postId, index);
  };

  return (
    <div className="mt-3 space-y-2">
      {poll.choices.map((choice, index) => {
        const percentage = totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0;
        const hasVotedThisChoice = votedChoice === index;

        return (
          <div key={index}>
            {votedChoice !== null ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center font-medium">
                    {choice.text}
                    {hasVotedThisChoice && <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />}
                  </div>
                  <span className="font-bold">{percentage.toFixed(0)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start font-medium"
                onClick={(e) => {
                    e.stopPropagation();
                    handleVote(index);
                }}
              >
                {choice.text}
              </Button>
            )}
          </div>
        );
      })}
      {votedChoice !== null && <p className="text-xs text-muted-foreground">{totalVotes} vote{totalVotes !== 1 && 's'}</p>}
    </div>
  );
}


export function Post(props: PostProps) {
  const {
    id,
    authorName,
    authorHandle,
    authorAvatar,
    content,
    timestamp,
    comments,
    reposts: initialReposts,
    likes: initialLikes,
    media,
    poll,
    isStandalone = false,
  } = props;
  
  const router = useRouter();

  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReposted(!isReposted);
    setRepostCount(isReposted ? repostCount - 1 : repostCount + 1);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  }
  
  const isOwnPost = authorHandle === 'yourhandle';

  const mediaExists = media && media.length > 0;
  const isVideo = mediaExists && media[0].type === 'video';
  const imageCount = mediaExists && !isVideo ? media.length : 0;
  
  const singleImage = imageCount === 1;

  const gridClasses = {
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[imageCount] || '';


  const postUiContent = (
      <div className="flex space-x-4">
        <Avatar>
          <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar"/>
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <Link href="/profile" className="truncate font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                {authorName}
              </Link>
              <span className="truncate text-muted-foreground">@{authorHandle}</span>
              <span className="text-muted-foreground">·</span>
              <span className="flex-shrink-0 text-muted-foreground">{timestamp}</span>
            </div>
            {!isOwnPost && isStandalone && (
              <Button 
                variant={isFollowing ? 'outline' : 'default'}
                size="sm" 
                className={cn("rounded-full h-8 px-4 font-bold", !isFollowing && "bg-foreground text-background hover:bg-foreground/90")}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap">{linkify(content)}</p>
          {poll && <Poll poll={poll} postId={id} />}
          {mediaExists && (
            <div className={cn("mt-3 rounded-2xl overflow-hidden border", imageCount > 1 && "aspect-video")}>
              {isVideo ? (
                <video
                  src={media[0].url}
                  controls
                  className="w-full h-auto max-h-96"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : singleImage ? (
                <Image
                    src={media[0].url}
                    alt={media[0].hint || `Post image 1`}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover"
                    data-ai-hint={media[0].hint}
                />
              ) : (
                <div className={cn("grid h-full gap-0.5", gridClasses)}>
                  {media.map((item, index) => (
                     <div key={index} className={cn("relative", imageCount === 3 && index === 0 && "row-span-2")}>
                      <Image
                        src={item.url}
                        alt={item.hint || `Post image ${index + 1}`}
                        fill
                        className="object-cover"
                        data-ai-hint={item.hint}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex justify-between text-muted-foreground max-w-xs">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-primary" onClick={(e) => { e.stopPropagation(); if(isStandalone) e.preventDefault(); }} disabled={isStandalone}>
                <MessageCircle className="h-5 w-5" />
                <span>{comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", isReposted ? 'text-green-500' : 'hover:text-green-500')} onClick={handleRepost}>
              <Repeat className="h-5 w-5" />
              <span>{repostCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", isLiked ? 'text-red-500' : 'hover:text-red-500')} onClick={handleLike}>
              <Heart className={cn("h-5 w-5", isLiked && 'fill-current')} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
  );

  if (isStandalone) {
    return <div className="p-4">{postUiContent}</div>;
  }

  return (
    <Dialog>
        <DialogTrigger asChild>
            <div className="block p-4 cursor-pointer hover:bg-accent/20">
                {postUiContent}
            </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px] p-0" onClick={(e) => e.stopPropagation()}>
            <CommentDialogContent post={props} />
        </DialogContent>
    </Dialog>
  );
}
