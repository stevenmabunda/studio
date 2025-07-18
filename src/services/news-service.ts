'use server';

// IMPORTANT: This file should not be marked with 'use server' if it's just a utility.
// However, since we might call it from server actions, we will keep it consistent.
// The functions themselves are what matter.

import type { PostType } from '@/lib/data';

// Define the shape of a single news article from the API
export interface NewsArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

// Define the shape of the entire API response
interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}


// Fetches the latest football news from the NewsAPI.
export async function getFootballNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
      console.error("News API key is missing. Please add NEWS_API_KEY to your .env file.");
      // Return a default or empty array to avoid crashing the app
      return [];
  }

  // Fetch news about "football" or "soccer", sorted by publish date, from English sources.
  const url = `https://newsapi.org/v2/everything?q=(football%20OR%20soccer)&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      // Use Next.js revalidation to cache results for 15 minutes
      next: { revalidate: 900 } 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("NewsAPI Error Response:", errorData.message);
      // Don't throw, just return empty so the site doesn't crash
      return [];
    }
    
    const apiData: NewsApiResponse = await response.json();
    
    if (apiData.status !== 'ok') {
        console.error("NewsAPI returned a non-ok status:", apiData);
        return [];
    }
    
    return apiData.articles;

  } catch (error) {
    console.error(`Failed to fetch from NewsAPI:`, error);
    return []; // Return empty on network error
  }
}
