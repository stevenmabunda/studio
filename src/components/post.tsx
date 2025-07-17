
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { MessageCircle, Repeat, Heart, Share2, CheckCircle2, MoreHorizontal, Edit, Trash2, Bookmark, MapPin, Copy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn, linkify } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import type { PostType } from "@/lib/data";
import { Progress } from "./ui/progress";
import { usePosts } from "@/contexts/post-context";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FollowButton } from "./follow-button";


type PostProps = PostType & {
  isStandalone?: boolean;
};

// Helper components for social icons
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1.1-3.5 2.2-6 2.2-2.3 0-4.6-1.1-6.8-2.2C5.3 14.3 4.1 12.3 3 10c1.8 1.4 3.9 2.4 6.3 2.5.1 0 .2 0 .3 0 2.3 0 4.2-1.1 5.7-2.2-.1-.1-.2-.2-.2-.3-.1-.3-.2-.5-.3-.8-.3-.9-.6-1.8-1-2.7-.4-.9-.9-1.8-1.4-2.6-1.1-1.4-2.6-2.3-4.2-2.3-1.4 0-2.8.7-3.9 1.8" /></svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);

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
    authorId,
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
    location,
    isStandalone = false,
  } = props;
  
  const router = useRouter();
  const { user } = useAuth();
  const { editPost, deletePost, likePost, repostPost, bookmarkPost, bookmarkedPostIds } = usePosts();
  const { toast } = useToast();

  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareSheetOpen, setShareSheetOpen] = useState(false);
  
  const isBookmarked = useMemo(() => bookmarkedPostIds.has(id), [bookmarkedPostIds, id]);

  const mediaExists = media && media.length > 0;
  const isVideo = mediaExists && media[0].type === 'video';
  const videoRef = useRef<HTMLVideoElement>(null);

  const isAuthor = user && user.uid === authorId;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          videoElement.pause();
        }
      },
      {
        threshold: 0.1, // Pause when less than 10% is visible
      }
    );

    observer.observe(videoElement);

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, [isVideo]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    likePost(id, isLiked);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReposted(!isReposted);
    setRepostCount(isReposted ? repostCount - 1 : repostCount + 1);
    repostPost(id, isReposted);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkPost(id, isBookmarked);
    toast({
      description: !isBookmarked ? "Post bookmarked." : "Bookmark removed.",
    });
  };
  
  const handleEditSave = async () => {
    if (editedContent.trim() === content.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      await editPost(id, { text: editedContent });
      toast({ description: "Post updated." });
      setIsEditing(false);
    } catch (error) {
      toast({ variant: 'destructive', description: "Failed to update post." });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(id);
      toast({ description: "Post deleted." });
      // If we are on the standalone page, redirect after delete
      if (isStandalone) {
        router.push('/home');
      }
    } catch (error) {
      toast({ variant: 'destructive', description: "Failed to delete post." });
    }
  };
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ description: "Link copied to clipboard!" });
  };
  
  const getShareUrl = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const postUrl = encodeURIComponent(`${window.location.origin}/post/${id}`);
    const text = encodeURIComponent(content);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${postUrl}&text=${text}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}%20${postUrl}`;
    }
  };

  const imageCount = mediaExists && !isVideo ? media.length : 0;
  
  const singleImage = imageCount === 1;

  const gridClasses = {
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[imageCount] || '';


  const postUiContent = (
      <div className="flex space-x-3 p-3 md:p-4">
        <Link href={`/profile/${authorId}`} onClick={(e) => e.stopPropagation()}>
            <Avatar>
            <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar"/>
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm">
              <Link href={`/profile/${authorId}`} className="truncate font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                {authorName}
              </Link>
              <span className="truncate text-muted-foreground">@{authorHandle}</span>
              <span className="text-muted-foreground">·</span>
              <span className="flex-shrink-0 text-muted-foreground">{timestamp}</span>
              {location && (
                <>
                  <span className="text-muted-foreground hidden sm:inline">·</span>
                  <span className="flex-shrink-0 text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center -mt-1">
                {!isAuthor && isStandalone && <FollowButton profileId={authorId} />}
                {isAuthor && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">More options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{linkify(content)}</p>
          {poll && <Poll poll={poll} postId={id} />}
          {mediaExists && (
            <div className={cn("mt-3 rounded-2xl overflow-hidden border", imageCount > 1 && "aspect-video")}>
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={media[0].url}
                  controls
                  className="w-full h-auto max-h-96 object-contain bg-black"
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
          <div className="mt-4 flex items-center justify-between text-muted-foreground">
            <div className="flex items-center -ml-3">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-primary">
                    <MessageCircle className="h-5 w-5" />
                    <span>{comments > 0 ? comments : ''}</span>
                </Button>
                <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", isReposted ? 'text-green-500' : 'hover:text-green-500')} onClick={handleRepost}>
                  <Repeat className="h-5 w-5" />
                  <span>{repostCount > 0 ? repostCount : ''}</span>
                </Button>
                <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", isLiked ? 'text-red-500' : 'hover:text-red-500')} onClick={handleLike}>
                  <Heart className={cn("h-5 w-5", isLiked && 'fill-current')} />
                  <span>{likeCount > 0 ? likeCount : ''}</span>
                </Button>
            </div>
            <div className="flex items-center -mr-3">
                <Button variant="ghost" size="icon" className={cn("hover:text-primary", isBookmarked && "text-primary")} onClick={handleBookmark}>
                    <Bookmark className={cn("h-5 w-5", isBookmarked && 'fill-current')} />
                </Button>
                <Sheet open={isShareSheetOpen} onOpenChange={setShareSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-lg" onClick={(e) => e.stopPropagation()}>
                        <SheetHeader>
                            <SheetTitle>Share Post</SheetTitle>
                        </SheetHeader>
                        <div className="grid grid-cols-4 gap-4 py-4">
                            <a href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center group">
                                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                                    <TwitterIcon className="h-7 w-7" />
                                </div>
                                <span className="text-xs">Twitter</span>
                            </a>
                            <a href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center group">
                                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                                    <FacebookIcon className="h-7 w-7" />
                                </div>
                                <span className="text-xs">Facebook</span>
                            </a>
                            <a href={getShareUrl('whatsapp')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center group">
                                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                                    <WhatsAppIcon className="h-7 w-7" />
                                </div>
                                <span className="text-xs">WhatsApp</span>
                            </a>
                            <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 text-center group">
                                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                                    <Copy className="h-7 w-7" />
                                </div>
                                <span className="text-xs">Copy Link</span>
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
          </div>
        </div>
      </div>
  );

  const handlePostClick = () => {
      if (!isStandalone) {
          router.push(`/post/${id}`);
      }
  }

  return (
      <div className={!isStandalone ? 'cursor-pointer hover:bg-accent/20' : ''} onClick={handlePostClick}>
          {postUiContent}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent onClick={e => e.stopPropagation()}>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your post.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                          className={buttonVariants({ variant: "destructive" })}
                          onClick={handleDelete}
                      >
                          Delete
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogContent onClick={e => e.stopPropagation()}>
                  <DialogHeader>
                      <DialogTitle>Edit Post</DialogTitle>
                  </DialogHeader>
                  <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[120px] text-base"
                  />
                  <DialogFooter>
                      <Button variant="outline" onClick={() => { setIsEditing(false); setEditedContent(content); }}>Cancel</Button>
                      <Button onClick={handleEditSave}>Save</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </div>
  );
}
