'use server';
/**
 * @fileOverview An AI agent for extracting topics from post content.
 *
 * - extractPostTopics - A function that extracts topics from text.
 * - ExtractPostTopicsInput - The input type for the function.
 * - ExtractPostTopicsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPostTopicsInputSchema = z.object({
  content: z.string().describe('The social media post content to analyze.'),
});
export type ExtractPostTopicsInput = z.infer<
  typeof ExtractPostTopicsInputSchema
>;

const ExtractPostTopicsOutputSchema = z.object({
  topics: z
    .array(z.string().describe('A single topic or keyword, 1-3 words long.'))
    .describe('An array of topics extracted from the post content.'),
});
export type ExtractPostTopicsOutput = z.infer<
  typeof ExtractPostTopicsOutputSchema
>;

export async function extractPostTopics(
  input: ExtractPostTopicsInput
): Promise<ExtractPostTopicsOutput> {
  return extractPostTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPostTopicsPrompt',
  input: {schema: ExtractPostTopicsInputSchema},
  output: {schema: ExtractPostTopicsOutputSchema},
  prompt: `You are an expert in text analysis for a football-focused social media platform. Extract the main topics or keywords from the following post.

Focus on players, teams, competitions, and key football concepts. Return them as a list of simple strings. Each topic should be 1-3 words. For example, for "What a goal by Messi in the Inter Miami game! He's a genius.", you might return ["Messi", "Inter Miami", "goal"].

Post Content:
{{{content}}}`,
});

const extractPostTopicsFlow = ai.defineFlow(
  {
    name: 'extractPostTopicsFlow',
    inputSchema: ExtractPostTopicsInputSchema,
    outputSchema: ExtractPostTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
