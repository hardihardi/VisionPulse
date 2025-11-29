
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
  prompt: `You are a traffic prediction expert. Based on the historical traffic data provided for the location "{{locationName}}", predict the traffic flow for the next 2-3 hours.

Analyze the trends in the data, considering potential rush hours or patterns. Provide a concise narrative forecast and classify the predicted congestion level as 'Rendah', 'Sedang', or 'Padat'.

Historical Data:
{{#each trafficData}}
- Time: {{timestamp}}, Vehicles: {{licensePlates}}
{{/each}}

Based on this data, what is the traffic prediction?`,
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
