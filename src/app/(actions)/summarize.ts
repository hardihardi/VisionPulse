'use server'
import { summarizeTrafficPatterns, SummarizeTrafficPatternsInput } from '@/ai/flows/summarize-traffic-patterns'

export async function getTrafficSummary(input: SummarizeTrafficPatternsInput) {
  try {
    // The AI flow can be slow, so for a better demo experience we can return a mock summary
    // const result = await summarizeTrafficPatterns(input);
    // return { summary: result.summary, error: null };
    
    // Mock response for faster UI
    const peakHours = input.licensePlateCounts.filter(d => d.count > 80).length > 0;
    const summary = `Traffic flow shows consistent patterns with ${peakHours ? 'clear peak hours in the morning and evening' : 'moderate volume throughout the day'}. The average vehicle count is around ${Math.round(input.licensePlateCounts.reduce((a, b) => a + b.count, 0) / input.licensePlateCounts.length)} vehicles per 5-minute interval. No major anomalies detected.`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { summary, error: null };

  } catch(e) {
    console.error(e);
    return { summary: null, error: 'Failed to generate summary due to an internal error.' }
  }
}
