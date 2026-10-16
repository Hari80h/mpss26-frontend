/**
 * EventSphere API Client
 * Connects mpss26-frontend with eventsphere-backend (Spring Boot 3.3.4)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'eventsphere_auth_token';
const USER_KEY = 'eventsphere_auth_user';

export interface ApiUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'ROLE_DELEGATE' | 'ROLE_EXHIBITOR' | 'ROLE_ORGANIZER';
  exhibitorId?: string | null;
  checkedIn?: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
}

export interface OrganizerMetrics {
  eventId: string;
  totalRegistered: number;
  totalCheckedIn: number;
  checkInRate: number;
  totalExhibitors: number;
  activeExhibitors: number;
  totalSessions: number;
  liveSessions: number;
  totalLeads: number;
  topExhibitors: Array<{
    id: string;
    name: string;
    booth: string;
    leads: number;
  }>;
}

export interface CheckInResult {
  attendeeId: string;
  checkedIn: boolean;
  checkInTime?: string | null;
}

export interface WalkInRequest {
  name: string;
  email: string;
  mobile: string;
  company: string;
  designation: string;
  ticketType: string;
  category?: string;
}

export interface ImportResult {
  eventId: string;
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
  errors: string[];
}

export interface CreateSessionPayload {
  title: string;
  track: string;
  day: number;
  timeRange: string;
  room: string;
  status: 'upcoming' | 'live' | 'completed' | 'concluded' | string;
  speakerName: string;
  speakerDesignation: string;
  speakerCompany: string;
  description: string;
  takeaways: string[];
}

export interface UpdateSessionPayload extends CreateSessionPayload {}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem(TOKEN_KEY);
      } catch {
        this.token = null;
      }
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        // ignore
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem(TOKEN_KEY);
      } catch {
        this.token = null;
      }
    }
    return this.token;
  }

  public clearAuth() {
    this.token = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        // ignore
      }
    }
  }

  public async ensureAuthenticated(roleHint?: string): Promise<string | null> {
    let token = this.getToken();
    if (token) return token;

    let mobile = '9876543210'; // default delegate: Hari Gupta
    if (roleHint === 'organizer') mobile = '9876543212';
    else if (roleHint === 'exhibitor') mobile = '9876543211';
    else if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('eventsphere_mpss26_store_v13');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.role === 'organizer') mobile = '9876543212';
          else if (parsed.role === 'exhibitor') mobile = '9876543211';
        }
      } catch {}
    }

    try {
      const res = await this.auth.login('MPSS26', mobile);
      return res.token;
    } catch (err) {
      console.warn('Auto-auth failed:', err);
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit & { _retry?: boolean } = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    let token = this.getToken();

    if (!token && !endpoint.includes('/auth/access') && typeof window !== 'undefined') {
      token = await this.ensureAuthenticated();
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && !options._retry && !endpoint.includes('/auth/access')) {
      this.clearAuth();
      const newToken = await this.ensureAuthenticated();
      if (newToken) {
        return this.request<T>(endpoint, { ...options, _retry: true });
      }
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (isJson) {
        try {
          const errData = await response.json();
          errorMessage = errData.message || errData.error || errorMessage;
        } catch {
          // ignore
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    if (isJson) {
      return response.json() as Promise<T>;
    }
    return response.text() as unknown as Promise<T>;
  }

  // Auth Endpoints
  public auth = {
    login: async (eventId: string, mobile: string): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/api/v1/auth/access', {
        method: 'POST',
        body: JSON.stringify({ eventId, mobile }),
      });
      if (res && res.token) {
        this.setToken(res.token);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          } catch {
            // ignore
          }
        }
      }
      return res;
    },
    logout: () => {
      this.clearAuth();
    },
  };

  // Phase 8: Organizer Endpoints
  public organizer = {
    getMetrics: async (): Promise<OrganizerMetrics> => {
      return this.request<OrganizerMetrics>('/api/v1/organizer/metrics');
    },
    toggleCheckIn: async (attendeeId: string): Promise<CheckInResult> => {
      return this.request<CheckInResult>(`/api/v1/organizer/attendees/${encodeURIComponent(attendeeId)}/check-in`, {
        method: 'POST',
      });
    },
    registerWalkIn: async (data: WalkInRequest): Promise<any> => {
      return this.request<any>('/api/v1/organizer/attendees/walk-in', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    importAttendeesCsv: async (file: File): Promise<ImportResult> => {
      const formData = new FormData();
      formData.append('file', file);
      return this.request<ImportResult>('/api/v1/organizer/attendees/import', {
        method: 'POST',
        body: formData,
      });
    },
    updateAttendee: async (attendeeId: string, data: any): Promise<any> => {
      return this.request<any>(`/api/v1/organizer/attendees/${encodeURIComponent(attendeeId)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    createSession: async (data: CreateSessionPayload): Promise<any> => {
      return this.request<any>('/api/v1/organizer/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateSession: async (sessionId: string, data: UpdateSessionPayload): Promise<any> => {
      return this.request<any>(`/api/v1/organizer/sessions/${encodeURIComponent(sessionId)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    updateSessionStatus: async (sessionId: string, status: string): Promise<any> => {
      return this.request<any>(`/api/v1/organizer/sessions/${encodeURIComponent(sessionId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    deleteSession: async (sessionId: string): Promise<void> => {
      return this.request<void>(`/api/v1/organizer/sessions/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
    },
  };

  // Phase 7: Sessions, Q&A & Live Polls
  public sessions = {
    getAll: async (day?: number, track?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (day) params.append('day', day.toString());
      if (track) params.append('track', track);
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<any[]>(`/api/v1/sessions${query}`);
    },
    getById: async (id: string): Promise<any> => {
      return this.request<any>(`/api/v1/sessions/${encodeURIComponent(id)}`);
    },
    toggleBookmark: async (sessionId: string): Promise<{ sessionId: string; isBookmarked: boolean }> => {
      return this.request<{ sessionId: string; isBookmarked: boolean }>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/bookmark`, {
        method: 'POST',
      });
    },
    getQuestions: async (sessionId: string): Promise<any[]> => {
      return this.request<any[]>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/questions`);
    },
    submitQuestion: async (sessionId: string, text: string, isAnonymous: boolean): Promise<any> => {
      return this.request<any>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/questions`, {
        method: 'POST',
        body: JSON.stringify({ text, isAnonymous }),
      });
    },
    upvoteQuestion: async (questionId: string): Promise<any> => {
      return this.request<any>(`/api/v1/sessions/questions/${encodeURIComponent(questionId)}/upvote`, {
        method: 'POST',
      });
    },
    removeQuestionUpvote: async (questionId: string): Promise<any> => {
      return this.request<any>(`/api/v1/sessions/questions/${encodeURIComponent(questionId)}/upvote`, {
        method: 'DELETE',
      });
    },
    getPolls: async (sessionId: string): Promise<any[]> => {
      return this.request<any[]>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/polls`);
    },
    votePoll: async (pollId: string, optionId: string): Promise<any> => {
      return this.request<any>(`/api/v1/polls/${encodeURIComponent(pollId)}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionId }),
      });
    },
    resetPollVote: async (pollId: string): Promise<any> => {
      return this.request<any>(`/api/v1/polls/${encodeURIComponent(pollId)}/vote`, {
        method: 'DELETE',
      });
    },
    getPollById: async (pollId: string): Promise<any> => {
      return this.request<any>(`/api/v1/polls/${encodeURIComponent(pollId)}`);
    },
  };

  // Phase 6: Attendees & Networking
  public attendees = {
    getAll: async (search?: string, role?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<any[]>(`/api/v1/attendees${query}`);
    },
    getMyProfile: async (): Promise<any> => {
      return this.request<any>('/api/v1/attendees/me');
    },
    updateMyProfile: async (data: Record<string, any>): Promise<any> => {
      return this.request<any>('/api/v1/attendees/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    updateAttendee: async (attendeeId: string, data: Record<string, any>): Promise<any> => {
      return this.request<any>(`/api/v1/attendees/${encodeURIComponent(attendeeId)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    updatePrivacy: async (data: { preset: string; shareEmail: boolean; sharePhone: boolean; shareLinkedIn: boolean; shareTwitter: boolean }): Promise<any> => {
      return this.request<any>('/api/v1/attendees/me/privacy', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getConnections: async (): Promise<any[]> => {
      return this.request<any[]>('/api/v1/attendees/connections');
    },
    requestConnection: async (targetAttendeeId: string, note?: string): Promise<any> => {
      return this.request<any>('/api/v1/attendees/connections', {
        method: 'POST',
        body: JSON.stringify({ targetAttendeeId, note }),
      });
    },
    acceptConnection: async (connectionId: string): Promise<any> => {
      return this.request<any>(`/api/v1/attendees/connections/${encodeURIComponent(connectionId)}/accept`, {
        method: 'POST',
      });
    },
    disconnect: async (connectionId: string): Promise<void> => {
      return this.request<void>(`/api/v1/attendees/connections/${encodeURIComponent(connectionId)}`, {
        method: 'DELETE',
      });
    },
    savePerson: async (attendeeId: string): Promise<any> => {
      return this.request<any>(`/api/v1/attendees/${encodeURIComponent(attendeeId)}/save`, {
        method: 'POST',
      });
    },
    unsavePerson: async (attendeeId: string): Promise<any> => {
      return this.request<any>(`/api/v1/attendees/${encodeURIComponent(attendeeId)}/save`, {
        method: 'DELETE',
      });
    },
    getSavedPeople: async (): Promise<any[]> => {
      return this.request<any[]>('/api/v1/attendees/saved');
    },
    saveExhibitor: async (exhibitorId: string): Promise<any> => {
      return this.request<any>(`/api/v1/attendees/saved-exhibitors/${encodeURIComponent(exhibitorId)}`, {
        method: 'POST',
      });
    },
    unsaveExhibitor: async (exhibitorId: string): Promise<any> => {
      return this.request<any>(`/api/v1/attendees/saved-exhibitors/${encodeURIComponent(exhibitorId)}`, {
        method: 'DELETE',
      });
    },
    getSavedExhibitors: async (): Promise<string[]> => {
      return this.request<string[]>('/api/v1/attendees/saved-exhibitors');
    },
  };

  // Phase 5: Exhibitor Portal
  public exhibitor = {
    getStats: async (exhibitorId?: string): Promise<any> => {
      const query = exhibitorId ? `?exhibitorId=${encodeURIComponent(exhibitorId)}` : '';
      return this.request<any>(`/api/v1/exhibitor/stats${query}`);
    },
    searchCandidates: async (query: string): Promise<any[]> => {
      return this.request<any[]>(`/api/v1/exhibitor/attendees/search?query=${encodeURIComponent(query)}`);
    },
    getLeads: async (status?: string): Promise<any[]> => {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      return this.request<any[]>(`/api/v1/exhibitor/leads${query}`);
    },
    captureLead: async (data: { attendeeId: string; status?: string; notes?: string; source?: string; interests?: string[] }): Promise<any> => {
      return this.request<any>('/api/v1/exhibitor/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateLead: async (leadId: string, data: { status: string; notes?: string }): Promise<any> => {
      return this.request<any>(`/api/v1/exhibitor/leads/${encodeURIComponent(leadId)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    getProducts: async (): Promise<any[]> => {
      return this.request<any[]>('/api/v1/exhibitor/products');
    },
    createProduct: async (data: any): Promise<any> => {
      return this.request<any>('/api/v1/exhibitor/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateProduct: async (productId: string, data: any): Promise<any> => {
      return this.request<any>(`/api/v1/exhibitor/products/${encodeURIComponent(productId)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteProduct: async (productId: string): Promise<void> => {
      return this.request<void>(`/api/v1/exhibitor/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
    },
  };
}

export const api = new ApiClient();
