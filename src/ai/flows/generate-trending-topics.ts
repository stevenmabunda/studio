'use server';

/**
 * @fileOverview An AI agent for generating trending topics from keywords.
 *
 * - generateTrendingTopics - A function that handles generating trending topics.
 * - GenerateTrendingTopicsInput - The input type for the generateTrendingTopics function.
 * - GenerateTrendingTopicsOutput - The return type for the generateTrendingTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input is now a list of raw topic strings
const GenerateTrendingTopicsInputSchema = z.object({
  topics: z
    .array(z.string())
    .describe('A list of trending keywords or topics.'),
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
  imageHint: z.string().optional().describe('A one or two word hint for a relevant image. Only provide this for the first topic.'),
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
  prompt: `You are a social media expert for a football-focused platform. You are given a list of raw trending topics.

Your task is to convert these raw topics into engaging, headline-style conversations. You must generate a headline for each raw topic provided.

For each topic, generate:
- A category, which should always be "Football • Trending".
- A short, engaging topic headline. For example, for the raw topic "messi retirement", a good headline would be "Messi's shock retirement". For "haaland man utd", a good headline would be "Haaland to Manchester United?".
- A fictional post count, formatted as a string like "15.7K posts" or "2,123 posts". Make it look realistic.
- For the VERY FIRST topic in the list ONLY, provide a concise one or two word \`imageHint\` for a relevant background image. Examples: "player celebrating", "stadium lights", "manager sideline". Do not provide a hint for other topics.

Raw Topics:
{{#each topics}}
- {{{this}}}
{{/each}}
`,
});

const generateTrendingTopicsFlow = ai.defineFlow(
  {
    name: 'generateTrendingTopicsFlow',
    inputSchema: GenerateTrendingTopicsInputSchema,
    outputSchema: GenerateTrendingTopicsOutputSchema,
    retry: {
      delay: '2s',
      maxAttempts: 3,
    },
  },
  async input => {
    // If there are no topics, return an empty array to avoid calling the model with no input.
    if (input.topics.length === 0) {
      return { topics: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
