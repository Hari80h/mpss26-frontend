export type RoleType = 'delegate' | 'speaker' | 'vip' | 'guest' | 'exhibitor_staff' | 'organizer_staff';

export type DemoRole = 'delegate' | 'exhibitor' | 'organizer';

export interface EventMetadata {
  id: string; // 'MPSS26'
  name: string; // 'MP Semiconductor Summit 2026'
  dates: string; // '23–24 Oct 2026'
  city: string; // 'Indore / Bhopal'
  venue: string; // 'Brilliant Convention Centre'
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  totalRegistered: number; // 2438
  totalCheckedIn: number; // 1120
  totalExhibitors: number; // 51
  totalSpeakers: number; // 42
  totalScans: number; // 6212
  totalConnections: number; // 3281
}

export interface PrivacyConsent {
  shareEmail: boolean;
  sharePhone: boolean;
  shareLinkedIn: boolean;
  shareTwitter?: boolean;
  preset: 'Open' | 'Connections Only';
}

export interface Person {
  id: string;
  name: string;
  avatar?: string;
  designation: string;
  company: string;
  role: RoleType;
  bio: string;
  interests: string[];
  skills: string[];
  email: string;
  mobile: string;
  linkedin?: string;
  twitter?: string;
  relevanceScore?: number; // e.g., 94 for 94%
  boothNumber?: string;
  privacy: PrivacyConsent;
  checkedIn: boolean;
  checkInTime?: string;
  registrationId: string;
  ticketType: string;
}

export interface Connection {
  id: string;
  personId: string;
  personName: string;
  designation: string;
  company: string;
  avatar?: string;
  status: 'pending' | 'connected';
  type: 'sent' | 'received';
  source: 'direct' | 'qr_scan' | 'recommended';
  connectedAt: string;
}

export type LeadStatus = 'New' | 'Interested' | 'Follow-up';

export interface Lead {
  id: string;
  personId: string;
  name: string;
  avatar?: string;
  company: string;
  designation: string;
  email: string;
  mobile: string;
  linkedin: string;
  source: string; // e.g. 'Booth Scan (B-14)'
  status: LeadStatus;
  interests: string[];
  notes: string;
  capturedAt: string;
  boothId: string;
  productsViewed: string[];
  syncStatus?: 'synced' | 'pending';
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  company: string;
  category: string;
  booth: string;
  image: string;
  views: number;
  enquiries: number;
  interestedVisitorsCount: number;
  overview: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  resources: {
    brochureUrl?: string;
    videoUrl?: string;
    websiteUrl?: string;
  };
  isSaved?: boolean;
}

export interface ProductInteraction {
  id: string;
  productId: string;
  personId: string;
  type: 'view' | 'save' | 'enquiry';
  timestamp: string;
}

export type QuestionStatus = 'Submitted' | 'Selected' | 'Answered' | 'Archived';

export interface Question {
  id: string;
  sessionId: string;
  text: string;
  authorName: string;
  authorId: string;
  isAnonymous: boolean;
  status: QuestionStatus;
  upvotes: number;
  upvotedBy: string[]; // array of userIds
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  sessionId: string;
  question: string;
  options: PollOption[];
  status: 'open' | 'closed';
  totalVotes: number;
  voterIds: string[]; // for 1 vote per person verification
}

export interface Session {
  id: string;
  title: string;
  track: string;
  day: number; // 1, 2, or 3
  timeRange: string; // e.g. '9:30–10:30'
  room: string;
  speakerName: string;
  speakerDesignation: string;
  speakerCompany: string;
  speakerId: string;
  speakerIds?: string[];
  description: string;
  takeaways: string[];
  status: 'live' | 'upcoming' | 'completed';
  attendanceCount: number;
  isBookmarked?: boolean;
  questionsCount: number;
}

export interface ExhibitorStats {
  id: string;
  company: string;
  logo?: string;
  booth: string;
  category: string;
  visits: number;
  leads: number;
  enquiries: number;
  teamSize: number;
  status: 'Active' | 'Setup';
}

export interface InterestedVisitor {
  id: string;
  productId: string;
  personId: string;
  name: string;
  designation: string;
  company: string;
  email: string;
  mobile: string;
  linkedin: string;
  interactionType: 'view' | 'save' | 'enquiry';
  timestamp: string;
}

