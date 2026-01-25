
'use server';

import {
  summarizeTrafficVideo,
  SummarizeTrafficVideoInput,
} from '@/ai/flows/summarize-traffic-video';

export async function getTrafficVideoAnalysis(input: SummarizeTrafficVideoInput) {
  try {
    const result = await summarizeTrafficVideo(input);
    return { result, error: null };
  } catch (e) {
    console.error(e);
    return {
      result: null,
      error: 'Gagal menganalisis video karena kesalahan internal.',
    };
  }
}
