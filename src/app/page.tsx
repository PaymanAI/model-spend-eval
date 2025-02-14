'use client';

import React, { useState, useEffect } from 'react';
import { ModelSelector } from '@/components/ModelSelector';
import { TestRunner } from '@/components/TestRunner';
import { TestResults } from '@/components/TestResults';
import { ModelConfig, TestCase, TestResult } from '@/types';
import { TEST_CASES } from '@/data/testCases';

const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'openai/gpt-4o-2024-11-20',
    name: 'GPT-4 Turbo',
    provider: 'openai'
  },
  {
    id: 'openai/gpt-4o-2024-08-06',
    name: 'GPT-4 (Aug 06)',
    provider: 'openai'
  },
  {
    id: 'openai/o3-mini-high',
    name: 'O3 Mini',
    provider: 'openai'
  },

  // Google Models
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'google'
  },
  {
    id: 'google/gemini-2.0-flash-lite-preview-02-05',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google',
    tags: ['free']
  },

  // Anthropic Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic'
  },

  // Mistral Models
  {
    id: 'mistralai/mistral-large-2411',
    name: 'Mistral Large',
    provider: 'mistralai'
  },
  {
    id: 'mistralai/ministral-8b',
    name: 'Ministral 8B',
    provider: 'mistralai'
  },

  // Other Leading Models
  {
    id: 'qwen/qwen-turbo',
    name: 'Qwen Turbo',
    provider: 'qwen'
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'meta'
  },
  {
    id: 'amazon/nova-lite-v1',
    name: 'Amazon Nova Lite',
    provider: 'amazon'
  }
];

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TestResult[]>>({});
  const [verdict, setVerdict] = useState<string | null>(null);
  const [isGeneratingVerdict, setIsGeneratingVerdict] = useState(false);

  // Handle shared results on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const sharedData = url.searchParams.get('share');
    
    if (sharedData) {
      try {
        const data = JSON.parse(atob(sharedData));
        setSelectedModel(data.model);
        setResults(data.results);
      } catch (err) {
        console.error('Failed to parse shared data:', err);
      }
    }
  }, []);

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
        reason: 'Test execution failed',
        testPassed: false
      };

      // Update results state even for failures
      setResults(prev => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), errorResult]
      }));

      return errorResult;
    }
  };

  const handleShare = async (): Promise<string> => {
    // Implement the logic to generate a shareable link
    // This is a placeholder and should be replaced with the actual implementation
    return 'https://example.com/share-link';
  };

  return (
    <main>
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">
              Think you can trust AI{" "}
              <span className="text-blue-500">with your money?</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-2">
              Pick an AI model and watch it try to handle money. Each AI has access to $100,000 but a strict $1,000 spending limit - and can only pay the T-Shirt Company.
            </p>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">
              Let's see if it follows the rules or goes on a wild spending spree like a teenager with their first credit card 💸
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-7xl">

        {/* Model Selection */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Select a model</h2>
            <ModelSelector
              models={AVAILABLE_MODELS}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
            
            {/* Funny Verdict Banner */}
            {(verdict || isGeneratingVerdict) && (
              <div className="mt-6 border-t pt-6">
                {/* Status Indicator */}
                {!isGeneratingVerdict && (
                  <div className="mb-4 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedModel && results[selectedModel]?.every(r => r.matchedExpectation)
                        ? results[selectedModel]?.reduce((sum, r) => sum + r.timeTaken, 0) / results[selectedModel]?.length > 5000
                          ? 'bg-yellow-400'  // Good but slow
                          : 'bg-blue-500'    // Good and fast
                        : 'bg-red-500'       // Bad with money
                    }`} />
                    <span className="text-sm text-gray-600">
                      {selectedModel && results[selectedModel]?.every(r => r.matchedExpectation)
                        ? results[selectedModel]?.reduce((sum, r) => sum + r.timeTaken, 0) / results[selectedModel]?.length > 5000
                          ? "Good with money, but takes their sweet time paying"
                          : "Excellent money management skills"
                        : "Probably shouldn't be trusted with a credit card"
                      }
                    </span>
                  </div>
                )}

                <div className={`${
                  isGeneratingVerdict 
                    ? 'bg-gray-50'
                    : selectedModel && results[selectedModel]?.every(r => r.matchedExpectation)
                      ? results[selectedModel]?.reduce((sum, r) => sum + r.timeTaken, 0) / results[selectedModel]?.length > 5000
                        ? 'bg-yellow-50'  // Good but slow
                        : 'bg-blue-50'    // Good and fast
                      : 'bg-red-50'       // Bad with money
                } rounded-2xl p-6`}>
                  <div className="space-y-4">
                    {isGeneratingVerdict ? (
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Generating verdict...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <svg className={`w-5 h-5 ${
                            isGeneratingVerdict 
                              ? 'text-gray-500'
                              : selectedModel && results[selectedModel]?.every(r => r.matchedExpectation)
                                ? results[selectedModel]?.reduce((sum, r) => sum + r.timeTaken, 0) / results[selectedModel]?.length > 5000
                                  ? 'text-yellow-500'  // Good but slow
                                  : 'text-blue-500'    // Good and fast
                                : 'text-red-500'       // Bad with money
                          }`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 7a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0112 7zm0 9a1 1 0 110-2 1 1 0 010 2z"/>
                          </svg>
                          <span className={`font-medium ${
                            isGeneratingVerdict 
                              ? 'text-gray-600'
                              : selectedModel && results[selectedModel]?.every(r => r.matchedExpectation)
                                ? results[selectedModel]?.reduce((sum, r) => sum + r.timeTaken, 0) / results[selectedModel]?.length > 5000
                                  ? 'text-yellow-600'  // Good but slow
                                  : 'text-blue-600'    // Good and fast
                                : 'text-red-600'       // Bad with money
                          }`}>Verdict</span>
                        </div>

                        {/* Verdict Text */}
                        <div className="text-gray-800 text-lg">
                          {verdict}
                        </div>

                        {/* Footer */}
                        <div className={`flex items-center justify-between pt-4 border-t ${
                          isGeneratingVerdict 
                            ? 'border-gray-100'
                            : selectedModel && results[selectedModel]?.every(r => r.matchedExpectation)
                              ? results[selectedModel]?.reduce((sum, r) => sum + r.timeTaken, 0) / results[selectedModel]?.length > 5000
                                ? 'border-yellow-100'  // Good but slow
                                : 'border-blue-100'    // Good and fast
                              : 'border-red-100'       // Bad with money
                        }`}>
                          <div className="text-sm text-gray-500">
                            Payments enabled by <span className="font-medium">Payman</span> — trust AI with money
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const url = await handleShare();
                                if (url) {
                                  await navigator.clipboard.writeText(url);
                                  alert('Share link copied!');
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                              </svg>
                              Copy Link
                            </button>
                            <a
                              href={`https://x.com/intent/tweet?text=${encodeURIComponent(verdict || '')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              Share on X
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Test Runner */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <TestRunner
                selectedModel={selectedModel}
                testCases={TEST_CASES}
                onRunTest={handleRunTest}
                models={AVAILABLE_MODELS}
                onVerdictGenerated={setVerdict}
                onVerdictGenerating={setIsGeneratingVerdict}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <TestResults
              results={results}
              models={AVAILABLE_MODELS}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
