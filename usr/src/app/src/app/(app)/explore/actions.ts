
'use server';

import {
  generateTrendingTopics,
  type GenerateTrendingTopicsOutput,
} from '@/ai/flows/generate-trending-topics';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';


export { generateTrendingTopics, type GenerateTrendingTopicsOutput };

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
  const seventyTwoHoursAgo = Timestamp.fromDate(new Date(Date.now() - 72 * 60 * 60 * 1000));
  const q = query(topicsRef, where('createdAt', '>=', seventyTwoHoursAgo));
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
