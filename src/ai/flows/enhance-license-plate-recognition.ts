
'use server';

/**
 * @fileOverview Enhances license plate recognition accuracy from a video feed.
 *
 * - enhanceLicensePlateRecognition - A function that enhances and detects a license plate from a video.
 * - EnhanceLicensePlateRecognitionInput - The input type for the enhanceLicensePlateRecognition function.
 * - EnhanceLicensePlateRecognitionOutput - The return type for the enhanceLicensePlateRecognition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceLicensePlateRecognitionInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video stream for analysis, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
});
export type EnhanceLicensePlateRecognitionInput = z.infer<
  typeof EnhanceLicensePlateRecognitionInputSchema
>;

const EnhanceLicensePlateRecognitionOutputSchema = z.object({
  licensePlate: z.string().describe('The detected license plate number.'),
  enhancementResult: z
    .string()
    .describe(
      'A description of the enhancement result after processing the video.'
    ),
  accuracyAchieved: z
    .string()
    .describe('The confidence level of the detection.'),
});
export type EnhanceLicensePlateRecognitionOutput = z.infer<
  typeof EnhanceLicensePlateRecognitionOutputSchema
>;

export async function enhanceLicensePlateRecognition(
  input: EnhanceLicensePlateRecognitionInput
): Promise<EnhanceLicensePlateRecognitionOutput> {
  return enhanceLicensePlateRecognitionFlow(input);
}

const enhanceLicensePlateRecognitionPrompt = ai.definePrompt({
  name: 'enhanceLicensePlateRecognitionPrompt',
  input: {schema: EnhanceLicensePlateRecognitionInputSchema},
  output: {schema: EnhanceLicensePlateRecognitionOutputSchema},
  prompt: `Anda adalah ahli dalam pengenalan plat nomor dari streaming video.

Anda akan menerima sebuah stream video. Tugas Anda adalah menganalisis video, mengidentifikasi tampilan paling jelas dari plat nomor kendaraan, dan mengekstrak nomor plat tersebut.

Berikan nomor plat yang terdeteksi, ringkasan singkat dari proses deteksi, dan tingkat kepercayaan deteksi dalam Bahasa Indonesia.

Stream Video: {{media url=videoDataUri}}
`,
});

const enhanceLicensePlateRecognitionFlow = ai.defineFlow(
  {
    name: 'enhanceLicensePlateRecognitionFlow',
    inputSchema: EnhanceLicensePlateRecognitionInputSchema,
    outputSchema: EnhanceLicensePlateRecognitionOutputSchema,
  },
  async input => {
    const {output} = await enhanceLicensePlateRecognitionPrompt(input);
    return output!;
  }
);
