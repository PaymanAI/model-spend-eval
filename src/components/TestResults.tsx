import React, { useState } from 'react';
import { TestResult, ModelConfig } from '@/types';
import { Tooltip } from './Tooltip';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/solid';

interface Props {
  results: Record<string, TestResult[]>;
  models: ModelConfig[];
}

export const TestResults: React.FC<Props> = ({ results, models }) => {
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});

  const toggleModelExpansion = (modelId: string) => {
    setExpandedModels(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

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
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Performance Analysis</h2>

      {modelStats.map(({ model, stats }) => (
        <div key={model.id} className="bg-gray-50 rounded-lg border">
          {/* Model Header - Always Visible */}
          <div className="p-6">
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

            {/* Stats Overview - Always Visible */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Tooltip content="Average response time per test">
                <div className="bg-white p-3 rounded-lg border">
                  <ClockIcon className="w-5 h-5 text-gray-600 mx-auto" />
                  <div className="text-sm font-medium mt-1 text-center">
                    {(stats.avgTime / 1000).toFixed(2)}s
                  </div>
                  <div className="text-xs text-gray-500 text-center">Avg Time</div>
                </div>
              </Tooltip>

              <Tooltip content="Tests that failed due to incorrect implementation">
                <div className="bg-white p-3 rounded-lg border">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mx-auto" />
                  <div className="text-sm font-medium mt-1 text-center">
                    {stats.implementationFailures}
                  </div>
                  <div className="text-xs text-gray-500 text-center">Implementation</div>
                </div>
              </Tooltip>

              <Tooltip content="Tests that produced unexpected results">
                <div className="bg-white p-3 rounded-lg border">
                  <XCircleIcon className="w-5 h-5 text-red-500 mx-auto" />
                  <div className="text-sm font-medium mt-1 text-center">
                    {stats.criticalFailures}
                  </div>
                  <div className="text-xs text-gray-500 text-center">Critical</div>
                </div>
              </Tooltip>
            </div>

            {/* Expansion Control */}
            <button
              onClick={() => toggleModelExpansion(model.id)}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expandedModels[model.id] ? (
                <>
                  <ChevronUpIcon className="w-4 h-4" />
                  Hide Test Results
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-4 h-4" />
                  Show All Test Results ({results[model.id]?.length || 0})
                </>
              )}
            </button>
          </div>

          {/* Expandable Test Results */}
          {expandedModels[model.id] && (
            <div className="border-t bg-white">
              <div className="p-6 space-y-2">
                {results[model.id]?.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${getStatusColor(result)} border`}
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
          )}
        </div>
      ))}
    </div>
  );
}; 