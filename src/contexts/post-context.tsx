
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
import { getFollowingPosts } from '@/app/(app)/home/actions';
import { getMostViewedPosts } from '@/app/(app)/discover/actions';

type PostContextType = {
  forYouPosts: PostType[];
  discoverPosts: PostType[];
  newForYouPosts: PostType[];
  showNewForYouPosts: () => void;
  addPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }) => Promise<PostType | null>;
  editPost: (postId: string, data: { text:string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addVote: (postId: string, choiceIndex: number) => Promise<void>;
  addComment: (postId: string, data: { text: string; media: ReplyMedia[] }) => Promise<void>;
  likePost: (postId: string, isLiked: boolean) => Promise<void>;
  repostPost: (postId: string, isReposted: boolean) => Promise<void>;
  bookmarkPost: (postId: string, isBookmarked: boolean) => Promise<void>;
  bookmarkedPostIds: Set<string>;
  loadingForYou: boolean;
  loadingDiscover: boolean;
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

  const showNewForYouPosts = () => {
    setForYouPosts(prev => [...newForYouPosts, ...prev]);
    setDiscoverPosts(prev => [...newForYouPosts, ...prev]);
    setNewForYouPosts([]);
  };

  const fetchAllData = useCallback(async () => {
      if (!db) {
          setLoadingForYou(false);
          setLoadingDiscover(false);
          return;
      }
      setLoadingForYou(true);
      setLoadingDiscover(true);
      
      try {
          await seedDatabaseIfEmpty();

          getMostViewedPosts().then(posts => {
            setDiscoverPosts(posts);
            // For now, For You is the same as Discover
            setForYouPosts(posts);
            setLoadingDiscover(false);
            setLoadingForYou(false);
          });
          
          if (user) {
              const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
              getDocs(bookmarksRef).then(bookmarksSnapshot => {
                  const bookmarkIds = new Set(bookmarksSnapshot.docs.map(doc => doc.id));
                  setBookmarkedPostIds(bookmarkIds);
              });
          } else {
              setBookmarkedPostIds(new Set());
          }
      } catch (error) {
          console.error("Error fetching initial data:", error);
          setLoadingForYou(false);
          setLoadingDiscover(false);
      }
  }, [user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!db) return;

    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const newPosts: PostType[] = [];
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const postData = change.doc.data();
                // Ensure post is not from the current user and not already in any list
                const isOwnPost = user && postData.authorId === user.uid;
                
                // Check if the post already exists in either the main feed or the new posts notification
                const postExists = forYouPosts.some(p => p.id === change.doc.id) || newForYouPosts.some(p => p.id === change.doc.id);

                if (!isOwnPost && !postExists) {
                    const createdAt = (postData.createdAt as Timestamp)?.toDate();
                    newPosts.push({
                        id: change.doc.id,
                        ...postData,
                        timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
                        createdAt: createdAt?.toISOString()
                    } as PostType);
                }
            }
        });
        
        if (newPosts.length > 0) {
            setNewForYouPosts(prev => [...newPosts, ...prev]);
        }
    });

    return () => unsubscribe();
}, [forYouPosts, newForYouPosts, user]);


  const addPost = async ({ text, media, poll, location, tribeId, communityId }: { text: string; media: Media[]; poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }): Promise<PostType | null> => {
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
        if (tribeId) {
            postData.tribeId = tribeId;
        }
        if (communityId) {
            postData.communityId = communityId;
        }
        
        // The real-time listener will now be the single source of truth for adding posts.
        const docRef = await addDoc(collection(db, "posts"), postData);

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
        
        // Return null as we are relying on the listener to update state.
        return null;

    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
  };

  const editPost = async (postId: string, data: { text: string }) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { content: data.text });
    setForYouPosts(posts => posts.map(p => p.id === postId ? { ...p, content: data.text } : p));
    setDiscoverPosts(posts => posts.map(p => p.id === postId ? { ...p, content: data.text } : p));
  };

  const deletePost = async (postId: string) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    setForYouPosts(posts => posts.filter(p => p.id !== postId));
    setDiscoverPosts(posts => posts.filter(p => p.id !== postId));
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
      fetchAllData();
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
            
            if (isLiked) {
                const newLikes = Math.max(0, postDoc.data().likes - 1);
                transaction.update(postRef, { likes: newLikes });
                transaction.delete(likeRef);
            } else {
                const newLikes = postDoc.data().likes + 1;
                transaction.update(postRef, { likes: newLikes });
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

  const value = {
      forYouPosts,
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
      loadingDiscover,
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
