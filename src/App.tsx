import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { StickyMobileCTA } from './components/layout/StickyMobileCTA';
import { HeroChapter } from './features/home/HeroChapter';
import { SpecialistCareChapter } from './features/home/SpecialistCareChapter';
import { StandardChapter } from './features/home/StandardChapter';
import { ServicesChapter } from './features/home/ServicesChapter';
import { ProcessChapter } from './features/home/ProcessChapter';
import { VisibilityChapter } from './features/home/VisibilityChapter';
import { ServiceHistoryChapter } from './features/home/ServiceHistoryChapter';
import { CampaignChapter } from './features/home/CampaignChapter';
import { ClientExperienceChapter } from './features/home/ClientExperienceChapter';
import { ActionHubChapter } from './features/home/ActionHubChapter';
import { LocationChapter } from './features/home/LocationChapter';
import { FinalCtaChapter } from './features/home/FinalCtaChapter';
import { SmartEnquiryModal } from './components/shared/SmartEnquiryModal';
import { ServicesPage } from './features/services/ServicesPage';
import { BookServicePage } from './features/booking/BookServicePage';
import { FaqsPage } from './features/faqs/FaqsPage';
import { ContactPage } from './features/contact/ContactPage';
import { QuoteViewerPage } from './features/quotes/QuoteViewerPage';
import { ServiceStatusTrackerPage } from './features/status/ServiceStatusTrackerPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import type { DashboardNavModule } from './features/dashboard/DashboardLayout';
import { PrivateWorkshopOsPage } from './features/private/PrivateWorkshopOsPage';

