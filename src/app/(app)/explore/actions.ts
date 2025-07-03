
'use server';

import {
  generateTrendingTopics,
  type GenerateTrendingTopicsOutput,
} from '@/ai/flows/generate-trending-topics';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

export async function getTrendingTopics(
  input: { numberOfTopics?: number } 
): Promise<GenerateTrendingTopicsOutput> {
  if (!db) {
    console.error("Firestore not initialized, returning empty topics.");
    return { topics: [] };
  }
  
  const numberOfTopicsToGenerate = input.numberOfTopics || 5;

  // 1. Fetch topics from the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const topicsRef = collection(db, 'topics');
  const q = query(topicsRef, where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo)));

  const querySnapshot = await getDocs(q);
  const recentTopics = querySnapshot.docs.map(doc => doc.data().topic as string);
  
  let topicsToGenerate: string[] = [];

  if (recentTopics.length > 0) {
    // 2. Count occurrences of each topic
    const topicCounts = recentTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Get topics mentioned at least 3 times, then take the top N
    const popularTopics = Object.entries(topicCounts)
      .filter(([, count]) => count >= 3)
      .sort(([, a], [, b]) => b - a) // Sort by most popular
      .map(([topic]) => topic);
    
    topicsToGenerate = popularTopics.slice(0, numberOfTopicsToGenerate);
  }
  
  // 4. If no topics meet the threshold, use a fallback list.
  if (topicsToGenerate.length === 0) {
    topicsToGenerate = [
      'messi retirement',
      'premier league winners',
      'champions league final',
      'mbappe transfer',
      'el clasico highlights',
    ];
  }

  // 5. Generate headlines from these topics
  return await generateTrendingTopics({ topics: topicsToGenerate });
}
