import React, { useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MobileFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionDisabled?: boolean;
  primaryActionVariant?: 'gold' | 'emerald' | 'danger';
  cancelActionLabel?: string;
  onCancel?: () => void;
  footer?: React.ReactNode;
  maxWidth?: string;
  maxWidthClass?: string;
  className?: string;
  hideFooter?: boolean;
}

export const MobileFormSheet: React.FC<MobileFormSheetProps> = ({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionDisabled = false,
  primaryActionVariant = 'gold',
  cancelActionLabel = 'Cancel',
  onCancel,
  footer,
  maxWidth,
  maxWidthClass = 'sm:max-w-xl',
  className,
  hideFooter = false,
}) => {
  // Prevent background scroll when sheet is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getPrimaryButtonClasses = () => {
    switch (primaryActionVariant) {
      case 'emerald':
        return 'bg-emerald-500 hover:bg-white text-obsidian font-extrabold';
      case 'danger':
        return 'bg-red-500 hover:bg-red-400 text-white font-extrabold';
      case 'gold':
      default:
        return 'bg-accent-gold hover:bg-white text-obsidian font-extrabold';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      {/* 
        On < 640px: Full screen viewport container (w-full h-full rounded-none)
        On >= 640px: Floating editorial modal (rounded-xs border max-h-[92vh])
      */}
      <div
        className={cn(
          "w-full h-full sm:h-auto sm:max-h-[92vh] bg-obsidian border-0 sm:border sm:border-graphite-border sm:rounded-xs shadow-2xl flex flex-col overflow-hidden",
          maxWidth || maxWidthClass,
          className
        )}
      >
        {/* 1. FIXED HEADER */}
        <div className="shrink-0 h-16 sm:h-16 px-4 sm:px-6 bg-obsidian border-b border-graphite-border flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-2 -ml-2 text-muted hover:text-warm-white rounded-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Back / Close"
            >
              <ChevronLeft className="w-5 h-5 text-accent-gold" />
            </button>
            <div className="space-y-0.5">
              {eyebrow && (
                <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-semibold leading-none">
                  {eyebrow}
                </span>
              )}
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-warm-white truncate">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-warm-white rounded-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 overscroll-contain">
          {children}
        </div>

        {/* 3. STICKY ACTION BAR */}
        {!hideFooter && (
          <div className="shrink-0 bg-obsidian/95 backdrop-blur-md border-t border-graphite-border px-4 sm:px-6 py-3 sm:py-4 pb-safe flex items-center justify-end gap-3 z-20">
            {footer ? (
              footer
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="flex-1 sm:flex-initial px-5 py-3 sm:py-2.5 bg-graphite border border-graphite-border hover:border-warm-white/40 text-muted hover:text-warm-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px] cursor-pointer"
                >
                  {cancelActionLabel}
                </button>
                {primaryActionLabel && onPrimaryAction && (
                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    disabled={primaryActionDisabled}
                    className={cn(
                      "flex-1 sm:flex-initial px-6 py-3 sm:py-2.5 rounded-xs text-xs uppercase tracking-wider transition-all min-h-[44px] cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                      getPrimaryButtonClasses()
                    )}
                  >
                    {primaryActionLabel}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
