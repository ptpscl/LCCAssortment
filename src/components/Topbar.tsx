import React from 'react';

interface TopbarProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Topbar({ title, action }: TopbarProps) {
  return (
    <div className="h-[64px] bg-white border-b border-border-subtle px-8 flex items-center justify-between shrink-0">
      <h2 className="text-[18px] font-semibold text-text-main">{title}</h2>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="h-10 px-4 bg-brand-600 text-white rounded-[8px] text-[13px] font-semibold hover:bg-brand-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
