'use server';

/**
 * @fileOverview Enhances license plate recognition accuracy by fine-tuning the system with custom training data.
 *
 * - enhanceLicensePlateRecognition - A function that enhances license plate recognition using custom training data.
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
    ),
  trainingDataDescription: z
    .string()
    .describe('Description of the custom training data provided.'),
  desiredAccuracy: z
    .string()
    .describe('The target accuracy level for license plate recognition.'),
});
export type EnhanceLicensePlateRecognitionInput = z.infer<
  typeof EnhanceLicensePlateRecognitionInputSchema
>;

const EnhanceLicensePlateRecognitionOutputSchema = z.object({
  enhancementResult: z
    .string()
    .describe(
      'A description of the enhancement result after fine-tuning with custom training data.'
    ),
  accuracyAchieved: z
    .string()
    .describe('The accuracy level achieved after fine-tuning.'),
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
  prompt: `You are an expert in enhancing license plate recognition systems using custom training data.

You will receive a video stream, a description of the training data, and the desired accuracy level.
Use this information to fine-tune the license plate recognition system and provide the enhancement result and the accuracy achieved.

Video Stream: {{media url=videoDataUri}}
Training Data Description: {{{trainingDataDescription}}}
Desired Accuracy: {{{desiredAccuracy}}}

Provide a detailed description of the enhancement process and the final accuracy achieved.
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
