
'use server';

import {
  generateTrendingTopics,
  type GenerateTrendingTopicsOutput,
} from '@/ai/flows/generate-trending-topics';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';


export async function getTrendingTopics(
  // @ts-ignore - next doesn't like passing objects with optional props through server actions

  input: { numberOfTopics?: number } 
): Promise<GenerateTrendingTopicsOutput> {
  if (!db) {
    console.error("Firestore not initialized, returning empty topics.");
    return { topics: [] };
  }
  
  const numberOfTopicsToGenerate = input.numberOfTopics || 5;

  // 1. Fetch all topics from the last 24 hours
  const topicsRef = collection(db, 'topics');
  const twentyFourHoursAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const q = query(topicsRef, where('createdAt', '>=', twentyFourHoursAgo));
  const querySnapshot = await getDocs(q);

  const recentTopics = querySnapshot.docs.map(doc => doc.data().topic as string);

  if (recentTopics.length === 0) {
    return { topics: [] };
  }
  
  // 2. Count occurrences of each topic
  const topicCounts = recentTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Get topics mentioned at least 3 times, then sort by popularity
  const popularTopics = Object.entries(topicCounts)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a)
    .map(([topic]) => topic);
  
  const topicsToGenerate = popularTopics.slice(0, numberOfTopicsToGenerate);

  // 4. If no topics meet the threshold, return empty.
  if (topicsToGenerate.length === 0) {
    return { topics: [] };
  }

  // 5. Generate headlines from these real, filtered topics
  const maxRetries = 3;
  const retryDelayMs = 1000;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Pass the accurate counts to the AI for context
      const topicsWithCounts = topicsToGenerate.map(topic => `${topic} (${topicCounts[topic]} posts)`);
      return await generateTrendingTopics({ topics: topicsWithCounts });
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed to generate trending topics:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw new Error(`Failed to generate trending topics after ${maxRetries} retries: ${lastError}`);
}

export type TrendingKeyword = {
  topic: string;
  category: string;
  postCount: string;
};

// This function now provides accurate, filtered data
export async function getTrendingKeywords(
  input: { numberOfTopics?: number }
): Promise<TrendingKeyword[]> {
  if (!db) {
    console.error("Firestore not initialized, returning empty topics.");
    return [];
  }

  const numberOfTopicsToFetch = input.numberOfTopics || 5;

  const topicsRef = collection(db, 'topics');
  const twentyFourHoursAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const q = query(topicsRef, where('createdAt', '>=', twentyFourHoursAgo));
  const querySnapshot = await getDocs(q);

  const recentTopics = querySnapshot.docs.map(doc => doc.data().topic as string);

  if (recentTopics.length === 0) {
    return [];
  }

  const topicCounts = recentTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter for topics mentioned at least 3 times and sort
  const popularTopics = Object.entries(topicCounts)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, numberOfTopicsToFetch)
    .map(([topic, count]) => ({
      // Capitalize words for display
      topic: topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: 'Football · Trending',
      // Use the accurate count
      postCount: `${count.toLocaleString()} ${count === 1 ? 'post' : 'posts'}`
    }));

  return popularTopics;
}
