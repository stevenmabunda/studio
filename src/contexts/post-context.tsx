
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { PostType } from '@/lib/data';
import type { Media } from '@/components/create-post';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, type Timestamp, doc, updateDoc, runTransaction, deleteDoc, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatTimestamp } from '@/lib/utils';
import { extractPostTopics } from '@/ai/flows/extract-post-topics';

type PostContextType = {
  posts: PostType[];
  addPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null, communityId?: string }) => Promise<void>;
  editPost: (postId: string, data: { text:string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addVote: (postId: string, choiceIndex: number) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  likePost: (postId: string, isLiked: boolean) => Promise<void>;
  repostPost: (postId: string, isReposted: boolean) => Promise<void>;
  bookmarkPost: (postId: string, isBookmarked: boolean) => Promise<void>;
  bookmarkedPostIds: Set<string>;
  loading: boolean;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

const seedPostsData = [
    {
      id: '--seed-post-1--',
      content: "What a season for Real Madrid! Winning La Liga and the Champions League is an incredible achievement. #HalaMadrid",
      likes: 1200,
      reposts: 345,
      comments: 123,
      views: 15000,
    },
    {
      id: '--seed-post-2--',
      content: "The transfer rumors are flying! Looks like Mbappé is finally heading to Real Madrid. This changes everything.",
      likes: 890,
      reposts: 210,
      comments: 95,
      views: 12300,
    },
    {
      id: '--seed-post-3--',
      content: "Is Messi the greatest of all time? After that World Cup win, it's hard to argue against it. #GOAT",
      likes: 2500,
      reposts: 800,
      comments: 450,
      views: 50000,
    },
    {
      id: '--seed-post-4--',
      content: "Can anyone stop Manchester City next season? Haaland is a goal machine.",
      likes: 950,
      reposts: 150,
      comments: 78,
      views: 18000,
    },
];

async function seedDatabaseIfEmpty() {
    if (!db) return;
    const seedFlagRef = doc(db, 'posts', '--seed-post-1--');
    const seedFlagDoc = await getDoc(seedFlagRef);

    // If the first seed post doesn't exist, we seed the database.
    if (!seedFlagDoc.exists()) {
        console.log("No seed data found, populating database...");
        const seedAuthor = {
            uid: 'bholo-bot',
            displayName: 'BHOLO Bot',
            handle: 'bholobot',
            photoURL: 'https://placehold.co/128x128.png',
        };

        for (const seed of seedPostsData) {
            const postRef = doc(db, 'posts', seed.id);
            const postData = {
                authorId: seedAuthor.uid,
                authorName: seedAuthor.displayName,
                authorHandle: seedAuthor.handle,
                authorAvatar: seedAuthor.photoURL,
                content: seed.content,
                createdAt: serverTimestamp(),
                comments: seed.comments,
                reposts: seed.reposts,
                likes: seed.likes,
                views: seed.views,
                media: [],
            };

            await setDoc(postRef, postData);

            try {
                const { topics } = await extractPostTopics({ content: seed.content });
                const topicsCollectionRef = collection(db, 'topics');
                for (const topic of topics) {
                    await addDoc(topicsCollectionRef, {
                        topic: topic.toLowerCase(),
                        createdAt: serverTimestamp(),
                    });
                }
            } catch (error) {
                console.error("Failed to extract topics for seed post:", error);
            }
        }
        console.log("Database seeding complete.");
    }
}

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    const fetchPostsAndBookmarks = async () => {
        setLoading(true);
        try {
            await seedDatabaseIfEmpty();
            
            const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
    
            const postsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = (data.createdAt as Timestamp)?.toDate();
                return {
                    id: doc.id,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    authorHandle: data.authorHandle,
                    authorAvatar: data.authorAvatar,
                    content: data.content,
                    comments: data.comments,
                    reposts: data.reposts,
                    likes: data.likes,
                    views: data.views || 0,
                    location: data.location,
                    media: data.media,
                    poll: data.poll,
                    communityId: data.communityId,
                    timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
                } as PostType;
            })
            // Filter out bot posts and community posts from the main feed
            .filter(post => post.authorId !== 'bholo-bot' && !post.communityId);
    
            setPosts(postsData);

            if (user) {
                const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
                const bookmarksSnapshot = await getDocs(bookmarksRef);
                const bookmarkIds = new Set(bookmarksSnapshot.docs.map(doc => doc.id));
                setBookmarkedPostIds(bookmarkIds);
            } else {
                setBookmarkedPostIds(new Set());
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchPostsAndBookmarks();
  }, [user]);

  const addPost = async ({ text, media, poll, location, communityId }: { text: string; media: Media[]; poll?: PostType['poll'], location?: string | null, communityId?: string }) => {
    if (!user || !db || !storage) {
        throw new Error("Cannot add post: user not logged in or Firebase not configured.");
    }
    
    try {
        const mediaUrls = [];
        for (const m of media) {
            const fileName = `${user.uid}-${Date.now()}-${m.file.name}`;
            const storagePath = `posts/${user.uid}/${fileName}`;
            const storageRef = ref(storage, storagePath);
            const snapshot = await uploadBytes(storageRef, m.file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            mediaUrls.push({ url: downloadURL, type: m.type, hint: 'user uploaded content' });
        }

        const postData: Omit<PostType, 'id' | 'timestamp'> & { createdAt: any } = {
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous User',
          authorHandle: user.email?.split('@')[0] || 'user',
          authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
          content: text,
          createdAt: serverTimestamp(),
          comments: 0,
          reposts: 0,
          likes: 0,
          views: 0,
          media: mediaUrls,
        };

        if (poll) {
            postData.poll = poll;
        }
        if (location) {
            postData.location = location;
        }
        if (communityId) {
            postData.communityId = communityId;
        }
        
        const docRef = await addDoc(collection(db, "posts"), postData);
        
        const newPostForState: PostType = {
            id: docRef.id,
            authorId: postData.authorId,
            authorName: postData.authorName,
            authorHandle: postData.authorHandle,
            authorAvatar: postData.authorAvatar,
            content: postData.content,
            timestamp: 'Just now',
            comments: postData.comments,
            reposts: postData.reposts,
            likes: postData.likes,
            views: postData.views,
            media: mediaUrls,
            poll: postData.poll,
            location: postData.location,
            communityId: postData.communityId,
        };
        
        // Only add to the global feed if it's not a community post
        if (!communityId) {
            setPosts((prevPosts) => [newPostForState, ...prevPosts]);
        }
        
        if (text) {
            extractPostTopics({ content: text })
                .then(async ({ topics }) => {
                    if (!db) return;
                    const topicsCollectionRef = collection(db, 'topics');
                    for (const topic of topics) {
                        await addDoc(topicsCollectionRef, {
                            topic: topic.toLowerCase(),
                            createdAt: serverTimestamp(),
                        });
                    }
                })
                .catch(error => {
                    console.error("Background topic extraction failed:", error);
                });
        }
    } catch (error) {
        console.error("Failed to create post:", error);
        // Re-throw the error to be caught by the calling component
        throw error;
    }
  };

  const editPost = async (postId: string, data: { text: string }) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { content: data.text });
    setPosts(posts => posts.map(p => p.id === postId ? { ...p, content: data.text } : p));
  };

  const deletePost = async (postId: string) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    setPosts(posts => posts.filter(p => p.id !== postId));
  };

  const addVote = async (postId: string, choiceIndex: number) => {
    if (!db) throw new Error("Firestore not initialized");

    const postRef = doc(db, "posts", postId);

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId && p.poll) {
          const newChoices = p.poll.choices.map((choice, index) => 
            index === choiceIndex ? { ...choice, votes: choice.votes + 1 } : choice
          );
          return { ...p, poll: { ...p.poll, choices: newChoices } };
        }
        return p;
      })
    );

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Document does not exist!";
        }
        
        const postData = postDoc.data() as PostType;
        const currentChoices = postData.poll?.choices || [];
        
        const newChoices = currentChoices.map((choice, index) => {
          if (index === choiceIndex) {
            return { ...choice, votes: choice.votes + 1 };
          }
          return choice;
        });

        transaction.update(postRef, { "poll.choices": newChoices });
      });
    } catch (error) {
      console.error("Failed to update vote in Firestore:", error);
      const fetchPosts = async () => { /* re-fetch logic from above */ };
      fetchPosts();
    }
  };

  const addComment = async (postId: string, commentText: string) => {
    if (!user || !db) {
        throw new Error("User not authenticated or Firebase not initialized.");
    }
    const postRef = doc(db, 'posts', postId);
    const commentsCollectionRef = collection(postRef, 'comments');

    const commentData = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous User',
        authorHandle: user.email?.split('@')[0] || 'user',
        authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
        content: commentText,
        createdAt: serverTimestamp(),
    };

    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Post does not exist!";
            }
            
            const newCommentCount = (postDoc.data().comments || 0) + 1;
            
            transaction.update(postRef, { comments: newCommentCount });

            const newCommentRef = doc(commentsCollectionRef);
            transaction.set(newCommentRef, commentData);
        });
        
        setPosts(posts => posts.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
        
        // Create notification
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            const postAuthorId = postDoc.data().authorId;
            if (user.uid !== postAuthorId) {
                const notificationRef = collection(db, 'users', postAuthorId, 'notifications');
                await addDoc(notificationRef, {
                    type: 'comment',
                    fromUserId: user.uid,
                    fromUserName: user.displayName || 'User',
                    fromUserAvatar: user.photoURL || 'https://placehold.co/40x40.png',
                    postId: postId,
                    postContentSnippet: commentText.substring(0, 50),
                    createdAt: serverTimestamp(),
                    read: false,
                });
            }
        }

    } catch (e) {
        console.error("Error adding comment: ", e);
        throw new Error("Could not post comment.");
    }
  };

  const likePost = async (postId: string, isLiked: boolean) => {
    if (!db || !user) return;
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, 'users', user.uid, 'likes', postId);

    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Post does not exist!";
            }
            
            if (isLiked) {
                // Unlike
                const newLikes = Math.max(0, postDoc.data().likes - 1);
                transaction.update(postRef, { likes: newLikes });
                transaction.delete(likeRef);
            } else {
                // Like
                const newLikes = postDoc.data().likes + 1;
                transaction.update(postRef, { likes: newLikes });
                transaction.set(likeRef, { createdAt: serverTimestamp() });
            }
        });

        // Create notification only on like, not on unlike
        if (!isLiked) {
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                const postData = postDoc.data();
                if (postData && postData.authorId && user.uid !== postData.authorId) {
                    const notificationRef = collection(db, 'users', postData.authorId, 'notifications');
                    await addDoc(notificationRef, {
                        type: 'like',
                        fromUserId: user.uid,
                        fromUserName: user.displayName || 'User',
                        fromUserAvatar: user.photoURL || 'https://placehold.co/40x40.png',
                        postId: postId,
                        postContentSnippet: (postData.content || '').substring(0, 50),
                        createdAt: serverTimestamp(),
                        read: false,
                    });
                }
            }
        }

    } catch (error) {
        console.error("Error updating likes:", error);
    }
  };
  
  const repostPost = async (postId: string, isReposted: boolean) => {
    if (!db) return;
    const postRef = doc(db, "posts", postId);
    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Document does not exist!";
        }
        const newReposts = postDoc.data().reposts + (isReposted ? -1 : 1);
        transaction.update(postRef, { reposts: newReposts < 0 ? 0 : newReposts });
      });
    } catch (error) {
      console.error("Error updating reposts:", error);
    }
  };

  const bookmarkPost = async (postId: string, isBookmarked: boolean) => {
    if (!db || !user) return;
    const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', postId);

    try {
        if (isBookmarked) {
            await deleteDoc(bookmarkRef);
            setBookmarkedPostIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        } else {
            await setDoc(bookmarkRef, { createdAt: serverTimestamp() });
            setBookmarkedPostIds(prev => {
                const newSet = new Set(prev);
                newSet.add(postId);
                return newSet;
            });
        }
    } catch (error) {
        console.error("Error updating bookmark:", error);
    }
  };

  return (
    <PostContext.Provider value={{ posts, addPost, editPost, deletePost, addVote, addComment, likePost, repostPost, bookmarkPost, bookmarkedPostIds, loading }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
