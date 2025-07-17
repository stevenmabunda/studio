
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

  // 1. Fetch all topics and filter in code to be more robust
  const topicsRef = collection(db, 'topics');
  const querySnapshot = await getDocs(topicsRef);

  // 2. Filter for topics from the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTopics = querySnapshot.docs
    .map(doc => {
        const data = doc.data();
        // Ensure createdAt exists and is a Timestamp before converting
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            return {
                topic: data.topic as string,
                createdAt: (data.createdAt as Timestamp).toDate()
            }
        }
        return null;
    })
    .filter((item): item is { topic: string, createdAt: Date } => {
        if (!item) return false;
        return item.createdAt >= twentyFourHoursAgo;
    })
    .map(item => item.topic);

  
  let topicsToGenerate: string[] = [];

  if (recentTopics.length > 0) {
    // 3. Count occurrences of each topic
    const topicCounts = recentTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 4. Get topics mentioned at least 3 times, then take the top N
    const popularTopics = Object.entries(topicCounts)
      .filter(([, count]) => count >= 3)
      .sort(([, a], [, b]) => b - a) // Sort by most popular
      .map(([topic]) => topic);
    
    topicsToGenerate = popularTopics.slice(0, numberOfTopicsToGenerate);
  }
  
  // 5. If no topics meet the threshold, use a fallback list with current news.
  if (topicsToGenerate.length === 0) {
    topicsToGenerate = [
      'Teboho Mokoena R100m PSV offer',
      'premier league winners',
      'champions league final',
      'mbappe transfer',
      'el clasico highlights',
    ];
  }

  // 6. Generate headlines from these topics
  const maxRetries = 3;
  const retryDelayMs = 1000; // 1 second
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateTrendingTopics({ topics: topicsToGenerate });
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

// New function to get raw keywords without AI generation.
export async function getTrendingKeywords(
  input: { numberOfTopics?: number }
): Promise<TrendingKeyword[]> {
  if (!db) {
    console.error("Firestore not initialized, returning empty topics.");
    return [];
  }

  const numberOfTopicsToFetch = input.numberOfTopics || 5;

  const topicsRef = collection(db, 'topics');
  const querySnapshot = await getDocs(topicsRef);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentTopics = querySnapshot.docs
    .map(doc => {
      const data = doc.data();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        return {
          topic: data.topic as string,
          createdAt: (data.createdAt as Timestamp).toDate()
        };
      }
      return null;
    })
    .filter((item): item is { topic: string, createdAt: Date } => {
      if (!item) return false;
      return item.createdAt >= oneWeekAgo;
    })
    .map(item => item.topic);

  if (recentTopics.length === 0) {
    return [
      { topic: 'Kaizer Chiefs', category: 'Football', postCount: '12.1K posts' },
      { topic: 'Orlando Pirates', category: 'Football', postCount: '10.8K posts' },
      { topic: 'VAR', category: 'Football', postCount: '9.3K posts' },
      { topic: 'AFCON', category: 'Football', postCount: '7.5K posts' },
      { topic: '#TransferNews', category: 'Football', postCount: '5.2K posts' },
    ];
  }

  const topicCounts = recentTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, numberOfTopicsToFetch)
    .map(([topic, count]) => ({
      topic: topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // Capitalize words
      category: 'Football · Trending',
      postCount: `${(count * 15).toLocaleString()} posts` // Make up a post count
    }));

  return popularTopics;
}
