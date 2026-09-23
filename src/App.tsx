import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { StickyMobileCTA } from './components/layout/StickyMobileCTA';
import { HeroChapter } from './features/home/HeroChapter';
import { SpecialistCareChapter } from './features/home/SpecialistCareChapter';
import { StandardChapter } from './features/home/StandardChapter';
import { VehicleConsultationChapter } from './features/home/VehicleConsultationChapter';
import { ServicesChapter } from './features/home/ServicesChapter';
import { ProcessChapter } from './features/home/ProcessChapter';
import { VisibilityChapter } from './features/home/VisibilityChapter';
import { ServiceHistoryChapter } from './features/home/ServiceHistoryChapter';
import { CampaignChapter } from './features/home/CampaignChapter';
import { ClientExperienceChapter } from './features/home/ClientExperienceChapter';
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
  const [selectedVehicle, setSelectedVehicle] = useState<{ make: string; model: string; year: number } | null>(null);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);

  const handleOpenBooking = (serviceSlug?: string) => {
    setSelectedVehicle(null);
    setSelectedServiceSlug(serviceSlug || null);
    setIsModalOpen(true);
  };

  const handleNavigateSection = (href: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenSelector = () => {
    handleNavigateSection('#vehicle-consultation');
  };

  const handleStartEnquiryWithContext = (
    vehicle: { make: string; model: string; year: number },
    serviceSlug?: string
  ) => {
    setSelectedVehicle(vehicle);
    setSelectedServiceSlug(serviceSlug || null);
    setIsModalOpen(true);
  };

  const handleClaimSampleOffer = () => {
    setSelectedVehicle({ make: 'Sample Marque', model: 'Luxury Series', year: 2023 });
    setSelectedServiceSlug('periodic-service');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-obsidian text-warm-white flex flex-col selection:bg-accent-gold/20 selection:text-accent-gold pb-16 md:pb-0">
      
      {/* 1. Header Navigation - Clean single top header on public customer pages */}
      {currentPage !== 'dashboard' && currentPage !== 'private-workshop-os' && (
        <Header
          onOpenBooking={() => handleOpenBooking()}
          onOpenSelector={handleOpenSelector}
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateSection={handleNavigateSection}
        />
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            {/* 01. Cinematic Hero */}
            <HeroChapter
              onOpenBooking={() => handleNavigateSection('#vehicle-consultation')}
              onExploreServices={() => handleNavigateSection('#services')}
            />

            {/* 02. Specialist Care */}
            <SpecialistCareChapter
              onDiscoverStandard={() => handleNavigateSection('#torque-standard')}
            />

            {/* 03. The Torque Expert Standard (4 Strategic Trust Pillars) */}
            <StandardChapter
              onSeeHowItWorks={() => handleNavigateSection('#process')}
            />

            {/* 04. What Do You Drive? (Primary Qualification / Conversion) */}
            <VehicleConsultationChapter
              onStartEnquiryWithContext={handleStartEnquiryWithContext}
              selectedServicePreselect={selectedServiceSlug || undefined}
            />

            {/* 05. Specialist Services (6 Disciplines with Problem Prompts & Micro-CTAs) */}
            <ServicesChapter
              onSelectServiceForBooking={(slug) => {
                setSelectedServiceSlug(slug);
                handleNavigateSection('#vehicle-consultation');
              }}
            />

            {/* 06. From Concern to Collection (7 Canonical Stages) */}
            <ProcessChapter
              onStartServiceRequest={() => handleNavigateSection('#vehicle-consultation')}
            />

            {/* 07. Your Vehicle. Your Visibility. (Sanitized Customer Status Showcase) */}
            <VisibilityChapter
              onViewServiceStatus={() => {
                setActiveToken('track-bmw-jc2047');
                setCurrentPage('status');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 08. Your Vehicle's History (Archival Lifecycle & Long-Term Value) */}
            <ServiceHistoryChapter />

            {/* 09. Featured Service / Package (Starting from ₹14,999) */}
            <CampaignChapter
              onClaimSampleOffer={handleClaimSampleOffer}
            />

            {/* 10. Customer Experience & 11. FAQ Objection Handling */}
            <ClientExperienceChapter
              onContactWorkshop={() => handleNavigateSection('#location')}
            />

            {/* 12. The Workshop (Location, Hours, Directions) */}
            <LocationChapter />

            {/* 13. Final Conversion CTA */}
            <FinalCtaChapter
              onBookService={() => handleNavigateSection('#vehicle-consultation')}
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
            isVisible={!isModalOpen}
            onOpenBooking={() => {
              if (currentPage === 'home') {
                handleNavigateSection('#vehicle-consultation');
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
