'use server';

import { auth, db, storage } from "@/lib/firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import type { StoryType } from "@/lib/data";

export async function addStory(imageDataUri: string): Promise<StoryType> {
  const user = auth?.currentUser;

  if (!user || !db || !storage) {
    throw new Error("User not authenticated or Firebase not initialized.");
  }
  
  const mimeType = imageDataUri.match(/data:(.*);base64,/)?.[1];
  if (!mimeType) {
      throw new Error("Invalid image data URI: MIME type not found.");
  }

  const storyRef = ref(storage, `stories/${user.uid}/${crypto.randomUUID()}`);
  
  const base64Data = imageDataUri.split(',')[1];
  const snapshot = await uploadString(storyRef, base64Data, 'base64', { contentType: mimeType });
  const downloadURL = await getDownloadURL(snapshot.ref);

  const storyData = {
    userId: user.uid,
    username: user.displayName || 'Anonymous',
    avatar: user.photoURL || 'https://placehold.co/64x64.png',
    storyImageUrl: downloadURL,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "stories"), storyData);

  return {
    id: docRef.id,
    userId: storyData.userId,
    username: storyData.username,
    avatar: storyData.avatar,
    storyImageUrl: storyData.storyImageUrl,
  };
}
