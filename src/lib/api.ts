/**
 * EventSphere API Client
 * Connects mpss26-frontend with eventsphere-backend (Spring Boot 3.3.4)
 */

const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.BACKEND_URL || 'http://localhost:8080');
const TOKEN_KEY = 'eventsphere_auth_token';
const USER_KEY = 'eventsphere_auth_user';

export interface ApiUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'ROLE_DELEGATE' | 'ROLE_EXHIBITOR' | 'ROLE_ORGANIZER';
  category?: string;
  exhibitorId?: string | null;
  eventId?: string;
  company?: string;
  designation?: string;
  avatar?: string;
  ticketType?: string;
  checkedIn?: boolean;
  boothNumber?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
}

export interface OrganizerMetrics {
  eventId?: string;
  totalRegistered: number;
  totalCheckedIn: number;
  checkInRate: number;
  totalExhibitors: number;
  activeExhibitors: number;
  totalSpeakers?: number;
  totalSessions: number;
  liveSessions: number;
  totalConnections?: number;
  totalLeads: number;
  topExhibitors: Array<{
    id: string;
    name: string;
    booth: string;
    leads: number;
  }>;
}

export interface OrganizerExhibitor {
  id: string;
  company: string;
  booth: string;
  category: string;
  logoUrl?: string;
  leadCount: number;
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

  public getUser(): ApiUser | null {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem(USER_KEY);
        if (u) return JSON.parse(u);
      } catch {
        return null;
      }
    }
    return null;
  }

  public clearAuth() {
    this.token = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('eventsphere_')) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // ignore
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

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

    if (response.status === 401 && !endpoint.includes('/auth/access')) {
      this.clearAuth();
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('eventsphere_mpss26_store_v13');
          window.dispatchEvent(new CustomEvent('eventsphere:unauthorized'));
        } catch {
          // ignore
        }
      }
      throw new Error('Session expired or unauthorized. Please log in.');
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

  private async requestWithResponse<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; headers: Headers }> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

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

    if (response.status === 401 && !endpoint.includes('/auth/access')) {
      this.clearAuth();
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('eventsphere_mpss26_store_v13');
          window.dispatchEvent(new CustomEvent('eventsphere:unauthorized'));
        } catch {
          // ignore
        }
      }
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = `Request failed with status ${response.status}`;
      if (contentType.includes('application/json')) {
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

    const data = (response.status === 204 ? {} : await response.json()) as T;
    return { data, headers: response.headers };
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
    getAttendees: async (params?: { query?: string; category?: string; checkedInOnly?: boolean; page?: number; size?: number }): Promise<{ items: any[]; total: number }> => {
      const sp = new URLSearchParams();
      if (params?.query) sp.append('query', params.query);
      if (params?.category) sp.append('category', params.category);
      if (params?.checkedInOnly !== undefined) sp.append('checkedInOnly', params.checkedInOnly.toString());
      if (params?.page !== undefined) sp.append('page', params.page.toString());
      if (params?.size !== undefined) sp.append('size', params.size.toString());
      const queryStr = sp.toString() ? `?${sp.toString()}` : '';
      const res = await this.requestWithResponse<any[]>(`/api/v1/organizer/attendees${queryStr}`);
      const totalHeader = res.headers.get('X-Total-Count');
      const total = totalHeader ? parseInt(totalHeader, 10) : res.data.length;
      return { items: res.data, total };
    },
    getExhibitors: async (): Promise<OrganizerExhibitor[]> => {
      return this.request<OrganizerExhibitor[]>('/api/v1/organizer/exhibitors');
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
    upvoteQuestion: async (questionId: string): Promise<{ questionId: string; upvotes: number; hasUpvoted: boolean; message: string }> => {
      return this.request<{ questionId: string; upvotes: number; hasUpvoted: boolean; message: string }>(`/api/v1/sessions/questions/${encodeURIComponent(questionId)}/upvote`, {
        method: 'POST',
      });
    },
    removeQuestionUpvote: async (questionId: string): Promise<{ questionId: string; upvotes: number; hasUpvoted: boolean; message: string }> => {
      return this.request<{ questionId: string; upvotes: number; hasUpvoted: boolean; message: string }>(`/api/v1/sessions/questions/${encodeURIComponent(questionId)}/upvote`, {
        method: 'POST',
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
    getAll: async (params?: { query?: string; category?: string; page?: number; size?: number; savedOnly?: boolean } | string, role?: string): Promise<any[]> => {
      let queryStr = '';
      if (typeof params === 'string') {
        const sp = new URLSearchParams();
        if (params) sp.append('query', params);
        if (role) sp.append('category', role);
        queryStr = `?${sp.toString()}`;
      } else if (params) {
        const sp = new URLSearchParams();
        if (params.query) sp.append('query', params.query);
        if (params.category) sp.append('category', params.category);
        if (params.page !== undefined) sp.append('page', params.page.toString());
        if (params.size !== undefined) sp.append('size', params.size.toString());
        if (params.savedOnly) sp.append('savedOnly', 'true');
        queryStr = `?${sp.toString()}`;
      }
      return this.request<any[]>(`/api/v1/attendees${queryStr}`);
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
    updatePrivacy: async (data: { preset: string; shareEmail: boolean; sharePhone: boolean; shareLinkedIn: boolean; shareTwitter: boolean }): Promise<any> => {
      return this.request<any>('/api/v1/attendees/me/privacy', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getConnections: async (): Promise<any[]> => {
      return this.request<any[]>('/api/v1/connections');
    },
    requestConnection: async (targetAttendeeId: string, note?: string): Promise<any> => {
      return this.request<any>('/api/v1/connections', {
        method: 'POST',
        body: JSON.stringify({ targetAttendeeId, note }),
      });
    },
    acceptConnection: async (connectionId: string): Promise<any> => {
      return this.request<any>(`/api/v1/connections/${encodeURIComponent(connectionId)}/accept`, {
        method: 'POST',
      });
    },
    disconnect: async (connectionId: string): Promise<void> => {
      return this.request<void>(`/api/v1/connections/${encodeURIComponent(connectionId)}`, {
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

  // Phase 5/9: Public Exhibitors Directory (Authenticated, Any Role)
  public exhibitors = {
    getAll: async (): Promise<any[]> => {
      return this.request<any[]>('/api/v1/exhibitors');
    },
    getById: async (id: string): Promise<any> => {
      return this.request<any>(`/api/v1/exhibitors/${encodeURIComponent(id)}`);
    },
    getProducts: async (id: string): Promise<any[]> => {
      return this.request<any[]>(`/api/v1/exhibitors/${encodeURIComponent(id)}/products`);
    },
    enquireProduct: async (id: string): Promise<any> => {
      return this.request<any>(`/api/v1/exhibitors/products/${encodeURIComponent(id)}/enquiry`, {
        method: 'POST',
      });
    },
  };
}

export const api = new ApiClient();
