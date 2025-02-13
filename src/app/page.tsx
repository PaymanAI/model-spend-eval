'use client';

import React, { useState } from 'react';
import { ModelSelector } from '@/components/ModelSelector';
import { TestRunner } from '@/components/TestRunner';
import { TestResults } from '@/components/TestResults';
import { ModelConfig, TestCase, TestResult } from '@/types';
import { TEST_CASES } from '@/data/testCases';

const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'openai/o3-mini-high',
    name: 'OpenAI O3 Mini',
    provider: 'openai'
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'google'
  },
  {
    id: 'mistralai/mistral-large-2411',
    name: 'Mistral Large',
    provider: 'mistralai'
  }
];

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TestResult[]>>({});

  const handleRunTest = async (modelId: string, testCase: TestCase): Promise<TestResult> => {
    try {
      // First, get the AI's response
      const response = await fetch('/api/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          testCase,
        }),
      });

      if (!response.ok) {
        throw new Error('Test failed to run');
      }

      const result = await response.json();
      
      // Update results state
      setResults(prev => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), result]
      }));

      return result;
    } catch (error) {
      console.error('Test error:', error);
      const errorResult: TestResult = {
        modelId,
        testId: testCase.id,
        success: false,
        timeTaken: 0,
        rawResponse: error instanceof Error ? error.message : String(error),
        matchedExpectation: false,
        reason: 'Test execution failed'
      };

      // Update results state even for failures
      setResults(prev => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), errorResult]
      }));

      return errorResult;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Payment Evaluation Tool</h1>
        
        <ModelSelector
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
        
        {selectedModel && (
          <TestRunner
            selectedModel={selectedModel}
            testCases={TEST_CASES}
            onRunTest={handleRunTest}
          />
        )}

        {/* Show results comparison if we have any results */}
        {Object.keys(results).length > 0 && (
          <TestResults 
            results={results}
            models={AVAILABLE_MODELS}
          />
        )}
      </div>
    </main>
  );
}
