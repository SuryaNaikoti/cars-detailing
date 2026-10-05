import React, { useState } from 'react';
import { Menu, X, MessageSquare, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateWhatsAppLink } from '../../lib/utils';

export interface HeaderProps {
  onOpenBooking?: () => void;
  onOpenSelector?: () => void;
  onNavigateHome?: () => void;
  onNavigateSection?: (href: string) => void;
  onNavigatePage?: (page: 'home' | 'services' | 'book' | 'faqs' | 'contact' | 'status') => void;
  currentPage?: string;
  isMobileMenuOpen?: boolean;
  onMobileMenuChange?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenSelector,
  onNavigateHome,
  onNavigateSection,
  onNavigatePage,
  currentPage = 'home',
  isMobileMenuOpen: controlledOpen,
  onMobileMenuChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const mobileMenuOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setMobileMenuOpen = (open: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(open);
    }
    if (onMobileMenuChange) {
      onMobileMenuChange(open);
    }
  };

  const navLinks = [
    { label: 'Services', href: '#services', page: 'services' as const },
    { label: 'Process', href: '#process' },
    { label: 'FAQ', href: '#faq', page: 'faqs' as const },
    { label: 'Workshop', href: '#location', page: 'contact' as const },
    { label: 'Book Service', href: '#action-hub', onClick: onOpenSelector },
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

  const handleLinkClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // Ensure body scroll is unlocked before executing scroll/navigation
    document.body.style.overflow = '';

    setTimeout(() => {
      if (link.onClick) {
        link.onClick();
      } else if (currentPage !== 'home' && link.page && onNavigatePage) {
        onNavigatePage(link.page);
      } else if (onNavigateSection) {
        onNavigateSection(link.href);
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-50 bg-obsidian/95 backdrop-blur-md border-b border-graphite-border/70 transition-colors">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Signature */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              document.body.style.overflow = '';
              if (onNavigateHome) {
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
                  e.preventDefault();
                  if (link.onClick) {
                    link.onClick();
                  } else if (currentPage !== 'home' && link.page && onNavigatePage) {
                    onNavigatePage(link.page);
                  } else if (onNavigateSection) {
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
              className="p-2.5 text-muted-light hover:text-warm-white focus-visible:ring-1 focus-visible:ring-accent-gold rounded-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-accent-gold" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Dimmed backdrop to close drawer when clicking anywhere outside */}
          <div
            id="mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-20 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Mobile Drawer */}
          <div 
            id="mobile-navigation-drawer"
            className="fixed inset-x-0 top-20 z-50 md:hidden flex flex-col bg-obsidian border-b border-graphite-border shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 overflow-hidden"
            style={{ maxHeight: 'calc(100dvh - 5rem)' }}
          >
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col justify-between max-h-[calc(100dvh-5rem)]">
              <nav className="flex flex-col space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
                  <span className="text-[10px] font-mono tracking-widest text-accent-gold uppercase font-semibold">
                    Navigation Menu
                  </span>
                  <span className="text-[10px] text-muted-dark uppercase tracking-wider font-mono">
                    {currentPage.toUpperCase()}
                  </span>
                </div>

                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link)}
                    className="text-base font-semibold tracking-tight text-warm-white py-3 border-b border-graphite-border/40 hover:text-accent-gold active:text-accent-gold transition-colors flex items-center justify-between min-h-[48px] cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs font-mono text-muted-dark">→</span>
                  </a>
                ))}

                {/* Extended Mobile Direct Page Links */}
                {onNavigatePage && (
                  <div className="pt-2 flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        document.body.style.overflow = '';
                        onNavigatePage('status');
                      }}
                      className="text-left text-xs uppercase tracking-wider text-muted-light py-2.5 hover:text-accent-gold flex items-center justify-between min-h-[44px] cursor-pointer"
                    >
                      <span>Track Live Service Status</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20">LIVE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        document.body.style.overflow = '';
                        onNavigatePage('contact');
                      }}
                      className="text-left text-xs uppercase tracking-wider text-muted-light py-2.5 hover:text-accent-gold flex items-center justify-between min-h-[44px] cursor-pointer"
                    >
                      <span>Direct Workshop Contact & Directions</span>
                      <span className="text-xs font-mono text-muted-dark">→</span>
                    </button>
                  </div>
                )}
              </nav>
              
              <div className="pt-4 mt-3 border-t border-graphite-border flex flex-col gap-2.5 pb-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = '';
                    if (onOpenBooking) onOpenBooking();
                  }}
                  className="w-full text-xs font-bold uppercase tracking-wider py-3.5 bg-warm-white text-obsidian min-h-[48px] cursor-pointer"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Book Workshop Service
                </Button>
                <a
                  href={generateWhatsAppLink({})}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                  className="w-full"
                >
                  <Button variant="outline" size="lg" className="w-full text-xs gap-2 py-3.5 border-graphite-border text-warm-white uppercase tracking-wider min-h-[48px] cursor-pointer">
                    <MessageSquare className="w-4 h-4 text-accent-gold" />
                    WhatsApp an Expert
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
