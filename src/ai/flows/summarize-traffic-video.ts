
'use server';

/**
 * @fileOverview Analyzes a traffic video to provide a structured summary.
 *
 * - summarizeTrafficVideo - A function that analyzes a traffic video.
 * - SummarizeTrafficVideoInput - The input type for the summarizeTrafficVideo function.
 * - SummarizeTrafficVideoOutput - The return type for the summarizeTrafficVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrafficVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of traffic, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeTrafficVideoInput = z.infer<typeof SummarizeTrafficVideoInputSchema>;

const SummarizeTrafficVideoOutputSchema = z.object({
  summary: z.string().describe('Ringkasan naratif singkat dari keseluruhan pola lalu lintas dalam video.'),
  congestionLevel: z.enum(['Rendah', 'Sedang', 'Padat']).describe('Tingkat kepadatan lalu lintas yang teramati.'),
  peakTime: z.string().describe('Estimasi waktu (jam atau rentang waktu) di mana lalu lintas paling padat.'),
  vehicleDistribution: z.array(z.object({
    type: z.enum(['Sepeda Motor', 'Mobil', 'Bus', 'Truk', 'Trailer']).describe('Jenis kendaraan yang terdeteksi.'),
    percentage: z.number().describe('Persentase jenis kendaraan ini dari total kendaraan yang terdeteksi.'),
  })).describe('Distribusi persentase dari berbagai jenis kendaraan yang terdeteksi dalam video.'),
});
export type SummarizeTrafficVideoOutput = z.infer<typeof SummarizeTrafficVideoOutputSchema>;

export async function summarizeTrafficVideo(
  input: SummarizeTrafficVideoInput
): Promise<SummarizeTrafficVideoOutput> {
  return summarizeTrafficVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrafficVideoPrompt',
  input: {schema: SummarizeTrafficVideoInputSchema},
  output: {schema: SummarizeTrafficVideoOutputSchema},
  prompt: `Anda adalah seorang ahli analis lalu lintas yang sangat berpengalaman. Tugas Anda adalah menganalisis video lalu lintas yang diberikan dan memberikan laporan analisis yang terstruktur dan mendalam dalam Bahasa Indonesia.

Analisis video berikut:
{{media url=videoDataUri}}

Berdasarkan video tersebut, berikan analisis dengan format JSON yang mencakup:
1.  **summary**: Ringkasan singkat (2-3 kalimat) mengenai kondisi lalu lintas secara umum, termasuk pola pergerakan, kepadatan, dan peristiwa penting jika ada.
2.  **congestionLevel**: Klasifikasikan tingkat kepadatan lalu lintas secara keseluruhan sebagai 'Rendah', 'Sedang', atau 'Padat'.
3.  **peakTime**: Estimasikan rentang waktu (misalnya, "Pagi hari sekitar 08:00" atau "Sore hari") di mana volume kendaraan tampak paling tinggi.
4.  **vehicleDistribution**: Berikan estimasi distribusi persentase untuk setiap jenis kendaraan yang terlihat (Sepeda Motor, Mobil, Bus, Truk, Trailer). Pastikan total persentase mendekati 100%.`,
});

const summarizeTrafficVideoFlow = ai.defineFlow(
  {
    name: 'summarizeTrafficVideoFlow',
    inputSchema: SummarizeTrafficVideoInputSchema,
    outputSchema: SummarizeTrafficVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
