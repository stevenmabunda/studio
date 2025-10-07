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
import { getRecentPosts } from '@/app/(app)/home/actions';

type PostContextType = {
  forYouPosts: PostType[];
  newForYouPosts: PostType[];
  loadingForYou: boolean;
  showNewForYouPosts: () => void;
  addPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string }) => Promise<PostType | null>;
  editPost: (postId: string, data: { text:string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addVote: (postId: string, choiceIndex: number) => Promise<void>;
  addComment: (postId: string, data: { text: string; media: ReplyMedia[] }) => Promise<boolean | null>;
  likePost: (postId: string, currentlyLiked: boolean) => Promise<void>;
  likeComment: (postId: string, commentId: string, isUnlike: boolean) => Promise<void>;
  repostPost: (postId: string, isReposted: boolean) => Promise<void>;
  bookmarkPost: (postId: string, isBookmarked: boolean) => Promise<void>;
  bookmarkedPostIds: Set<string>;
  likedPostIds: Set<string>;
  fetchForYouPosts: (options?: { limit?: number; lastPostId?: string }) => Promise<PostType[]>;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

const commonStopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);

function extractKeywords(text: string): string[] {
  if (!text) return [];

  const topics = new Set<string>();
  const phraseWords = new Set<string>();

  const capitalizedPhrases = text.match(/\b([A-Z][a-z']*\s*){2,}/g) || [];
  capitalizedPhrases.forEach(phrase => {
    const trimmedPhrase = phrase.trim().toLowerCase();
    topics.add(trimmedPhrase);
    trimmedPhrase.split(/\s+/).forEach(word => phraseWords.add(word));
  });

  const allWords = text.replace(/[.,!?:;()"']/g, '').split(/\s+/);
  allWords.forEach(word => {
    if (word.startsWith('#')) {
      topics.add(word.substring(1).toLowerCase());
      return;
    }
    
    const lowerWord = word.toLowerCase();

    if (!commonStopWords.has(lowerWord) && lowerWord.length > 2 && !phraseWords.has(lowerWord)) {
      topics.add(lowerWord);
    }
  });

  return Array.from(topics);
}

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
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [prefetchedPosts, setPrefetchedPosts] = useState<PostType[]>([]);

  const fetchForYouPosts = useCallback(async (options: { limit?: number; lastPostId?: string } = {}) => {
      if (!options.lastPostId) setLoadingForYou(true);
      try {
          if (options.lastPostId && prefetchedPosts.length > 0) {
              const postsToAppend = [...prefetchedPosts];
              setForYouPosts(prev => [...prev, ...postsToAppend]);
              setPrefetchedPosts([]); 
              
              if (postsToAppend.length > 0) {
                  getRecentPosts({ limit: 20, lastPostId: postsToAppend[postsToAppend.length - 1].id }).then(newPrefetchedPosts => {
                      setPrefetchedPosts(newPrefetchedPosts);
                  });
              }
              return postsToAppend;
          }

          const posts = await getRecentPosts(options);
          if (options.lastPostId) {
              setForYouPosts(prev => [...prev, ...posts]);
          } else {
              setForYouPosts(posts);
              if (posts.length > 0) {
                   getRecentPosts({ limit: 20, lastPostId: posts[posts.length - 1].id }).then(newPrefetchedPosts => {
                      setPrefetchedPosts(newPrefetchedPosts);
                  });
              }
          }
          return posts;
      } catch (error) {
          console.error("Failed to fetch 'For You' posts:", error);
          return [];
      } finally {
          setLoadingForYou(false);
      }
  }, [prefetchedPosts]);


  useEffect(() => {
    if (!hasFetchedInitial) {
        fetchForYouPosts({ limit: 20 });
        setHasFetchedInitial(true);
    }
  }, [hasFetchedInitial, fetchForYouPosts]);


  const showNewForYouPosts = () => {
    setForYouPosts(prev => [...newForYouPosts, ...prev]);
    setNewForYouPosts([]);
  };

  useEffect(() => {
    if (!db || !user) {
        setBookmarkedPostIds(new Set());
        setLikedPostIds(new Set());
        return;
    }
    
    const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
    const unsubBookmarks = onSnapshot(bookmarksRef, (snapshot) => {
        const ids = new Set(snapshot.docs.map(doc => doc.id));
        setBookmarkedPostIds(ids);
    });

    const likesRef = collection(db, 'users', user.uid, 'likes');
    const unsubLikes = onSnapshot(likesRef, (snapshot) => {
        const ids = new Set(snapshot.docs.map(doc => doc.id));
        setLikedPostIds(ids);
    });

    return () => {
        unsubBookmarks();
        unsubLikes();
    };
  }, [user]);


  useEffect(() => {
    if (!db || !user) return;

    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const postData = change.doc.data();
                const now = new Date();
                const postDate = (postData.createdAt as Timestamp)?.toDate() || now;
                const isRecent = (now.getTime() - postDate.getTime()) < 5 * 60 * 1000;
                
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
                        return currentNewPosts;
                    });
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
    
    const createdAt = new Date();
    
    const postDataForDb: any = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous User',
        authorHandle: user.email?.split('@')[0] || 'user',
        authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
        content: text,
        createdAt: serverTimestamp(),
        comments: 0, reposts: 0, likes: 0, views: 0,
        media: [], // Start with empty media
        ...(poll && { poll }),
        ...(location && { location }),
        ...(tribeId && { tribeId }),
        ...(communityId && { communityId }),
    };

    const docRef = await addDoc(collection(db, "posts"), postDataForDb);
    
    const optimisticPost: PostType = {
      id: docRef.id,
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

    // Don't wait for uploads to finish, UI updates optimistically
    const uploadPromises = media.map(async (m) => {
        if (m.type === 'gif' || m.type === 'sticker') {
            return { url: m.url, type: m.type, width: m.width, height: m.height, hint: 'giphy content' };
        }
        const fileName = `${user.uid}-${Date.now()}-${m.file.name}`;
        const storagePath = `posts/${user.uid}/${fileName}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, m.file);
        const downloadURL = await getDownloadURL(storageRef);
        const baseMediaData = { url: downloadURL, type: m.type, hint: 'user uploaded content' };
        
        if (m.type === 'image') {
            const { width, height } = await getImageDimensions(m.file);
            return { ...baseMediaData, width, height };
        }
        return baseMediaData;
    });

    // After all uploads complete, update the document
    Promise.all(uploadPromises).then(mediaUploads => {
        updateDoc(docRef, { media: mediaUploads });
        const finalPost = { ...optimisticPost, media: mediaUploads };
        setForYouPosts(prev => prev.map(p => p.id === optimisticPost.id ? finalPost : p));
    }).catch(uploadError => {
        console.error("Error during media upload, post created without media:", uploadError);
        // Optionally update the post to indicate failed media upload
    });

    if (text) {
      const topics = extractKeywords(text);
      if (topics.length > 0 && db) {
        const topicsCollectionRef = collection(db, 'topics');
        const batch = writeBatch(db);
        topics.forEach(topic => batch.set(doc(topicsCollectionRef), { topic, createdAt: serverTimestamp() }));
        await batch.commit();
      }
    }
    
    const finalPost = { ...optimisticPost, id: docRef.id };
    return finalPost;
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
    await deleteDoc(doc(db, 'posts', postId));

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
    if (!user || !db || !storage) throw new Error("User not authenticated or Firebase not initialized.");
    
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
            authorId: user.uid, authorName: user.displayName || 'Anonymous User',
            authorHandle: user.email?.split('@')[0] || 'user',
            authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
            content: text, media: mediaUploads, createdAt: serverTimestamp(),
            likes: 0, reposts: 0, comments: 0
        };

        const postDoc = await getDoc(postRef);
        await addDoc(commentsCollectionRef, commentData);
        await updateDoc(postRef, { comments: (postDoc.data()?.comments || 0) + 1 });
        
        const updater = (posts: PostType[]) => posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p);
        setForYouPosts(updater);
        
        const postAuthorId = postDoc.data()?.authorId;
        if (user.uid !== postAuthorId) {
            await addDoc(collection(db, 'users', postAuthorId, 'notifications'), {
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

  const likePost = async (postId: string, currentlyLiked: boolean) => {
    if (!db || !user) return;

    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, 'users', user.uid, 'likes', postId);
    const shouldUnlike = currentlyLiked;

    const updater = (posts: PostType[]) => posts.map(p => 
        p.id === postId 
        ? { ...p, likes: p.likes + (shouldUnlike ? -1 : 1) } 
        : p
    );
    setForYouPosts(updater);

    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) throw "Post does not exist!";
            
            const newLikeCount = postDoc.data().likes + (shouldUnlike ? -1 : 1);
            transaction.update(postRef, { likes: Math.max(0, newLikeCount) });
            
            if (shouldUnlike) {
                transaction.delete(likeRef);
            } else {
                transaction.set(likeRef, { createdAt: serverTimestamp() });
            }
        });

        if (!shouldUnlike) {
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                const postData = postDoc.data();
                if (postData?.authorId && user.uid !== postData.authorId) {
                    await addDoc(collection(db, 'users', postData.authorId, 'notifications'), {
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
        const revertUpdater = (posts: PostType[]) => posts.map(p => 
            p.id === postId 
            ? { ...p, likes: p.likes + (shouldUnlike ? 1 : -1) } 
            : p
        );
        setForYouPosts(revertUpdater);
    }
  };
  
  const likeComment = async (postId: string, commentId: string, isUnlike: boolean) => {
    if (!db || !user) return;
    const commentRef = doc(db, "posts", postId, "comments", commentId);

    try {
        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) throw "Comment does not exist!";
            
            const newLikeCount = (commentDoc.data().likes || 0) + (isUnlike ? -1 : 1);
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
        if (isBookmarked) await deleteDoc(bookmarkRef);
        else await setDoc(bookmarkRef, { createdAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating bookmark:", error);
    }
  };

  const value = {
      forYouPosts, newForYouPosts,
      loadingForYou,
      showNewForYouPosts, addPost, editPost, deletePost, addVote,
      addComment, likePost, likeComment, repostPost, bookmarkPost,
      bookmarkedPostIds, likedPostIds,
      fetchForYouPosts
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
