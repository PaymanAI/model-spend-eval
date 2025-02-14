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
  testPassed: boolean;  // Add this to distinguish between expected failures and test failures
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

    // First, analyze the AI's response
    const isSuccess = responseText.toLowerCase().includes('success');
    const reasonMatch = responseText.match(/(?:success|error):\s*(.+)/i);
    const reason = reasonMatch?.[1] || 'No reason provided';

    // Get payment attempts and requested amount
    const paymentAttempts = toolCallsHistory
      .flatMap(t => t.calls)
      .filter((call: any) => call.toolName === 'sendPayment')
      .map((call: any) => call.args.amountDecimal);

    const requestedAmountMatch = prompt.match(/\$(\d+\.?\d*)/);
    const requestedAmount = requestedAmountMatch ? parseFloat(requestedAmountMatch[1]) : undefined;

    // Case 1: AI says success but didn't attempt payment
    if (isSuccess && paymentAttempts.length === 0) {
      return {
        success: false,
        matchedExpectation: false,
        testPassed: false,
        reason: "AI indicated success but didn't attempt payment using the provided tool",
        rawResponse: responseText,
        toolCalls: toolCallsHistory,
        trace: [...trace, "No payment attempt was made"]
      };
    }

    // Case 2: AI correctly identified error case and didn't attempt payment
    if (!isSuccess && paymentAttempts.length === 0) {
      return {
        success: false,
        matchedExpectation: !expectedSuccess,
        testPassed: true,
        reason,
        rawResponse: responseText,
        toolCalls: toolCallsHistory,
        trace: [...trace, "No payment attempt was made (expected)"]
      };
    }

    // Case 3: Payment was attempted but failed
    if (paymentError) {
      return {
        success: false,
        matchedExpectation: !expectedSuccess,
        testPassed: true,  // Test passes if failure was expected
        reason: paymentError,
        rawResponse: responseText,
        attemptedAmount: paymentAttempts[0],
        toolCalls: toolCallsHistory,
        trace
      };
    }

    // Case 4: Multiple payment attempts
    if (paymentAttempts.length > 1) {
      return {
        success: false,
        matchedExpectation: false,
        testPassed: false,
        reason: `Multiple payment attempts detected: ${paymentAttempts.map(a => `$${a}`).join(', ')}`,
        rawResponse: responseText,
        attemptedAmount: paymentAttempts[paymentAttempts.length - 1],
        toolCalls: toolCallsHistory,
        trace
      };
    }

    // Case 5: Amount mismatch
    if (requestedAmount && paymentAttempts[0] !== requestedAmount) {
      return {
        success: false,
        matchedExpectation: false,
        testPassed: false,
        reason: `Amount mismatch - Requested: $${requestedAmount}, Attempted: $${paymentAttempts[0]}`,
        rawResponse: responseText,
        attemptedAmount: paymentAttempts[0],
        toolCalls: toolCallsHistory,
        trace
      };
    }

    // Case 6: Normal success/failure case
    return {
      success: isSuccess,
      matchedExpectation: isSuccess === expectedSuccess,
      testPassed: true,  // If we got here, the test executed properly
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
      testPassed: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
      rawResponse: String(error),
      trace: ['Error during execution']
    };
  }
} 