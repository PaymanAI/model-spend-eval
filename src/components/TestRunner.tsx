import React, { useState, useEffect } from 'react';
import { TestCase, TestResult, ModelConfig } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ShareIcon } from '@heroicons/react/24/solid';
import { Tooltip } from './Tooltip';

interface Props {
  selectedModel: string | null;
  testCases: TestCase[];
  onRunTest: (modelId: string, testCase: TestCase) => Promise<TestResult>;
  models: ModelConfig[];
  onVerdictGenerated: (verdict: string | null) => void;
  onVerdictGenerating: (isGenerating: boolean) => void;
}

export const TestRunner: React.FC<Props> = ({ selectedModel, testCases, onRunTest, models, onVerdictGenerated, onVerdictGenerating }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(-1);
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});
  const [loadingTests, setLoadingTests] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<string | null>(null);

  const getFunnyVerdict = async (results: TestResult[], modelId: string | null) => {
    if (!modelId) return null;
    
    const modelConfig = models.find(m => m.id === modelId);
    const modelName = modelConfig?.name || modelId;
    
    try {
      const response = await fetch('/api/generate-verdict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName,
          modelProvider: modelConfig?.provider,
          results: results.map(r => ({
            testCase: testCases.find(t => t.id === r.testId),
            modelProvider: modelConfig?.provider,
            ...r,
            timeTaken: r.timeTaken
          }))
        }),
      });

      const data = await response.json();
      return data.verdict;
    } catch (error) {
      console.error('Failed to get verdict:', error);
      return `🤖 ${modelName} is... well, let's just say it's special`;
    }
  };

  const runAllTests = async () => {
    if (!selectedModel) return;
    setIsRunning(true);
    setLoadingTests(true);
    onVerdictGenerated(null); // Clear old verdict
    setResults([]);
    const newResults: TestResult[] = [];
    
    for (let i = 0; i < testCases.length; i++) {
      setCurrentTestIndex(i);
      const result = await onRunTest(selectedModel, testCases[i]);
      newResults.push(result);
      setResults([...newResults]);
    }
    
    setCurrentTestIndex(-1);
    setIsRunning(false);
    setLoadingTests(false);
    
    // Get custom verdict after tests complete
    onVerdictGenerating(true);
    const customVerdict = await getFunnyVerdict(newResults, selectedModel);
    onVerdictGenerated(customVerdict);
    onVerdictGenerating(false);
  };

  const toggleTestDetails = (testId: string) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const getStatusColor = (result: TestResult) => {
    if (!result.testPassed) {
      return 'bg-yellow-50 border-yellow-200'; // Implementation error
    }
    if (result.matchedExpectation) {
      return 'bg-green-50 border-green-200'; // Success
    }
    return 'bg-red-50 border-red-200'; // Expected behavior mismatch
  };

  const getStatusIcon = (result: TestResult) => {
    if (!result.testPassed) {
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    }
    return result.matchedExpectation ? 
      <CheckCircleIcon className="w-6 h-6 text-green-500" /> :
      <XCircleIcon className="w-6 h-6 text-red-500" />;
  };

  const getStatusText = (result: TestResult) => {
    if (!result.testPassed) {
      return 'Implementation Error';
    }
    return result.matchedExpectation ? 'Success' : 'Behavior Mismatch';
  };

  const handleShare = async () => {
    if (!selectedModel || !results.length) return null;
    
    // Create a shareable URL with model, results and verdict
    const shareData = {
      model: selectedModel,
      results: results.map(r => ({
        testId: r.testId,
        success: r.success,
        matchedExpectation: r.matchedExpectation,
        reason: r.reason
      })),
      verdict: verdict
    };

    // Create URL with data
    const url = new URL(window.location.origin);
    url.searchParams.set('share', btoa(JSON.stringify(shareData)));
    
    return url.toString();
  };

  // Add this to test the OG tags
  useEffect(() => {
    if (results.length > 0) {
      handleShare().then(url => {
        if (url) {
          console.log('Shareable URL:', url);
        }
      });
    }
  }, [results]);

  const selectedModelConfig = models.find(m => m.id === selectedModel);
  const modelName = selectedModelConfig?.name || selectedModel;

  return (
    <div className="space-y-6">
      {/* Onboarding Banner */}
      

      {/* Test Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Test Cases</h2>
        <div className="flex gap-2">
          {!selectedModel ? (
            <div className="text-gray-500 italic">Please select a model to run tests</div>
          ) : (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          )}
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-4">
        {/* Show loading skeleton for tests being run */}
        {loadingTests && currentTestIndex >= 0 && testCases.slice(currentTestIndex).map((test, idx) => (
          <div key={`loading-${test.id}`} className="p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div>
                <h3 className="font-medium">{test.description}</h3>
                <div className="text-sm text-gray-600">Running...</div>
              </div>
            </div>
          </div>
        ))}

        {results.map((result, index) => {
          const test = testCases[index];
          const isExpanded = expandedTests[test.id];
          const isCurrentTest = currentTestIndex === index;

          return (
            <div 
              key={test.id}
              className={`p-4 rounded-lg border ${getStatusColor(result)}`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleTestDetails(test.id)}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result)}
                  <div>
                    <h3 className="font-medium">{test.description}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {isCurrentTest ? 'Running...' : `${result.timeTaken}ms`}
                      </span>
                      <span className="text-sm font-medium">
                        {getStatusText(result)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>

              {/* Expanded Test Details - updated for better organization */}
              {isExpanded && (
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-800 text-gray-200 p-3 rounded">
                    <code className="whitespace-pre-wrap">{test.prompt}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium mb-1">Expected Behavior</h4>
                      <p className="text-sm">{test.reason}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium mb-1">Actual Result</h4>
                      <p className="text-sm">{result.reason}</p>
                    </div>
                  </div>

                  {result.trace && result.trace.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium mb-2">Execution Trace</h4>
                      <div className="text-sm space-y-1">
                        {result.trace.map((step, i) => (
                          <div key={i} className="py-1 border-b last:border-0">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-lg border">
                    <h4 className="font-medium mb-2">Raw Response</h4>
                    <Tooltip content="The complete response from the AI model">
                      <div className="text-sm max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{result.rawResponse}</pre>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 