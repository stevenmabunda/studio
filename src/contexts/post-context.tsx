

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
import type { ReplyMedia } from '@/components/create-comment';
import { getRecentPosts, getVideoPosts } from '@/app/(app)/home/actions';

type PostContextType = {
  forYouPosts: PostType[];
  setForYouPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
  newForYouPosts: PostType[];
  showNewForYouPosts: () => void;
  addPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }) => Promise<PostType | null>;
  editPost: (postId: string, data: { text:string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addVote: (postId: string, choiceIndex: number) => Promise<void>;
  addComment: (postId: string, data: { text: string; media: ReplyMedia[] }) => Promise<boolean | null>;
  likePost: (postId: string, isLiked: boolean) => Promise<void>;
  likeComment: (postId: string, commentId: string, isLiked: boolean) => Promise<void>;
  repostPost: (postId: string, isReposted: boolean) => Promise<void>;
  bookmarkPost: (postId: string, isBookmarked: boolean) => Promise<void>;
  bookmarkedPostIds: Set<string>;
  loadingForYou: boolean;
  setLoadingForYou: React.Dispatch<React.SetStateAction<boolean>>;
  fetchForYouPosts: (options?: { limit?: number; lastPostId?: string }) => Promise<PostType[]>;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

// Simple keyword extraction logic
const commonStopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);

function extractKeywords(text: string): string[] {
  if (!text) return [];

  const topics = new Set<string>();
  const phraseWords = new Set<string>();

  // 1. Find and add multi-word capitalized phrases first.
  const capitalizedPhrases = text.match(/\b([A-Z][a-z']*\s*){2,}/g) || [];
  capitalizedPhrases.forEach(phrase => {
    const trimmedPhrase = phrase.trim().toLowerCase();
    topics.add(trimmedPhrase);
    // Keep track of the individual words that make up these phrases.
    trimmedPhrase.split(/\s+/).forEach(word => phraseWords.add(word));
  });

  // 2. Process the whole text for hashtags and single words.
  const allWords = text.replace(/[.,!?:;()"']/g, '').split(/\s+/);
  allWords.forEach(word => {
    // Add hashtags
    if (word.startsWith('#')) {
      topics.add(word.substring(1).toLowerCase());
      return;
    }
    
    const lowerWord = word.toLowerCase();

    // 3. Add single words ONLY if they are not part of an already added phrase.
    if (!commonStopWords.has(lowerWord) && lowerWord.length > 2 && !phraseWords.has(lowerWord)) {
      topics.add(lowerWord);
    }
  });

  return Array.from(topics);
}

// Function to get image dimensions
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};

export function PostProvider({ children }: { children: ReactNode }) {
  const [forYouPosts, setForYouPosts] = useState<PostType[]>([]);
  const [newForYouPosts, setNewForYouPosts] = useState<PostType[]>([]);
  
  const [loadingForYou, setLoadingForYou] = useState(true);

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

  const fetchBookmarks = useCallback(async () => {
    if (!db || !user) {
        setBookmarkedPostIds(new Set());
        return;
    };
    
    const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
    const unsubscribe = onSnapshot(bookmarksRef, (snapshot) => {
        const bookmarkIds = new Set(snapshot.docs.map(doc => doc.id));
        setBookmarkedPostIds(bookmarkIds);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubPromise = fetchBookmarks();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    }
  }, [fetchBookmarks]);


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
                        const postExistsInMainFeed = currentForYouPosts.some(p => p.id === change.doc.id);
                        const postExistsInNewFeed = currentNewPosts.some(p => p.id === change.doc.id);
                        const postExists = postExistsInMainFeed || postExistsInNewFeed;
                        
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


  const addPost = async ({ text, media, poll, location, tribeId, communityId }: { text: string; media: Media[]; poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }): Promise<PostType | null> => {
    if (!user || !db || !storage) {
        throw new Error("Cannot add post: user not logged in or Firebase not configured.");
    }
    
    // Optimistic UI update
    const createdAt = new Date();
    const tempId = `temp_${Date.now()}`;
    const optimisticPost: PostType = {
      id: tempId,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous User',
      authorHandle: user.email?.split('@')[0] || 'user',
      authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
      content: text,
      timestamp: formatTimestamp(createdAt),
      createdAt: createdAt.toISOString(),
      comments: 0, reposts: 0, likes: 0, views: 0,
      media: media.map(m => ({ url: m.previewUrl, type: m.type, hint: 'user uploaded content' })),
      ...(poll && { poll }),
      ...(location && { location }),
      ...(tribeId && { tribeId }),
      ...(communityId && { communityId }),
    };
    setForYouPosts(prev => [optimisticPost, ...prev]);

    try {
        const mediaUploads = await Promise.all(media.map(async (m) => {
            const fileName = `${user.uid}-${Date.now()}-${m.file.name}`;
            const storagePath = `posts/${user.uid}/${fileName}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, m.file);
            const downloadURL = await getDownloadURL(storageRef);

            const baseMediaData = { 
              url: downloadURL, 
              type: m.type, 
              hint: 'user uploaded content' 
            };

            if (m.type === 'image') {
              const { width, height } = await getImageDimensions(m.file);
              return { ...baseMediaData, width, height };
            }

            return baseMediaData;
        }));
        
        const postDataForDb = {
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous User',
          authorHandle: user.email?.split('@')[0] || 'user',
          authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
          content: text,
          createdAt: serverTimestamp(),
          comments: 0, reposts: 0, likes: 0, views: 0,
          media: mediaUploads,
          ...(poll && { poll }),
          ...(location && { location }),
          ...(tribeId && { tribeId }),
          ...(communityId && { communityId }),
        };

        const docRef = await addDoc(collection(db, "posts"), postDataForDb);

        const finalPost = { ...optimisticPost, id: docRef.id, media: mediaUploads };

        // Update the optimistic post with the real ID and data
        setForYouPosts(prev => prev.map(p => p.id === tempId ? finalPost : p));

        // Extract and log keywords in the background.
        if (text) {
          const topics = extractKeywords(text);
          if (topics.length > 0 && db) {
            const topicsCollectionRef = collection(db, 'topics');
            const batch = writeBatch(db);
            for (const topic of topics) {
              const newTopicRef = doc(topicsCollectionRef);
              batch.set(newTopicRef, { topic: topic, createdAt: serverTimestamp() });
            }
            batch.commit().catch(err => console.error("Failed to write topics", err));
          }
        }
        return finalPost;
    } catch (error) {
        console.error("Failed to create post:", error);
        // Revert optimistic update on failure
        setForYouPosts(prev => prev.filter(p => p.id !== tempId));
        throw error;
    }
  };

  const editPost = async (postId: string, data: { text: string }) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { content: data.text });
    
    const updater = (posts: PostType[]) => posts.map(p => p.id === postId ? { ...p, content: data.text } : p)
    setForYouPosts(updater);
  };

  const deletePost = async (postId: string) => {
    if (!db || !user) throw new Error("Not authorized or db not available");
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);

    const updater = (posts: PostType[]) => posts.filter(p => p.id !== postId)
    setForYouPosts(updater);
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

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) throw "Document does not exist!";
        
        const postData = postDoc.data();
        const currentChoices = postData.poll?.choices || [];
        
        const newChoices = currentChoices.map((choice: { text: string, votes: number }, index: number) => 
            index === choiceIndex ? { ...choice, votes: choice.votes + 1 } : choice
        );

        transaction.update(postRef, { "poll.choices": newChoices });
      });
    } catch (error) {
      console.error("Failed to update vote in Firestore:", error);
      fetchForYouPosts();
    }
  };

  const addComment = async (postId: string, data: { text: string; media: ReplyMedia[] }): Promise<boolean | null> => {
    if (!user || !db || !storage) {
        throw new Error("User not authenticated or Firebase not initialized.");
    }
    const { text, media } = data;
    
    try {
        const postRef = doc(db, 'posts', postId);
        const commentsCollectionRef = collection(postRef, 'comments');

        const mediaUploads = await Promise.all(media.map(async (m) => {
            const { width, height } = m.type === 'image' ? await getImageDimensions(m.file) : { width: undefined, height: undefined };
            const fileName = `${user.uid}-comment-${Date.now()}-${m.file.name}`;
            const storagePath = `comments/${postId}/${fileName}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, m.file);
            const downloadURL = await getDownloadURL(storageRef);
            return { url: downloadURL, type: m.type, width, height, hint: 'user uploaded reply' };
        }));

        const commentData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous User',
            authorHandle: user.email?.split('@')[0] || 'user',
            authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
            content: text,
            media: mediaUploads,
            createdAt: serverTimestamp(),
            likes: 0,
            reposts: 0,
            comments: 0
        };

        const postDocBeforeUpdate = await getDoc(postRef);
        const currentComments = postDocBeforeUpdate.data()?.comments || 0;

        await addDoc(commentsCollectionRef, commentData);
        await updateDoc(postRef, { comments: currentComments + 1 });
        
        setForYouPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
        
        // Notify author
        const postAuthorId = postDocBeforeUpdate.data()?.authorId;
        if (user.uid !== postAuthorId) {
            const notificationRef = collection(db, 'users', postAuthorId, 'notifications');
            addDoc(notificationRef, {
                type: 'comment', fromUserId: user.uid, fromUserName: user.displayName || 'User',
                fromUserAvatar: user.photoURL || 'https://placehold.co/40x40.png',
                postId: postId, postContentSnippet: text.substring(0, 50),
                createdAt: serverTimestamp(), read: false,
            });
        }
        
        return true;

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
            if (!postDoc.exists()) throw "Post does not exist!";
            
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
                        type: 'like', fromUserId: user.uid, fromUserName: user.displayName || 'User',
                        fromUserAvatar: user.photoURL || 'https://placehold.co/40x40.png',
                        postId: postId, postContentSnippet: (postData.content || '').substring(0, 50),
                        createdAt: serverTimestamp(), read: false,
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error updating likes:", error);
    }
  };
  
  const likeComment = async (postId: string, commentId: string, isLiked: boolean) => {
    if (!db || !user) return;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    // Note: We don't track user 'likes' on comments to keep it simple.

    try {
        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) throw "Comment does not exist!";
            
            const newLikeCount = (commentDoc.data().likes || 0) + (isLiked ? -1 : 1);
            transaction.update(commentRef, { likes: Math.max(0, newLikeCount) });
        });
    } catch (error) {
        console.error("Error updating comment likes:", error);
    }
  };

  const repostPost = async (postId: string, isReposted: boolean) => {
    if (!db) return;
    const postRef = doc(db, "posts", postId);
    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) throw "Document does not exist!";
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
      newForYouPosts,
      showNewForYouPosts,
      addPost,
      editPost,
      deletePost,
      addVote,
      addComment,
      likePost,
      likeComment,
      repostPost,
      bookmarkPost,
      bookmarkedPostIds,
      loadingForYou,
      setLoadingForYou,
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

    
