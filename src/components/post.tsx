

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { MessageCircle, Repeat, Heart, Share2, MoreHorizontal, Edit, Trash2, Bookmark, Copy, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn, linkify, formatTimestamp, formatDetailedTimestamp } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
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
import { getIsFollowing } from "@/app/(app)/profile/actions";
import { ScrollArea } from "./ui/scroll-area";
import { CreateComment, type ReplyMedia } from "./create-comment";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, orderBy, query, type Timestamp } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import useEmblaCarousel from 'embla-carousel-react';
import { LoginOrSignupDialog } from "./login-or-signup-dialog";
import { ProfileHoverCard } from "./profile-hover-card";


type PostProps = PostType & {
  isStandalone?: boolean;
  isReplyView?: boolean;
};

type CommentType = PostType;


// Helper components for social icons
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1.1-3.5 2.2-6 2.2-2.3 0-4.6-1.1-6.8-2.2C5.3 14.3 4.1 12.3 3 10c1.8 1.4 3.9 2.4 6.3 2.5.1 0 .2 0 .3 0 2.3 0 4.2-1.1 5.7-2.2-.1-.1-.2-.2-.2-.3-.1-.3-.2-.5-.3-.8-.3-.9-.6-1.8-1-2.7-.4-.9-.9-1.8-1.4-2.6-1.1-1.4-2.6-2.3-4.2-2.3-1.4 0-2.8.7-3.9 1.8" /></svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);

