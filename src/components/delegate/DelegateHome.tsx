'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { INITIAL_ATTENDEES, RECOMMENDED_PEOPLE_IDS } from '../../lib/mockData';
import { getExhibitorSlug } from '../../lib/exhibitorSlug';
import { Person } from '../../types';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Check,
  ChevronRight,
  Star,
  Users,
  Map,
  Bookmark,
  BookmarkCheck,
  BarChart2,
  Cpu,
  Box,
  Zap,
  Settings,
  Rocket,
  GraduationCap,
} from 'lucide-react';

const EVENT_PARTNERS = [
  {
    name: 'Make in India',
    type: 'National Initiative',
    logo: '/images/partners/make-in-india.png',
  },
  {
    name: 'MSME Department',
    type: 'Government Partner',
    logo: '/images/partners/msme.png',
  },
  {
    name: 'Semi-Conductor Laboratory',
    type: 'Technology Partner',
    logo: '/images/partners/scl.png',
  },
  {
    name: 'MP Tourism',
    type: 'Tourism Partner',
    logo: '/images/partners/mp-tourism.png',
  },
  {
    name: 'Invest MP',
    type: 'Investment Partner',
    logo: '/images/partners/invest-mp.png',
  },
  {
    name: 'VLSI Society of India',
    type: 'Industry Partner',
    logo: '/images/partners/vlsi.png',
  },
  {
    name: 'ISIG',
    type: 'Industry Partner',
    logo: '/images/partners/isig.png',
  },
];

