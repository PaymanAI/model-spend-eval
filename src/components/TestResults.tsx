import React from 'react';
import { TestResult, ModelConfig } from '@/types';
import { Tooltip } from './Tooltip';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/solid';

interface Props {
  results: Record<string, TestResult[]>;
  models: ModelConfig[];
}

export const TestResults: React.FC<Props> = ({ results, models }) => {
  const calculateStats = (modelResults: TestResult[]) => {
    if (!modelResults?.length) return {
      successRate: 0,
      avgTime: 0,
      totalTests: 0,
      criticalFailures: 0,
      implementationFailures: 0
    };
    
    const successful = modelResults.filter(r => r.matchedExpectation && r.testPassed).length;
    const criticalFails = modelResults.filter(r => !r.matchedExpectation && r.testPassed).length;
    const implementationFails = modelResults.filter(r => !r.testPassed).length;
    const totalTime = modelResults.reduce((sum, r) => sum + r.timeTaken, 0);
    
    return {
      successRate: (successful / modelResults.length) * 100,
      avgTime: totalTime / modelResults.length,
      totalTests: modelResults.length,
      criticalFailures: criticalFails,
      implementationFailures: implementationFails
    };
  };

  const getStatusColor = (result: TestResult) => {
    if (!result.testPassed) return 'bg-yellow-50';
    return result.matchedExpectation ? 'bg-green-50' : 'bg-red-50';
  };

  const getStatusText = (result: TestResult) => {
    if (!result.testPassed) return 'Implementation Error';
    return result.matchedExpectation ? 'Success' : 'Behavior Mismatch';
  };

  const modelStats = Object.entries(results).map(([modelId, modelResults]) => ({
    model: models.find(m => m.id === modelId) || { id: modelId, name: modelId, provider: 'unknown' },
    stats: calculateStats(modelResults),
    results: modelResults
  }));

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold">Performance Analysis</h2>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelStats.map(({ model, stats }) => (
          <div key={model.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium text-lg">{model.name}</h3>
                <span className="text-sm text-gray-500">{model.provider}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <Tooltip content="Average response time per test">
                <div className="bg-gray-50 p-2 rounded">
                  <ClockIcon className="w-5 h-5 text-gray-600 mx-auto" />
                  <div className="text-sm font-medium mt-1">
                    {(stats.avgTime / 1000).toFixed(2)}s
                  </div>
                  <div className="text-xs text-gray-500">Avg Time</div>
                </div>
              </Tooltip>

              <Tooltip content="Tests that failed due to incorrect implementation">
                <div className="bg-gray-50 p-2 rounded">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mx-auto" />
                  <div className="text-sm font-medium mt-1">
                    {stats.implementationFailures}
                  </div>
                  <div className="text-xs text-gray-500">Implementation</div>
                </div>
              </Tooltip>

              <Tooltip content="Tests that produced unexpected results">
                <div className="bg-gray-50 p-2 rounded">
                  <XCircleIcon className="w-5 h-5 text-red-500 mx-auto" />
                  <div className="text-sm font-medium mt-1">
                    {stats.criticalFailures}
                  </div>
                  <div className="text-xs text-gray-500">Critical</div>
                </div>
              </Tooltip>
            </div>

            {/* Test Results Summary */}
            <div className="mt-4 space-y-2">
              {results[model.id].map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-lg ${getStatusColor(result)} border`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!result.testPassed ? (
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                      ) : result.matchedExpectation ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {result.testId}
                      </span>
                    </div>
                    <span className="text-sm">
                      {getStatusText(result)}
                    </span>
                  </div>
                  {(!result.testPassed || !result.matchedExpectation) && (
                    <p className="text-sm mt-1 text-gray-600 ml-7">
                      {result.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Analysis */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-4">Response Time Comparison</h3>
        <div className="space-y-2">
          {modelStats.map(({ model, stats }) => (
            <div key={model.id} className="flex items-center gap-2">
              <div className="w-24 text-sm">{model.name}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div 
                  className="bg-blue-500 rounded-full h-4 transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (stats.avgTime / 2000) * 100)}%` 
                  }}
                />
              </div>
              <div className="w-20 text-sm text-right">
                {(stats.avgTime / 1000).toFixed(2)}s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 