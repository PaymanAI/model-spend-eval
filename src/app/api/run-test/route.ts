import { NextRequest, NextResponse } from 'next/server';
import { getModelResponse } from '@/services/modelService';

export async function POST(request: NextRequest) {
  try {
    const { modelId, testCase } = await request.json();
    const startTime = Date.now();

    // Use our modelService to run the test
    const modelResponse = await getModelResponse(
      modelId, 
      testCase.prompt,
      testCase.expectedSuccess
    );
    const timeTaken = Date.now() - startTime;

    return NextResponse.json({
      modelId,
      testId: testCase.id,
      success: modelResponse.success,
      matchedExpectation: modelResponse.matchedExpectation,
      reason: modelResponse.reason,
      timeTaken,
      rawResponse: modelResponse.rawResponse
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
} 