export function App() {
  // Read initial query params for deep link handling e.g. ?page=status&jobToken=... or /service-status/:token or ?page=dashboard
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;

  let initialPage: 'home' | 'services' | 'book' | 'faqs' | 'contact' | 'quote' | 'status' | 'dashboard' | 'private-workshop-os' = 'home';
  let initialToken = 'track-bmw-jc2047'; // Seed default BMW job token
  let initialModule: DashboardNavModule = 'overview';
  let initialJobId: string | null = null;

  // Check URL pathname routing (/service-status/:token or /quote/:token or /dashboard or private sales route)
  if (path === '/private/workshop-os' || path === '/workshop-os/private' || path.startsWith('/private/workshop-os/')) {
    initialPage = 'private-workshop-os';
  } else if (path.startsWith('/service-status/')) {
    initialPage = 'status';
    initialToken = path.replace('/service-status/', '').trim();
  } else if (path.startsWith('/quote/')) {
    initialPage = 'quote';
    initialToken = path.replace('/quote/', '').trim();
  } else if (path.startsWith('/dashboard')) {
    initialPage = 'dashboard';
    const sub = path.replace(/^\/dashboard\/?/, '').trim() as DashboardNavModule;
    if (sub && sub.length > 0) initialModule = sub;
  } else if (params.get('page')) {
    initialPage = params.get('page') as any;
  } else if (params.get('jobToken')) {
    initialPage = 'status';
    initialToken = params.get('jobToken')!;
  } else if (params.get('quoteToken')) {
    initialPage = 'quote';
    initialToken = params.get('quoteToken')!;
  }

  if (params.get('jobToken')) initialToken = params.get('jobToken')!;
  if (params.get('quoteToken')) initialToken = params.get('quoteToken')!;
  if (params.get('page') === 'dashboard' || path.startsWith('/dashboard')) {
    initialPage = 'dashboard';
    if (params.get('module')) initialModule = params.get('module') as DashboardNavModule;
    if (params.get('jobId')) initialJobId = params.get('jobId');
  } else if (params.get('module')) {
    initialModule = params.get('module') as DashboardNavModule;
  }
  if (params.get('jobId')) initialJobId = params.get('jobId');

  const [currentPage, setCurrentPage] = useState<'home' | 'services' | 'book' | 'faqs' | 'contact' | 'quote' | 'status' | 'dashboard' | 'private-workshop-os'>(initialPage);
  const [previousPage, setPreviousPage] = useState<'home' | 'dashboard'>('home');
  const [activeToken, setActiveToken] = useState<string>(initialToken);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const s = new URLSearchParams(window.location.search);
      if (p === '/private/workshop-os' || p === '/workshop-os/private' || p.startsWith('/private/workshop-os/') || s.get('page') === 'private-workshop-os') {
        setCurrentPage('private-workshop-os');
      } else if (p.startsWith('/service-status/') || s.get('page') === 'status') {
        setCurrentPage('status');
        const tok = p.startsWith('/service-status/') ? p.replace('/service-status/', '').trim() : s.get('jobToken');
        if (tok) setActiveToken(tok);
      } else if (p.startsWith('/quote/') || s.get('page') === 'quote') {
        setCurrentPage('quote');
        const tok = p.startsWith('/quote/') ? p.replace('/quote/', '').trim() : s.get('quoteToken');
        if (tok) setActiveToken(tok);
      } else if (p.startsWith('/dashboard') || s.get('page') === 'dashboard') {
        setCurrentPage('dashboard');
      } else if (s.get('page')) {
        setCurrentPage(s.get('page') as any);
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<{ make: string; model: string; year: number } | null>(null);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);

  // Monitor Hero section visibility to hide sticky mobile CTA while user is within the hero
  useEffect(() => {
    if (currentPage !== 'home') {
      setIsHeroVisible(false);
      return;
    }

    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          // If any meaningful part of the hero is intersecting, consider it visible
          setIsHeroVisible(entry.isIntersecting);
        }
      },
      {
        threshold: 0.05, // triggers when hero enters/leaves viewport
      }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [currentPage]);

  const handleOpenBooking = (serviceSlug?: string) => {
    if (currentPage === 'home') {
      if (serviceSlug) setSelectedServiceSlug(serviceSlug);
      handleNavigateSection('#action-hub');
    } else {
      setSelectedVehicle(null);
      setSelectedServiceSlug(serviceSlug || null);
      setIsModalOpen(true);
    }
  };

  const handleNavigateSection = (href: string) => {
    const id = href.replace('#', '');
    const scrollTarget = () => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 84;
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop - headerOffset;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      }
    };

    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(scrollTarget, 100);
      setTimeout(scrollTarget, 300);
    } else {
      // Execute with microtask/RAF to ensure state updates (like selected service) take effect
      requestAnimationFrame(() => {
        scrollTarget();
      });
    }
  };

  const handleOpenSelector = () => {
    handleNavigateSection('#action-hub');
  };

  const handleSelectServiceForActionHub = (slug: string) => {
    setSelectedServiceSlug(slug);
    handleNavigateSection('#action-hub');
  };

  return (
    <div className="min-h-screen bg-obsidian text-warm-white flex flex-col selection:bg-accent-gold/20 selection:text-accent-gold pb-16 md:pb-0">
      
      {/* 1. Header Navigation - Clean single top header on public customer pages */}
      {currentPage !== 'dashboard' && currentPage !== 'private-workshop-os' && (
        <Header
          currentPage={currentPage}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuChange={setIsMobileMenuOpen}
          onOpenBooking={() => handleOpenBooking()}
          onOpenSelector={handleOpenSelector}
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateSection={handleNavigateSection}
          onNavigatePage={(page) => {
            if (page === 'status') {
              setActiveToken('track-bmw-jc2047');
              setCurrentPage('status');
            } else {
              setCurrentPage(page);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            {/* 01. HERO */}
            <HeroChapter
              onOpenBooking={() => handleNavigateSection('#action-hub')}
              onExploreServices={() => handleNavigateSection('#services')}
            />

            {/* 02. SPECIALIST CARE */}
            <SpecialistCareChapter
              onDiscoverStandard={() => handleNavigateSection('#torque-standard')}
            />

            {/* 03. TORQUE EXPERT STANDARD */}
            <StandardChapter
              onSeeHowItWorks={() => handleNavigateSection('#process')}
            />

            {/* 04. SPECIALIST SERVICES / SERVICE DISCOVERY */}
            <ServicesChapter
              onSelectServiceForBooking={handleSelectServiceForActionHub}
            />

            {/* 05. FROM CONCERN TO COLLECTION */}
            <ProcessChapter
              onStartServiceRequest={() => handleNavigateSection('#action-hub')}
            />

            {/* 06. YOUR VEHICLE. YOUR VISIBILITY. */}
            <VisibilityChapter
              onViewServiceStatus={() => {
                setActiveToken('track-bmw-jc2047');
                setCurrentPage('status');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 07. YOUR VEHICLE'S HISTORY. KEPT WITH THE SERVICE. */}
            <ServiceHistoryChapter />

            {/* 08. FEATURED SERVICE / PACKAGE */}
            <CampaignChapter
              onClaimSampleOffer={() => {
                setSelectedServiceSlug('periodic-service');
                handleNavigateSection('#action-hub');
              }}
            />

            {/* 09. CUSTOMER EXPERIENCE & 10. FAQ */}
            <ClientExperienceChapter
              onContactWorkshop={() => handleNavigateSection('#location')}
            />

            {/* 11. ACTION HUB (Consolidated Primary Conversion Destination) */}
            <ActionHubChapter
              selectedServicePreselect={selectedServiceSlug}
              onServiceSelect={(slug) => setSelectedServiceSlug(slug)}
              onViewServiceStatus={() => {
                setActiveToken('track-bmw-jc2047');
                setCurrentPage('status');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onContactWorkshop={() => handleNavigateSection('#location')}
            />

            {/* 12. THE WORKSHOP (Location, Directions, Hours) */}
            <LocationChapter />

            {/* 13. FINAL CTA */}
            <FinalCtaChapter
              onBookService={() => handleNavigateSection('#action-hub')}
              onContactWorkshop={() => handleNavigateSection('#location')}
            />
          </>
        )}

        {currentPage === 'services' && (
          <ServicesPage onOpenBooking={(slug) => handleOpenBooking(slug)} />
        )}

        {currentPage === 'book' && (
          <BookServicePage onBackToHome={() => setCurrentPage('home')} preselectedServiceSlug={selectedServiceSlug} />
        )}

        {currentPage === 'faqs' && (
          <FaqsPage />
        )}

        {currentPage === 'contact' && (
          <ContactPage />
        )}

        {currentPage === 'quote' && (
          <QuoteViewerPage token={activeToken} onBack={() => setCurrentPage(previousPage)} />
        )}

        {currentPage === 'status' && (
          <ServiceStatusTrackerPage token={activeToken} onBack={() => setCurrentPage('home')} />
        )}

        {currentPage === 'private-workshop-os' && (
          <PrivateWorkshopOsPage
            onNavigateHome={() => setCurrentPage('home')}
            onNavigateContact={() => setCurrentPage('contact')}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            initialModule={initialModule}
            initialJobId={initialJobId}
            onLogout={() => setCurrentPage('home')}
            onOpenQuoteToken={(tok) => {
              setPreviousPage('dashboard');
              setActiveToken(tok);
              setCurrentPage('quote');
            }}
            onOpenJobToken={(tok) => {
              setPreviousPage('dashboard');
              setActiveToken(tok);
              setCurrentPage('status');
            }}
          />
        )}
      </main>

      {/* Editorial Footer & Mobile Sticky CTA - Public customer pages only */}
      {currentPage !== 'dashboard' && currentPage !== 'private-workshop-os' && (
        <>
          <Footer
            onNavigateSection={handleNavigateSection}
            onNavigatePage={(page) => {
              if (page === 'status') {
                setActiveToken('track-bmw-jc2047');
                setCurrentPage('status');
              } else {
                setCurrentPage(page);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          <StickyMobileCTA
            isVisible={
              !isModalOpen &&
              !isMobileMenuOpen &&
              (currentPage !== 'home' || !isHeroVisible)
            }
            onOpenBooking={() => {
              if (currentPage === 'home') {
                handleNavigateSection('#action-hub');
              } else {
                handleOpenBooking();
              }
            }}
          />
        </>
      )}

      {/* Structured Smart Enquiry Modal */}
      <SmartEnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialVehicle={selectedVehicle}
        initialServiceSlug={selectedServiceSlug}
      />

    </div>
  );
}

export default App;
