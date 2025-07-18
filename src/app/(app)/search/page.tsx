
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { searchEverything, type SearchResults } from './actions';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Post } from '@/components/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/follow-button';
import Link from 'next/link';
import { PostSkeleton } from '@/components/post-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { JoinTribeButton } from '@/components/join-tribe-button';
import { getJoinedTribeIds, type Tribe } from '@/app/(app)/tribes/actions';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { getIsFollowing, toggleFollow } from '@/app/(app)/profile/actions';

function UserResultSkeleton() {
    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
        </div>
    );
}

function TribeResultSkeleton() {
    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
        </div>
    );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [joinedTribeIds, setJoinedTribeIds] = useState<Set<string>>(new Set());
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());

  const fetchInitialData = useCallback(async () => {
    if (user) {
      setLoading(true);
      const [tribeIds, searchResults] = await Promise.all([
        getJoinedTribeIds(user.uid),
        searchEverything(initialQuery)
      ]);

      setJoinedTribeIds(new Set(tribeIds));
      setResults(searchResults);
      
      if (searchResults.users.length > 0) {
        const followChecks = searchResults.users.map(u => getIsFollowing(user.uid, u.uid));
        const followStatuses = await Promise.all(followChecks);
        const newFollowedUserIds = new Set<string>();
        searchResults.users.forEach((u, index) => {
          if (followStatuses[index]) {
            newFollowedUserIds.add(u.uid);
          }
        });
        setFollowedUserIds(newFollowedUserIds);
      }
      
      setLoading(false);
    } else if (initialQuery.trim()) {
      setLoading(true);
      const searchResults = await searchEverything(initialQuery);
      setResults(searchResults);
      setLoading(false);
    } else {
      setResults({ users: [], tribes: [], posts: [] });
      setLoading(false);
    }
  }, [user, initialQuery]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newQuery = e.currentTarget.value;
      if (newQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
      }
    }
  };
  
  const handleFollowToggle = (profileId: string, isFollowing: boolean) => {
      setFollowedUserIds(prev => {
          const newSet = new Set(prev);
          if (isFollowing) {
              newSet.add(profileId);
          } else {
              newSet.delete(profileId);
          }
          return newSet;
      })
  }

  const handleMembershipChange = (tribeId: string, isMember: boolean) => {
    setJoinedTribeIds(prev => {
      const newSet = new Set(prev);
      if (isMember) {
        newSet.add(tribeId);
      } else {
        newSet.delete(tribeId);
      }
      return newSet;
    });
  }

  const hasResults = useMemo(() => {
    if (!results) return false;
    return results.users.length > 0 || results.tribes.length > 0 || results.posts.length > 0;
  }, [results]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 p-2 backdrop-blur-sm sm:p-4">
         <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
            <ArrowLeft />
         </Button>
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search BHOLO"
            className="pl-11 rounded-full bg-secondary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </header>
      
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="flex w-full justify-around rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="top" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Top</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Users</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Posts</TabsTrigger>
          <TabsTrigger value="tribes" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Tribes</TabsTrigger>
        </TabsList>
        <main className="flex-1">
          {loading ? (
             <div className="divide-y divide-border">
                <UserResultSkeleton />
                <PostSkeleton />
                <TribeResultSkeleton />
             </div>
          ) : !hasResults ? (
             <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">No results for "{initialQuery}"</h2>
                <p>Try searching for something else.</p>
            </div>
          ) : (
            <>
                <TabsContent value="top">
                    <div className="divide-y divide-border">
                        {results?.users.slice(0, 2).map(p => (
                            <div key={p.uid} className="p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <Link href={`/profile/${p.uid}`} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                        <AvatarImage src={p.photoURL} data-ai-hint="user avatar" />
                                        <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid">
                                        <p className="font-semibold leading-none hover:underline">{p.displayName}</p>
                                        <p className="text-sm text-muted-foreground">@{p.handle}</p>
                                        </div>
                                    </Link>
                                    <FollowButton 
                                      profileId={p.uid}
                                      isFollowing={followedUserIds.has(p.uid)}
                                      onToggleFollow={handleFollowToggle}
                                    />
                                </div>
                                <p className="mt-2 text-sm">{p.bio}</p>
                            </div>
                        ))}
                        {results?.posts.slice(0, 10).map(post => <Post key={post.id} {...post} />)}
                    </div>
                </TabsContent>
                <TabsContent value="users">
                    <div className="divide-y divide-border">
                        {results?.users.map(p => (
                           <div key={p.uid} className="p-4 hover:bg-accent/50">
                                <div className="flex items-center justify-between gap-2">
                                    <Link href={`/profile/${p.uid}`} className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                        <AvatarImage src={p.photoURL} data-ai-hint="user avatar" />
                                        <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid">
                                        <p className="font-semibold leading-none hover:underline">{p.displayName}</p>
                                        <p className="text-sm text-muted-foreground">@{p.handle}</p>
                                        </div>
                                    </Link>
                                     <FollowButton 
                                      profileId={p.uid}
                                      isFollowing={followedUserIds.has(p.uid)}
                                      onToggleFollow={handleFollowToggle}
                                    />
                                </div>
                                <p className="mt-2 text-sm ml-16">{p.bio}</p>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="posts">
                     <div className="divide-y divide-border">
                        {results?.posts.map(post => <Post key={post.id} {...post} />)}
                    </div>
                </TabsContent>
                <TabsContent value="tribes">
                     <div className="divide-y divide-border">
                        {results?.tribes.map(tribe => (
                             <div key={tribe.id} className="p-4 hover:bg-accent/50">
                                <div className="flex items-start justify-between gap-4">
                                    <Link href={`/tribes/${tribe.id}`} className="flex items-start gap-4 flex-1">
                                        <Image src={tribe.bannerUrl} alt={tribe.name} width={64} height={64} className="rounded-lg object-cover h-16 w-16" />
                                        <div className="flex-1">
                                            <h3 className="font-bold hover:underline">{tribe.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{tribe.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{tribe.memberCount} members</p>
                                        </div>
                                    </Link>
                                    <div className="w-28 flex-shrink-0">
                                        <JoinTribeButton
                                            tribeId={tribe.id}
                                            isMember={joinedTribeIds.has(tribe.id)}
                                            onToggleMembership={handleMembershipChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </>
          )}
        </main>
      </Tabs>
    </div>
  );
}
