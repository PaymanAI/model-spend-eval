import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  content: string;
}

export const Tooltip: React.FC<Props> = ({ children, content }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white p-2 rounded text-sm bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2 border-8 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}; 