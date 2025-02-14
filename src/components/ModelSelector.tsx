import React from 'react';
import { ModelConfig } from '@/types';
import Image from 'next/image';

interface Props {
  models: ModelConfig[];
  selectedModel: string | null;
  onSelectModel: (modelId: string | null) => void;
}

const PROVIDER_LOGOS: Record<string, string> = {
  openai: '/providers/openai.svg',
  google: '/providers/google.svg',
  anthropic: '/providers/anthropic.svg',
  mistralai: '/providers/mistral.svg',
  qwen: '/providers/qwen.svg',
  deepseek: '/providers/deepseek.svg',
  meta: '/providers/meta.svg',
  amazon: '/providers/amazon.svg'
};

export const ModelSelector: React.FC<Props> = ({ models, selectedModel, onSelectModel }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onSelectModel(model.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${selectedModel === model.id 
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300'
            }
          `}
        >
          {PROVIDER_LOGOS[model.provider] && (
            <Image 
              src={PROVIDER_LOGOS[model.provider]}
              alt={`${model.provider} logo`}
              width={16}
              height={16}
              className="object-contain"
            />
          )}
          <span>{model.name}</span>
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