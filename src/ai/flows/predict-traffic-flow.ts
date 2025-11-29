
'use server';

/**
 * @fileOverview Predicts future traffic flow based on historical data.
 *
 * - predictTrafficFlow - A function that generates a traffic forecast.
 * - PredictTrafficFlowInput - The input type for the predictTrafficFlow function.
 * - PredictTrafficFlowOutput - The return type for the predictTrafficFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTrafficFlowInputSchema = z.object({
  trafficData: z
    .array(z.object({
      timestamp: z.string().describe('ISO string of the data point timestamp.'),
      licensePlates: z.number().describe('Number of license plates detected.'),
    }))
    .describe('An array of historical traffic data points.'),
  locationName: z.string().describe('The name of the location being analyzed.'),
});
export type PredictTrafficFlowInput = z.infer<
  typeof PredictTrafficFlowInputSchema
>;

const PredictTrafficFlowOutputSchema = z.object({
  forecast: z.string().describe('A narrative summary of the traffic forecast for the next few hours.'),
  predictedCongestion: z.enum(['Rendah', 'Sedang', 'Padat']).describe('The predicted congestion level.'),
});
export type PredictTrafficFlowOutput = z.infer<
  typeof PredictTrafficFlowOutputSchema
>;

export async function predictTrafficFlow(
  input: PredictTrafficFlowInput
): Promise<PredictTrafficFlowOutput> {
  return predictTrafficFlowFlow(input);
}

const predictTrafficFlowPrompt = ai.definePrompt({
  name: 'predictTrafficFlowPrompt',
  input: {schema: PredictTrafficFlowInputSchema},
  output: {schema: PredictTrafficFlowOutputSchema},
  prompt: `Anda adalah seorang ahli prediksi lalu lintas. Berdasarkan data historis lalu lintas yang diberikan untuk lokasi "{{locationName}}", prediksikan arus lalu lintas untuk 2-3 jam ke depan.

Analisis tren dalam data, pertimbangkan potensi jam sibuk atau pola yang ada. Berikan prakiraan naratif yang ringkas dan klasifikasikan prediksi tingkat kepadatan sebagai 'Rendah', 'Sedang', atau 'Padat'.

Tolong berikan jawaban dalam Bahasa Indonesia.

Data Historis:
{{#each trafficData}}
- Waktu: {{timestamp}}, Jumlah Kendaraan: {{licensePlates}}
{{/each}}

Berdasarkan data ini, bagaimana prediksi lalu lintasnya?`,
});

const predictTrafficFlowFlow = ai.defineFlow(
  {
    name: 'predictTrafficFlowFlow',
    inputSchema: PredictTrafficFlowInputSchema,
    outputSchema: PredictTrafficFlowOutputSchema,
  },
  async input => {
    const {output} = await predictTrafficFlowPrompt(input);
    return output!;
  }
);
