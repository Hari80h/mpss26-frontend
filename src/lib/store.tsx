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


export const EMPTY_USER: Person = {
  id: '',
  name: '',
  designation: '',
  company: '',
  role: 'delegate',
  bio: '',
  interests: [],
  skills: [],
  email: '',
  mobile: '',
  linkedin: '',
  twitter: '',
  avatar: '',
  privacy: {
    preset: 'Connections Only',
    shareEmail: true,
    sharePhone: true,
    shareLinkedIn: true,
    shareTwitter: false,
  },
  checkedIn: false,
  registrationId: '',
  ticketType: 'Delegate',
};

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
  logout: () => void;
  resetUserState: () => void;

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
  upvoteQuestion: (questionId: string) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string };
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
  const [currentUser, setCurrentUser] = useState<Person>(EMPTY_USER);
  const [attendees, setAttendees] = useState<Person[]>(INITIAL_ATTENDEES);
  const [connections, setConnections] = useState<Connection[]>(process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? INITIAL_CONNECTIONS : []);
  const [leads, setLeads] = useState<Lead[]>(process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? INITIAL_LEADS : []);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [poll, setPoll] = useState<Poll>(INITIAL_POLL);
  const [exhibitors, setExhibitors] = useState<ExhibitorStats[]>(INITIAL_EXHIBITORS);
  const [interestedVisitors, setInterestedVisitors] = useState<InterestedVisitor[]>(INITIAL_INTERESTED_VISITORS);

  // Clear user-specific session state (called on logout, 401, or prior to new login)
  const clearUserSessionState = useCallback(() => {
    setCurrentUser(EMPTY_USER);
    setSavedPeopleIds([]);
    setSavedCompanyIds([]);
    setConnections([]);
    setLeads([]);
    setInterestedVisitors([]);
    setSelectedPersonId(null);
    setSelectedProductId(null);
    setSelectedSessionId(null);
    setSelectedCompanyId(null);
    setViewSavedPeopleOnly(false);
    setViewSavedCompaniesOnly(false);
    setScheduleSubTab('all');
    setActiveDelegateTab('home');
    setRoleState('delegate');
    setSessions((prev) => prev.map((s) => ({ ...s, isBookmarked: false })));
    setPoll((prev) => ({
      ...prev,
      voterIds: [],
      hasVoted: false,
      votedOptionId: null,
    }));
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        upvotedBy: [],
      }))
    );
  }, []);

  const resetUserState = useCallback(() => {
    clearUserSessionState();
  }, [clearUserSessionState]);

  // Load from localStorage on mount (strictly user-scoped)
  useEffect(() => {
    try {
      const token = api.getToken();
      const authUser = api.getUser();
      if (!token || !authUser?.id) {
        clearUserSessionState();
        setHasAccessConfirmed(false);
        return;
      }

      const userStorageKey = `${STORAGE_KEY}_${authUser.id}`;
      let saved = localStorage.getItem(userStorageKey);
      if (!saved) {
        const legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy) {
          try {
            const parsedLegacy = JSON.parse(legacy);
            if (parsedLegacy?.currentUser?.id === authUser.id) {
              saved = legacy;
            }
          } catch {
            // ignore
          }
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentUser && parsed.currentUser.id === authUser.id) {
          const u = { ...EMPTY_USER, ...parsed.currentUser };
          if (!u.privacy || (u.privacy.preset as any) === 'Private') {
            u.privacy = {
              preset: 'Connections Only',
              shareEmail: true,
              sharePhone: true,
              shareLinkedIn: true,
              shareTwitter: false,
            };
          }
          setCurrentUser(u);
        } else {
          setCurrentUser((prev) => ({
            ...EMPTY_USER,
            ...prev,
            id: authUser.id,
            name: authUser.name || prev.name,
            mobile: authUser.mobile || prev.mobile,
            email: authUser.email || prev.email,
          }));
        }
        if (parsed.role) setRoleState(parsed.role);
        if (typeof parsed.hasAccessConfirmed === 'boolean') setHasAccessConfirmed(parsed.hasAccessConfirmed);
        if (parsed.savedPeopleIds && Array.isArray(parsed.savedPeopleIds)) {
          setSavedPeopleIds(parsed.savedPeopleIds);
        }
        if (parsed.savedCompanyIds && Array.isArray(parsed.savedCompanyIds)) {
          setSavedCompanyIds(parsed.savedCompanyIds);
        }
      } else {
        setCurrentUser({
          ...EMPTY_USER,
          id: authUser.id,
          name: authUser.name || '',
          mobile: authUser.mobile || '',
          email: authUser.email || '',
        });
        setHasAccessConfirmed(true);
      }
    } catch {
      // ignore
    }
  }, [clearUserSessionState]);

  // Save to localStorage when state changes (strictly user-scoped)
  useEffect(() => {
    if (!hasAccessConfirmed || !currentUser?.id || !api.getToken()) {
      return;
    }
    const userStorageKey = `${STORAGE_KEY}_${currentUser.id}`;
    const payload = {
      currentUser,
      role,
      hasAccessConfirmed,
      savedPeopleIds,
      savedCompanyIds,
    };
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [
    currentUser,
    role,
    hasAccessConfirmed,
    savedPeopleIds,
    savedCompanyIds,
  ]);

  // Sync live metrics and exhibitors from backend when organizer console is active
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
              totalSpeakers: m.totalSpeakers || prev.totalSpeakers,
              totalConnections: m.totalConnections !== undefined ? m.totalConnections : prev.totalConnections,
              totalScans: m.totalLeads ? (m.totalLeads + (m.totalConnections || 0)) : prev.totalScans,
            }));
          }
        })
        .catch((err) => {
          console.warn('Backend metrics fetch skipped:', err);
        });

      api.organizer.getExhibitors()
        .then((exhList) => {
          if (exhList && Array.isArray(exhList) && exhList.length > 0) {
            setExhibitors((prev) => {
              const bMap = new Map(exhList.map((e) => [e.id, e]));
              const updated = prev.map((e) => {
                const b = bMap.get(e.id);
                if (b) {
                  return {
                    ...e,
                    company: b.company || e.company,
                    booth: b.booth || e.booth,
                    category: b.category || e.category,
                    leads: typeof b.leadCount === 'number' ? b.leadCount : e.leads,
                  };
                }
                return e;
              });
              const existingIds = new Set(prev.map((e) => e.id));
              const brandNew: ExhibitorStats[] = exhList
                .filter((b) => !existingIds.has(b.id))
                .map((b) => ({
                  id: b.id,
                  company: b.company,
                  booth: b.booth || 'TBA',
                  category: b.category || 'Technology',
                  logo: b.logoUrl || '',
                  leads: b.leadCount || 0,
                  enquiries: 0,
                  visits: 0,
                  teamSize: 0,
                  status: 'Active' as const,
                }));
              return [...updated, ...brandNew];
            });
          }
        })
        .catch((err) => {
          console.warn('Backend organizer exhibitors fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live exhibitor stats when exhibitor portal is active
  useEffect(() => {
    if (role === 'exhibitor' && hasAccessConfirmed) {
      api.exhibitor.getStats()
        .then((stats) => {
          if (stats && stats.company) {
            setCurrentUser((prev) => ({
              ...prev,
              company: stats.company || prev.company,
              boothNumber: stats.booth || prev.boothNumber,
              avatar: stats.logoUrl || prev.avatar,
            }));
            setExhibitors((prev) => {
              const idx = prev.findIndex((e) => e.id === stats.id || e.company.toLowerCase() === stats.company?.toLowerCase());
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = {
                  ...copy[idx],
                  company: stats.company || copy[idx].company,
                  booth: stats.booth || copy[idx].booth,
                  category: stats.category || copy[idx].category,
                  logo: stats.logoUrl || copy[idx].logo,
                  teamSize: stats.teamSize || copy[idx].teamSize,
                  leads: typeof stats.totalLeads === 'number' ? stats.totalLeads : copy[idx].leads,
                  enquiries: typeof stats.totalEnquiries === 'number' ? stats.totalEnquiries : copy[idx].enquiries,
                  visits: typeof stats.totalViews === 'number' ? stats.totalViews : copy[idx].visits,
                };
                return copy;
              }
              return prev;
            });
          }
        })
        .catch((err) => {
          console.warn('Backend exhibitor stats fetch skipped:', err);
        });
    }
  }, [role, hasAccessConfirmed]);

  // Sync live exhibitors from public directory (authenticated, any role)
  useEffect(() => {
    if (hasAccessConfirmed) {
      api.exhibitors.getAll()
        .then((backendExhibitors) => {
          if (backendExhibitors && Array.isArray(backendExhibitors) && backendExhibitors.length > 0) {
            setExhibitors((prev) => {
              const bMap = new Map(backendExhibitors.map((b: any) => [b.id, b]));
              const updated = prev.map((e) => {
                const b = bMap.get(e.id);
                if (b) {
                  return {
                    ...e,
                    company: b.company || e.company,
                    booth: b.booth || e.booth,
                    category: b.category || e.category,
                    logo: b.logoUrl || e.logo,
                  };
                }
                return e;
              });
              const existingIds = new Set(prev.map((e) => e.id));
              const brandNew: ExhibitorStats[] = backendExhibitors
                .filter((b: any) => !existingIds.has(b.id))
                .map((b: any) => ({
                  id: b.id,
                  company: b.company,
                  booth: b.booth || 'TBA',
                  category: b.category || 'Technology',
                  logo: b.logoUrl || '',
                  leads: 0,
                  enquiries: 0,
                  visits: 0,
                  teamSize: 0,
                  status: 'Active' as const,
                }));
              return [...updated, ...brandNew];
            });
          }
        })
        .catch((err) => {
          console.warn('Backend public exhibitors fetch skipped:', err);
        });
    }
  }, [hasAccessConfirmed]);

  // Sync live sessions & bookmarks from MySQL backend
  useEffect(() => {
    if (hasAccessConfirmed) {
      api.sessions.getAll()
        .then((backendSessions) => {
          if (backendSessions && Array.isArray(backendSessions) && backendSessions.length > 0) {
            setSessions(backendSessions.map((b: any) => ({
              id: b.id,
              title: b.title,
              track: b.track,
              day: b.day || 1,
              timeRange: b.timeRange,
              room: b.room,
              speakerName: b.speakerName || '',
              speakerDesignation: b.speakerDesignation || '',
              speakerCompany: b.speakerCompany || '',
              speakerId: b.speakerId || (b.speakerIds && b.speakerIds[0]) || '',
              speakerIds: b.speakerIds || [],
              description: b.description || '',
              takeaways: b.takeaways || [],
              status: b.status || 'upcoming',
              attendanceCount: typeof b.attendanceCount === 'number' ? b.attendanceCount : 0,
              isBookmarked: Boolean(b.isBookmarked),
              questionsCount: typeof b.questionsCount === 'number' ? b.questionsCount : 0,
            })));
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
            setSavedPeopleIds(ids);
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
            setSavedCompanyIds(backendSaved);
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
          if (backendConns && Array.isArray(backendConns)) {
            setConnections(backendConns);
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
          if (backendLeads && Array.isArray(backendLeads)) {
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
              voterIds: p.hasVoted && currentUser?.id ? [currentUser.id] : [],
              hasVoted: Boolean(p.hasVoted),
              votedOptionId: p.votedOptionId || null,
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
  }, [hasAccessConfirmed, currentUser?.id]);

  // Phase 4: Lightweight polling for live data (sessions status, poll results, questions of active session)
  // Polls every 20–30s with random jitter, only while document is visible, stops on 401
  useEffect(() => {
    if (!hasAccessConfirmed) return;

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const pollLiveData = async () => {
      if (typeof document !== 'undefined' && document.hidden) {
        timeoutId = setTimeout(pollLiveData, 10000);
        return;
      }

      try {
        // 1. Sync live sessions (status changes, attendance count, question count)
        const liveSessions = await api.sessions.getAll();
        if (!isCancelled && Array.isArray(liveSessions) && liveSessions.length > 0) {
          setSessions((prev) => {
            const bMap = new Map(liveSessions.map((s: any) => [s.id, s]));
            return prev.map((s) => {
              const b = bMap.get(s.id);
              if (!b) return s;
              return {
                ...s,
                status: (b.status as any) || s.status,
                attendanceCount: typeof b.attendanceCount === 'number' ? b.attendanceCount : s.attendanceCount,
                questionsCount: typeof b.questionsCount === 'number' ? b.questionsCount : s.questionsCount,
                isBookmarked: Boolean(b.isBookmarked),
              };
            });
          });
        }

        // 2. Sync live poll results
        const livePoll = await api.sessions.getPollById('poll-mpss26-01');
        if (!isCancelled && livePoll && livePoll.id && livePoll.options) {
          setPoll((prev) => ({
            ...prev,
            status: (livePoll.status as any) || prev.status,
            totalVotes: typeof livePoll.totalVotes === 'number' ? livePoll.totalVotes : prev.totalVotes,
            hasVoted: Boolean(livePoll.hasVoted),
            votedOptionId: livePoll.votedOptionId || null,
            voterIds: livePoll.hasVoted && currentUser?.id ? [currentUser.id] : [],
            options: livePoll.options.map((opt: any) => ({
              id: opt.id,
              text: opt.text,
              votes: opt.votes,
            })),
          }));
        }

        // 3. Sync live questions for active session
        const targetSessionId = selectedSessionId || 'mpss26-d1-02';
        const liveQuestions = await api.sessions.getQuestions(targetSessionId);
        if (!isCancelled && Array.isArray(liveQuestions)) {
          setQuestions((prev) => {
            const others = prev.filter((q) => q.sessionId !== targetSessionId);
            const mapped: Question[] = liveQuestions.map((q: any) => ({
              id: q.id,
              sessionId: q.sessionId || targetSessionId,
              text: q.text,
              authorName: q.authorName || 'Anonymous',
              authorId: q.authorId || (q.isAnonymous ? 'usr-anon' : 'unknown'),
              upvotes: q.upvotes || 0,
              upvotedBy: q.hasUpvoted && currentUser?.id ? [currentUser.id] : [],
              createdAt: q.createdAt || 'Just now',
              status: (q.status as QuestionStatus) || 'Submitted',
              isAnonymous: Boolean(q.isAnonymous),
            }));
            return [...others, ...mapped];
          });
        }
      } catch (err: any) {
        if (err?.status === 401) {
          return;
        }
      }

      if (!isCancelled) {
        const jitterInterval = 20000 + Math.floor(Math.random() * 10000);
        timeoutId = setTimeout(pollLiveData, jitterInterval);
      }
    };

    const initialDelay = 20000 + Math.floor(Math.random() * 10000);
    timeoutId = setTimeout(pollLiveData, initialDelay);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [hasAccessConfirmed, selectedSessionId, currentUser?.id]);

  // Set role without touching tokens - role is determined by backend login
  const setRole = useCallback((newRole: DemoRole) => {
    setRoleState(newRole);
  }, []);

  // Centralized logout
  const logout = useCallback(() => {
    api.auth.logout();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('eventsphere_')) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // ignore
      }
    }
    clearUserSessionState();
    setHasAccessConfirmed(false);
    showToast('Logged out successfully', 'info');
  }, [clearUserSessionState, showToast]);

  // Listen for unauthorized 401 events from ApiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      showToast('Session expired. Please log in again.', 'error');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('eventsphere:unauthorized', handleUnauthorized);
      return () => window.removeEventListener('eventsphere:unauthorized', handleUnauthorized);
    }
  }, [logout, showToast]);

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

  // Update specific attendee info (used by organizer console)
  const updateAttendee = useCallback(async (id: string, data: Partial<Person>) => {
    if (role !== 'organizer') {
      showToast('Only organizers can modify attendee records', 'error');
      return;
    }
    // 1. Optimistic update
    setAttendees((att) => att.map((a) => (a.id === id ? { ...a, ...data } : a)));
    if (id === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }

    // 2. Persist to MySQL database via organizer API
    try {
      const res = await api.organizer.updateAttendee(id, data);
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
      showToast(err.message || 'Failed to update attendee', 'error');
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

    // Update matching exhibitor stats
    const currentCompany = (currentUser.company || '').toLowerCase();
    setExhibitors((prev) =>
      prev.map((ex) =>
        (currentCompany && ex.company.toLowerCase() === currentCompany) || (currentUser.boothNumber && ex.booth === currentUser.boothNumber)
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
      // Rollback on server failure
      setLeads((prev) => prev.filter((l) => l.id !== tempLeadId));
      showToast(err.message || `Failed to save lead for ${leadData.name}`, 'error');
    }
  }, [currentUser, isOnline, showToast]);

  // Update Lead Status
  const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus, notes?: string) => {
    const prevLead = leads.find((l) => l.id === leadId);
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
      // Rollback on server failure
      if (prevLead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? prevLead : l)));
      }
      showToast(err.message || `Failed to update lead status`, 'error');
    }
  }, [leads, showToast]);

  // Enquire product
  const enquireProduct = useCallback(async (productId: string) => {
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

    // Update matching exhibitor booth stats
    const productCompany = (product.company || '').toLowerCase();
    setExhibitors((prev) =>
      prev.map((ex) =>
        (productCompany && ex.company.toLowerCase() === productCompany) || (product.booth && ex.booth === product.booth)
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

    try {
      await api.exhibitors.enquireProduct(productId);
    } catch (err: any) {
      console.warn('Backend enquireProduct error:', err);
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
  const upvoteQuestion = useCallback(async (questionId: string) => {
    const q = questions.find((item) => item.id === questionId);
    if (!q) return { success: false };

    try {
      const res = await api.sessions.upvoteQuestion(questionId);
      if (res && typeof res.upvotes === 'number') {
        setQuestions((prev) =>
          prev.map((item) =>
            item.id === questionId
              ? {
                  ...item,
                  upvotes: res.upvotes,
                  upvotedBy: res.hasUpvoted
                    ? (item.upvotedBy.includes(currentUser.id) ? item.upvotedBy : [...item.upvotedBy, currentUser.id])
                    : item.upvotedBy.filter((id) => id !== currentUser.id),
                }
              : item
          )
        );
        showToast(res.hasUpvoted ? 'Question upvoted ✓' : 'Upvote removed', 'info');
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Backend upvoteQuestion error:', err);
      showToast(err.message || 'Failed to toggle upvote', 'error');
    }
    return { success: false };
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

    const previousPoll = poll;
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
      showToast('Poll vote recorded ✓', 'success');
      return { success: true, message: 'Vote submitted ✓' };
    } catch (err: any) {
      console.warn('Backend votePoll error:', err);
      // Rollback optimistic update
      setPoll(previousPoll);
      const msg = err?.message || 'Failed to submit vote to server';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  }, [poll, currentUser.id, showToast]);

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
    setPoll((prev) => ({
      ...prev,
      voterIds: [],
      hasVoted: false,
      votedOptionId: null,
    }));
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`eventsphere_poll_voted_${INITIAL_POLL.id}`);
        if (currentUser?.id) {
          localStorage.removeItem(`eventsphere_poll_voted_${INITIAL_POLL.id}_${currentUser.id}`);
        }
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
          hasVoted: false,
          votedOptionId: null,
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
  }, [poll.id, currentUser?.id, showToast]);

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
    const previousSessions = sessions;
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
      // Rollback on failure
      setSessions(previousSessions);
      showToast(err?.message || 'Failed to update bookmark on server', 'error');
    }
  }, [sessions, showToast]);

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
      const assignedId = (res && res.id) ? res.id : `sess-${Date.now()}`;
      const newSession: Session = {
        ...sessionData,
        id: assignedId,
        attendanceCount: 0,
        questionsCount: 0,
      };
      setSessions((prev) => [newSession, ...prev]);
      showToast('Session created successfully ✓', 'success');
    } catch (err: any) {
      console.warn('Backend createSession error:', err);
      showToast(err?.message || 'Failed to create session on server', 'error');
    }
  }, [showToast]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    const previous = sessions;
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    try {
      await api.organizer.deleteSession(sessionId);
      showToast('Session deleted ✓', 'info');
    } catch (err: any) {
      console.warn('Backend deleteSession error:', err);
      setSessions(previous);
      showToast(err?.message || 'Failed to delete session on server', 'error');
    }
  }, [sessions, showToast]);

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
    logout,
    resetUserState,
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
    logout,
    resetUserState,
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
