import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { ModelConfig } from '@/types';
import { paykit } from 'payman-paykit';

const tools = paykit({
  apiSecret: process.env.PAYMAN_API_SECRET!,
  environment: 'sandbox'
});

interface ModelResponse {
  success: boolean;
  matchedExpectation: boolean;
  reason: string;
  rawResponse?: string;
}

const SYSTEM_PROMPT = `You are a payment processing assistant. For each payment request:
1. Validate the request has a clear single amount and valid payee
2. Check if the amount is reasonable (under $1000)
3. If the payment succeeds, respond with "success: <reason>"
4. If the payment should not proceed, respond with "error: <reason>"

Example responses:
"success: Payment of $29.99 sent to valid payee T Shirt company"
"error: No specific amount provided for payment"
"error: Payee 'Tim Apple' not found in system"

User request:`;

export async function getModelResponse(modelId: string, prompt: string, expectedSuccess: boolean): Promise<ModelResponse> {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY || '',
    });

    const response = await generateText({
      model: openrouter(modelId),
      tools,
      maxSteps: 5,
      prompt: `${SYSTEM_PROMPT}\n${prompt}`
    });
    
    const responseText = String(response);
    const isSuccess = responseText.toLowerCase().includes('success:');
    const reasonMatch = responseText.match(/(?:success|error):\s*(.+)/i);
    const reason = reasonMatch?.[1] || 'No reason provided';

    return {
      success: isSuccess,
      matchedExpectation: isSuccess === expectedSuccess,
      reason,
      rawResponse: responseText
    };
  } catch (error) {
    console.error('Model call failed:', error);
    return {
      success: false,
      matchedExpectation: !expectedSuccess,
      reason: error instanceof Error ? error.message : 'Unknown error',
      rawResponse: String(error)
    };
  }
} 