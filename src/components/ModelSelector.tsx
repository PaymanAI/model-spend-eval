import React from 'react';
import { ModelConfig } from '@/types';

interface Props {
  models: ModelConfig[];
  selectedModel: string | null;
  onSelectModel: (modelId: string | null) => void;
}

export const ModelSelector: React.FC<Props> = ({ models, selectedModel, onSelectModel }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {models.map(model => (
        <button
          key={model.id}
          onClick={() => onSelectModel(model.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${selectedModel === model.id 
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300'
            }
          `}
        >
          {model.name}
          {model.tags?.includes('free') && (
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
              Free
            </span>
          )}
        </button>
      ))}
    </div>
  );
}; 