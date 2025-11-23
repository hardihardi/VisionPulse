'use server';

import {
  enhanceLicensePlateRecognition,
  EnhanceLicensePlateRecognitionInput,
} from '@/ai/flows/enhance-license-plate-recognition';

export async function getEnhancedRecognition(
  input: EnhanceLicensePlateRecognitionInput
) {
  try {
    const result = await enhanceLicensePlateRecognition(input);
    return { result, error: null };
  } catch (e) {
    console.error(e);
    return {
      result: null,
      error: 'Gagal meningkatkan pengenalan karena kesalahan internal.',
    };
  }
}