function ReplyDialog({ post, onReply, open, onOpenChange }: { post: PostType, onReply: (data: { text: string; media: ReplyMedia[] }) => Promise<boolean | null>, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleCreateReply = async (data: { text: string; media: ReplyMedia[] }) => {
        try {
            const success = await onReply(data);
            if (success) {
                onOpenChange(false);
                toast({
                    description: "Your reply was sent.",
                    action: (
                        <Button variant="outline" size="sm" onClick={() => {
                            // Save scroll position before navigating
                            sessionStorage.setItem('scrollY', String(window.scrollY));
                            sessionStorage.setItem('scrollPostId', post.id);
                            router.push(`/post/${post.id}#comments`);
                        }}>
                            View
                        </Button>
                    ),
                });
                return true;
            }
             return null;
        } catch (error) {
            toast({ variant: 'destructive', description: "Failed to send reply." });
            return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0" onClick={(e) => e.stopPropagation()}>
                <DialogHeader className="p-4 border-b">
                     <DialogTitle className="sr-only">Reply to post</DialogTitle>
                     <DialogClose />
                </DialogHeader>
                <div className="p-4">
                    <div className="flex space-x-3">
                        <div className="flex flex-col items-center">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="w-0.5 grow bg-border my-2" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{post.authorName}</span>
                                <span className="text-sm text-muted-foreground">@{post.authorHandle}</span>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Replying to <span className="text-primary">@{post.authorHandle}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <CreateComment onComment={handleCreateReply} />
            </DialogContent>
        </Dialog>
    );
}

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
                    {hasVotedThisChoice && <Check className="ml-2 h-4 w-4 text-primary" />}
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

function Comment({ comment }: { comment: CommentType }) {
  const hasMedia = comment.media && comment.media.length > 0;
  const isVideo = hasMedia && comment.media![0].type === 'video';
  
  return (
    <div className="p-3 md:p-4">
      <div className="flex space-x-3 md:space-x-4">
          <Avatar>
            <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="user avatar" />
            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                  <Link href={`/profile/${comment.authorId}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                      {comment.authorName}
                  </Link>
                  <span className="text-muted-foreground">@{comment.authorHandle}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{comment.timestamp}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
              {hasMedia && (
                <div className={cn("mt-3 rounded-2xl overflow-hidden border max-h-[400px]")}>
                  {isVideo ? (
                    <video
                      src={comment.media![0].url}
                      controls
                      className="w-full h-auto max-h-96 object-contain bg-black"
                    />
                  ) : (
                    <Image
                      src={comment.media![0].url}
                      alt={`Comment image`}
                      width={comment.media![0].width || 500}
                      height={comment.media![0].height || 500}
                      className="w-full h-auto max-h-[400px] object-contain"
                      data-ai-hint={comment.media![0].hint}
                    />
                  )}
                </div>
              )}
          </div>
      </div>
    </div>
  )
}

function CommentSkeleton() {
  return (
      <div className="flex space-x-3 md:space-x-4 p-3 md:p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
          </div>
      </div>
  )
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
    createdAt,
    comments: initialComments,
    reposts: initialReposts,
    likes: initialLikes,
    views,
    media,
    poll,
    isStandalone = false,
    isReplyView = false,
  } = props;
  
  const router = useRouter();
  const { user } = useAuth();
  const { editPost, deletePost, likePost, repostPost, bookmarkPost, bookmarkedPostIds, addComment } = usePosts();
  const { toast } = useToast();

  const [comments, setComments] = useState<CommentType[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(initialComments);

  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareSheetOpen, setShareSheetOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerStartIndex, setImageViewerStartIndex] = useState(0);
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);

  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const isBookmarked = useMemo(() => bookmarkedPostIds.has(id), [bookmarkedPostIds, id]);

  const mediaExists = media && media.length > 0;
  const isVideo = mediaExists && media[0].type === 'video';
  const videoRef = useRef<HTMLVideoElement>(null);

  const isAuthor = user && user.uid === authorId;

  // Embla carousel hooks for the image viewer
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, startIndex: imageViewerStartIndex });
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  
  useEffect(() => {
    if (emblaApi) {
        emblaApi.scrollTo(imageViewerStartIndex, true); // Instantly jump to start index
    }
  }, [emblaApi, imageViewerStartIndex, isImageViewerOpen]);

  // Effect to generate video thumbnail
  useEffect(() => {
    if (isVideo && media[0].url) {
        const video = document.createElement('video');
        video.crossOrigin = "anonymous";
        video.src = media[0].url;
        
        const onLoadedData = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setVideoThumbnail(canvas.toDataURL());
            }
            // Cleanup
            video.removeEventListener('loadeddata', onLoadedData);
        };
        
        video.addEventListener('loadeddata', onLoadedData);

        return () => {
            video.removeEventListener('loadeddata', onLoadedData);
        }
    }
  }, [isVideo, media]);
  
    // Effect for Intersection Observer to play/pause video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isVideo]);


  // Effect to fetch comments when the image viewer is opened
  useEffect(() => {
    let unsubscribe = () => {};
    if (isImageViewerOpen && db) {
      setLoadingComments(true);
      const commentsRef = collection(db, 'posts', id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate();
            return {
                id: doc.id,
                authorId: data.authorId,
                authorName: data.authorName,
                authorHandle: data.authorHandle,
                authorAvatar: data.authorAvatar,
                content: data.content,
                timestamp: createdAt ? formatTimestamp(createdAt) : "now",
                media: data.media || [],
                comments: 0, reposts: 0, likes: 0,
            }
        }) as CommentType[];
        setComments(fetchedComments);
        setLoadingComments(false);
      });
    }
    return () => unsubscribe();
  }, [isImageViewerOpen, id]);

  const handleCreateComment = async (data: { text: string; media: ReplyMedia[] }) => {
    if (!user || !id) return null;
    try {
      await addComment(id, data);
      setCommentCount(prev => prev + 1);
      return true; // Indicate success
    } catch (error) {
        toast({ variant: 'destructive', description: "Failed to post reply." });
        console.error("Failed to add comment:", error);
        return null;
    }
  }


  useEffect(() => {
    if (isStandalone && user && user.uid !== authorId) {
        setFollowLoading(true);
        getIsFollowing(user.uid, authorId).then(status => {
            setIsFollowing(status);
            setFollowLoading(false);
        });
    } else {
        setFollowLoading(false);
    }
  }, [user, authorId, isStandalone]);
  
  const needsTruncation = !isStandalone && !isExpanded && content.length > 280;
  const displayText = needsTruncation ? `${content.substring(0, 280)}` : content;

  const handlePostClick = () => {
      if (id.startsWith('temp_')) return;
      if (!isStandalone && !isReplyView) {
          sessionStorage.setItem('scrollY', String(window.scrollY));
          sessionStorage.setItem('scrollPostId', id);
          router.push(`/post/${id}`);
      }
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
        setIsLoginDialogOpen(true);
        return;
    }
    setIsReplyDialogOpen(true);
  };

  const handleActionClick = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }
    action();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    likePost(id, isLiked);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setRepostCount(isReposted ? repostCount - 1 : repostCount + 1);
    repostPost(id, isReposted);
  };

  const handleBookmark = () => {
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

  const openImageViewer = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setImageViewerStartIndex(index);
    setIsImageViewerOpen(true);
  };

  const imageCount = mediaExists && !isVideo ? media.length : 0;
  
  const singleImage = imageCount === 1;

  const gridClasses = {
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[imageCount] || '';

  const mainPostContent = (
    <div className={cn("flex space-x-3 md:space-x-4", isReplyView ? 'p-3 md:p-4' : 'p-3 md:p-4')}>
      <div className="flex flex-col items-center">
          <ProfileHoverCard userId={authorId}>
            <Link href={`/profile/${authorId}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <Avatar>
                <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar" />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          </ProfileHoverCard>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <ProfileHoverCard userId={authorId}>
                      <Link href={`/profile/${authorId}`} className="font-bold hover:underline truncate" onClick={(e) => e.stopPropagation()}>
                          {authorName}
                      </Link>
                    </ProfileHoverCard>
                    <span className="text-sm text-muted-foreground truncate">@{authorHandle}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground flex-shrink-0">{timestamp}</span>
                </div>
            </div>
           {isAuthor ? (
                <div className="flex-shrink-0">
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
                </div>
           ) : user && isStandalone && !isReplyView ? (
                <div className="flex-shrink-0 -mr-2">
                     <FollowButton
                        profileId={authorId}
                        isFollowing={isFollowing}
                        isLoading={followLoading}
                        onToggleFollow={setIsFollowing}
                    />
                </div>
           ) : (
                <div className="flex-shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">More options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem>
                                Not interested in this post
                            </DropdownMenuItem>
                             <DropdownMenuItem>
                                Unfollow @{authorHandle}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Report post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
           )}
        </div>
        
        {isEditing ? (
            <div className="mt-2">
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[80px] text-base"
                    autoFocus
                />
                <div className="mt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditedContent(content); }}>Cancel</Button>
                    <Button size="sm" onClick={handleEditSave}>Save</Button>
                </div>
            </div>
        ) : (
            <p className={cn("whitespace-pre-wrap", "mt-2", isStandalone && "text-lg")}>
                {linkify(isReplyView ? content : displayText)}
                {needsTruncation && (
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                    }}
                    className="text-primary hover:underline ml-1"
                    >
                    ...more
                    </button>
                )}
            </p>
        )}

        {poll && <Poll poll={poll} postId={id} />}
        
        {mediaExists && (
          <div className={cn("mt-3 rounded-2xl overflow-hidden border", imageCount > 1 && "aspect-video")}>
            {isVideo ? (
              <video
                ref={videoRef}
                src={media[0].url}
                loop
                muted
                playsInline
                controls
                poster={videoThumbnail || ''}
                className="w-full h-auto max-h-96 object-contain bg-black"
                onClick={(e) => e.stopPropagation()}
              />
            ) : singleImage ? (
              <div 
                  className="relative w-full max-h-[500px] bg-black cursor-pointer"
                  onClick={(e) => openImageViewer(e, 0)}
              >
                  <Image
                      src={media[0].url}
                      alt={media[0].hint || `Post image 1`}
                      width={media[0].width || 500}
                      height={media[0].height || 500}
                      className="w-full h-auto max-h-[500px] object-contain"
                      data-ai-hint={media[0].hint}
                  />
              </div>
            ) : (
              <div className={cn("grid h-full gap-0.5", gridClasses)}>
                {media.map((item, index) => (
                   <div 
                      key={index} 
                      className={cn("relative cursor-pointer", imageCount === 3 && index === 0 && "row-span-2")}
                      onClick={(e) => openImageViewer(e, index)}
                  >
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

        {isStandalone && !isReplyView && createdAt && (
             <div className="mt-4 text-sm text-muted-foreground">
                 <span>{formatDetailedTimestamp(new Date(createdAt))}</span>
                 {views ? (
                    <>
                        <span className="mx-1">·</span>
                        <span className="font-bold text-foreground">{views.toLocaleString()}</span> Views
                    </>
                 ) : null}
            </div>
        )}
        
        <div className={cn("flex items-center justify-between text-muted-foreground", isStandalone && !isReplyView ? "py-2 my-2" : "mt-4", isReplyView && "max-w-xs")}>
            <div className="flex items-center -ml-3">
                <Button variant="ghost" size={isReplyView ? 'icon' : 'sm'} className={cn("flex items-center gap-2 hover:text-primary", isReplyView && "h-8 w-8")} onClick={handleCommentClick}>
                    <MessageCircle className="h-5 w-5" />
                    {!isReplyView && <span>{commentCount > 0 ? commentCount : ''}</span>}
                </Button>
                <Button variant="ghost" size={isReplyView ? 'icon' : 'sm'} className={cn("flex items-center gap-2", isReposted ? 'text-green-500' : 'hover:text-green-500', isReplyView && "h-8 w-8")} onClick={handleActionClick(handleRepost)}>
                    <Repeat className="h-5 w-5" />
                    {!isReplyView && <span>{repostCount > 0 ? repostCount : ''}</span>}
                </Button>
                <Button variant="ghost" size={isReplyView ? 'icon' : 'sm'} className={cn("flex items-center gap-2", isLiked ? 'text-red-500' : 'hover:text-red-500', isReplyView && "h-8 w-8")} onClick={handleActionClick(handleLike)}>
                    <Heart className={cn("h-5 w-5", isLiked && 'fill-current')} />
                    {!isReplyView && <span>{likeCount > 0 ? likeCount : ''}</span>}
                </Button>
            </div>
            <div className="flex items-center -mr-3">
                <Button variant="ghost" size="icon" className={cn("hover:text-primary", isBookmarked && "text-primary", isReplyView && "h-8 w-8")} onClick={handleActionClick(handleBookmark)}>
                    <Bookmark className={cn("h-5 w-5", isBookmarked && 'fill-current')} />
                </Button>
                <Sheet open={isShareSheetOpen} onOpenChange={setShareSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("hover:text-primary", isReplyView && "h-8 w-8")} onClick={(e) => e.stopPropagation()}>
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

  return (
      <div 
        className={cn(!isStandalone && !isReplyView && 'cursor-pointer hover:bg-accent/20')} 
        onClick={handlePostClick}
        data-post-id={id}
      >
          {mainPostContent}
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
          <ReplyDialog post={props} onReply={handleCreateComment} open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen} />
           <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
                <DialogContent 
                    className="max-w-none w-screen h-screen bg-black/90 border-none shadow-none p-0 flex flex-col md:flex-row"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                    
                    {/* Main Image Content */}
                    <div className="flex-1 flex flex-col min-h-0 md:h-full">
                        <div className="relative flex-1 w-full h-full flex items-center justify-center group/viewer">
                            <div className="overflow-hidden w-full h-full" ref={emblaRef}>
                                <div className="flex h-full">
                                    {media?.filter(m => m.type === 'image').map((image, index) => (
                                        <div key={index} className="flex-[0_0_100%] min-w-0 relative flex items-center justify-center">
                                            <Image
                                                src={image.url}
                                                alt={`Enlarged view of post image ${index + 1}`}
                                                width={image.width || 1200}
                                                height={image.height || 1200}
                                                className="object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white h-10 w-10 bg-black/30 hover:bg-black/50 hover:text-white rounded-full opacity-50 group-hover/viewer:opacity-100 transition-opacity" onClick={scrollPrev}>
                                <ChevronLeft className="h-6 w-6"/>
                            </Button>
                            <Button variant="ghost" size="icon" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white h-10 w-10 bg-black/30 hover:bg-black/50 hover:text-white rounded-full opacity-50 group-hover/viewer:opacity-100 transition-opacity" onClick={scrollNext}>
                                <ChevronRight className="h-6 w-6"/>
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar with Post and Comments */}
                    <aside className="w-full md:w-[380px] md:h-full bg-background flex flex-col overflow-y-hidden flex-shrink-0 max-h-[40vh] md:max-h-full">
                        <div className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="flex-1">
                                <div className="flex space-x-3 md:space-x-4 p-3 md:p-4">
                                    <Link href={`/profile/${authorId}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <Avatar>
                                        <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar" />
                                        <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link href={`/profile/${authorId}`} className="font-bold hover:underline truncate" onClick={(e) => e.stopPropagation()}>
                                                {authorName}
                                            </Link>
                                            <span className="text-sm text-muted-foreground truncate">@{authorHandle}</span>
                                        </div>
                                        <p className="mt-2 whitespace-pre-wrap text-sm">{linkify(content)}</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-border border-t">
                                    {loadingComments ? (
                                        Array.from({length: 3}).map((_, i) => <CommentSkeleton key={i} />)
                                    ) : comments.length > 0 ? (
                                        comments.map((comment) => <Comment key={`comment-${comment.id}`} comment={comment} />)
                                    ) : (
                                        <p className="p-8 text-center text-muted-foreground text-sm">No comments yet.</p>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="border-t">
                                <CreateComment onComment={handleCreateComment} />
                            </div>
                        </div>
                    </aside>
                </DialogContent>
            </Dialog>
            <LoginOrSignupDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      </div>
  );
}
