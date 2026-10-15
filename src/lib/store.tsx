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
  updateCurrentUser: (data: Partial<Person>) => void;
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
  saveLead: (leadData: Omit<Lead, 'id' | 'capturedAt'>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => void;
  enquireProduct: (productId: string) => void;
  toggleSaveProduct: (productId: string) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addProduct: (productData: Omit<Product, 'id'>) => void;
  submitQuestion: (sessionId: string, text: string, isAnonymous: boolean) => void;
  upvoteQuestion: (questionId: string) => { success: boolean; message?: string };
  updateQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  votePoll: (optionId: string) => { success: boolean; message: string };
  togglePollStatus: () => void;
  resetPollVote: () => void;
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

  const toggleSaveCompany = useCallback((id: string) => {
    setSavedCompanyIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }, []);

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
  const toggleSavePerson = useCallback((id: string) => {
    setSavedPeopleIds((prev) => {
      const isSaved = prev.includes(id);
      if (isSaved) return prev.filter((pId) => pId !== id);
      return [...prev, id];
    });
  }, []);


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
        if (parsed.currentUser && parsed.currentUser.id === CURRENT_USER.id) {
          const u = { ...CURRENT_USER, ...parsed.currentUser };
          u.name = 'Hari Gupta';
          u.company = 'EventSphere';
          u.designation = 'CEO';
          u.mobile = '+91 98765 43210';
          u.email = 'hari@eventsphere.com';
          u.avatar = '/images/avatars/hari-gupta.png';
          u.registrationId = '#5023';
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
  ]);

  // Set role with tab preservation
  const setRole = useCallback((newRole: DemoRole) => {
    setRoleState(newRole);
    showToast(`Switched to ${newRole === 'delegate' ? 'Delegate (Santosh Kumar)' : newRole === 'exhibitor' ? 'Exhibitor (Truechip Booth A-02)' : 'Organizer Console'} view`, 'info');
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

  // Update privacy
  const updateCurrentUser = useCallback((data: Partial<Person>) => {
    setCurrentUser((prev) => {
      const updatedUser = { ...prev, ...data };
      setAttendees((att) => att.map((a) => (a.id === prev.id ? updatedUser : a)));
      return updatedUser;
    });
    showToast('Profile updated ✓', 'success');
  }, [showToast]);

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

    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
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
    return { success: true, alreadyConnected: false };
  }, [connections, attendees, isOnline, showToast]);

  // Disconnect from person
  const disconnectFrom = useCallback((personId: string) => {
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
  }, [connections, attendees, showToast]);

  const acceptConnectionRequest = useCallback((personId: string) => {
    setConnections(prev => prev.map(c => 
      c.personId === personId && c.type === 'received' && c.status === 'pending'
        ? { ...c, status: 'connected', connectedAt: 'Just now' }
        : c
    ));
    showToast('Connection request accepted', 'success');
  }, [showToast]);

  const ignoreConnectionRequest = useCallback((personId: string) => {
    setConnections(prev => prev.filter(c => !(c.personId === personId && c.type === 'received' && c.status === 'pending')));
  }, []);

  // Save Lead (Exhibitor)
  const saveLead = useCallback((leadData: Omit<Lead, 'id' | 'capturedAt'>) => {
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
        const newLead: Lead = {
          ...leadData,
          id: `lead-${Date.now()}`,
          capturedAt: 'Just now',
          syncStatus: isOnline ? 'synced' : 'pending',
        };
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
    } else {
      showToast(`Lead saved for ${leadData.name} as "${leadData.status}" ✓`, 'success');
    }
  }, [isOnline, showToast]);

  // Update Lead Status
  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus, notes?: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status, ...(notes !== undefined ? { notes } : {}) }
          : l
      )
    );
    showToast(`Lead updated to ${status} ✓`, 'success');
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
  const updateProduct = useCallback((productId: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data } : p))
    );
    showToast('Product updated successfully ✓', 'success');
  }, [showToast]);

  // Delete product (Exhibitor)
  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from showcase ✓', 'info');
  }, [showToast]);

  // Add product (Exhibitor)
  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-truechip-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('New product added to showcase ✓', 'success');
  }, [showToast]);

  // Submit Q&A Question
  const submitQuestion = useCallback((sessionId: string, text: string, isAnonymous: boolean) => {
    if (!text.trim()) return;

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      sessionId,
      text: text.trim(),
      authorName: isAnonymous ? 'Anonymous' : currentUser.name,
      authorId: isAnonymous ? 'usr-anon' : currentUser.id,
      isAnonymous,
      status: 'Submitted',
      upvotes: 1,
      upvotedBy: [currentUser.id],
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
  const votePoll = useCallback((optionId: string) => {
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

    showToast('Poll vote recorded ✓', 'success');
    return { success: true, message: 'Vote submitted ✓' };
  }, [poll.voterIds, currentUser.id, showToast]);

  // Toggle Poll Status (Open / Closed)
  const togglePollStatus = useCallback(() => {
    setPoll((prev) => {
      const nextStatus = prev.status === 'open' ? 'closed' : 'open';
      showToast(`Poll is now ${nextStatus.toUpperCase()}`, 'info');
      return { ...prev, status: nextStatus };
    });
  }, [showToast]);

  // Reset Poll to Initial State (for delegates / testing)
  const resetPollVote = useCallback(() => {
    setPoll(INITIAL_POLL);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`eventsphere_poll_voted_${INITIAL_POLL.id}`);
      } catch {
        // ignore
      }
    }
    showToast('Poll reset to initial state ✓', 'info');
  }, [showToast]);

  // Toggle check-in (Organizer)
  const toggleCheckIn = useCallback((personId: string) => {
    setAttendees((prev) =>
      prev.map((p) => {
        if (p.id === personId) {
          const next = !p.checkedIn;
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
        totalCheckedIn: isCurrentlyCheckedIn ? prev.totalCheckedIn - 1 : prev.totalCheckedIn + 1,
      };
    });

    if (!isOnline) {
      setSyncPendingCount((c) => c + 1);
    }

    showToast('Check-in status updated ✓', 'success');
  }, [attendees, isOnline, showToast]);

  // Add Walk-in Attendee (Organizer)
  const addWalkInAttendee = useCallback((data: {
    name: string;
    email: string;
    mobile: string;
    company: string;
    designation: string;
    ticketType: string;
  }) => {
    const newPerson: Person = {
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

    setAttendees((prev) => [newPerson, ...prev]);
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
  const toggleBookmarkSession = useCallback((sessionId: string) => {
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
  }, [showToast]);

  // Update session
  const updateSession = useCallback((sessionId: string, data: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...data } : s))
    );
    showToast('Session updated successfully ✓', 'success');
  }, [showToast]);

  // Create session
  const createSession = useCallback((sessionData: Omit<Session, 'id' | 'attendanceCount' | 'questionsCount'>) => {
    const newSession: Session = {
      ...sessionData,
      id: `sess-${Date.now()}`,
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
