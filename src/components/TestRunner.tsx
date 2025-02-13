import React, { useState } from 'react';
import { TestCase, TestResult } from '../types';

interface Props {
  selectedModel: string;
  testCases: TestCase[];
  onRunTest: (modelId: string, testCase: TestCase) => Promise<TestResult>;
}

export const TestRunner: React.FC<Props> = ({ selectedModel, testCases, onRunTest }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    const newResults: TestResult[] = [];
    
    for (const test of testCases) {
      const result = await onRunTest(selectedModel, test);
      newResults.push(result);
      setResults([...newResults]);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Test Cases</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          onClick={runAllTests}
          disabled={isRunning || !selectedModel}
        >
          {isRunning ? 'Running...' : 'Run All Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              result.matchedExpectation ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="font-medium">
              Test: {testCases[index].description}
            </div>
            <div className="text-sm mt-2">
              <div>Expected: {testCases[index].expectedSuccess ? 'Success' : 'Failure'}</div>
              <div>Result: {result.success ? 'Success' : 'Failure'}</div>
              <div>Reason: {result.reason}</div>
              <div>Time: {result.timeTaken}ms</div>
              {result.trace && result.trace.length > 0 && (
                <div>Trace: {result.trace.join(', ')}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 