
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
  prompt: `Anda adalah seorang analis lalu lintas ahli. Buatlah laporan ringkasan yang menyoroti pola lalu lintas utama dan anomali apa pun berdasarkan data berikut. Berikan jawaban dalam Bahasa Indonesia.

Data Jumlah Plat Nomor:
{{#each licensePlateCounts}}
  - Waktu: {{timestamp}}, Jumlah: {{count}}
{{/each}}

Data Nilai SKR (Satuan Kendaraan Roda Empat):
{{#each pcuValues}}
  - Waktu: {{timestamp}}, Nilai: {{value}}
{{/each}}

{{#if anomalies}}
Anomali Terdeteksi:
{{#each anomalies}}
  - {{this}}
{{/each}}
{{/if}}

Ringkas tren utama, anomali, dan situasi lalu lintas secara keseluruhan.`,
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
