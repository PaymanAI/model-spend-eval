import React, { useState } from 'react';
import { TestResult, ModelConfig } from '@/types';

interface Props {
  results: Record<string, TestResult[]>; // modelId -> results
  models: ModelConfig[];
}

export const TestResults: React.FC<Props> = ({ results, models }) => {
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});

  const getSuccessRate = (modelResults: TestResult[]) => {
    if (!modelResults.length) return 0;
    // Count tests where actual matches expected (matchedExpectation)
    const successCount = modelResults.filter(r => r.matchedExpectation).length;
    return (successCount / modelResults.length) * 100;
  };

  const toggleExpand = (modelId: string) => {
    setExpandedModels(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Test Results</h2>
      <div className="space-y-4">
        {Object.entries(results).map(([modelId, modelResults]) => {
          const successRate = getSuccessRate(modelResults);
          const model = models.find(m => m.id === modelId);
          const isExpanded = expandedModels[modelId];

          return (
            <div key={modelId} className="p-4 bg-white rounded-lg shadow">
              <div 
                className="flex justify-between items-center mb-2 cursor-pointer"
                onClick={() => toggleExpand(modelId)}
              >
                <div className="flex items-center gap-2">
                  <span className="transform transition-transform duration-200">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <h3 className="font-medium">{model?.name || modelId}</h3>
                </div>
                <span className={`px-2 py-1 rounded ${
                  successRate === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {successRate.toFixed(0)}% Pass
                </span>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2 pl-6">
                  {modelResults.map((result, index) => (
                    <div 
                      key={result.testId}
                      className={`p-2 rounded ${
                        result.matchedExpectation ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{result.testId}</span>
                        <span>{result.matchedExpectation ? 'Pass' : 'Fail'}</span>
                      </div>
                      <div className="text-sm mt-1">
                        <div>Result: {result.success ? 'Success' : 'Failure'}</div>
                        <div>Reason: {result.reason}</div>
                        {result.trace && result.trace.length > 0 && (
                          <div>Trace: {result.trace.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 