
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { PostType } from '@/lib/data';
import type { Media } from '@/components/create-post';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, type Timestamp, doc, updateDoc, runTransaction, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatTimestamp } from '@/lib/utils';

type PostContextType = {
  posts: PostType[];
  addPost: (data: { text: string; media: Media[], poll?: PostType['poll'] }) => Promise<void>;
  editPost: (postId: string, data: { text: string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addVote: (postId: string, choiceIndex: number) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  likePost: (postId: string, isLiked: boolean) => Promise<void>;
  repostPost: (postId: string, isReposted: boolean) => Promise<void>;
  loading: boolean;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'posts'));
            const querySnapshot = await getDocs(q);

            const docsWithData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            
            docsWithData.sort((a, b) => {
                const aDate = (a.createdAt as Timestamp)?.toDate() || new Date(0);
                const bDate = (b.createdAt as Timestamp)?.toDate() || new Date(0);
                return bDate.getTime() - aDate.getTime();
            });
    
            const postsData = docsWithData.map(data => {
                const createdAt = (data.createdAt as Timestamp)?.toDate();
                return {
                    id: data.id,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    authorHandle: data.authorHandle,
                    authorAvatar: data.authorAvatar,
                    content: data.content,
                    comments: data.comments,
                    reposts: data.reposts,
                    likes: data.likes,
                    media: data.media,
                    poll: data.poll,
                    timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
                } as PostType;
            });
    
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchPosts();
  }, [user]);

  const addPost = async ({ text, media, poll }: { text: string; media: Media[]; poll?: PostType['poll'] }) => {
    if (!user || !db || !storage) {
        throw new Error("Cannot add post: user not logged in or Firebase not configured.");
    }

    const mediaUrls = await Promise.all(
        media.map(async (m) => {
            const fileName = crypto.randomUUID();
            const mediaRef = ref(storage, `posts/${user.uid}/${fileName}`);
            const response = await fetch(m.url);
            const blob = await response.blob();

            await uploadBytes(mediaRef, blob, { contentType: blob.type });
            const downloadURL = await getDownloadURL(mediaRef);
            return { url: downloadURL, type: m.type, hint: 'user uploaded content' };
        })
    );

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
      media: mediaUrls,
    };

    if (poll) {
        postData.poll = poll;
    }

    const docRef = await addDoc(collection(db, "posts"), postData);

    const newPost: PostType = {
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
        media: postData.media,
        poll: postData.poll,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
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

    // Optimistically update the UI
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

    // Update in Firestore using a transaction for safety
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
      // Revert the optimistic update on failure
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
            
            // 1. Update the post's comment count
            transaction.update(postRef, { comments: newCommentCount });

            // 2. Add the new comment document
            const newCommentRef = doc(commentsCollectionRef);
            transaction.set(newCommentRef, commentData);
        });
        
        // Optimistically update the UI
        setPosts(posts => posts.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
        
    } catch (e) {
        console.error("Error adding comment: ", e);
        throw new Error("Could not post comment.");
    }
  };

  const likePost = async (postId: string, isLiked: boolean) => {
    if (!db) return;
    const postRef = doc(db, "posts", postId);
    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Document does not exist!";
        }
        const newLikes = postDoc.data().likes + (isLiked ? -1 : 1);
        transaction.update(postRef, { likes: newLikes < 0 ? 0 : newLikes });
      });
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

  return (
    <PostContext.Provider value={{ posts, addPost, editPost, deletePost, addVote, addComment, likePost, repostPost, loading }}>
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
