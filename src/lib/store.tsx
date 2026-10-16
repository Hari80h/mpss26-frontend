'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  EventMetadata,
  Person,
  Connection,
  Lead,
  Product,
  Session,
  Question,
  Poll,
  ExhibitorStats,
  DemoRole,
  QuestionStatus,
  LeadStatus,
  PrivacyConsent,
  InterestedVisitor
} from '../types';
import {
  INITIAL_EVENT,
  CURRENT_USER,
  INITIAL_ATTENDEES,
  INITIAL_CONNECTIONS,
  INITIAL_PRODUCTS,
  INITIAL_LEADS,
  INITIAL_SESSIONS,
  INITIAL_QUESTIONS,
  INITIAL_POLL,
  INITIAL_EXHIBITORS,
  INITIAL_INTERESTED_VISITORS
} from './mockData';
import { api } from './api';


interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Navigation & Role
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  activeDelegateTab: 'home' | 'people' | 'scan' | 'focus' | 'schedule' | 'profile' | 'companies' | 'company_detail' | 'edit_profile' | 'ai_recommendations' | 'speakers' | 'polls' | 'map' | 'sponsors' | 'support';
  setActiveDelegateTab: (tab: 'home' | 'people' | 'scan' | 'focus' | 'schedule' | 'profile' | 'companies' | 'company_detail' | 'edit_profile' | 'ai_recommendations' | 'speakers' | 'polls' | 'map' | 'sponsors' | 'support') => void;
  viewSavedPeopleOnly: boolean;
  setViewSavedPeopleOnly: (v: boolean) => void;
  viewSavedCompaniesOnly: boolean;
  setViewSavedCompaniesOnly: (v: boolean) => void;
  scheduleSubTab: 'all' | 'saved';
  setScheduleSubTab: (tab: 'all' | 'saved') => void;
  savedCompanyIds: string[];
  savedPeopleIds: string[];
  toggleSavePerson: (id: string) => void;
  toggleSaveCompany: (id: string) => void;
  activeExhibitorTab: 'home' | 'leads' | 'scan' | 'products' | 'more';
  setActiveExhibitorTab: (tab: 'home' | 'leads' | 'scan' | 'products' | 'more') => void;
  activeOrganizerTab: 'overview' | 'attendees' | 'exhibitors' | 'sessions' | 'reports' | 'settings';
  setActiveOrganizerTab: (tab: 'overview' | 'attendees' | 'exhibitors' | 'sessions' | 'reports' | 'settings') => void;

  // View frame mode for Delegate/Exhibitor (centered 430px frame vs full)
  viewMode: 'frame' | 'responsive';
  setViewMode: (mode: 'frame' | 'responsive') => void;

  // Connectivity & Offline Sync Demo
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  toggleConnectivity: () => void;
  isSyncing: boolean;
  syncPendingCount: number;
  lastSyncedTime: string;

  // Access Flow state
  hasAccessConfirmed: boolean;
  setHasAccessConfirmed: (confirmed: boolean) => void;
  triggerAccessFlow: (prefillMobile?: string, prefillEventId?: string) => void;

  // Selected details
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  sessionBackTab: 'home' | 'schedule' | 'profile' | 'ai_recommendations';
  setSessionBackTab: (tab: 'home' | 'schedule' | 'profile' | 'ai_recommendations') => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;

  // Core Data
  event: EventMetadata;
  currentUser: Person;
  setCurrentUser: React.Dispatch<React.SetStateAction<Person>>;
  updateCurrentUser: (data: Partial<Person>) => Promise<void>;
  updateAttendee: (id: string, data: Partial<Person>) => Promise<void>;
  updateCurrentUserPrivacy: (newPrivacy: Partial<PrivacyConsent>) => void;
  attendees: Person[];
  setAttendees: React.Dispatch<React.SetStateAction<Person[]>>;
  connections: Connection[];
  leads: Lead[];
  products: Product[];
  sessions: Session[];
  questions: Question[];
  poll: Poll;
  exhibitors: ExhibitorStats[];
  interestedVisitors: InterestedVisitor[];

  // Mutators & Business Logic
  connectWith: (personId: string, source?: 'direct' | 'qr_scan' | 'recommended') => { success: boolean; alreadyConnected: boolean };
  disconnectFrom: (personId: string) => void;
  acceptConnectionRequest: (personId: string) => void;
  ignoreConnectionRequest: (personId: string) => void;
  saveLead: (leadData: Omit<Lead, 'id' | 'capturedAt'>) => void | Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => void | Promise<void>;
  enquireProduct: (productId: string) => void;
  toggleSaveProduct: (productId: string) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void | Promise<void>;
  deleteProduct: (productId: string) => void | Promise<void>;
  addProduct: (productData: Omit<Product, 'id'>) => void | Promise<void>;
  submitQuestion: (sessionId: string, text: string, isAnonymous: boolean) => void | Promise<void>;
  upvoteQuestion: (questionId: string) => { success: boolean; message?: string };
  updateQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  votePoll: (optionId: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  togglePollStatus: () => void;
  resetPollVote: () => void | Promise<void>;
  toggleCheckIn: (personId: string) => void;
  addWalkInAttendee: (data: { name: string; email: string; mobile: string; company: string; designation: string; ticketType: string }) => void;
  importAttendeesMock: (count: number) => void;
  toggleBookmarkSession: (sessionId: string) => void;
  updateSession: (sessionId: string, data: Partial<Session>) => void;
  createSession: (sessionData: Omit<Session, 'id' | 'attendanceCount' | 'questionsCount'>) => void;
  deleteSession: (sessionId: string) => void;
  recordScan: () => void;
  resetAllData: () => void;

  // Notification Toast
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'eventsphere_mpss26_store_v13';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [role, setRoleState] = useState<DemoRole>('delegate');
  const [activeDelegateTab, setActiveDelegateTab] = useState<'home' | 'people' | 'scan' | 'focus' | 'schedule' | 'profile' | 'companies' | 'company_detail' | 'edit_profile' | 'ai_recommendations' | 'speakers' | 'polls' | 'map' | 'sponsors' | 'support'>('home');
  const [viewSavedPeopleOnly, setViewSavedPeopleOnly] = useState<boolean>(false);
  const [viewSavedCompaniesOnly, setViewSavedCompaniesOnly] = useState<boolean>(false);
  const [scheduleSubTab, setScheduleSubTab] = useState<'all' | 'saved'>('all');
  const [activeExhibitorTab, setActiveExhibitorTab] = useState<'home' | 'leads' | 'scan' | 'products' | 'more'>('home');
  const [activeOrganizerTab, setActiveOrganizerTab] = useState<'overview' | 'attendees' | 'exhibitors' | 'sessions' | 'reports' | 'settings'>('overview');
  const [viewMode, setViewMode] = useState<'frame' | 'responsive'>('frame');

  // Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncPendingCount, setSyncPendingCount] = useState<number>(0);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('12:40 PM');

  // Access Flow
  const [hasAccessConfirmed, setHasAccessConfirmed] = useState<boolean>(false);

  // Selected Detail Views
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionBackTab, setSessionBackTab] = useState<'home' | 'schedule' | 'profile' | 'ai_recommendations'>('schedule');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>([]);
  const [savedPeopleIds, setSavedPeopleIds] = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Show Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2800);
  }, []);

  const toggleSaveCompany = useCallback(async (id: string) => {
    const isSaved = savedCompanyIds.includes(id);
    // Optimistic UI update
    setSavedCompanyIds((prev) => (isSaved ? prev.filter((c) => c !== id) : [...prev, id]));

    try {
      if (isSaved) {
        await api.attendees.unsaveExhibitor(id);
        showToast('Company removed from saved list', 'info');
      } else {
        await api.attendees.saveExhibitor(id);
        showToast('Company saved to My Exhibitors ✓', 'success');
      }
    } catch (err: any) {
      console.warn('Backend toggleSaveCompany error:', err);
      // Rollback on failure
      setSavedCompanyIds((prev) => (isSaved ? [...prev, id] : prev.filter((c) => c !== id)));
      showToast(err?.message || 'Failed to update saved company on server', 'error');
    }
  }, [savedCompanyIds, showToast]);

  const toggleSavePerson = useCallback(async (id: string) => {
    const isSaved = savedPeopleIds.includes(id);
    // Optimistic UI update
    setSavedPeopleIds((prev) => (isSaved ? prev.filter((pId) => pId !== id) : [...prev, id]));

    try {
      if (isSaved) {
        await api.attendees.unsavePerson(id);
        showToast('Removed from Saved People', 'info');
      } else {
        await api.attendees.savePerson(id);
        showToast('Saved to My People', 'success');
      }
    } catch (err: any) {
      console.warn('Backend toggleSavePerson error:', err);
      // Rollback on failure
      setSavedPeopleIds((prev) => (isSaved ? [...prev, id] : prev.filter((pId) => pId !== id)));
      showToast(err?.message || 'Failed to update saved person on server', 'error');
    }
  }, [savedPeopleIds, showToast]);

  // Entities
  const [event, setEvent] = useState<EventMetadata>(INITIAL_EVENT);
  const [currentUser, setCurrentUser] = useState<Person>(CURRENT_USER);
  const [attendees, setAttendees] = useState<Person[]>(INITIAL_ATTENDEES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [poll, setPoll] = useState<Poll>(INITIAL_POLL);
  const [exhibitors, setExhibitors] = useState<ExhibitorStats[]>(INITIAL_EXHIBITORS);
  const [interestedVisitors, setInterestedVisitors] = useState<InterestedVisitor[]>(INITIAL_INTERESTED_VISITORS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.event) {
          setEvent({
            ...INITIAL_EVENT,
            ...parsed.event,
            venue: INITIAL_EVENT.venue,
            city: INITIAL_EVENT.city,
            totalRegistered: parsed.event.totalRegistered || INITIAL_EVENT.totalRegistered,
            totalCheckedIn: parsed.event.totalCheckedIn || INITIAL_EVENT.totalCheckedIn,
            totalExhibitors: parsed.event.totalExhibitors || INITIAL_EVENT.totalExhibitors,
            totalSpeakers: parsed.event.totalSpeakers || INITIAL_EVENT.totalSpeakers,
            totalScans: parsed.event.totalScans || INITIAL_EVENT.totalScans,
            totalConnections: parsed.event.totalConnections || INITIAL_EVENT.totalConnections,
          });
        }
        if (parsed.currentUser) {
          const u = { ...CURRENT_USER, ...parsed.currentUser };
          if (!u.privacy || (u.privacy.preset as any) === 'Private') {
            u.privacy = {
              preset: 'Connections Only',
              shareEmail: true,
              sharePhone: true,
              shareLinkedIn: true,
              shareTwitter: true,
            };
          }
          setCurrentUser(u);
        } else {
          setCurrentUser(CURRENT_USER);
        }
        const initialMap = new Map(INITIAL_ATTENDEES.map((a: Person) => [a.id, a]));
        if (parsed.attendees) {
          const validAttendees = parsed.attendees.filter(
            (a: Person) => a.role !== 'speaker' || initialMap.has(a.id)
          );
          const existingIds = new Set(validAttendees.map((a: Person) => a.id));
          const missingSpeakers = INITIAL_ATTENDEES.filter((a) => !existingIds.has(a.id));
          const allAttendees = [...validAttendees, ...missingSpeakers];
          const sanitized = allAttendees.map((a: Person) => {
            let item = { ...a };
            const seed = initialMap.get(item.id);
            if (seed?.role === 'speaker') {
              item.avatar = seed.avatar;
              item.designation = seed.designation;
              item.company = seed.company;
              item.email = 'Not publicly listed';
              if (seed.linkedin) item.linkedin = seed.linkedin;
            } else if (!item.avatar && seed?.avatar) {
              item.avatar = seed.avatar;
            }
            if (!item.registrationId || item.registrationId.toLowerCase().includes('not public') || item.registrationId.toLowerCase().includes('unlisted')) {
              const num = String(Math.abs(item.id.split('').reduce((acc: number, c: string) => ((acc << 5) - acc) + c.charCodeAt(0), 0)) % 9000 + 1000).padStart(4, '0');
              item.registrationId = `#${num}`;
            }
            if (!item.privacy || (item.privacy.preset as any) === 'Private') {
              item.privacy = {
                preset: 'Connections Only',
                shareEmail: true,
                sharePhone: true,
                shareLinkedIn: true,
                shareTwitter: false,
              };
            }
            return item;
          });
          setAttendees(sanitized);
        } else {
          setAttendees(INITIAL_ATTENDEES);
        }
        if (parsed.connections) {
          const sanitizedConns = parsed.connections.map((c: any) => {
            if (!c.avatar) {
              const seed = initialMap.get(c.personId);
              if (seed?.avatar) c.avatar = seed.avatar;
            }
            return c;
          });
          setConnections(sanitizedConns);
        }
        if (parsed.leads && parsed.leads.length > 0) setLeads(parsed.leads);
        else setLeads(INITIAL_LEADS);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.sessions && Array.isArray(parsed.sessions)) {
          const bookmarkSet = new Set<string>(
            parsed.sessions
              .filter((s: Session) => Boolean(s && s.isBookmarked))
              .map((s: Session) => s.id)
          );
          const freshSessions: Session[] = INITIAL_SESSIONS.map((s) => ({
            ...s,
            isBookmarked: bookmarkSet.has(s.id) || Boolean(s.isBookmarked),
          }));
          setSessions(freshSessions);
        } else {
          setSessions(INITIAL_SESSIONS);
        }
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.poll && parsed.poll.id === INITIAL_POLL.id && parsed.poll.options && parsed.poll.options.length > 0) {
          setPoll(parsed.poll);
        } else {
          setPoll(INITIAL_POLL);
        }
        if (parsed.exhibitors) setExhibitors(parsed.exhibitors);
        if (parsed.interestedVisitors) setInterestedVisitors(parsed.interestedVisitors);
        if (parsed.role) setRoleState(parsed.role);
        if (typeof parsed.hasAccessConfirmed === 'boolean') setHasAccessConfirmed(parsed.hasAccessConfirmed);
        if (parsed.savedPeopleIds && Array.isArray(parsed.savedPeopleIds)) {
          setSavedPeopleIds(parsed.savedPeopleIds);
        }
        if (parsed.savedCompanyIds && Array.isArray(parsed.savedCompanyIds)) {
          setSavedCompanyIds(parsed.savedCompanyIds);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      const payload = {
        event,
        currentUser,
        attendees,
        connections,
        leads,
        products,
        sessions,
        questions,
        poll,
        exhibitors,
        interestedVisitors,
        role,
        hasAccessConfirmed,
        savedPeopleIds,
        savedCompanyIds,
      };
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch {
          // ignore
        }
      }, 150);
      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, [
    event,
    currentUser,
    attendees,
    connections,
    leads,
    products,
    sessions,
    questions,
    poll,
    exhibitors,
    interestedVisitors,
    role,
    hasAccessConfirmed,
    savedPeopleIds,
    savedCompanyIds,
  ]);

  // Sync live metrics from backend when organizer console is active
  useEffect(() => {
    if (role === 'organizer' && hasAccessConfirmed) {
      api.organizer.getMetrics()
        .then((m) => {
          if (m && m.totalRegistered !== undefined) {
            setEvent((prev) => ({
              ...prev,
              totalRegistered: m.totalRegistered,
              totalCheckedIn: m.totalCheckedIn,
              totalExhibitors: m.totalExhibitors || prev.totalExhibitors,
            }));
          }
        })
        .catch((err) => {
          console.warn('Backend metrics fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live sessions & bookmarks from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed) {
      api.sessions.getAll()
        .then((backendSessions) => {
          if (backendSessions && Array.isArray(backendSessions) && backendSessions.length > 0) {
            const bMap = new Map(backendSessions.map((s: any) => [s.id, s]));
            setSessions((prev) =>
              prev.map((s) => {
                const b = bMap.get(s.id);
                if (b) {
                  return {
                    ...s,
                    isBookmarked: Boolean(b.isBookmarked),
                    status: (b.status as any) || s.status,
                    attendanceCount: typeof b.attendanceCount === 'number' ? b.attendanceCount : s.attendanceCount,
                    questionsCount: typeof b.questionsCount === 'number' ? b.questionsCount : s.questionsCount,
                  };
                }
                return s;
              })
            );
          }
        })
        .catch((err) => {
          console.warn('Backend sessions fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live saved people from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed && role === 'delegate') {
      api.attendees.getSavedPeople()
        .then((backendSaved) => {
          if (backendSaved && Array.isArray(backendSaved)) {
            const ids = backendSaved.map((p: any) => p.id);
            setSavedPeopleIds((prev) => Array.from(new Set([...prev, ...ids])));
          }
        })
        .catch((err) => {
          console.warn('Backend saved people fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live saved companies (exhibitors) from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed && role === 'delegate') {
      api.attendees.getSavedExhibitors()
        .then((backendSaved) => {
          if (backendSaved && Array.isArray(backendSaved)) {
            setSavedCompanyIds((prev) => Array.from(new Set([...prev, ...backendSaved])));
          }
        })
        .catch((err) => {
          console.warn('Backend saved exhibitors fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live connections from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed && role === 'delegate') {
      api.attendees.getConnections()
        .then((backendConns) => {
          if (backendConns && Array.isArray(backendConns) && backendConns.length > 0) {
            setConnections((prev) => {
              const bIds = new Set(backendConns.map((c: any) => c.personId || c.id));
              const localKept = prev.filter((c) => !bIds.has(c.personId) && !bIds.has(c.id));
              return [...backendConns, ...localKept];
            });
          }
        })
        .catch((err) => {
          console.warn('Backend connections fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live current user profile from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed && role === 'delegate') {
      api.attendees.getMyProfile()
        .then((profile) => {
          if (profile && profile.name) {
            setCurrentUser((prev) => ({
              ...prev,
              name: profile.name || prev.name,
              designation: profile.designation || prev.designation,
              company: profile.company || prev.company,
              bio: profile.bio || prev.bio,
              email: profile.email || prev.email,
              mobile: profile.mobile || prev.mobile,
              avatar: profile.avatar || prev.avatar,
              linkedin: profile.linkedin || prev.linkedin,
              twitter: profile.twitter || prev.twitter,
              interests: (profile.interests && profile.interests.length > 0) ? profile.interests : prev.interests,
              skills: (profile.skills && profile.skills.length > 0) ? profile.skills : prev.skills,
              registrationId: profile.registrationId || prev.registrationId,
              ticketType: profile.ticketType || prev.ticketType,
            }));
          }
        })
        .catch((err) => {
          console.warn('Backend getMyProfile fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live attendees from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed) {
      api.attendees.getAll()
        .then((backendAttendees) => {
          if (backendAttendees && Array.isArray(backendAttendees) && backendAttendees.length > 0) {
            setAttendees((prev) => {
              const bMap = new Map(backendAttendees.map((a: any) => [a.id, a]));
              const updated = prev.map((a) => {
                const b = bMap.get(a.id);
                if (b) {
                  return {
                    ...a,
                    checkedIn: b.checkedIn ?? a.checkedIn,
                    name: b.name || a.name,
                    designation: b.designation || a.designation,
                    company: b.company || a.company,
                    bio: b.bio || a.bio,
                    avatar: b.avatar || b.avatarUrl || a.avatar,
                    linkedin: b.linkedin || a.linkedin,
                    twitter: b.twitter || a.twitter,
                    email: b.email || a.email,
                    mobile: b.mobile || a.mobile,
                    interests: (b.interests && b.interests.length > 0) ? b.interests : a.interests,
                    skills: (b.skills && b.skills.length > 0) ? b.skills : a.skills,
                    ticketType: b.ticketType || a.ticketType,
                    registrationId: b.registrationId || a.registrationId,
                  };
                }
                return a;
              });
              const existingIds = new Set(prev.map((a) => a.id));
              const brandNew = backendAttendees
                .filter((b: any) => !existingIds.has(b.id))
                .map((b: any) => ({
                  id: b.id,
                  name: b.name,
                  designation: b.designation || '',
                  company: b.company || '',
                  role: (b.category as any) || (b.role as any) || 'delegate',
                  bio: b.bio || `Professional at ${b.company || 'the summit'} focusing on tech innovation.`,
                  interests: (b.interests && b.interests.length > 0) ? b.interests : ['Semiconductors', 'Technology'],
                  skills: (b.skills && b.skills.length > 0) ? b.skills : ['Engineering', 'Architecture'],
                  email: b.email || '',
                  mobile: b.mobile || '',
                  avatar: b.avatar || b.avatarUrl || '',
                  linkedin: b.linkedin || '',
                  twitter: b.twitter || '',
                  checkedIn: Boolean(b.checkedIn),
                  registrationId: b.registrationId || `#${b.id.slice(-4)}`,
                  ticketType: b.ticketType || 'Delegate',
                  privacy: {
                    preset: 'Connections Only' as const,
                    shareEmail: true,
                    sharePhone: true,
                    shareLinkedIn: true,
                    shareTwitter: false,
                  },
                }));
              return [...updated, ...brandNew];
            });
          }
        })
        .catch((err) => {
          console.warn('Backend attendees fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live exhibitor leads from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed && role === 'exhibitor') {
      api.exhibitor.getLeads()
        .then((backendLeads) => {
          if (backendLeads && Array.isArray(backendLeads) && backendLeads.length > 0) {
            setLeads(backendLeads.map((l: any) => ({
              id: l.id,
              personId: l.personId || l.attendeeId || '',
              name: l.name || '',
              avatar: l.avatar || '',
              company: l.company || '',
              designation: l.designation || '',
              email: l.email || '',
              mobile: l.mobile || '',
              linkedin: l.linkedin || '',
              source: l.source || 'Booth Scan',
              status: (l.status as any) || 'New',
              interests: l.interests || [],
              notes: l.notes || '',
              capturedAt: l.capturedAt || 'Recently',
              boothId: l.boothId || '',
              productsViewed: l.productsViewed || [],
              syncStatus: 'synced' as const,
            })));
          }
        })
        .catch((err) => {
          console.warn('Backend leads fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live exhibitor products from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed && role === 'exhibitor') {
      api.exhibitor.getProducts()
        .then((backendProducts) => {
          if (backendProducts && Array.isArray(backendProducts) && backendProducts.length > 0) {
            setProducts((prev) => {
              const bMap = new Map(backendProducts.map((p: any) => [p.id, p]));
              const updated = prev.map((p) => {
                const b = bMap.get(p.id);
                if (b) {
                  return {
                    ...p,
                    name: b.name || p.name,
                    tagline: b.tagline || p.tagline,
                    category: b.category || p.category,
                    views: typeof b.views === 'number' ? b.views : p.views,
                    enquiries: typeof b.enquiries === 'number' ? b.enquiries : p.enquiries,
                    interestedVisitorsCount: typeof b.interestedVisitorsCount === 'number' ? b.interestedVisitorsCount : p.interestedVisitorsCount,
                    overview: b.overview || p.overview,
                    features: b.features || p.features,
                    benefits: b.benefits || p.benefits,
                    useCases: b.useCases || p.useCases,
                    resources: b.resources ? {
                      brochureUrl: b.resources.brochureUrl,
                      videoUrl: b.resources.videoUrl,
                      websiteUrl: b.resources.websiteUrl,
                    } : p.resources,
                  };
                }
                return p;
              });
              const existingIds = new Set(prev.map((p) => p.id));
              const brandNew = backendProducts
                .filter((b: any) => !existingIds.has(b.id))
                .map((b: any) => ({
                  id: b.id,
                  name: b.name,
                  tagline: b.tagline,
                  company: b.company || 'Truechip Solutions',
                  category: b.category,
                  booth: b.booth || 'Hall 1 · A-02',
                  image: b.image || '/images/products/pcie.png',
                  views: b.views || 0,
                  enquiries: b.enquiries || 0,
                  interestedVisitorsCount: b.interestedVisitorsCount || 0,
                  overview: b.overview || '',
                  features: b.features || [],
                  benefits: b.benefits || [],
                  useCases: b.useCases || [],
                  resources: {
                    brochureUrl: b.resources?.brochureUrl || '',
                    videoUrl: b.resources?.videoUrl || '',
                    websiteUrl: b.resources?.websiteUrl || '',
                  },
                }));
              return [...updated, ...brandNew];
            });
          }
        })
        .catch((err) => {
          console.warn('Backend products fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live poll from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed) {
      api.sessions.getPollById('poll-mpss26-01')
        .then((p) => {
          if (p && p.id && p.options) {
            setPoll((prev) => ({
              ...prev,
              id: p.id,
              sessionId: p.sessionId || prev.sessionId,
              question: p.question || prev.question,
              status: (p.status as any) || prev.status,
              totalVotes: typeof p.totalVotes === 'number' ? p.totalVotes : prev.totalVotes,
              voterIds: p.hasVoted && currentUser ? Array.from(new Set([...prev.voterIds, currentUser.id])) : prev.voterIds,
              options: p.options.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                votes: opt.votes,
              })),
            }));
          }
        })
        .catch((err) => {
          console.warn('Backend poll fetch skipped:', err);
        });
    }
  }, [hasAccessConfirmed, currentUser]);

  // Set role with tab preservation & auth token re-alignment
  const setRole = useCallback((newRole: DemoRole) => {
    setRoleState(newRole);
    api.clearAuth();
    api.ensureAuthenticated(newRole).catch(() => {});
    showToast(`Switched to ${newRole === 'delegate' ? 'Delegate (Hari Gupta)' : newRole === 'exhibitor' ? 'Exhibitor (Truechip Booth A-02)' : 'Organizer Console'} view`, 'info');
  }, [showToast]);

  // Connectivity toggle
  const toggleConnectivity = useCallback(() => {
    if (isOnline) {
      setIsOnline(false);
      showToast('Switched to Offline Mode · Sync pending for new actions', 'info');
    } else {
      setIsSyncing(true);
      showToast('Syncing offline data with EventSphere server...', 'info');
      setTimeout(() => {
        setIsSyncing(false);
        setIsOnline(true);
        setSyncPendingCount(0);
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedTime(timeStr);
        // Mark pending leads as synced
        setLeads((prev) => prev.map((l) => ({ ...l, syncStatus: 'synced' })));
        showToast('Synced ✓ All data up to date', 'success');
      }, 1200);
    }
  }, [isOnline, showToast]);

  // Trigger Access Flow
  const triggerAccessFlow = useCallback(() => {
    setHasAccessConfirmed(false);
    setActiveDelegateTab('home');
  }, []);

  // Update current user profile with MySQL backend synchronization
  const updateCurrentUser = useCallback(async (data: Partial<Person>) => {
    // 1. Optimistically update local React state
    setCurrentUser((prev) => {
      const updatedUser = { ...prev, ...data };
      setAttendees((att) => att.map((a) => (a.id === prev.id ? updatedUser : a)));
      return updatedUser;
    });

    // 2. Persist to MySQL database via Spring Boot API
    try {
      const res = await api.attendees.updateMyProfile(data);
      if (res && res.name) {
        setCurrentUser((prev) => {
          const fresh: Person = {
            ...prev,
            ...data,
            name: res.name || prev.name,
            designation: res.designation || prev.designation,
            company: res.company || prev.company,
            bio: res.bio || prev.bio,
            email: res.email || prev.email,
            mobile: res.mobile || prev.mobile,
            avatar: res.avatar || prev.avatar,
            linkedin: res.linkedin || prev.linkedin,
            twitter: res.twitter || prev.twitter,
            interests: (res.interests && res.interests.length > 0) ? res.interests : prev.interests,
            skills: (res.skills && res.skills.length > 0) ? res.skills : prev.skills,
          };
          setAttendees((att) => att.map((a) => (a.id === prev.id ? fresh : a)));
          return fresh;
        });
      }
      showToast('Profile saved & synced to MySQL ✓', 'success');
    } catch (err: any) {
      console.warn('Backend updateMyProfile failed:', err);
      showToast('Profile updated locally (offline mode)', 'info');
    }
  }, [showToast]);

  // Update specific attendee info (used by organizer and profile modals)
  const updateAttendee = useCallback(async (id: string, data: Partial<Person>) => {
    // 1. Optimistic update
    setAttendees((att) => att.map((a) => (a.id === id ? { ...a, ...data } : a)));
    if (id === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }

    // 2. Persist to MySQL database via organizer or attendee API
    try {
      const res = await (role === 'organizer'
        ? api.organizer.updateAttendee(id, data)
        : api.attendees.updateAttendee(id, data));
      if (res) {
        setAttendees((att) => att.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              ...data,
              name: res.name || a.name,
              designation: res.designation || a.designation,
              company: res.company || a.company,
              bio: res.bio || a.bio,
              email: res.email || a.email,
              mobile: res.mobile || a.mobile,
              avatar: res.avatar || a.avatar,
              linkedin: res.linkedin || a.linkedin,
              twitter: res.twitter || a.twitter,
              interests: (res.interests && res.interests.length > 0) ? res.interests : a.interests,
              skills: (res.skills && res.skills.length > 0) ? res.skills : a.skills,
            };
          }
          return a;
        }));
      }
      showToast('Attendee record updated & saved to MySQL ✓', 'success');
    } catch (err: any) {
      console.warn('Backend updateAttendee failed:', err);
      showToast('Attendee updated locally (offline mode)', 'info');
    }
  }, [role, currentUser.id, showToast]);

  const updateCurrentUserPrivacy = useCallback((newPrivacy: Partial<PrivacyConsent>) => {
    setCurrentUser((prev) => {
      const updatedPrivacy = { ...prev.privacy, ...newPrivacy };
      // Also update in attendees list
      setAttendees((att) =>
        att.map((a) => (a.id === prev.id ? { ...a, privacy: updatedPrivacy } : a))
      );
      return {
        ...prev,
        privacy: updatedPrivacy,
      };
    });
    showToast('Privacy preferences updated ✓', 'success');
  }, [showToast]);

  // Record a QR scan
  const recordScan = useCallback(() => {
    setEvent((prev) => ({
      ...prev,
      totalScans: prev.totalScans + 1,
    }));
  }, []);

  // Connect with person (Delegate)
  const connectWith = useCallback((personId: string, source: 'direct' | 'qr_scan' | 'recommended' = 'direct') => {
    const existing = connections.find((c) => c.personId === personId);
    const targetPerson = attendees.find((a) => a.id === personId);
    if (!targetPerson) return { success: false, alreadyConnected: false };

    if (existing) {
      return { success: true, alreadyConnected: true };
    }

    const tempConnId = `conn-${Date.now()}`;
    const newConnection: Connection = {
      id: tempConnId,
      personId: targetPerson.id,
      personName: targetPerson.name,
      designation: targetPerson.designation,
      company: targetPerson.company,
      avatar: targetPerson.avatar,
      status: source === 'qr_scan' ? 'connected' : 'pending',
      type: 'sent',
      source,
      connectedAt: 'Just now',
    };

    setConnections((prev) => [newConnection, ...prev]);

    // Update global event metrics
    setEvent((prev) => ({
      ...prev,
      totalConnections: prev.totalConnections + 1,
      totalScans: source === 'qr_scan' ? prev.totalScans + 1 : prev.totalScans,
    }));

    if (!isOnline) {
      setSyncPendingCount((c) => c + 1);
    }

    showToast(`Sent connection request to ${targetPerson.name} ✓`, 'success');

    api.attendees.requestConnection(personId)
      .then((res) => {
        if (res && res.id) {
          setConnections((prev) => prev.map((c) => c.id === tempConnId ? { ...c, id: res.id, status: res.status || c.status } : c));
        }
      })
      .catch((err) => {
        console.warn('Backend requestConnection error:', err);
      });

    return { success: true, alreadyConnected: false };
  }, [connections, attendees, isOnline, showToast]);

  // Disconnect from person
  const disconnectFrom = useCallback(async (personId: string) => {
    const existing = connections.find((c) => c.personId === personId);
    if (!existing) return;

    setConnections((prev) => prev.filter((c) => c.personId !== personId));

    const targetPerson = attendees.find((a) => a.id === personId);
    if (targetPerson) {
      showToast(`Disconnected from ${targetPerson.name}`, 'info');
    }

    setEvent((prev) => ({
      ...prev,
      totalConnections: Math.max(0, prev.totalConnections - 1),
    }));

    try {
      await api.attendees.disconnect(existing.id || personId);
    } catch (err: any) {
      console.warn('Backend disconnect error:', err);
    }
  }, [connections, attendees, showToast]);

  const acceptConnectionRequest = useCallback(async (personId: string) => {
    const conn = connections.find((c) => c.personId === personId && c.type === 'received' && c.status === 'pending');
    setConnections((prev) => prev.map((c) => 
      c.personId === personId && c.type === 'received' && c.status === 'pending'
        ? { ...c, status: 'connected', connectedAt: 'Just now' }
        : c
    ));
    showToast('Connection request accepted', 'success');

    if (conn && conn.id) {
      try {
        await api.attendees.acceptConnection(conn.id);
      } catch (err: any) {
        console.warn('Backend acceptConnection error:', err);
      }
    }
  }, [connections, showToast]);

  const ignoreConnectionRequest = useCallback((personId: string) => {
    setConnections(prev => prev.filter(c => !(c.personId === personId && c.type === 'received' && c.status === 'pending')));
  }, []);

  // Save Lead (Exhibitor)
  const saveLead = useCallback(async (leadData: Omit<Lead, 'id' | 'capturedAt'>) => {
    const tempLeadId = `lead-${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id: tempLeadId,
      capturedAt: 'Just now',
      syncStatus: isOnline ? 'synced' : 'pending',
    };

    setLeads((prev) => {
      const existingIndex = prev.findIndex((l) => l.personId === leadData.personId);
      if (existingIndex >= 0) {
        const copy = [...prev];
        const existing = copy[existingIndex];
        const updatedLead: Lead = {
          ...existing,
          ...leadData,
          status: leadData.status,
          notes: leadData.notes || existing.notes,
          capturedAt: 'Just now',
          syncStatus: isOnline ? 'synced' : 'pending',
        };
        copy.splice(existingIndex, 1);
        return [updatedLead, ...copy];
      } else {
        return [newLead, ...prev];
      }
    });

    // Update Truechip stats
    setExhibitors((prev) =>
      prev.map((ex) =>
        ex.company.toLowerCase().includes('truechip')
          ? { ...ex, leads: ex.leads + 1 }
          : ex
      )
    );

    // Update event metrics
    setEvent((prev) => ({
      ...prev,
      totalScans: prev.totalScans + 1,
    }));

    if (!isOnline) {
      setSyncPendingCount((c) => c + 1);
      showToast(`Lead saved for ${leadData.name} (Sync pending)`, 'info');
      return;
    }

    try {
      const res = await api.exhibitor.captureLead({
        attendeeId: leadData.personId,
        status: leadData.status,
        source: leadData.source,
        notes: leadData.notes,
        interests: leadData.interests,
      });
      if (res && res.id) {
        setLeads((prev) =>
          prev.map((l) => (l.id === tempLeadId ? { ...l, id: res.id, syncStatus: 'synced' } : l))
        );
      }
      showToast(`Lead saved for ${leadData.name} as "${leadData.status}" ✓`, 'success');
    } catch (err: any) {
      console.warn('Backend captureLead error:', err);
      showToast(`Lead saved for ${leadData.name} as "${leadData.status}" ✓`, 'success');
    }
  }, [isOnline, showToast]);

  // Update Lead Status
  const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus, notes?: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status, ...(notes !== undefined ? { notes } : {}) }
          : l
      )
    );

    try {
      await api.exhibitor.updateLead(leadId, { status, notes });
      showToast(`Lead updated to ${status} ✓`, 'success');
    } catch (err: any) {
      console.warn('Backend updateLead error:', err);
      showToast(`Lead updated to ${status} ✓`, 'success');
    }
  }, [showToast]);

  // Enquire product
  const enquireProduct = useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Increment enquiries and interested visitors count
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              enquiries: p.enquiries + 1,
              interestedVisitorsCount: p.interestedVisitorsCount + 1,
            }
          : p
      )
    );

    // Update Truechip booth stats
    setExhibitors((prev) =>
      prev.map((ex) =>
        ex.company.toLowerCase().includes('truechip')
          ? { ...ex, enquiries: ex.enquiries + 1 }
          : ex
      )
    );

    // Add currentUser to interested visitors (respecting privacy consent!)
    const alreadyVisitor = interestedVisitors.find(
      (v) => v.productId === productId && v.personId === currentUser.id
    );

    if (!alreadyVisitor) {
      const newVisitor: InterestedVisitor = {
        id: `v-${Date.now()}`,
        productId,
        personId: currentUser.id,
        name: currentUser.name,
        designation: currentUser.designation,
        company: currentUser.company,
        email: currentUser.privacy.shareEmail ? currentUser.email : 'Not shared',
        mobile: currentUser.privacy.sharePhone ? currentUser.mobile : 'Not shared',
        linkedin: (currentUser.privacy.shareLinkedIn && currentUser.linkedin) ? currentUser.linkedin : 'Not shared',
        interactionType: 'enquiry',
        timestamp: 'Just now',
      };
      setInterestedVisitors((prev) => [newVisitor, ...prev]);
    }

    showToast(`Enquiry submitted for ${product.name} ✓`, 'success');
  }, [products, interestedVisitors, currentUser, showToast]);

  // Save/Bookmark Product
  const toggleSaveProduct = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextState = !p.isSaved;
          showToast(nextState ? `Saved ${p.name} to your items` : `Removed ${p.name} from saved`, 'info');
          return { ...p, isSaved: nextState };
        }
        return p;
      })
    );
  }, [showToast]);

  // Update product (Exhibitor)
  const updateProduct = useCallback(async (productId: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data } : p))
    );
    showToast('Product updated successfully ✓', 'success');

    try {
      await api.exhibitor.updateProduct(productId, {
        name: data.name,
        tagline: data.tagline,
        category: data.category,
        overview: data.overview,
        features: data.features,
        benefits: data.benefits,
        useCases: data.useCases,
        imageUrl: data.image,
        websiteUrl: data.resources?.websiteUrl,
        brochureUrl: data.resources?.brochureUrl,
      });
    } catch (err: any) {
      console.warn('Backend updateProduct error:', err);
    }
  }, [showToast]);

  // Delete product (Exhibitor)
  const deleteProduct = useCallback(async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from showcase ✓', 'info');

    try {
      await api.exhibitor.deleteProduct(productId);
    } catch (err: any) {
      console.warn('Backend deleteProduct error:', err);
    }
  }, [showToast]);

  // Add product (Exhibitor)
  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    const tempId = `prod-truechip-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: tempId,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('New product added to showcase ✓', 'success');

    try {
      const res = await api.exhibitor.createProduct({
        name: productData.name,
        tagline: productData.tagline,
        category: productData.category,
        overview: productData.overview || productData.tagline,
        features: productData.features || [],
        benefits: productData.benefits || [],
        useCases: productData.useCases || [],
        imageUrl: productData.image,
        websiteUrl: productData.resources?.websiteUrl,
        brochureUrl: productData.resources?.brochureUrl,
      });
      if (res && res.id) {
        setProducts((prev) => prev.map((p) => p.id === tempId ? { ...p, id: res.id } : p));
      }
    } catch (err: any) {
      console.warn('Backend createProduct error:', err);
    }
  }, [showToast]);

  // Submit Q&A Question
  const submitQuestion = useCallback(async (sessionId: string, text: string, isAnonymous: boolean) => {
    if (!text.trim()) return;

    let createdId = `q-${Date.now()}`;
    try {
      const res = await api.sessions.submitQuestion(sessionId, text.trim(), isAnonymous);
      if (res && res.id) {
        createdId = res.id;
      }
    } catch (err: any) {
      console.warn('Backend submitQuestion error:', err);
    }

    const newQuestion: Question = {
      id: createdId,
      sessionId,
      text: text.trim(),
      authorName: isAnonymous ? 'Anonymous' : currentUser.name,
      authorId: isAnonymous ? 'usr-anon' : currentUser.id,
      isAnonymous,
      status: 'Submitted',
      upvotes: 0,
      upvotedBy: [],
      createdAt: 'Just now',
    };

    setQuestions((prev) => [newQuestion, ...prev]);

    // Update session questions count
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, questionsCount: s.questionsCount + 1 } : s
      )
    );

    showToast('Question submitted ✓', 'success');
  }, [currentUser, showToast]);

  // Upvote Question
  const upvoteQuestion = useCallback((questionId: string) => {
    const q = questions.find((item) => item.id === questionId);
    if (!q) return { success: false };

    const alreadyUpvoted = q.upvotedBy.includes(currentUser.id);
    if (alreadyUpvoted) {
      // remove upvote
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === questionId
            ? {
                ...item,
                upvotes: Math.max(0, item.upvotes - 1),
                upvotedBy: item.upvotedBy.filter((id) => id !== currentUser.id),
              }
            : item
        )
      );
      api.sessions.removeQuestionUpvote(questionId).catch((err) => {
        console.warn('Backend removeQuestionUpvote error:', err);
      });
      return { success: true, message: 'Upvote removed' };
    } else {
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === questionId
            ? {
                ...item,
                upvotes: item.upvotes + 1,
                upvotedBy: [...item.upvotedBy, currentUser.id],
              }
            : item
        )
      );
      api.sessions.upvoteQuestion(questionId).catch((err) => {
        console.warn('Backend upvoteQuestion error:', err);
      });
      showToast('Question upvoted ✓', 'success');
      return { success: true };
    }
  }, [questions, currentUser.id, showToast]);

  // Update question status (Moderator action)
  const updateQuestionStatus = useCallback((questionId: string, status: QuestionStatus) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, status } : q))
    );
    showToast(`Question marked as ${status} ✓`, 'info');
  }, [showToast]);

  // Vote in Poll
  const votePoll = useCallback(async (optionId: string) => {
    if (poll.voterIds.includes(currentUser.id)) {
      return { success: false, message: 'You have already voted.' };
    }

    setPoll((prev) => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      voterIds: [...prev.voterIds, currentUser.id],
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
    }));

    try {
      const res = await api.sessions.votePoll(poll.id, optionId);
      if (res && res.options) {
        setPoll((prev) => ({
          ...prev,
          totalVotes: res.totalVotes,
          options: res.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes,
          })),
        }));
      }
    } catch (err: any) {
      console.warn('Backend votePoll error:', err);
    }

    showToast('Poll vote recorded ✓', 'success');
    return { success: true, message: 'Vote submitted ✓' };
  }, [poll.id, poll.voterIds, currentUser.id, showToast]);

  // Toggle Poll Status (Open / Closed)
  const togglePollStatus = useCallback(() => {
    setPoll((prev) => {
      const nextStatus = prev.status === 'open' ? 'closed' : 'open';
      showToast(`Poll is now ${nextStatus.toUpperCase()}`, 'info');
      return { ...prev, status: nextStatus };
    });
  }, [showToast]);

  // Reset Poll to Initial State (for delegates / testing)
  const resetPollVote = useCallback(async () => {
    setPoll(INITIAL_POLL);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`eventsphere_poll_voted_${INITIAL_POLL.id}`);
      } catch {
        // ignore
      }
    }
    try {
      const res = await api.sessions.resetPollVote(poll.id);
      if (res && res.options) {
        setPoll((prev) => ({
          ...prev,
          totalVotes: res.totalVotes,
          voterIds: [],
          options: res.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes,
          })),
        }));
      }
    } catch (err: any) {
      console.warn('Backend resetPollVote error:', err);
    }
    showToast('Poll reset to initial state ✓', 'info');
  }, [poll.id, showToast]);

  // Toggle check-in (Organizer)
  const toggleCheckIn = useCallback(async (personId: string) => {
    let nextCheckedInState = false;
    setAttendees((prev) =>
      prev.map((p) => {
        if (p.id === personId) {
          const next = !p.checkedIn;
          nextCheckedInState = next;
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...p,
            checkedIn: next,
            checkInTime: next ? `12 Feb 2026, ${nowStr}` : undefined,
          };
        }
        return p;
      })
    );

    setEvent((prev) => {
      const target = attendees.find((a) => a.id === personId);
      const isCurrentlyCheckedIn = target?.checkedIn;
      return {
        ...prev,
        totalCheckedIn: isCurrentlyCheckedIn ? Math.max(0, prev.totalCheckedIn - 1) : prev.totalCheckedIn + 1,
      };
    });

    if (!isOnline) {
      setSyncPendingCount((c) => c + 1);
    }

    showToast('Check-in status updated ✓', 'success');

    // Call backend API when connected
    try {
      const res = await api.organizer.toggleCheckIn(personId);
      if (res) {
        setAttendees((prev) =>
          prev.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  checkedIn: res.checkedIn,
                  checkInTime: res.checkInTime ? new Date(res.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
                }
              : p
          )
        );
      }
    } catch (err: any) {
      console.warn('Backend toggleCheckIn error:', err);
    }
  }, [attendees, isOnline, showToast]);

  // Add Walk-in Attendee (Organizer)
  const addWalkInAttendee = useCallback(async (data: {
    name: string;
    email: string;
    mobile: string;
    company: string;
    designation: string;
    ticketType: string;
  }) => {
    let newPerson: Person | null = null;
    try {
      const res = await api.organizer.registerWalkIn({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        company: data.company,
        designation: data.designation,
        ticketType: data.ticketType,
        category: 'DELEGATE',
      });
      if (res && res.id) {
        newPerson = {
          id: res.id,
          name: res.name,
          email: res.email,
          mobile: res.mobile,
          company: res.company || data.company,
          designation: res.designation || data.designation,
          ticketType: res.ticketType || data.ticketType,
          role: 'delegate',
          bio: res.bio || 'On-site walk-in registered delegate.',
          interests: res.interests || ['General Tech', 'Networking'],
          skills: res.skills || [],
          linkedin: res.linkedin || '',
          registrationId: res.registrationId || `REG-MPSS26-${Math.floor(1000 + Math.random() * 9000)}`,
          checkedIn: res.checkedIn ?? true,
          checkInTime: '23 Oct 2026, Just now',
          privacy: {
            preset: 'Connections Only',
            shareEmail: true,
            sharePhone: false,
            shareLinkedIn: true,
          },
        };
      }
    } catch (err: any) {
      console.warn('Backend registerWalkIn error:', err);
    }

    if (!newPerson) {
      newPerson = {
        id: `usr-walkin-${Date.now()}`,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        company: data.company,
        designation: data.designation,
        ticketType: data.ticketType,
        role: 'delegate',
        bio: 'On-site walk-in registered delegate.',
        interests: ['General Tech', 'Networking'],
        skills: [],
        linkedin: '',
        registrationId: `REG-MPSS26-${Math.floor(1000 + Math.random() * 9000)}`,
        checkedIn: true,
        checkInTime: '23 Oct 2026, Just now',
        privacy: {
          preset: 'Connections Only',
          shareEmail: true,
          sharePhone: false,
          shareLinkedIn: true,
        },
      };
    }

    setAttendees((prev) => [newPerson!, ...prev]);
    setEvent((prev) => ({
      ...prev,
      totalRegistered: prev.totalRegistered + 1,
      totalCheckedIn: prev.totalCheckedIn + 1,
    }));

    showToast(`Walk-in attendee ${data.name} checked in ✓`, 'success');
  }, [showToast]);

  // Import mock CSV attendees
  const importAttendeesMock = useCallback((count: number) => {
    setEvent((prev) => ({
      ...prev,
      totalRegistered: prev.totalRegistered + count,
    }));
    showToast(`Successfully imported ${count} registrations from CSV ✓`, 'success');
  }, [showToast]);

  // Toggle bookmark session
  const toggleBookmarkSession = useCallback(async (sessionId: string) => {
    // 1. Optimistic UI update
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const next = !s.isBookmarked;
          showToast(next ? `Session added to My Schedule ✓` : `Session removed from My Schedule`, 'info');
          return { ...s, isBookmarked: next };
        }
        return s;
      })
    );

    // 2. Persist to MySQL backend and confirm response
    try {
      const res = await api.sessions.toggleBookmark(sessionId);
      if (res && typeof res.isBookmarked === 'boolean') {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, isBookmarked: res.isBookmarked } : s))
        );
      }
    } catch (err: any) {
      console.warn('Backend toggleBookmark error:', err);
    }
  }, [showToast]);

  // Update session
  const updateSession = useCallback((sessionId: string, data: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...data } : s))
    );
    showToast('Session updated successfully ✓', 'success');

    if (data.status && Object.keys(data).length === 1) {
      api.organizer.updateSessionStatus(sessionId, data.status).catch((err) => {
        console.warn('Backend updateSessionStatus error:', err);
      });
    } else {
      const existing = sessions.find((s) => s.id === sessionId);
      if (existing) {
        const merged = { ...existing, ...data };
        api.organizer.updateSession(sessionId, {
          title: merged.title,
          track: merged.track,
          day: merged.day,
          timeRange: merged.timeRange,
          room: merged.room,
          status: merged.status,
          speakerName: merged.speakerName,
          speakerDesignation: merged.speakerDesignation,
          speakerCompany: merged.speakerCompany,
          description: merged.description,
          takeaways: merged.takeaways || [],
        }).catch((err) => {
          console.warn('Backend updateSession error:', err);
        });
      }
    }
  }, [sessions, showToast]);

  // Create session
  const createSession = useCallback(async (sessionData: Omit<Session, 'id' | 'attendanceCount' | 'questionsCount'>) => {
    let assignedId = `sess-${Date.now()}`;
    try {
      const res = await api.organizer.createSession({
        title: sessionData.title,
        track: sessionData.track,
        day: sessionData.day,
        timeRange: sessionData.timeRange,
        room: sessionData.room,
        status: sessionData.status,
        speakerName: sessionData.speakerName,
        speakerDesignation: sessionData.speakerDesignation,
        speakerCompany: sessionData.speakerCompany,
        description: sessionData.description,
        takeaways: sessionData.takeaways || [],
      });
      if (res && res.id) {
        assignedId = res.id;
      }
    } catch (err: any) {
      console.warn('Backend createSession error:', err);
    }

    const newSession: Session = {
      ...sessionData,
      id: assignedId,
      attendanceCount: 0,
      questionsCount: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    showToast('Session created successfully ✓', 'success');
  }, [showToast]);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Session deleted', 'info');

    api.organizer.deleteSession(sessionId).catch((err) => {
      console.warn('Backend deleteSession error:', err);
    });
  }, [showToast]);

  // Reset all data
  const resetAllData = useCallback(() => {
    setEvent(INITIAL_EVENT);
    setCurrentUser(CURRENT_USER);
    setAttendees(INITIAL_ATTENDEES);
    setConnections(INITIAL_CONNECTIONS);
    setLeads(INITIAL_LEADS);
    setProducts(INITIAL_PRODUCTS);
    setSessions(INITIAL_SESSIONS);
    setQuestions(INITIAL_QUESTIONS);
    setPoll(INITIAL_POLL);
    setExhibitors(INITIAL_EXHIBITORS);
    setInterestedVisitors(INITIAL_INTERESTED_VISITORS);
    setRoleState('delegate');
    setHasAccessConfirmed(false);
    setIsOnline(true);
    setSyncPendingCount(0);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Demo data reset to initial state ✓', 'info');
  }, [showToast]);

  const value = useMemo<StoreContextType>(() => ({
    role,
    setRole,
    activeDelegateTab,
    viewSavedPeopleOnly,
    setViewSavedPeopleOnly,
    viewSavedCompaniesOnly,
    setViewSavedCompaniesOnly,
    scheduleSubTab,
    setScheduleSubTab,
    savedCompanyIds,
    savedPeopleIds,
    toggleSavePerson,
    toggleSaveCompany,
    setActiveDelegateTab,
    activeExhibitorTab,
    setActiveExhibitorTab,
    activeOrganizerTab,
    setActiveOrganizerTab,
    viewMode,
    setViewMode,
    isOnline,
    setIsOnline,
    toggleConnectivity,
    isSyncing,
    syncPendingCount,
    lastSyncedTime,
    hasAccessConfirmed,
    setHasAccessConfirmed,
    triggerAccessFlow,
    selectedPersonId,
    setSelectedPersonId,
    selectedProductId,
    setSelectedProductId,
    selectedSessionId,
    setSelectedSessionId,
    sessionBackTab,
    setSessionBackTab,
    selectedCompanyId,
    setSelectedCompanyId,
    event,
    currentUser,
    setCurrentUser,
    updateCurrentUser,
    updateAttendee,
    updateCurrentUserPrivacy,
    attendees,
    setAttendees,
    connections,
    leads,
    products,
    sessions,
    questions,
    poll,
    exhibitors,
    interestedVisitors,
    connectWith,
    disconnectFrom,
    acceptConnectionRequest,
    ignoreConnectionRequest,
    saveLead,
    updateLeadStatus,
    enquireProduct,
    toggleSaveProduct,
    updateProduct,
    deleteProduct,
    addProduct,
    submitQuestion,
    upvoteQuestion,
    updateQuestionStatus,
    votePoll,
    togglePollStatus,
    resetPollVote,
    toggleCheckIn,
    addWalkInAttendee,
    importAttendeesMock,
    toggleBookmarkSession,
    updateSession,
    createSession,
    deleteSession,
    recordScan,
    resetAllData,
    toast,
    showToast,
  }), [
    role,
    setRole,
    activeDelegateTab,
    viewSavedPeopleOnly,
    viewSavedCompaniesOnly,
    scheduleSubTab,
    savedCompanyIds,
    savedPeopleIds,
    toggleSavePerson,
    toggleSaveCompany,
    activeExhibitorTab,
    activeOrganizerTab,
    viewMode,
    isOnline,
    toggleConnectivity,
    isSyncing,
    syncPendingCount,
    lastSyncedTime,
    hasAccessConfirmed,
    triggerAccessFlow,
    selectedPersonId,
    selectedProductId,
    selectedSessionId,
    sessionBackTab,
    selectedCompanyId,
    event,
    currentUser,
    updateCurrentUser,
    updateAttendee,
    updateCurrentUserPrivacy,
    attendees,
    connections,
    leads,
    products,
    sessions,
    questions,
    poll,
    exhibitors,
    interestedVisitors,
    connectWith,
    disconnectFrom,
    acceptConnectionRequest,
    ignoreConnectionRequest,
    saveLead,
    updateLeadStatus,
    enquireProduct,
    toggleSaveProduct,
    updateProduct,
    deleteProduct,
    addProduct,
    submitQuestion,
    upvoteQuestion,
    updateQuestionStatus,
    votePoll,
    togglePollStatus,
    resetPollVote,
    toggleCheckIn,
    addWalkInAttendee,
    importAttendeesMock,
    toggleBookmarkSession,
    updateSession,
    createSession,
    deleteSession,
    recordScan,
    resetAllData,
    toast,
    showToast,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
