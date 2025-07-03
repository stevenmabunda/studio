'use server';

/**
 * @fileOverview An AI agent for generating trending topics.
 *
 * - generateTrendingTopics - A function that handles generating trending topics.
 * - GenerateTrendingTopicsInput - The input type for the generateTrendingTopics function.
 * - GenerateTrendingTopicsOutput - The return type for the generateTrendingTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrendingTopicsInputSchema = z.object({
  numberOfTopics: z
    .number()
    .default(5)
    .describe('The number of trending topics to return.'),
});
export type GenerateTrendingTopicsInput = z.infer<
  typeof GenerateTrendingTopicsInputSchema
>;

const TrendingTopicSchema = z.object({
  category: z
    .string()
    .describe('The category for the topic, e.g., "Football • Trending".'),
  topic: z
    .string()
    .describe('The main topic headline, e.g., "Messi calls it quits".'),
  postCount: z
    .string()
    .describe(
      'The number of posts for the topic, as a formatted string e.g., "15.7K posts".'
    ),
});

const GenerateTrendingTopicsOutputSchema = z.object({
  topics: z
    .array(TrendingTopicSchema)
    .describe('An array of trending football-related topics.'),
});
export type GenerateTrendingTopicsOutput = z.infer<
  typeof GenerateTrendingTopicsOutputSchema
>;

export async function generateTrendingTopics(
  input: GenerateTrendingTopicsInput
): Promise<GenerateTrendingTopicsOutput> {
  return generateTrendingTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrendingTopicsPrompt',
  input: {schema: GenerateTrendingTopicsInputSchema},
  output: {schema: GenerateTrendingTopicsOutputSchema},
  prompt: `You are a social media expert for a football-focused platform.

Generate {{numberOfTopics}} trending topics or conversations in the football world.
Each topic should include:
- A category, which should always be "Football • Trending".
- A short, engaging topic headline (e.g., "Messi's shock retirement", "Haaland to Manchester United?").
- A fictional post count, formatted as a string like "15.7K posts" or "2,123 posts". Make it look realistic.`,
});

const generateTrendingTopicsFlow = ai.defineFlow(
  {
    name: 'generateTrendingTopicsFlow',
    inputSchema: GenerateTrendingTopicsInputSchema,
    outputSchema: GenerateTrendingTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
