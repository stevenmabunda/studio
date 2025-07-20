
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PostType } from '@/lib/data';
import type { Media } from '@/components/create-post';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, type Timestamp, doc, updateDoc, runTransaction, deleteDoc, orderBy, getDoc, setDoc, writeBatch, limit, onSnapshot, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatTimestamp } from '@/lib/utils';
import { extractPostTopics } from '@/ai/flows/extract-post-topics';
import { seedPosts } from '@/lib/seed-data';
import type { ReplyMedia } from '@/components/create-comment';
import { getMediaPosts } from '@/app/(app)/profile/actions';
import { getRecentPosts } from '@/app/(app)/home/actions';

type PostContextType = {
  forYouPosts: PostType[];
  setForYouPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
  discoverPosts: PostType[];
  newForYouPosts: PostType[];
  showNewForYouPosts: () => void;
  addPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }) => Promise<PostType | undefined>;
  editPost: (postId: string, data: { text:string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addVote: (postId: string, choiceIndex: number) => Promise<void>;
  addComment: (postId: string, data: { text: string; media: ReplyMedia[] }) => Promise<void>;
  likePost: (postId: string, isLiked: boolean) => Promise<void>;
  repostPost: (postId: string, isReposted: boolean) => Promise<void>;
  bookmarkPost: (postId: string, isBookmarked: boolean) => Promise<void>;
  bookmarkedPostIds: Set<string>;
  loadingForYou: boolean;
  setLoadingForYou: React.Dispatch<React.SetStateAction<boolean>>;
  loadingDiscover: boolean;
  fetchForYouPosts: (options?: { limit?: number; lastPostId?: string }) => Promise<PostType[]>;
};

const PostContext = createContext<PostContextType | undefined>(undefined);


async function seedDatabaseIfEmpty() {
    if (!db) return;
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("Database is empty, seeding posts...");
        const batch = writeBatch(db);
        seedPosts.forEach((post) => {
            const docRef = doc(postsRef); // Create a new doc with a random ID
            const firestorePost = {
                ...post,
                createdAt: serverTimestamp()
            };
            batch.set(docRef, firestorePost);
        });
        await batch.commit();
        console.log("Database seeded successfully.");
    } else {
        console.log("Database already has posts, skipping seed.");
    }
}

