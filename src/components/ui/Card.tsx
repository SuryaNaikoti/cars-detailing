import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-graphite/80 border border-graphite-border',
    elevated: 'bg-graphite-card border border-graphite-subtle shadow-subtle',
    interactive: 'bg-graphite/70 border border-graphite-border hover:border-warm-white/30 hover:bg-graphite transition-all duration-200 cursor-pointer',
    outline: 'bg-transparent border border-graphite-border',
  };

  return (
    <div
      className={cn(
        'rounded-md p-6 text-warm-white relative overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'outline' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-graphite-subtle text-warm-white border border-graphite-border',
    gold: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
    outline: 'bg-transparent text-muted-light border border-graphite-border',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-xs text-[11px] font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
