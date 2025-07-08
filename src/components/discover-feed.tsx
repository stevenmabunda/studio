'use client';

import { Post } from '@/components/post';
import type { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useMemo } from 'react';
import { FollowButton } from './follow-button';
import Link from 'next/link';

type Author = {
    id: string;
    name: string;
    handle: string;
    avatar: string;
}

export function DiscoverFeed({ posts }: { posts: PostType[] }) {
    const suggestedUsers = useMemo(() => {
        const authors = new Map<string, Author>();
        posts.forEach(post => {
            if (!authors.has(post.authorHandle)) {
                authors.set(post.authorHandle, {
                    id: post.authorId,
                    name: post.authorName,
                    handle: post.authorHandle,
                    avatar: post.authorAvatar
                });
            }
        });
        return Array.from(authors.values()).slice(0, 5); // Suggest up to 5 users
    }, [posts]);

    if (posts.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">The Discover feed is quiet...</h2>
                <p>Post something to see content here, or check back later!</p>
            </div>
        );
    }

    const postsFromSuggested = posts.filter(p => suggestedUsers.some(u => u.handle === p.authorHandle));

    return (
        <div>
            {suggestedUsers.length > 0 && (
                <Card className="m-4 bg-secondary">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Suggested for you</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {suggestedUsers.map((user) => (
                                <div key={user.handle} className="flex items-center justify-between gap-2">
                                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
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
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="border-t">
                {postsFromSuggested.length > 0 && <h2 className="p-4 text-lg font-bold">From accounts you might like</h2>}
                <div className="divide-y divide-border">
                    {postsFromSuggested.map((post) => (
                        <Post key={post.id} {...post} />
                    ))}
                </div>
            </div>
        </div>
    );
}
