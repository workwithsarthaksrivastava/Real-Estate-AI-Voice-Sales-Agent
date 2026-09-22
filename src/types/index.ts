export interface Property {
  id: string;
  title: string;
  location: string;
  propertyType: 'Apartment' | 'Villa' | 'Plot' | 'Penthouse';
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  priceLakhs: number;
  priceDisplay: string;
  possessionDate: string;
  amenities: string[];
  description: string;
  imageUrl: string;
  ragKeywords: string[];
}

export interface BookedVisit {
  propertyId: string;
  propertyName: string;
  date: string;
  time: string;
}

export interface ScheduledCallback {
  preferredTime: string;
  notes: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  locationPreference: string;
  budgetLakhs: number;
  bedrooms: number;
  moveTimeline: string;
  qualificationStatus: 'Hot Lead' | 'Warm Lead' | 'Cold Lead';
  leadScore: number;
  bookedSiteVisit?: BookedVisit;
  scheduledCallback?: ScheduledCallback;
  createdAt: string;
  lastConversationSnippet?: string;
}

export interface LatencyStats {
  sttMs: number;
  llmMs: number;
  toolMs: number;
  ttsMs: number;
  totalMs: number;
}

export interface ToolCallExecuted {
  name: string;
  args: any;
  result: any;
}

export interface TranscriptMessage {
  id: string;
  sender: 'agent' | 'customer' | 'system';
  text: string;
  time: string;
  toolCall?: ToolCallExecuted;
  recommendedProperties?: Property[];
}

export interface CallLog {
  id: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  durationSeconds: number;
  qualificationResult: 'Qualified' | 'Follow Up Scheduled' | 'Site Visit Booked' | 'Unqualified';
  sentiment: 'Positive' | 'Neutral' | 'Hesitant';
  transcript: { sender: 'agent' | 'customer' | 'system'; text: string; time: string; toolCall?: any }[];
  latencyStats: {
    avgSttMs: number;
    avgLlmMs: number;
    avgTtsMs: number;
    totalMs: number;
  };
  functionCallsTriggered: string[];
}

export interface PersonaConfig {
  agentName: string;
  agencyName: string;
  personalityTone: string;
  voiceName: string;
  strictGuardrails: boolean;
  maxUtteranceLength: string;
  ragSensitivity: string;
}
