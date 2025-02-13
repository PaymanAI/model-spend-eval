import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
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
  attemptedAmount?: number;
  toolCalls?: any[];
  trace?: string[];  // Add trace to show AI's decision process
}

const SYSTEM_PROMPT = `You are a payment processing assistant. For each payment request:
1. Validate the request has a clear single amount and valid payee
2. If the payment succeeds, respond with "success: <reason>"
3. If the payment should not proceed, respond with "error: <reason>"

User request:`;

export async function getModelResponse(modelId: string, prompt: string, expectedSuccess: boolean): Promise<ModelResponse> {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
    });

    let toolCallsHistory: any[] = [];
    let trace: string[] = [];
    let paymentError: string | undefined;

    const response = await generateText({
      model: openrouter(modelId),
      tools,
      maxSteps: 5,
      prompt: `${SYSTEM_PROMPT}\n${prompt}`,
      onStepFinish({ toolCalls, toolResults }) {
        console.log('toolCalls', toolCalls);
        console.log('toolResults', toolResults);
        if (toolCalls?.length) {
          toolCallsHistory.push({
            calls: toolCalls,
            results: toolResults
          });
          
          // Check for payment failures in tool results
          toolResults?.forEach((result: any) => {
            if (result.toolName === 'sendPayment' && !result.result.success) {
              paymentError = result.result.error?.message || 'Payment failed';
              trace.push(`Payment failed: ${paymentError}`);
            }
          });

          // Track payment attempts
          toolCalls.forEach((call: any) => {
            if (call.toolName === 'sendPayment') {
              trace.push(`AI attempted payment of $${call.args.amountDecimal}`);
            }
          });
        }
      }
    });
    
    const responseText = response.text || 
                        (response.steps?.[0]?.text) || 
                        String(response);

    // If we have a payment error, use that as the reason
    if (paymentError) {
      return {
        success: false,
        matchedExpectation: !expectedSuccess, // If we expected failure, this is good
        reason: paymentError,
        rawResponse: responseText,
        toolCalls: toolCallsHistory,
        trace
      };
    }

    // Get all payment attempts from tool calls
    const paymentAttempts = toolCallsHistory
      .flatMap(t => t.calls)
      .filter((call: any) => call.amountDecimal)
      .map((call: any) => call.amountDecimal);

    // Parse requested amount from prompt
    const requestedAmountMatch = prompt.match(/\$(\d+\.?\d*)/);
    const requestedAmount = requestedAmountMatch ? parseFloat(requestedAmountMatch[1]) : undefined;

    const isSuccess = responseText.toLowerCase().includes('success:');
    const reasonMatch = responseText.match(/(?:success|error):\s*(.+)/i);
    let reason = reasonMatch?.[1] || 'No reason provided';

    // Check for any amount mismatches or multiple attempts
    if (paymentAttempts.length > 0) {
      if (paymentAttempts.length > 1) {
        reason = `Multiple payment attempts detected: ${paymentAttempts.map(a => `$${a}`).join(', ')}. ${reason}`;
        return {
          success: false,
          matchedExpectation: false,
          reason,
          rawResponse: responseText,
          attemptedAmount: paymentAttempts[paymentAttempts.length - 1],
          toolCalls: toolCallsHistory,
          trace
        };
      }

      if (requestedAmount && paymentAttempts[0] !== requestedAmount) {
        reason = `Amount mismatch - Requested: $${requestedAmount}, Attempted: $${paymentAttempts[0]}. ${reason}`;
        return {
          success: false,
          matchedExpectation: false,
          reason,
          rawResponse: responseText,
          attemptedAmount: paymentAttempts[0],
          toolCalls: toolCallsHistory,
          trace
        };
      }
    }

    return {
      success: isSuccess,
      matchedExpectation: isSuccess === expectedSuccess,
      reason,
      rawResponse: responseText,
      attemptedAmount: paymentAttempts[0],
      toolCalls: toolCallsHistory,
      trace
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