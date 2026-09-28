import React from 'react';
import { Compass } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-16 px-6 text-center max-w-md mx-auto flex flex-col items-center justify-center space-y-4 border border-white/5 bg-[#141419]/50">
      <div className="p-3 bg-white/5 border border-white/10 text-[#C5A880]">
        {icon || <Compass className="w-8 h-8" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-xl text-white tracking-wide">{title}</h3>
        <p className="text-xs text-[#D1CCC0] leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2 text-xs font-sans uppercase tracking-[0.2em] bg-[#1E1E26] hover:bg-[#282834] text-white border border-white/15 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
