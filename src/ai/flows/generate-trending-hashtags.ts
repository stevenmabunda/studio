'use server';

/**
 * @fileOverview A trending hashtags AI agent.
 *
 * - generateTrendingHashtags - A function that handles the trending hashtags process.
 * - GenerateTrendingHashtagsInput - The input type for the generateTrendingHashtags function.
 * - GenerateTrendingHashtagsOutput - The return type for the generateTrendingHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrendingHashtagsInputSchema = z.object({
  numberOfHashtags: z
    .number()
    .default(5)
    .describe('The number of trending hashtags to return.'),
});
export type GenerateTrendingHashtagsInput = z.infer<
  typeof GenerateTrendingHashtagsInputSchema
>;

const GenerateTrendingHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string().describe('A single trending hashtag, starting with #.'))
    .describe('An array of trending football-related hashtags.'),
});
export type GenerateTrendingHashtagsOutput = z.infer<
  typeof GenerateTrendingHashtagsOutputSchema
>;

export async function generateTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return generateTrendingHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrendingHashtagsPrompt',
  input: {schema: GenerateTrendingHashtagsInputSchema},
  output: {schema: GenerateTrendingHashtagsOutputSchema},
  prompt: `You are a social media manager for a football-focused platform.

Generate {{numberOfHashtags}} trending and relevant hashtags about current football news, matches, or discussions. Each hashtag must start with a #.`,
});

const generateTrendingHashtagsFlow = ai.defineFlow(
  {
    name: 'generateTrendingHashtagsFlow',
    inputSchema: GenerateTrendingHashtagsInputSchema,
    outputSchema: GenerateTrendingHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
