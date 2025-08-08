'use server';
/**
 * @fileOverview An AI agent for extracting metadata from a URL.
 *
 * - extractLinkMetadata - Fetches a URL and extracts its metadata.
 * - ExtractLinkMetadataInput - The input type for the function.
 * - ExtractLinkMetadataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractLinkMetadataInputSchema = z.object({
  url: z.string().url().describe('The URL to fetch and extract metadata from.'),
});
export type ExtractLinkMetadataInput = z.infer<
  typeof ExtractLinkMetadataInputSchema
>;

const ExtractLinkMetadataOutputSchema = z.object({
  title: z.string().describe('The primary title of the webpage.'),
  description: z
    .string()
    .describe('A brief summary of the webpage content.'),
  imageUrl: z.string().url().optional().describe('The main image URL for the article or page.'),
  domain: z.string().describe('The domain name of the URL (e.g., example.com).'),
});
export type ExtractLinkMetadataOutput = z.infer<
  typeof ExtractLinkMetadataOutputSchema
>;

// This function is NOT a flow, it's a server action that calls the flow.
// It includes the logic for fetching the HTML content before passing it to the AI.
export async function extractLinkMetadata(
  input: ExtractLinkMetadataInput
): Promise<ExtractLinkMetadataOutput | null> {
    try {
        const response = await fetch(input.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            console.error(`Failed to fetch URL: ${response.statusText}`);
            return null;
        }

        const htmlContent = await response.text();
        const domain = new URL(input.url).hostname;
        
        return await extractLinkMetadataFlow({ htmlContent, domain });

    } catch (error) {
        console.error('Error fetching or processing URL:', error);
        return null;
    }
}

// The schema for the AI flow itself, which takes HTML content directly.
const FlowInputSchema = z.object({
    htmlContent: z.string().describe("The full HTML content of a webpage."),
    domain: z.string().describe("The domain name of the URL.")
});

const prompt = ai.definePrompt({
  name: 'extractLinkMetadataPrompt',
  input: {schema: FlowInputSchema},
  output: {schema: ExtractLinkMetadataOutputSchema},
  prompt: `You are an expert at extracting key information from a webpage's HTML. From the following HTML content, please extract the main title, a concise description, and the most relevant image URL (like an 'og:image').

The domain of the website is '{{{domain}}}'.

Return the extracted information in the specified JSON format. If you cannot find a suitable image, you may omit the imageUrl field.

HTML Content:
\`\`\`html
{{{htmlContent}}}
\`\`\`
`,
});

const extractLinkMetadataFlow = ai.defineFlow(
  {
    name: 'extractLinkMetadataFlow',
    inputSchema: FlowInputSchema,
    outputSchema: ExtractLinkMetadataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
