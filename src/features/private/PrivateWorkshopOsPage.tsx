import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Shield,
  Layers,
  Wrench,
  Users,
  Calendar,
  ClipboardList,
  Search,
  FileText,
  Activity,
  History,
  Bell,
  BarChart3,
  Car,
  ExternalLink,
} from 'lucide-react';
import { Container } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { PrivateDemoModal } from './components/PrivateDemoModal';

interface PrivateWorkshopOsPageProps {
  onNavigateHome?: () => void;
  onNavigateContact?: () => void;
}

export const PrivateWorkshopOsPage: React.FC<PrivateWorkshopOsPageProps> = ({
  onNavigateContact,
}) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [modalInterest, setModalInterest] = useState('Workshop OS — Standard Package');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Set noindex, nofollow metadata dynamically for this private route
  React.useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
      created = true;
    }
    const previousContent = metaRobots.content;
    metaRobots.content = 'noindex, nofollow';

    // Update document title for private sales context
    const previousTitle = document.title;
    document.title = 'Workshop OS — A Digital Operating System for Modern Automotive Workshops';

    window.scrollTo({ top: 0, behavior: 'instant' as any });

    return () => {
      document.title = previousTitle;
      if (metaRobots) {
        if (created) {
          metaRobots.remove();
        } else {
          metaRobots.content = previousContent;
        }
      }
    };
  }, []);

  const handleOpenDemo = (interest: string = 'Workshop OS — Standard Package') => {
    setModalInterest(interest);
    setIsDemoModalOpen(true);
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 12 Feature Domains
  const FEATURE_DOMAINS = [
    {
      title: 'Customer Management',
      desc: 'Centralise customer contact details, communication logs, active vehicles, and service history without messy WhatsApp threads.',
      icon: Users,
    },
    {
      title: 'Vehicle Records',
      desc: 'Track complete vehicle profiles, VINs, license plates, engine codes, past repair notes, and current workshop status.',
      icon: Car,
    },
    {
      title: 'Appointments & Scheduling',
      desc: 'Organise arrival dates, time slots, customer symptoms, and intake capacity directly from reception.',
      icon: Calendar,
    },
    {
      title: 'Digital Job Cards',
      desc: 'Replace clipboard paperwork with digital job cards that follow the vehicle through all 8 operational stages.',
      icon: ClipboardList,
    },
    {
      title: 'Digital Inspections',
      desc: '12-point structured vehicle check. Record observations, photos, and severity before work is estimated.',
      icon: Search,
    },
    {
      title: 'Estimates & Approvals',
      desc: 'Generate clean parts and labour estimates. Give customers clear choices with itemised approval controls.',
      icon: FileText,
    },
    {
      title: 'Technician & Bay Management',
      desc: 'Assign technicians, monitor bay occupancy (Bays 01–06), track active workload, and eliminate shop-floor bottlenecks.',
      icon: Wrench,
    },
    {
      title: 'Workshop Dashboard',
      desc: 'Real-time visibility over active jobs, vehicles requiring attention, pending estimates, and daily throughput.',
      icon: Activity,
    },
    {
      title: 'Customer Service Status',
      desc: 'Give customers a dedicated, mobile-friendly link to view the latest workshop status without calling reception.',
      icon: ExternalLink,
    },
    {
      title: 'Service History',
      desc: 'Permanent digital archive of every delivered job, replaced part, and scope value for long-term customer retention.',
      icon: History,
    },
    {
      title: 'Follow-ups & Reminders',
      desc: 'Automatically capture declined recommendations and scheduled maintenance with one-click WhatsApp follow-ups.',
      icon: Bell,
    },
    {
      title: 'Reports & Analytics',
      desc: 'Track jobs opened, completed, delivered, intake funnels, and approved scope values across custom date ranges.',
      icon: BarChart3,
    },
  ];

  // 13 FAQ Items
  const FAQS = [
    {
      q: "Do I need to replace everything we're currently using?",
      a: "No. We can start with the core workshop workflow and determine what should remain in your existing setup.",
    },
    {
      q: "Is this only for large workshops?",
      a: "No. The system is designed to scale from an independent specialist workshop to larger operations.",
    },
    {
      q: "Do my employees need technical knowledge?",
      a: "No. The system is designed around everyday workshop workflows rather than technical software concepts.",
    },
    {
      q: "Can the system be customised for our workshop?",
      a: "Yes. The standard setup covers the core workflow. Additional workflow, branding and integration requirements can be scoped separately.",
    },
    {
      q: "Can customers see our internal workshop information?",
      a: "No. Customer-facing views are designed to expose only information relevant to the customer.",
    },
    {
      q: "Can I start with one workshop?",
      a: "Yes. The initial offering is designed around a single workshop location.",
    },
    {
      q: "Do I need a long-term contract?",
      a: "No long-term commitment is required for the standard starting package.",
    },
    {
      q: "Can you help us set it up?",
      a: "Yes. Setup and onboarding are part of the initial implementation.",
    },
  ];

  // Vehicle Journey Stages
  const JOURNEY_STAGES = [
    'ENQUIRY',
    'APPOINTMENT',
    'ARRIVAL',
    'JOB CARD',
    'INSPECTION',
    'ESTIMATE',
    'CUSTOMER APPROVAL',
    'WORK IN PROGRESS',
    'QUALITY CHECK',
    'READY FOR COLLECTION',
    'DELIVERY',
    'SERVICE HISTORY',
    'FOLLOW-UP',
  ];

  return (
    <div className="bg-obsidian text-warm-white selection:bg-accent-gold/20 selection:text-accent-gold min-h-screen">
      
      {/* PRIVATE HEADER BAR */}
      <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-md border-b border-graphite-border">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tighter text-warm-white">
                  WORKSHOP OS
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-accent-gold bg-accent-gold/10 border border-accent-gold/30 rounded-xs">
                  PRIVATE
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-eyebrow uppercase text-muted">
                Powered by Niche Synthesis
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleScrollToSection('pricing')}
                className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-muted hover:text-warm-white transition-colors"
              >
                Commercial Offer
              </button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleOpenDemo('Header CTA')}
                className="text-xs font-bold uppercase tracking-wider min-h-[40px]"
              >
                Book a Private Demo
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* ============================================================== */}
      {/* SECTION 01 — HERO */}
      {/* ============================================================== */}
      <section id="hero" className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-graphite-border overflow-hidden">
        {/* Subtle background ambient automotive lighting */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-graphite-subtle rounded-full blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl space-y-6">
            
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-accent-gold" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-accent-gold font-mono">
                A DIGITAL OPERATING SYSTEM FOR MODERN WORKSHOPS
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-warm-white leading-[1.08] uppercase">
              Run your entire workshop from one place.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-light font-light leading-relaxed max-w-3xl">
              From the first customer enquiry to vehicle delivery and follow-up — manage customers, vehicles, appointments, job cards, inspections, estimates, technicians, workshop bays and service history through one connected system.
            </p>

            {/* Supporting line */}
            <p className="text-xs sm:text-sm text-muted font-normal">
              Built for independent workshops, specialist garages and growing automotive service businesses.
            </p>

            {/* Action buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={() => handleOpenDemo('Hero Primary CTA')}
                className="w-full sm:w-auto text-xs sm:text-sm font-extrabold uppercase tracking-wider gap-2 min-h-[52px]"
              >
                <span>BOOK A PRIVATE DEMO</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => handleScrollToSection('solution')}
                className="w-full sm:w-auto text-xs sm:text-sm font-bold uppercase tracking-wider min-h-[52px]"
              >
                SEE HOW IT WORKS
              </Button>
            </div>

            {/* Microcopy */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-dark font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/60" />
                <span>No complicated implementation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/60" />
                <span>No long-term contract</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/60" />
                <span>Start with one workshop</span>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 02 — PROBLEM */}
      {/* ============================================================== */}
      <section id="problem" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                  YOUR WORKSHOP IS BUSY. YOUR SYSTEM SHOULDN'T BE.
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
                Too much of your workshop still lives in WhatsApp, notebooks and memory.
              </h2>
            </div>

            <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-muted-light font-light leading-relaxed">
              <div className="p-6 sm:p-8 rounded-sm bg-graphite/40 border border-graphite-border space-y-4">
                <p>A customer calls.</p>
                <p>Someone writes the details down.</p>
                <p>Another person updates the appointment.</p>
                <p>The vehicle arrives.</p>
                <p>The technician gets the job verbally.</p>
                <p>Inspection findings go into a message.</p>
                <p>The estimate is sent separately.</p>
                <p>Someone has to remember to follow up.</p>
                <div className="pt-2 border-t border-graphite-border">
                  <p className="text-warm-white font-medium italic">
                    And when the customer calls asking: &ldquo;What&rsquo;s happening with my car?&rdquo; — you have to ask someone else.
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-warm-white font-semibold pt-2">
                Your workshop doesn't need more paperwork. It needs one connected workflow.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 03 — SOLUTION */}
      {/* ============================================================== */}
      <section id="solution" className="py-20 sm:py-28 border-b border-graphite-border">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                ONE WORKSHOP. ONE CONNECTED SYSTEM.
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              Every vehicle has a journey. Your system should follow it.
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed font-light">
              Workshop OS connects the operational journey of a vehicle from enquiry to delivery.
            </p>
          </div>

          {/* Visual Journey Stepper */}
          <div className="p-6 sm:p-8 rounded-sm bg-graphite/30 border border-graphite-border">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
              {JOURNEY_STAGES.map((stage, idx) => (
                <div
                  key={stage}
                  className="p-3 sm:p-4 rounded-xs bg-graphite/60 border border-graphite-border flex flex-col justify-between space-y-2 hover:border-accent-gold/40 transition-colors"
                >
                  <span className="text-[10px] font-mono text-accent-gold font-semibold">
                    STEP {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-warm-white leading-snug">
                    {stage}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-graphite-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed max-w-xl">
                Nothing needs to be reconstructed from memory. The customer&rsquo;s journey stays connected from start to finish.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDemo('Journey Step CTA')}
                className="text-xs uppercase tracking-wider shrink-0"
              >
                Experience the Workflow
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 04 — FEATURES */}
      {/* ============================================================== */}
      <section id="features" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                BUILT AROUND YOUR WORKSHOP
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              Everything your team needs. Nothing your team doesn't.
            </h2>
            <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
              Carefully engineered operational capabilities designed around actual workshop roles, eliminating software bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_DOMAINS.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-sm bg-graphite/50 border border-graphite-border hover:border-graphite-subtle transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-warm-white uppercase tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 05 — DIFFERENTIATION */}
      {/* ============================================================== */}
      <section id="differentiation" className="py-20 sm:py-28 border-b border-graphite-border">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                  NOT JUST ANOTHER GARAGE SOFTWARE
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
                We don't give you another dashboard. We connect your workshop.
              </h2>
              <div className="p-4 rounded-xs bg-accent-gold/10 border border-accent-gold/30 text-accent-gold font-mono text-xs uppercase tracking-wider font-semibold">
                One workflow. One record. One source of truth.
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5 text-sm sm:text-base text-muted-light font-light leading-relaxed">
              <p>
                Many workshop tools focus on individual tasks — just billing, just appointment calendars, or just vehicle listings.
              </p>
              <p>
                Workshop OS is designed around the <strong className="text-warm-white font-semibold">complete vehicle journey</strong>:
              </p>
              
              <ul className="space-y-3.5 border-l-2 border-accent-gold/40 pl-6 my-6 text-sm">
                <li className="leading-relaxed">
                  When a customer enquiry becomes an appointment, it can become a job card.
                </li>
                <li className="leading-relaxed">
                  When the vehicle is inspected, findings can become recommendations.
                </li>
                <li className="leading-relaxed">
                  When recommendations become an estimate, the customer's decision stays connected to the job.
                </li>
                <li className="leading-relaxed">
                  When work begins, the workshop team sees the operational status.
                </li>
                <li className="leading-relaxed">
                  When the vehicle is delivered, its service history remains available for the next visit.
                </li>
              </ul>

              <div className="pt-2">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => handleOpenDemo('Differentiation Section CTA')}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Book a Private Demo
                </Button>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 06 — BEFORE / AFTER */}
      {/* ============================================================== */}
      <section id="comparison" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                IMAGINE YOUR WORKSHOP WITHOUT THE CHAOS
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              From scattered information to a connected operation.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* BEFORE */}
            <div className="p-6 sm:p-8 rounded-sm bg-obsidian border border-graphite-border space-y-6">
              <div className="flex items-center justify-between border-b border-graphite-border pb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                  BEFORE WORKSHOP OS
                </span>
                <span className="text-[11px] text-muted-dark uppercase tracking-wider font-mono">
                  Fragmented & Reactive
                </span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-muted font-light">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Customer details in WhatsApp</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Appointments in notebooks</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Job details in spreadsheets</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Technician updates passed verbally</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Inspection findings on paper</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Estimates sent separately</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Follow-ups forgotten</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Customer status calls interrupt the team</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                  <span>Service history difficult to find</span>
                </li>
              </ul>
            </div>

            {/* AFTER */}
            <div className="p-6 sm:p-8 rounded-sm bg-graphite/40 border border-accent-gold/40 shadow-subtle space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between border-b border-graphite-border pb-4 relative z-10">
                <span className="text-xs font-mono font-bold tracking-widest text-accent-gold uppercase">
                  AFTER WORKSHOP OS
                </span>
                <span className="text-[11px] text-accent-gold/80 uppercase tracking-wider font-mono">
                  Connected & In Control
                </span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-warm-white font-normal relative z-10">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Customer records in one place</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Appointments organised</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Digital job cards</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Technician assignments</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Structured inspections</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Connected estimates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Customer approvals</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Workshop status visibility</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Digital service history</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Follow-up reminders</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-10 p-6 rounded-xs bg-graphite/40 border border-graphite-border text-center">
            <p className="text-sm sm:text-base text-warm-white font-medium">
              Less searching. Less asking. Less remembering. <span className="text-accent-gold font-bold">More control over the workshop.</span>
            </p>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 07 — CUSTOMER EXPERIENCE */}
      {/* ============================================================== */}
      <section id="customer-experience" className="py-20 sm:py-28 border-b border-graphite-border">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                  YOUR CUSTOMERS NOTICE THE DIFFERENCE TOO
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
                Give customers visibility without giving your team more work.
              </h2>
              <p className="text-sm text-muted font-light leading-relaxed">
                Customers don't always need to call the workshop. With the customer-facing experience, they can access relevant information about their vehicle's service journey through a dedicated status view.
              </p>
              <p className="text-sm text-muted font-light leading-relaxed">
                They can see the latest workshop stage, relevant service information and what happens next.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-2">
                <h3 className="text-base font-bold text-warm-white uppercase">
                  A clearer experience
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                  Customers know where their vehicle stands without guessing or waiting for an update.
                </p>
              </div>

              <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-2">
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Less unnecessary calling
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                  Your reception team spends less time answering repetitive status questions and more time handling customer intake.
                </p>
              </div>

              <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-2">
                <h3 className="text-base font-bold text-warm-white uppercase">
                  More transparency
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                  Customers can see the progression of their service journey, building confidence in your workshop's professionalism.
                </p>
              </div>

              {/* Privacy Microcopy */}
              <div className="p-4 rounded-xs bg-obsidian border border-graphite-border flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-dark font-mono">
                <span>• No internal workshop notes</span>
                <span>• No sensitive operational information</span>
                <span>• Just the information the customer needs</span>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 08 — ROLES */}
      {/* ============================================================== */}
      <section id="roles" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                ONE SYSTEM. DIFFERENT ROLES.
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              Give every person the information they need to do their job.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Role 1 */}
            <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                ROLE 01
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                Owner / Manager
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                See workshop activity, workload, jobs, estimates and operational performance across the entire business.
              </p>
            </div>

            {/* Role 2 */}
            <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                ROLE 02
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                Service Advisor / Reception
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Manage enquiries, appointments, customer communication and vehicle arrivals without missing details.
              </p>
            </div>

            {/* Role 3 */}
            <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                ROLE 03
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                Workshop Manager
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                See active jobs, bays, technicians, inspections and quality checks to keep vehicles moving.
              </p>
            </div>

            {/* Role 4 */}
            <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                ROLE 04
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                Technician
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Know assigned work and the vehicles currently requiring attention without verbal miscommunications.
              </p>
            </div>

            {/* Role 5 */}
            <div className="p-6 rounded-sm bg-graphite/50 border border-graphite-border space-y-3 sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                ROLE 05
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                Customer
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Stay informed about the latest status of their vehicle through a clean, token-based link.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 09 — WORKSHOP FLOOR */}
      {/* ============================================================== */}
      <section id="workshop-floor" className="py-20 sm:py-28 border-b border-graphite-border">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                BUILT AROUND THE WORKSHOP FLOOR
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              When the workshop gets busy, visibility matters most.
            </h2>
            <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
              Workshop OS gives your team an operational view of what's happening across active vehicles, job cards, technicians and workshop bays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-8 rounded-sm bg-graphite/40 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-gold uppercase">
                01 · CLARITY
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                WHAT'S ACTIVE
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                See vehicles currently moving through the workshop and understand their current stage at a glance.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-graphite/40 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-gold uppercase">
                02 · ACCOUNTABILITY
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                WHO'S WORKING ON WHAT
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Understand technician assignments and workload across active bays without physically walking the shop floor.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-graphite/40 border border-graphite-border space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-gold uppercase">
                03 · FLOW
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                WHAT NEEDS ATTENTION
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Identify vehicles waiting for estimate approval, quality checks, customer collection, or overdue follow-up.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted font-light">
            The goal isn't more software. <strong className="text-warm-white font-semibold">It's fewer blind spots.</strong>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 10 — SETUP */}
      {/* ============================================================== */}
      <section id="setup" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                GET STARTED WITHOUT A TECHNOLOGY PROJECT
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              We handle the setup. Your team learns the workflow.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 sm:p-8 rounded-sm bg-graphite/50 border border-graphite-border space-y-4">
              <span className="text-3xl font-extrabold text-accent-gold font-mono">
                01
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                WE CONFIGURE
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                We configure the system around your workshop's operational requirements, bay capacity, and service catalog.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-graphite/50 border border-graphite-border space-y-4">
              <span className="text-3xl font-extrabold text-accent-gold font-mono">
                02
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                WE SET YOU UP
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Your workshop, team, customer records, and vehicle data can be prepared for the new connected operating system.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-graphite/50 border border-graphite-border space-y-4">
              <span className="text-3xl font-extrabold text-accent-gold font-mono">
                03
              </span>
              <h3 className="text-lg font-bold text-warm-white uppercase">
                YOUR TEAM GOES LIVE
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                We walk your team through the workflow so they can start using the system confidently from day one.
              </p>
            </div>

          </div>

          <div className="mt-10 text-center text-sm sm:text-base text-warm-white font-medium">
            You don't need an IT department to run your workshop digitally.
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 11 — PRICING (ONE PRIMARY CARD — NO 3-COLUMN TABLE) */}
      {/* ============================================================== */}
      <section id="pricing" className="py-20 sm:py-28 border-b border-graphite-border">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                SIMPLE TO START
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              Start with your workshop. Expand when you're ready.
            </h2>
            <p className="text-sm sm:text-base text-muted font-light max-w-xl mx-auto">
              Straightforward commercial pricing designed to make the decision simple for Indian workshop owners.
            </p>
          </div>

          {/* PRIMARY PRICING CARD */}
          <div className="max-w-2xl mx-auto rounded-sm bg-graphite-card border-2 border-accent-gold/50 shadow-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-accent-gold text-obsidian text-[10px] font-mono uppercase tracking-widest font-extrabold">
              STANDARD WORKSHOP SETUP
            </div>

            <div className="space-y-6">
              
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-accent-gold font-semibold">
                  PRODUCT
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-warm-white uppercase tracking-tight mt-1">
                  Workshop OS
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light mt-2 leading-relaxed">
                  For an independent workshop ready to move from scattered tools to one connected operating system.
                </p>
              </div>

              {/* Price Figures */}
              <div className="p-6 rounded-xs bg-obsidian border border-graphite-border flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-warm-white font-mono">
                      ₹29,999
                    </span>
                    <span className="text-xs text-muted uppercase font-mono tracking-wider">
                      one-time setup
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-dark block mt-1">
                    Includes system configuration & team onboarding
                  </span>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-graphite-border">
                  <div className="text-xl sm:text-2xl font-bold text-accent-gold font-mono">
                    ₹3,999<span className="text-xs text-muted font-sans font-normal"> / month</span>
                  </div>
                  <span className="text-[11px] text-muted-dark block mt-1">
                    Ongoing software access & updates
                  </span>
                </div>
              </div>

              {/* Includes List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-light block font-semibold">
                  WHAT IS INCLUDED IN THE STANDARD SETUP:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-warm-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Customer management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Vehicle records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Enquiries & leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Digital job cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Workshop floor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Technician assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Bay management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Digital inspections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Estimates & approvals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Customer service status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Service history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Follow-up reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Workshop dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Operational reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Team onboarding</span>
                  </div>
                </div>
              </div>

              {/* Primary Pricing CTA */}
              <div className="pt-4">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => handleOpenDemo('START WITH WORKSHOP OS — Pricing Card')}
                  className="w-full text-xs sm:text-sm font-extrabold uppercase tracking-wider min-h-[50px] shadow-lg"
                >
                  START WITH WORKSHOP OS
                </Button>
              </div>

              {/* Pricing Microcopy */}
              <div className="text-center space-y-1 text-xs text-muted-dark pt-2">
                <p>One workshop location • Initial setup and onboarding included.</p>
                <p className="text-[11px]">Custom integrations and additional requirements are quoted separately.</p>
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 12 — CUSTOM REQUIREMENTS */}
      {/* ============================================================== */}
      <section id="custom" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="max-w-4xl mx-auto rounded-sm bg-graphite/50 border border-graphite-border p-8 sm:p-12 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                  NEED MORE?
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-white uppercase">
                Your workshop may need more than the standard setup.
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                If you operate a larger workshop, multiple locations, have specialised workflows or require deeper customisation, we can configure the platform around your operation.
              </p>
            </div>

            {/* Examples Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {[
                'Multiple locations',
                'Custom workflows',
                'Advanced permissions',
                'Custom reporting',
                'Additional integrations',
                'Branded customer experience',
                'Dedicated infrastructure',
              ].map((item) => (
                <div
                  key={item}
                  className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs text-warm-white font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-graphite-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-muted-dark font-light">
                We'll scope the requirements before recommending a configuration.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => handleOpenDemo('TALK ABOUT YOUR WORKSHOP — Custom Requirements')}
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider shrink-0"
              >
                TALK ABOUT YOUR WORKSHOP
              </Button>
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 13 — FAQ */}
      {/* ============================================================== */}
      <section id="faq" className="py-20 sm:py-28 border-b border-graphite-border">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                  BEFORE YOU DECIDE
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white uppercase">
                You probably have a few questions.
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Clear, straightforward answers about how Workshop OS implements into your daily garage workflow.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-graphite-border border-y border-graphite-border">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className="py-5">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left flex items-start justify-between gap-4 group focus:outline-none cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-bold text-warm-white group-hover:text-accent-gold transition-colors">
                        {faq.q}
                      </span>
                      <span className="p-1 text-muted group-hover:text-warm-white transition-colors shrink-0">
                        {isOpen ? <Minus className="w-4 h-4 text-accent-gold" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pt-3 pb-1 text-xs sm:text-sm text-muted font-light leading-relaxed animate-in fade-in duration-150">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 14 — TRUST */}
      {/* ============================================================== */}
      <section id="trust" className="py-20 sm:py-28 border-b border-graphite-border bg-graphite/20">
        <Container>
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
                BUILT AS AN OPERATIONAL SYSTEM
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-warm-white leading-tight uppercase">
              Not a concept. A working workshop workflow.
            </h2>
            <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
              The platform has been built around a complete workshop lifecycle — from customer enquiry through job execution, inspection, estimation, approval, quality control, delivery and post-service follow-up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 sm:p-8 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-warm-white uppercase">
                CONNECTED WORKFLOW
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Core workshop entities stay connected throughout the service journey, preventing lost context.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-warm-white uppercase">
                CUSTOMER-SAFE
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Customer-facing experiences are cleanly separated from internal technician notes, costs, and bay data.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-graphite/50 border border-graphite-border space-y-3">
              <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-warm-white uppercase">
                READY TO CONFIGURE
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                The platform can be adapted to the way your workshop actually operates, without rigid constraints.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 15 — FINAL CTA */}
      {/* ============================================================== */}
      <section id="final-cta" className="py-24 sm:py-32 border-b border-graphite-border relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent-gold/15 rounded-full blur-3xl" />
        </div>

        <Container className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wideTracking text-accent-gold font-mono">
              YOUR WORKSHOP IS ALREADY RUNNING.
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-warm-white uppercase leading-tight">
            The question is whether your system is keeping up.
          </h2>

          <p className="text-sm sm:text-base text-muted font-light leading-relaxed max-w-2xl mx-auto">
            See how Workshop OS can fit into your existing workshop workflow. We'll walk you through the system using your actual operational requirements — not a generic software presentation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              onClick={() => handleOpenDemo('Final CTA — Book Demo')}
              className="w-full sm:w-auto text-xs sm:text-sm font-extrabold uppercase tracking-wider gap-2 min-h-[52px]"
            >
              <span>BOOK A PRIVATE DEMO</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleScrollToSection('pricing')}
              className="w-full sm:w-auto text-xs sm:text-sm font-bold uppercase tracking-wider min-h-[52px]"
            >
              ASK ABOUT SETUP
            </Button>
          </div>

          <div className="pt-2 text-xs text-muted-dark font-medium">
            30-minute walkthrough • No obligation • Built around your workshop
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* SECTION 16 — FOOTER (NO PRICING LINK AS PER SPEC) */}
      {/* ============================================================== */}
      <footer className="py-12 bg-obsidian border-t border-graphite-border text-xs text-muted">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-warm-white tracking-tight">
                  Workshop OS
                </span>
                <span className="text-muted-dark">•</span>
                <span className="text-[11px] font-medium text-accent-gold">
                  Powered by Niche Synthesis
                </span>
              </div>
              <p className="text-[11px] text-muted-dark font-light">
                A connected digital operating system for modern automotive workshops.
              </p>
            </div>

            {/* SPEC: Footer links only: Privacy, Terms, Contact. DO NOT include Pricing link. */}
            <div className="flex items-center gap-6 text-[11px] text-muted">
              <button
                type="button"
                onClick={() => alert('Workshop OS — Privacy Notice: Client workshop data and vehicle records are strictly isolated and never shared or sold.')}
                className="hover:text-warm-white transition-colors"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => alert('Workshop OS — Commercial Terms: Standard setup fee covers system onboarding and configuration. Monthly subscription includes continuous feature access and technical support.')}
                className="hover:text-warm-white transition-colors"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateContact) onNavigateContact();
                  else handleOpenDemo('Footer Contact Link');
                }}
                className="hover:text-warm-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </Container>
      </footer>

      {/* DIRECT DEMO BOOKING MODAL */}
      <PrivateDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialInterest={modalInterest}
      />

    </div>
  );
};
export default PrivateWorkshopOsPage;
