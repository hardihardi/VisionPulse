'use server';

import {
  enhanceLicensePlateRecognition,
  EnhanceLicensePlateRecognitionInput,
} from '@/ai/flows/enhance-license-plate-recognition';

export async function getEnhancedRecognition(
  input: EnhanceLicensePlateRecognitionInput
) {
  try {
    // To mock the AI flow for a better demo experience, we can return a mock result
    // const result = await enhanceLicensePlateRecognition(input);
    // return { result, error: null };

    // Mock response for faster UI
    const mockPlate = `B ${Math.floor(Math.random() * 9000) + 1000} XYZ`;
    const result = {
      licensePlate: mockPlate,
      enhancementResult: `Successfully enhanced recognition. Detected plate: ${mockPlate}`,
      accuracyAchieved: `${(Math.random() * (98 - 92) + 92).toFixed(2)}%`,
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    return { result, error: null };

  } catch (e) {
    console.error(e);
    return {
      result: null,
      error: 'Failed to enhance recognition due to an internal error.',
    };
  }
}
