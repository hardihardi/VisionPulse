'use server';
/**
 * @fileOverview Summarizes traffic patterns from analyzed video data.
 *
 * - summarizeTrafficPatterns - A function that generates a summary report of traffic patterns.
 * - SummarizeTrafficPatternsInput - The input type for the summarizeTrafficPatterns function.
 * - SummarizeTrafficPatternsOutput - The return type for the summarizeTrafficPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrafficPatternsInputSchema = z.object({
  licensePlateCounts: z
    .array(z.object({
      timestamp: z.string(),
      count: z.number(),
    }))
    .describe('An array of license plate counts with timestamps.'),
  pcuValues: z
    .array(z.object({
      timestamp: z.string(),
      value: z.number(),
    }))
    .describe('An array of PCU values with timestamps.'),
  anomalies: z
    .array(z.string())
    .optional()
    .describe('A list of detected traffic anomalies.'),
});
export type SummarizeTrafficPatternsInput = z.infer<
  typeof SummarizeTrafficPatternsInputSchema
>;

const SummarizeTrafficPatternsOutputSchema = z.object({
  summary: z.string().describe('A summary of the traffic patterns and anomalies.'),
});
export type SummarizeTrafficPatternsOutput = z.infer<
  typeof SummarizeTrafficPatternsOutputSchema
>;

export async function summarizeTrafficPatterns(
  input: SummarizeTrafficPatternsInput
): Promise<SummarizeTrafficPatternsOutput> {
  return summarizeTrafficPatternsFlow(input);
}

const summarizeTrafficPatternsPrompt = ai.definePrompt({
  name: 'summarizeTrafficPatternsPrompt',
  input: {schema: SummarizeTrafficPatternsInputSchema},
  output: {schema: SummarizeTrafficPatternsOutputSchema},
  prompt: `You are an expert traffic analyst. Generate a concise summary report highlighting key traffic patterns and any anomalies based on the following data:\n\nLicense Plate Counts:\n{{#each licensePlateCounts}}\n  - Timestamp: {{timestamp}}, Count: {{count}}{{#if anomalies}}\nAnomalies:{{anomalies}}{{/if}}\n{{/each}}\n\nPCU Values:\n{{#each pcuValues}}\n  - Timestamp: {{timestamp}}, Value: {{value}}\n{{/each}}\n\nAnomalies: {{anomalies}}\n\nSummarize the key trends, anomalies, and overall traffic situation.`,
});

const summarizeTrafficPatternsFlow = ai.defineFlow(
  {
    name: 'summarizeTrafficPatternsFlow',
    inputSchema: SummarizeTrafficPatternsInputSchema,
    outputSchema: SummarizeTrafficPatternsOutputSchema,
  },
  async input => {
    const {output} = await summarizeTrafficPatternsPrompt(input);
    return output!;
  }
);
