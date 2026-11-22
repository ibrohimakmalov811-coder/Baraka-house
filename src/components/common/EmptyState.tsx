import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`p-10 sm:p-14 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl flex flex-col items-center justify-center text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-xs leading-relaxed">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] font-semibold text-xs border border-[var(--border)] transition"
          >
            <Plus className="w-4 h-4" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
};