export function PostProvider({ children }: { children: ReactNode }) {
  const [forYouPosts, setForYouPosts] = useState<PostType[]>([]);
  const [discoverPosts, setDiscoverPosts] = useState<PostType[]>([]);
  const [newForYouPosts, setNewForYouPosts] = useState<PostType[]>([]);
  
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [loadingDiscover, setLoadingDiscover] = useState(true);

  const { user } = useAuth();
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  
  const [hasFetchedInitialForYou, setHasFetchedInitialForYou] = useState(false);

  const fetchForYouPosts = useCallback(async (options: { limit?: number; lastPostId?: string } = {}) => {
      setLoadingForYou(true);
      try {
          const posts = await getRecentPosts(options);
          if (options.lastPostId) {
              setForYouPosts(prev => [...prev, ...posts]);
          } else {
              setForYouPosts(posts);
          }
          return posts;
      } catch (error) {
          console.error("Failed to fetch 'For You' posts:", error);
          return [];
      } finally {
          setLoadingForYou(false);
      }
  }, []);

  useEffect(() => {
    if (!hasFetchedInitialForYou) {
        fetchForYouPosts({ limit: 20 });
        setHasFetchedInitialForYou(true);
    }
  }, [hasFetchedInitialForYou, fetchForYouPosts]);


  const showNewForYouPosts = () => {
    setForYouPosts(prev => [...newForYouPosts, ...prev]);
    setNewForYouPosts([]);
  };

  const fetchDiscoverAndBookmarks = useCallback(async () => {
    if (!db) {
        setLoadingDiscover(false);
        return;
    }
    setLoadingDiscover(true);
    try {
        await seedDatabaseIfEmpty();

        getMediaPosts().then(posts => {
          setDiscoverPosts(posts);
          setLoadingDiscover(false);
        });
        
        if (user) {
            const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
            const unsubscribe = onSnapshot(bookmarksRef, (snapshot) => {
                const bookmarkIds = new Set(snapshot.docs.map(doc => doc.id));
                setBookmarkedPostIds(bookmarkIds);
            });
            // Note: In a real app, you'd want to store and call this unsubscribe function on cleanup.
            // For simplicity here, we're not.
        } else {
            setBookmarkedPostIds(new Set());
        }
    } catch (error) {
        console.error("Error fetching discover/bookmark data:", error);
        setLoadingDiscover(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDiscoverAndBookmarks();
  }, [fetchDiscoverAndBookmarks]);


  useEffect(() => {
    if (!db || !user) return;

    // Listen for new posts.
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const postData = change.doc.data();
                const now = new Date();
                const postDate = (postData.createdAt as Timestamp)?.toDate() || now;
                
                // Only count as "new" if posted within last 5 minutes.
                const isRecent = (now.getTime() - postDate.getTime()) < 5 * 60 * 1000;
                
                // Use a functional update to get the most current state of both post arrays.
                setForYouPosts(currentForYouPosts => {
                    setNewForYouPosts(currentNewPosts => {
                        const postExists = currentForYouPosts.some(p => p.id === change.doc.id) || currentNewPosts.some(p => p.id === change.doc.id);
                        
                        if (isRecent && !postExists && postData.authorId !== user.uid) {
                            const newPost: PostType = {
                                id: change.doc.id,
                                ...postData,
                                timestamp: formatTimestamp(postDate),
                                createdAt: postDate.toISOString()
                            } as PostType;
                            
                            return [newPost, ...currentNewPosts];
                        }
                        
                        // Return the state unmodified if no new post should be added.
                        return currentNewPosts;
                    });
                     // Return the state unmodified for the `forYouPosts` state.
                    return currentForYouPosts;
                });
            }
        });
    });

    return () => unsubscribe();
  }, [user]);


  const addPost = async ({ text, media, poll, location, tribeId, communityId }: { text: string; media: Media[]; poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }): Promise<PostType | undefined> => {
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
        
        const postDataForDb = {
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
          ...(poll && { poll }),
          ...(location && { location }),
          ...(tribeId && { tribeId }),
          ...(communityId && { communityId }),
        };

        const docRef = await addDoc(collection(db, "posts"), postDataForDb);

        if (text) {
            extractPostTopics({ content: text })
                .then(async ({ topics }) => {
                    if (!db) return;
                    const topicsCollectionRef = collection(db, 'topics');
                    const batch = writeBatch(db);
                    for (const topic of topics) {
                        const newTopicRef = doc(topicsCollectionRef);
                        batch.set(newTopicRef, {
                            topic: topic.toLowerCase(),
                            createdAt: serverTimestamp(),
                        });
                    }
                    await batch.commit();
                })
                .catch(error => {
                    console.error("Background topic extraction failed:", error);
                });
        }
        
        const createdAt = new Date();
        const newPost: PostType = {
          id: docRef.id,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous User',
          authorHandle: user.email?.split('@')[0] || 'user',
          authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
          content: text,
          timestamp: formatTimestamp(createdAt),
          createdAt: createdAt.toISOString(),
          comments: 0,
          reposts: 0,
          likes: 0,
          views: 0,
          media: mediaUrls,
          ...(poll && { poll }),
          ...(location && { location }),
          ...(tribeId && { tribeId }),
          ...(communityId && { communityId }),
        };

        return newPost;
    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
  };

  const editPost = async (postId: string, data: { text: string }) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { content: data.text });
    
    const updater = (posts: PostType[]) => posts.map(p => p.id === postId ? { ...p, content: data.text } : p)
    setForYouPosts(updater);
    setDiscoverPosts(updater);
  };

  const deletePost = async (postId: string) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);

    const updater = (posts: PostType[]) => posts.filter(p => p.id !== postId)
    setForYouPosts(updater);
    setDiscoverPosts(updater);
  };

  const addVote = async (postId: string, choiceIndex: number) => {
    if (!db) throw new Error("Firestore not initialized");

    const postRef = doc(db, "posts", postId);

    const updater = (posts: PostType[]) =>
      posts.map(p => {
        if (p.id === postId && p.poll) {
          const newChoices = p.poll.choices.map((choice, index) => 
            index === choiceIndex ? { ...choice, votes: choice.votes + 1 } : choice
          );
          return { ...p, poll: { ...p.poll, choices: newChoices } };
        }
        return p;
      });

    setForYouPosts(updater);
    setDiscoverPosts(updater);

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Document does not exist!";
        }
        
        const postData = postDoc.data();
        const currentChoices = postData.poll?.choices || [];
        
        const newChoices = currentChoices.map((choice: { text: string, votes: number }, index: number) => {
          if (index === choiceIndex) {
            return { ...choice, votes: choice.votes + 1 };
          }
          return choice;
        });

        transaction.update(postRef, { "poll.choices": newChoices });
      });
    } catch (error) {
      console.error("Failed to update vote in Firestore:", error);
      // Re-fetch all data on error to ensure consistency
      fetchDiscoverAndBookmarks();
    }
  };

  const addComment = async (postId: string, data: { text: string; media: ReplyMedia[] }) => {
    if (!user || !db || !storage) {
        throw new Error("User not authenticated or Firebase not initialized.");
    }
    const { text, media } = data;
    const postRef = doc(db, 'posts', postId);
    const commentsCollectionRef = collection(postRef, 'comments');

    const mediaUrls = [];
    for (const m of media) {
        const fileName = `${user.uid}-comment-${Date.now()}-${m.file.name}`;
        const storagePath = `comments/${postId}/${fileName}`;
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, m.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        mediaUrls.push({ url: downloadURL, type: m.type, hint: 'user uploaded reply' });
    }

    const commentData = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous User',
        authorHandle: user.email?.split('@')[0] || 'user',
        authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
        content: text,
        media: mediaUrls,
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
        
        const updater = (posts: PostType[]) => posts.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p);
        setForYouPosts(updater);
        setDiscoverPosts(updater);
        
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
                    postContentSnippet: text.substring(0, 50),
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
            
            const newLikeCount = postDoc.data().likes + (isLiked ? -1 : 1);
            transaction.update(postRef, { likes: Math.max(0, newLikeCount) });
            
            if (isLiked) {
                transaction.delete(likeRef);
            } else {
                transaction.set(likeRef, { createdAt: serverTimestamp() });
            }
        });

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
        } else {
            await setDoc(bookmarkRef, { createdAt: serverTimestamp() });
        }
    } catch (error) {
        console.error("Error updating bookmark:", error);
    }
  };

  const value = {
      forYouPosts,
      setForYouPosts,
      discoverPosts,
      newForYouPosts,
      showNewForYouPosts,
      addPost,
      editPost,
      deletePost,
      addVote,
      addComment,
      likePost,
      repostPost,
      bookmarkPost,
      bookmarkedPostIds,
      loadingForYou,
      setLoadingForYou,
      loadingDiscover,
      fetchForYouPosts,
  };

  return (
    <PostContext.Provider value={value}>
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
