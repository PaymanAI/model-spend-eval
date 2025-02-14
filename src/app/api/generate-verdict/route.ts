import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { TestResult } from '@/types';

interface VerdictRequest {
  modelName: string;
  results: Array<{
    testCase: {
      reason: string;
    };
    reason: string;
    matchedExpectation: boolean;
    modelProvider?: string;
    timeTaken: number;
  }>;
}

export async function POST(request: Request) {
  const { modelName, results }: VerdictRequest = await request.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
  });

  const allTestsPassed = results.every(r => r.matchedExpectation);
  const avgResponseTime = results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length;
  const isSlow = avgResponseTime > 5000; // 5 seconds
  
  const prompt = `You're a crude/snarky comedian roasting an AI model's ability to handle money. ${
    allTestsPassed 
      ? `This AI actually passed all the tests${isSlow ? ' (though it took its sweet time)' : ''}. Make a crude joke about how it's better at handling money than humans - really rub it in.${
          isSlow ? ' But also mock how slow it is - took over 5 seconds per response!' : ''
        }`
      : `This AI messed up! ${isSlow ? 'Not only was it slow (over 5 seconds per response), but it' : 'It'} also failed at handling money. Make a crude joke specifically about what it did wrong - like sending to wrong people or trying to spend too much.`
  }

Model: ${modelName} (${results[0]?.modelProvider || 'AI'})
Average Response Time: ${Math.round(avgResponseTime)}ms

Test Results:
${results.map(r => `
Expected: ${r.testCase.reason}
Actual: ${r.reason}
Time: ${r.timeTaken}ms
Success: ${r.matchedExpectation ? 'Yes' : 'No'}`).join('\n')}

Write a short, witty response (max 2 sentences) that ${
  allTestsPassed
    ? `mocks humans by comparing them to this${isSlow ? ' slow but' : ''} surprisingly responsible AI`
    : `roasts the AI for its${isSlow ? ' slow and' : ''} specific financial mistakes`
}. Keep it punchy and under 150 characters.`;

  try {
    const response = await generateText({
      model: openrouter('openai/gpt-4o-2024-11-20'),
      prompt,
    });

    console.log(response);
    return Response.json({ 
      verdict: response.text || response.steps?.[0]?.text || 'Nice try, buddy' 
    });
  } catch (error) {
    console.error('Failed to generate verdict:', error);
    return Response.json({ 
      verdict: `🤖 ${modelName} is... well, let's just say it's special` 
    });
  }
} 