export const DelegateHome: React.FC = () => {
  const router = useRouter();
  const {
    currentUser,
    event,
    attendees,
    connections,
    connectWith,
    disconnectFrom,
    setActiveDelegateTab,
    setSelectedSessionId,
    setSessionBackTab,
    setSelectedPersonId,
    setSelectedCompanyId,
    sessions,
    exhibitors,
    toggleBookmarkSession,
    showToast,
  } = useStore();

  // Featured "Up next" session for MPSS 2026: Day 1 Opening Keynote at 10:00 AM – 10:30 AM
  const featuredSession =
    sessions.find((s) => s.id === 'mpss26-d1-02') ||
    sessions.find((s) => s.title.toLowerCase().includes('global semiconductor industry')) ||
    sessions.find((s) => !/registration|high tea|lunch|tea break|cultural evening|gala dinner/i.test(s.title)) || {
      id: 'mpss26-d1-02',
      title: 'Keynote on Global Semiconductor Industry & Technology Trends',
      timeRange: '10:00 AM – 10:30 AM',
      room: 'Main Auditorium',
      day: 1,
      speakerName: 'Jaswinder Ahuja',
      speakerDesignation: 'Advisor',
      speakerCompany: 'India Semiconductor Mission',
      speakerId: 'speaker-jaswinder-ahuja',
      isBookmarked: false,
    };


  const isFeaturedBookmarked = sessions.some(
    (s) => s.id === featuredSession.id && s.isBookmarked
  );

  // 10 Curated speakers for "People You Should Meet"
  const recommendedPeople = useMemo(() => {
    return RECOMMENDED_PEOPLE_IDS
      .map((id) => attendees.find((a) => a.id === id))
      .filter(Boolean) as Person[];
  }, [attendees]);

  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    } else if (distance < -minSwipeDistance) {
      setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleConnect = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    connectWith(personId, 'recommended');
  };

  const isConnected = (personId: string) => {
    return connections.some((c) => c.personId === personId && c.status === 'connected');
  };

  const isPending = (personId: string) => {
    return connections.some((c) => c.personId === personId && c.status === 'pending');
  };

  const getGreetingIST = () => {
    const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false } as const;
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const hour = parseInt(formatter.format(new Date()), 10);
    if (hour < 12) return 'GOOD MORNING,';
    if (hour < 17) return 'GOOD AFTERNOON,';
    return 'GOOD EVENING,';
  };

  // Up next overlapping avatars
  const upNextAvatars = [
    '/images/speakers/manish-hooda.png',
    '/images/speakers/jaswinder-ahuja.png',
    '/images/speakers/satya-gupta.png',
  ];

  // Auto-scroll for Event Partners Section (seamless infinite circular loop, scrolls one by one)
  const partnersScrollRef = useRef<HTMLDivElement>(null);
  const [isPartnersPaused, setIsPartnersPaused] = useState(false);

  useEffect(() => {
    const container = partnersScrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (isPartnersPaused) return;

      const firstChild = container.firstElementChild as HTMLElement;
      const itemWidth = firstChild ? firstChild.offsetWidth + 8 : 84;
      const oneSetWidth = itemWidth * EVENT_PARTNERS.length;

      // When we reach or pass one full set, normalize silently to start of cycle
      if (container.scrollLeft >= oneSetWidth) {
        container.scrollLeft -= oneSetWidth;
      }

      container.scrollBy({ left: itemWidth, behavior: 'smooth' });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPartnersPaused]);

  const handlePartnersScroll = () => {
    const container = partnersScrollRef.current;
    if (!container) return;
    const firstChild = container.firstElementChild as HTMLElement;
    const itemWidth = firstChild ? firstChild.offsetWidth + 8 : 84;
    const oneSetWidth = itemWidth * EVENT_PARTNERS.length;

    if (container.scrollLeft >= 2 * oneSetWidth) {
      container.scrollLeft -= oneSetWidth;
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full px-3 pt-2 pb-3 space-y-3 bg-[#F8F7F4] overflow-y-auto select-none">
      {/* Top Greeting & Attendee Identity Header */}
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">
              MPSS26 · DELEGATE
            </p>
            <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none truncate">
              {currentUser.name || 'Delegate'}
            </h1>
            <p className="text-[12px] text-[#6B6B6B] font-medium mt-1 truncate">
              {[currentUser.designation, currentUser.company].filter(Boolean).join(' · ') || 'MPSS26 Attendee'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <button
              onClick={() => router.push('/delegate/profile')}
              className="relative group focus:outline-none flex-shrink-0"
              aria-label="View Profile"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name || 'Delegate'}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-base border-2 border-white shadow-sm">
                  {currentUser.name ? currentUser.name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2) : '?'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Carousel Banner Card */}
      <div
        className="relative rounded-[18px] shadow-sm overflow-hidden bg-[#18181B]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {/* Slide 1: BTS26 Live Event Card (Dark Theme matching Slide 3) */}
          <div className="w-full flex-shrink-0 p-3.5 pb-3.5 relative min-h-[148px] bg-gradient-to-br from-[#18181B] via-[#161C28] to-[#0F172A] select-none flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                {event.id}
              </span>
              <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#38BDF8] bg-[#0284C7]/20 border border-[#38BDF8]/40 px-2.5 py-0.5 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <span className="tracking-wider">
                  UPCOMING
                </span>
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-white tracking-tight leading-snug">
              {event.name}
            </h2>

            <div className="mt-1.5 text-[11.5px] text-[#94A3B8] space-y-1">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#38BDF8]" />
                <span className="truncate">
                  {event.venue.includes(event.city) ? event.venue : `${event.venue}, ${event.city}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#38BDF8]" />
                <span>{event.dates}</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] whitespace-nowrap overflow-x-auto no-scrollbar pb-0.5 pr-14">
              <span className="bg-[#1E293B]/70 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                <strong className="text-white font-semibold">{event.totalRegistered || attendees.length}</strong> attendees
              </span>
              <span className="bg-[#1E293B]/70 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                <strong className="text-white font-semibold">40+</strong> speakers
              </span>
              <span className="bg-[#1E293B]/70 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                <strong className="text-white font-semibold">50+</strong> exhibitors
              </span>
            </div>
          </div>

          {/* Slide 2: MPSS26 Official Leadership Poster (Native Theme matching Slide 3) */}
          <div className="w-full flex-shrink-0 p-3 sm:p-3.5 relative min-h-[148px] bg-gradient-to-br from-[#18181B] via-[#161C28] to-[#0F172A] select-none flex flex-col justify-between overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#38BDF8]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-[#FBBF24]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Badges matching Slide 3 */}
            <div className="relative z-10 flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                MPSS 2026
              </span>
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-[#38BDF8] bg-[#0284C7]/20 border border-[#38BDF8]/40 px-2.5 py-0.5 rounded-full shadow-sm">
                <span>LEADERSHIP VISION</span>
              </div>
            </div>

            {/* Main Content: Left Leader, Center Summit Branding & Tagline, Right Leader - 100% Mathematically Symmetric & Centered */}
            <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-1 my-auto px-2 sm:px-3">
              {/* Left Leader: Narendra Modi */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative w-[56px] sm:w-[64px] h-[70px] sm:h-[76px] flex items-end justify-center overflow-hidden">
                  <img
                    src="/images/banners/modi-cutout.png?v=7"
                    alt="Narendra Modi"
                    className="max-h-full max-w-full object-contain drop-shadow-md select-none pointer-events-none"
                  />
                </div>
                <p className="text-[8.5px] sm:text-[9.5px] font-bold text-white leading-tight whitespace-nowrap mt-1 text-center">
                  Narendra Modi
                </p>
                <p className="text-[6px] sm:text-[6.5px] text-[#94A3B8] leading-[1.15] mt-0.5 text-center max-w-[68px] sm:max-w-[76px]">
                  Hon&apos;ble Prime Minister, India
                </p>
              </div>

              {/* Center: Summit Title & Tagline - Single Line "MADHYA PRADESH", Zero Dead Space */}
              <div className="flex flex-col items-center justify-center text-center px-1">
                <h2 className="text-[15px] sm:text-[16.5px] font-black tracking-wide text-white uppercase whitespace-nowrap leading-none drop-shadow-sm">
                  MADHYA PRADESH
                </h2>
                <h1 className="text-[12.5px] sm:text-[14px] font-black text-[#38BDF8] tracking-tight uppercase whitespace-nowrap leading-tight my-1 drop-shadow-md">
                  SEMICONDUCTOR SUMMIT
                </h1>
                <span className="text-[11px] sm:text-[12px] font-black text-white tracking-[0.22em] leading-none mb-1 drop-shadow-sm">
                  2026
                </span>

                {/* Slogan Pill matching Slide 3 sector pill style */}
                <div className="bg-[#1E293B]/85 border border-slate-700/70 rounded-md px-2 py-0.5 shadow-sm max-w-[165px] sm:max-w-[185px]">
                  <p className="text-[6.8px] sm:text-[7.5px] font-semibold text-[#FBBF24] leading-tight text-center">
                    Building the Semiconductor Ecosystem of Madhya Pradesh
                  </p>
                </div>
              </div>

              {/* Right Leader: Dr. Mohan Yadav */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative w-[56px] sm:w-[64px] h-[70px] sm:h-[76px] flex items-end justify-center overflow-hidden">
                  <img
                    src="/images/banners/yadav-cutout.png?v=7"
                    alt="Dr. Mohan Yadav"
                    className="max-h-full max-w-full object-contain drop-shadow-md select-none pointer-events-none"
                  />
                </div>
                <p className="text-[8.5px] sm:text-[9.5px] font-bold text-white leading-tight whitespace-nowrap mt-1 text-center">
                  Dr. Mohan Yadav
                </p>
                <p className="text-[6px] sm:text-[6.5px] text-[#94A3B8] leading-[1.15] mt-0.5 text-center max-w-[68px] sm:max-w-[76px]">
                  Hon&apos;ble Chief Minister, MP
                </p>
              </div>
            </div>
          </div>

          {/* Slide 3: Exhibition & Showcase (Dark Theme - Top 4 Sectors Compact) */}
          <div 
            className="w-full flex-shrink-0 p-3.5 pb-3.5 relative min-h-[148px] bg-gradient-to-br from-[#18181B] via-[#161C28] to-[#0F172A] select-none flex flex-col justify-between"
          >
            {/* Header row with badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                EXPO PAVILION
              </span>
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-[#38BDF8] bg-[#0284C7]/20 border border-[#38BDF8]/40 px-2.5 py-0.5 rounded-full shadow-sm">
                <span>50+ EXHIBITORS</span>
              </div>
            </div>

            {/* Title with cyan accent */}
            <h2 className="text-[15.5px] font-bold text-white tracking-tight leading-snug mt-0.5">
              EXHIBITION & <span className="text-[#38BDF8]">SHOWCASE</span>
            </h2>

            {/* Subtitle description */}
            <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5 line-clamp-1 pr-12">
              Presenting cutting-edge technologies, research, startups & ecosystem solutions.
            </p>

            {/* Symmetrical 2x2 Grid of Top 4 Key Sectors */}
            <div className="mt-2 grid grid-cols-2 gap-1.5 pb-0.5">
              <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                <span className="text-[11px] font-medium text-slate-200 truncate">Chip Design & EDA</span>
              </div>
              <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
                <span className="text-[11px] font-medium text-slate-200 truncate">ATMP / OSAT</span>
              </div>
              <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                <span className="text-[11px] font-medium text-slate-200 truncate">Semicon & Electronics</span>
              </div>
              <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span className="text-[11px] font-medium text-slate-200 truncate">Equipment & Materials</span>
              </div>
            </div>
          </div>

          {/* Slide 4: Jointly Organised By (Partners Poster - Vertically Symmetrical) */}
          <div 
            className="w-full flex-shrink-0 p-3 sm:p-3.5 relative min-h-[148px] bg-gradient-to-br from-[#060D19] via-[#091527] to-[#0D1D3A] flex flex-col justify-center gap-2.5 select-none overflow-hidden"
          >
            {/* Header: PARTNERS / JOINTLY ORGANISED BY */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-5 h-[1.5px] bg-[#38BDF8]" />
                <span className="text-[9px] font-extrabold tracking-[0.2em] text-[#38BDF8] uppercase">
                  PARTNERS
                </span>
                <span className="w-5 h-[1.5px] bg-[#38BDF8]" />
              </div>
              <h2 className="text-[15px] sm:text-[16.5px] font-black text-white tracking-wider uppercase leading-none">
                JOINTLY ORGANISED <span className="text-[#38BDF8]">BY</span>
              </h2>
            </div>

            {/* Symmetrical Two Partner Cards with 'and' in center */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1 sm:gap-1.5">
              {/* Left Card: MPSeDC */}
              <div className="bg-gradient-to-br from-[#EEF6FF] via-[#F8FAFC] to-[#FFFDF7] border border-amber-400/50 rounded-xl p-2 shadow-sm flex items-center gap-1.5 group-hover:border-amber-400 transition-colors">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <img
                    src="/images/banners/mpsedc-clean.png"
                    alt="MPSeDC"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-[1px] h-9 bg-slate-300/80 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 leading-[1.18] line-clamp-3">
                    Madhya Pradesh State Electronics Development Corporation (MPSeDC), Department of Science & Technology
                  </h3>
                  <p className="text-[7px] sm:text-[7.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Government of Madhya Pradesh
                  </p>
                </div>
              </div>

              {/* Center 'and' */}
              <div className="flex items-center justify-center px-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#F59E0B] italic shrink-0">
                  and
                </span>
              </div>

              {/* Right Card: AIGGPA */}
              <div className="bg-gradient-to-br from-[#EEF6FF] via-[#F8FAFC] to-[#FFFDF7] border border-amber-400/50 rounded-xl p-2 shadow-sm flex items-center gap-1.5 group-hover:border-amber-400 transition-colors">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <img
                    src="/images/banners/aiggpa-clean.png"
                    alt="AIGGPA"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-[1px] h-9 bg-slate-300/80 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 leading-[1.18] line-clamp-3">
                    Atal Bihari Vajpayee Institute of Good Governance & Policy Analysis (AIGGPA), Bhopal
                  </h3>
                  <p className="text-[7px] sm:text-[7.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Government of Madhya Pradesh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Overlay */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1 z-20 pointer-events-auto">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeSlide === i ? 'bg-white scale-125' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Up next Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">Up next</h3>
          <button
            onClick={() => {
              router.push('/delegate/agenda/allsessions');
            }}
            className="text-[12px] font-semibold text-[#DC2626] flex items-center gap-0.5 hover:underline"
          >
            <span>View full agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Up next Card */}
        <div
          onClick={() => {
            router.push(`/delegate/agenda/sessions/${featuredSession.id}`);
          }}
          className="bg-white rounded-[16px] p-3.5 border border-[#E5E7EB] shadow-xs cursor-pointer hover:border-gray-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-bold text-[#111827]">
              {featuredSession.timeRange
                ? (featuredSession.timeRange.includes('AM') || featuredSession.timeRange.includes('PM')
                    ? featuredSession.timeRange
                    : `${featuredSession.timeRange.replace('–', ' AM – ')} AM`)
                : '10:00 AM – 10:30 AM'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmarkSession(featuredSession.id);
              }}
              className="text-[#111827] p-0.5 hover:scale-110 transition-transform"
              aria-label="Bookmark session"
            >
              {isFeaturedBookmarked ? (
                <BookmarkCheck className="w-4.5 h-4.5 text-[#DC2626] fill-[#DC2626]" />
              ) : (
                <Bookmark className="w-4.5 h-4.5 text-[#111827]" />
              )}
            </button>
          </div>

          <div className="mt-1">
            <h4 className="text-[14.5px] font-bold text-[#111827] tracking-tight leading-snug">
              {featuredSession.title || 'Keynote on Global Semiconductor Industry & Technology Trends'}
            </h4>
            <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B7280] mt-1">
              <span className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>{featuredSession.room || 'Main Auditorium'}</span>
              </span>
            </div>
          </div>

          {/* Compact View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/delegate/agenda/sessions/${featuredSession.id}`);
            }}
            className="w-full mt-2.5 py-2 bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#111827] rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 border border-[#EBE7DF] transition-colors"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick access Section */}
      <div>
        <h3 className="text-[16px] font-bold text-[#111827] tracking-tight mb-2 px-0.5">
          Quick access
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'speakers', label: 'Speakers', icon: Users, path: '/delegate/speakers' },
            { id: 'polls', label: 'Poll', icon: BarChart2, path: '/delegate/polls' },
            { id: 'map', label: 'Map', icon: Map, path: '/delegate/map' },
            { id: 'sponsors', label: 'Sponsors', icon: Star, path: '/delegate/sponsors' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center py-3 px-1 bg-white rounded-2xl shadow-xs border border-[#E5E7EB] active:scale-95 transition-all text-[#111827] hover:border-gray-400"
            >
              <item.icon className="w-5.5 h-5.5 mb-1.5 text-[#111827] stroke-[1.8]" />
              <span className="text-[11.5px] font-semibold text-[#111827] tracking-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* My AI Recommendations (People Profiles) - Matching reference design */}
      {recommendedPeople.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <h3
              onClick={() => router.push('/delegate/people')}
              className="text-[17px] font-bold text-[#111827] tracking-tight cursor-pointer hover:text-[#B51F32] transition-colors"
            >
              People You Should Meet
            </h3>
            <button
              onClick={() => router.push('/delegate/people')}
              className="text-[13px] font-semibold text-[#111827] flex items-center gap-0.5 hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-3 px-3 pb-1 pt-1.5">
            <div className="flex gap-3 w-max">
              {recommendedPeople.map((person) => {
                const connected = isConnected(person.id);
                const pending = isPending(person.id);
                return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className="bg-white p-2.5 rounded-[15px] border border-[#E5E7EB] flex-shrink-0 w-[178px] flex flex-col justify-between gap-2 cursor-pointer shadow-xs hover:border-gray-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        {person.avatar ? (
                           <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-[34px] h-[34px] rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-[34px] h-[34px] rounded-full bg-[#EFEBE5] flex items-center justify-center font-bold text-xs text-[#181818] flex-shrink-0 border border-[#DEDCD7]">
                            {person.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-[#111827] truncate leading-tight">
                            {person.name}
                          </h4>
                          <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                            {person.company || person.designation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5 flex items-center justify-center gap-1 text-[11.5px] font-semibold text-[#181818] border-t border-gray-100 mt-1 text-center">
                      <span>View profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Exhibitors to Explore */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[17px] font-bold text-[#111827] tracking-tight">
            Exhibitors to Explore
          </h3>
          <button
            onClick={() => router.push('/delegate/exhibitors')}
            className="text-[12px] font-semibold text-[#DC2626] flex items-center gap-1 hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {(() => {
            const exploreCompanies = ['MPSEDC', 'Truechip solutions private limited', 'CDAC', 'Analog Devices']
              .map((name) => exhibitors.find((e) => e.company === name))
              .filter(Boolean);

            const displayCompanies =
              exploreCompanies.length === 4 ? exploreCompanies : exhibitors.slice(0, 4);

            return displayCompanies.map((company) => {
              if (!company) return null;
              return (
                <div
                  key={company.id}
                  onClick={() => {
                    router.push(`/delegate/exhibitors/${getExhibitorSlug(company)}`);
                  }}
                  className="bg-white p-2.5 rounded-2xl border border-[#E5E7EB] hover:border-gray-400 transition-all cursor-pointer shadow-xs flex flex-col gap-2 overflow-hidden"
                >
                  <div className="flex justify-between items-start w-full gap-1">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex items-center justify-center font-bold text-sm text-[#181818] flex-shrink-0">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.company}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              company.company
                            )}&background=F3F4F6&color=181818&bold=true`;
                          }}
                        />
                      ) : (
                        company.company.charAt(0)
                      )}
                    </div>
                    {company.booth && (
                      <span className="text-[8.5px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap tracking-tight">
                        Booth {company.booth}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <h4 className="text-[13px] font-bold text-[#181818] leading-tight truncate">
                      {company.company}
                    </h4>
                    <p className="text-[11.5px] text-[#6B6B6B] mt-0.5 truncate">
                      {company.category}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Partners Section (Clean minimal horizontal auto-scroll) */}
      <div className="space-y-2 pt-1 pb-1">
        {/* Section Heading Centered */}
        <div className="text-center px-0.5">
          <h3 className="text-[17px] font-bold text-[#111827] tracking-tight">
            Partners
          </h3>
        </div>

        {/* Scrollable Container with Auto-Scroll One by One (Fits 4 Icons in View, No Scrollbar Line) */}
        <div
          ref={partnersScrollRef}
          onScroll={handlePartnersScroll}
          onMouseEnter={() => setIsPartnersPaused(true)}
          onMouseLeave={() => setIsPartnersPaused(false)}
          onTouchStart={() => setIsPartnersPaused(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsPartnersPaused(false), 2500);
          }}
          className="flex items-start gap-2 overflow-x-auto pb-1 pt-0.5 scroll-smooth select-none no-scrollbar"
        >
          {[...EVENT_PARTNERS, ...EVENT_PARTNERS, ...EVENT_PARTNERS].map((partner, index) => (
            <div
              key={index}
              onClick={() => showToast(`${partner.name} · Official ${partner.type}`, 'info')}
              className="w-[76px] sm:w-[82px] shrink-0 flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Decreased icon size in clean rounded white box */}
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs p-1 flex items-center justify-center overflow-hidden group-hover:border-gray-400 group-hover:shadow-xs transition-all">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain select-none"
                />
              </div>

              {/* Name below */}
              <h4 className="text-[10px] sm:text-[10.5px] font-bold text-[#181818] leading-[1.15] text-center mt-1.5 line-clamp-2 px-0.5">
                {partner.name}
              </h4>

              {/* Partner type below */}
              <p className="text-[8px] sm:text-[8.5px] font-semibold text-[#6B7280] leading-tight text-center mt-0.5 line-clamp-1">
                {partner.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
