import React from 'react';
import { ModelConfig } from '../types';

interface Props {
  models: ModelConfig[];
  selectedModel: string | null;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelector: React.FC<Props> = ({ models, selectedModel, onSelectModel }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Select Model</h2>
      <div className="grid grid-cols-3 gap-4">
        {models.map(model => (
          <button
            key={model.id}
            className={`p-4 rounded-lg border ${
              selectedModel === model.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelectModel(model.id)}
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-sm text-gray-500">{model.provider}</div>
          </button>
        ))}
      </div>
    </div>
  );
} 