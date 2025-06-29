'use server';

/**
 * @fileOverview A trending topics AI agent.
 *
 * - generateTrendingTopics - A function that handles the trending topics process.
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

const NewsItemSchema = z.object({
  headline: z.string().describe('The news headline.'),
  source: z.string().describe('The source of the news (e.g., ESPN, Sky Sports).'),
});

const GenerateTrendingTopicsOutputSchema = z.object({
  headlines: z
    .array(NewsItemSchema)
    .describe('An array of breaking news headlines in the football world.'),
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
  prompt: `You are a sports news editor for a social media platform specializing in football.

Generate {{numberOfTopics}} breaking news headlines. For each headline, provide a fictional but realistic-sounding news source (e.g., "BBC Sport", "Sky Sports", "The Athletic").`,
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
