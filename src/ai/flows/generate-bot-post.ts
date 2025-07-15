'use server';
/**
 * @fileOverview An AI agent that generates and saves a new post from a bot.
 *
 * - generateAndSaveBotPost - A function that handles the entire process.
 * - GenerateBotPostOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BotPostSchema = z.object({
  topic: z.string().describe('A short, engaging football topic. e.g., "Upcoming El Clasico", "Messi vs Ronaldo debate", "Premier League title race".'),
  content: z.string().describe('The social media post content, including relevant hashtags. Should be under 280 characters.'),
});

export const GenerateBotPostOutputSchema = z.object({
  postId: z.string().describe('The ID of the newly created post.'),
  content: z.string().describe('The content of the post that was saved.'),
});
export type GenerateBotPostOutput = z.infer<typeof GenerateBotPostOutputSchema>;


export async function generateAndSaveBotPost(): Promise<GenerateBotPostOutput> {
  return generateBotPostFlow();
}

const botPostPrompt = ai.definePrompt({
  name: 'generateBotPostPrompt',
  output: {schema: BotPostSchema},
  prompt: `You are an AI bot for a football social media platform called BHOLO. Your personality is enthusiastic and knowledgeable.

Generate a new, random, and engaging post about football. It can be about a recent match, a player debate, a transfer rumor, or a general football topic.

Create a topic and then write a short post (under 280 characters) with relevant hashtags.`,
});

const generateBotPostFlow = ai.defineFlow(
  {
    name: 'generateBotPostFlow',
    outputSchema: GenerateBotPostOutputSchema,
  },
  async () => {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    
    // 1. Generate the post content from the LLM
    const { output } = await botPostPrompt();
    if (!output) {
      throw new Error('Failed to generate bot post content.');
    }
    const { content } = output;

    // 2. Define the bot's user data
    const botUser = {
        authorId: 'bholo-bot',
        authorName: 'BHOLO Bot',
        authorHandle: 'bholobot',
        authorAvatar: 'https://placehold.co/40x40.png',
    };

    // 3. Save the new post to Firestore
    const postsRef = collection(db, 'posts');
    const newPostDoc = await addDoc(postsRef, {
        ...botUser,
        content: content,
        createdAt: serverTimestamp(),
        comments: 0,
        reposts: 0,
        likes: Math.floor(Math.random() * 20), // Add some random initial likes
        views: Math.floor(Math.random() * 1000),
        media: [],
    });

    // 4. Return the ID and content of the new post
    return {
      postId: newPostDoc.id,
      content: content,
    };
  }
);
