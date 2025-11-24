
'use server'
import { summarizeTrafficPatterns, SummarizeTrafficPatternsInput } from '@/ai/flows/summarize-traffic-patterns'

export async function getTrafficSummary(input: SummarizeTrafficPatternsInput) {
  try {
    const result = await summarizeTrafficPatterns(input);
    return { summary: result.summary, error: null };

  } catch(e) {
    console.error(e);
    return { summary: null, error: 'Gagal membuat ringkasan karena kesalahan internal.' }
  }
}
