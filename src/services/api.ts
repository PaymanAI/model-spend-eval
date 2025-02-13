import { ModelConfig } from '../types';
import { MerchantPaymentService } from './merchantPayments';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
const merchantPaymentService = new MerchantPaymentService();

export async function callModel(modelId: string, prompt: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  return response.json();
}

export interface PaymentRequest {
  amount: number;
  merchantId: string;
  description: string;
  modelId: string;
  testId: string;
}

export async function processPayment(request: PaymentRequest) {
  try {
    const result = await merchantPaymentService.processPayment(
      request.merchantId,
      request.amount,
      request.description
    );

    return {
      success: true,
      ...result,
      testId: request.testId,
      modelId: request.modelId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      testId: request.testId,
      modelId: request.modelId,
    };
  }
} 