import React from 'react';
import { TestResult, ModelConfig } from '@/types';

interface Props {
  results: Record<string, TestResult[]>; // modelId -> results
  models: ModelConfig[];
}

export const TestResults: React.FC<Props> = ({ results, models }) => {
  const calculateStats = (modelResults: TestResult[]) => {
    if (!modelResults?.length) return { successRate: 0, avgTime: 0, totalTests: 0 };
    
    const successful = modelResults.filter(r => r.success).length;
    const totalTime = modelResults.reduce((sum, r) => sum + r.timeTaken, 0);
    
    return {
      successRate: (successful / modelResults.length) * 100,
      avgTime: totalTime / modelResults.length,
      totalTests: modelResults.length
    };
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Model Performance Comparison</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {models.map(model => {
          const modelResults = results[model.id] || [];
          const stats = calculateStats(modelResults);
          
          return (
            <div 
              key={model.id}
              className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{model.name}</h3>
                <span className="text-sm text-gray-500">{model.provider}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                  <div className="font-medium text-lg">
                    {stats.successRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Time</div>
                  <div className="font-medium text-lg">
                    {(stats.avgTime / 1000).toFixed(2)}s
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tests Run</div>
                  <div className="font-medium text-lg">
                    {stats.totalTests}
                  </div>
                </div>
              </div>

              {/* Test Case Breakdown */}
              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">Test Case Results</div>
                <div className="space-y-2">
                  {modelResults.map((result, index) => (
                    <div 
                      key={result.testId}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{result.testId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 