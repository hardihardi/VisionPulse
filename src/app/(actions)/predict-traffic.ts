'use server';

import {
  predictTrafficFlow,
  PredictTrafficFlowInput,
} from '@/ai/flows/predict-traffic-flow';

export async function getTrafficPrediction(input: PredictTrafficFlowInput) {
  try {
    const result = await predictTrafficFlow(input);
    return { result, error: null };
  } catch (e) {
    console.error(e);
    return {
      result: null,
      error: 'Gagal membuat prakiraan karena kesalahan internal.',
    };
  }
}
