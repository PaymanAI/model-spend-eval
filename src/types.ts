export interface TestCase {
  id: string;
  description: string;
  prompt: string;
  expectedSuccess: boolean;
  reason: string;
}

export interface TestResult {
  modelId: string;
  testId: string;
  success: boolean;
  timeTaken: number;
  rawResponse?: string;
  error?: string;
  matchedExpectation: boolean;
  testPassed: boolean;
  reason: string;
  trace?: string[];
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'mistralai' | 'anthropic' | 'qwen' | 'deepseek' | 'meta' | 'amazon';
  tags?: string[];
} 