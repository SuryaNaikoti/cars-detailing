import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.99]";
    
    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded-sm gap-1.5 tracking-wide",
      md: "text-sm px-5 py-2.5 rounded-sm gap-2 tracking-wide",
      lg: "text-base px-6 py-3.5 rounded-sm gap-2.5 font-semibold",
    };

    const variants = {
      primary: "bg-warm-white text-obsidian hover:bg-white hover:shadow-subtle border border-transparent",
      secondary: "bg-graphite text-warm-white hover:bg-graphite-subtle border border-graphite-border",
      gold: "bg-accent-gold text-obsidian font-semibold hover:bg-accent-goldHover shadow-subtle border border-accent-gold",
      outline: "bg-transparent text-warm-white border border-graphite-border hover:border-warm-white/40 hover:bg-graphite/40",
      ghost: "bg-transparent text-muted hover:text-warm-white hover:bg-graphite/30",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
