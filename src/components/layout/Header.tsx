import React, { useState } from 'react';
import { Menu, X, MessageSquare, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateWhatsAppLink } from '../../lib/utils';

export interface HeaderProps {
  onOpenBooking?: () => void;
  onOpenSelector?: () => void;
  onNavigateHome?: () => void;
  onNavigateSection?: (href: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenSelector,
  onNavigateHome,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Vehicle Selector', href: '#vehicle-consultation', onClick: onOpenSelector },
    { label: 'Process', href: '#process' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Workshop', href: '#location' },
  ];

  // Prevent background scroll when mobile menu drawer is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-md border-b border-graphite-border/70 transition-colors">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Signature */}
          <a
            href="#"
            onClick={(e) => {
              if (onNavigateHome) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
            className="flex flex-col group cursor-pointer focus-visible:ring-1 focus-visible:ring-accent-gold"
          >
            <span className="text-lg sm:text-xl font-extrabold tracking-tighter text-warm-white group-hover:text-white transition-colors">
              TORQUE EXPERT’S
            </span>
            <span className="text-[10px] font-semibold tracking-eyebrow uppercase text-accent-gold">
              German & Luxury Car Specialists
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    link.onClick();
                  } else if (onNavigateSection) {
                    e.preventDefault();
                    onNavigateSection(link.href);
                  }
                }}
                className="text-xs font-medium uppercase tracking-wider text-muted hover:text-warm-white transition-colors duration-150 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={generateWhatsAppLink({})}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Direct WhatsApp Contact"
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-light min-h-[40px]">
                <MessageSquare className="w-3.5 h-3.5 text-accent-gold" />
                WhatsApp
              </Button>
            </a>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenBooking}
              className="gap-1.5 text-xs bg-warm-white text-obsidian font-bold min-h-[40px]"
            >
              <Wrench className="w-3.5 h-3.5" />
              Book a Service
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-menu-trigger"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-muted-light hover:text-warm-white focus-visible:ring-1 focus-visible:ring-accent-gold rounded-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-50 md:hidden bg-obsidian/98 backdrop-blur-xl border-t border-graphite-border px-6 py-6 flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-accent-gold uppercase font-semibold pb-2 border-b border-graphite-border">
              Navigation Menu
            </span>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    link.onClick();
                  } else if (onNavigateSection) {
                    e.preventDefault();
                    onNavigateSection(link.href);
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-base font-semibold tracking-tight text-warm-white py-3.5 border-b border-graphite-border/40 hover:text-accent-gold transition-colors flex items-center justify-between min-h-[48px]"
              >
                <span>{link.label}</span>
                <span className="text-xs font-mono text-muted-dark">→</span>
              </a>
            ))}
          </nav>
          
          <div className="pt-6 mt-4 border-t border-graphite-border flex flex-col gap-3 safe-pb">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full text-xs font-bold uppercase tracking-wider py-4 bg-warm-white text-obsidian min-h-[48px]"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Book Workshop Service
            </Button>
            <a
              href={generateWhatsAppLink({})}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" size="lg" className="w-full text-xs gap-2 py-4 border-graphite-border text-warm-white uppercase tracking-wider min-h-[48px]">
                <MessageSquare className="w-4 h-4 text-accent-gold" />
                WhatsApp an Expert
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
