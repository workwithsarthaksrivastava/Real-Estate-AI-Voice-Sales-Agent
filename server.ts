import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Mock Database for Properties (RAG Store)
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

let propertiesDatabase: Property[] = [
  {
    id: 'prop-101',
    title: 'Green Valley Heights 2BHK Luxury Residency',
    location: 'Kolar Road',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1150,
    priceLakhs: 38,
    priceDisplay: '₹38 Lakhs',
    possessionDate: 'Ready to Move',
    amenities: ['Gated Security', 'Clubhouse', 'Children Play Area', '24x7 Water', 'Covered Parking'],
    description: 'Modern 2BHK apartment situated on Kolar Road with high quality fittings, spacious balconies, and close proximity to top schools.',
    imageUrl: '/src/assets/images/apartment_modern_bhk_1790109998552.jpg',
    ragKeywords: ['kolar road', '2bhk', '38 lakh', '40 lakh', 'budget', 'apartment', 'ready to move']
  },
  {
    id: 'prop-102',
    title: 'Royal Enclave 2BHK Premium Flat',
    location: 'Kolar Road',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1220,
    priceLakhs: 42,
    priceDisplay: '₹42 Lakhs',
    possessionDate: 'Dec 2026',
    amenities: ['Swimming Pool', 'Gym', 'Vastu Compliant', 'Power Backup', 'Landscaped Garden'],
    description: 'Vastu compliant 2BHK in prime Kolar Road corridor with swimming pool, indoor gym, and excellent road connectivity.',
    imageUrl: '/src/assets/images/gated_community_view_179010027374.jpg',
    ragKeywords: ['kolar road', '2bhk', '40 lakh', '42 lakh', 'swimming pool', 'gym', 'vastu']
  },
  {
    id: 'prop-103',
    title: 'Horizon Palm Villa 3BHK Independent House',
    location: 'Kolar Road',
    propertyType: 'Villa',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1850,
    priceLakhs: 68,
    priceDisplay: '₹68 Lakhs',
    possessionDate: 'Ready to Move',
    amenities: ['Private Garden', 'Duplex Layout', '2 Car Parking', 'Solar Water Heating', 'Modular Kitchen'],
    description: 'Exclusive 3BHK duplex villa with private terrace garden, modular kitchen, and serene green surroundings near Kolar Road main market.',
    imageUrl: '/src/assets/images/hero_luxury_villa_1790109978221.jpg',
    ragKeywords: ['kolar road', '3bhk', 'villa', 'independent house', '68 lakh', 'duplex', 'garden']
  },
  {
    id: 'prop-104',
    title: 'Elegance Towers 3BHK Super Luxury',
    location: 'Arera Colony',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2100,
    priceLakhs: 115,
    priceDisplay: '₹1.15 Crore',
    possessionDate: 'Ready to Move',
    amenities: ['Infinity Pool', 'Rooftop Lounge', 'Near Metro', 'Smart Home Automation', '24x7 Security'],
    description: 'Prime Arera Colony luxury address with panoramic city views, high speed elevators, smart home automation, and metro connectivity.',
    imageUrl: '/src/assets/images/apartment_modern_bhk_1790109998552.jpg',
    ragKeywords: ['arera colony', '3bhk', 'luxury', '1 crore', 'metro', 'smart home', 'pool']
  },
  {
    id: 'prop-105',
    title: 'Emerald Gardens 2BHK & 3BHK Gated Township',
    location: 'Hoshangabad Road',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1080,
    priceLakhs: 34,
    priceDisplay: '₹34 Lakhs',
    possessionDate: 'March 2027',
    amenities: ['Tennis Court', 'Community Hall', 'Jogging Track', 'Temple Inside Campus'],
    description: 'Affordable township living on Hoshangabad Road featuring lush parks, sports facilities, and direct highway access.',
    imageUrl: '/src/assets/images/gated_community_view_179010027374.jpg',
    ragKeywords: ['hoshangabad road', '2bhk', '34 lakh', 'affordable', 'township', 'parks']
  },
  {
    id: 'prop-106',
    title: 'Grand Pinnacle 4BHK Sky Villa',
    location: 'Bawadiya Kalan',
    propertyType: 'Penthouse',
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3400,
    priceLakhs: 180,
    priceDisplay: '₹1.80 Crore',
    possessionDate: 'Ready to Move',
    amenities: ['Private Jacuzzi', '270 Degree View', '4 Reserved Parking', 'Club Membership'],
    description: 'Ultra luxury penthouses in Bawadiya Kalan for elite living with high ceilings, Italian marble flooring, and private terrace.',
    imageUrl: '/src/assets/images/hero_luxury_villa_1790109978221.jpg',
    ragKeywords: ['bawadiya kalan', '4bhk', 'penthouse', 'sky villa', '1.8 crore', 'luxury']
  }
];

// Mock Qualified Leads CRM Store
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
  bookedSiteVisit?: {
    propertyId: string;
    propertyName: string;
    date: string;
    time: string;
  };
  scheduledCallback?: {
    preferredTime: string;
    notes: string;
  };
  createdAt: string;
  lastConversationSnippet?: string;
}

let leadsDatabase: Lead[] = [
  {
    id: 'lead-001',
    name: 'Vikram Sharma',
    phone: '+91 98260 12345',
    locationPreference: 'Kolar Road',
    budgetLakhs: 40,
    bedrooms: 2,
    moveTimeline: 'Within 2 Months',
    qualificationStatus: 'Hot Lead',
    leadScore: 94,
    bookedSiteVisit: {
      propertyId: 'prop-101',
      propertyName: 'Green Valley Heights 2BHK',
      date: '2026-09-26',
      time: '11:00 AM'
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastConversationSnippet: 'Confirmed site visit for 2BHK on Kolar Road, budget 40L max.'
  },
  {
    id: 'lead-002',
    name: 'Ananya Verma',
    phone: '+91 97555 88990',
    locationPreference: 'Arera Colony',
    budgetLakhs: 120,
    bedrooms: 3,
    moveTimeline: 'Next 6 Months',
    qualificationStatus: 'Warm Lead',
    leadScore: 78,
    scheduledCallback: {
      preferredTime: 'Tomorrow at 4:00 PM',
      notes: 'Wants detailed floor plan and loan assistance info.'
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastConversationSnippet: 'Inquired about 3BHK luxury options with metro connectivity near Arera Colony.'
  }
];

// Mock Call Logs Store
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

let callLogsDatabase: CallLog[] = [
  {
    id: 'call-901',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Vikram Sharma',
    customerPhone: '+91 98260 12345',
    durationSeconds: 145,
    qualificationResult: 'Site Visit Booked',
    sentiment: 'Positive',
    transcript: [
      { sender: 'agent', text: 'Hello! This is Aria from Horizon Realty. I noticed you were exploring homes in Bhopal. How can I help you today?', time: '13:40:02' },
      { sender: 'customer', text: 'I need a 2BHK on Kolar Road, budget 40 lakh.', time: '13:40:10' },
      { sender: 'system', text: '⚡ Tool Executed: search_properties(location: "Kolar Road", max_budget_lakhs: 40, bedrooms: 2)', time: '13:40:12', toolCall: { name: 'search_properties', args: { location: 'Kolar Road', max_budget_lakhs: 40, bedrooms: 2 } } },
      { sender: 'agent', text: 'We have 2 great options! Green Valley Heights is ready to move at 38 Lakhs, and Royal Enclave with a swimming pool is 42 Lakhs. Would you like to schedule a site visit?', time: '13:40:15' },
      { sender: 'customer', text: 'Yes, Green Valley Heights sounds good. Book a visit for Saturday 11 AM. My name is Vikram Sharma.', time: '13:40:28' },
      { sender: 'system', text: '⚡ Tool Executed: book_site_visit(customer_name: "Vikram Sharma", property_id: "prop-101", date: "2026-09-26", time: "11:00 AM")', time: '13:40:30', toolCall: { name: 'book_site_visit', args: { customer_name: 'Vikram Sharma', property_id: 'prop-101', date: '2026-09-26', time: '11:00 AM' } } },
      { sender: 'agent', text: 'Perfect! I have booked your site visit for Green Valley Heights on Saturday at 11:00 AM. Our field manager will meet you there. Have a wonderful day!', time: '13:40:34' }
    ],
    latencyStats: {
      avgSttMs: 120,
      avgLlmMs: 280,
      avgTtsMs: 150,
      totalMs: 550
    },
    functionCallsTriggered: ['search_properties', 'book_site_visit', 'save_lead_qualification']
  }
];

// System Persona Settings
let personaConfig = {
  agentName: 'Aria',
  agencyName: 'Horizon Realty',
  personalityTone: 'Polite, Professional, & Consultative Sales Agent',
  voiceName: 'Kore', // 'Kore', 'Zephyr', 'Puck'
  strictGuardrails: true,
  maxUtteranceLength: '1 to 3 concise, natural sentences suitable for phone audio',
  ragSensitivity: 'Strictly match verified property catalog; do not hallucinate prices'
};

// Tool Declarations for Gemini Function Calling
const searchPropertiesTool: FunctionDeclaration = {
  name: 'search_properties',
  description: 'Search property catalog for matching real estate listings based on location, budget, property type, and bedroom requirements.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: 'Location or neighborhood e.g. Kolar Road, Arera Colony, Hoshangabad Road' },
      max_budget_lakhs: { type: Type.NUMBER, description: 'Maximum budget in Indian Lakhs (e.g. 40 for 40 Lakhs, 100 for 1 Crore)' },
      property_type: { type: Type.STRING, description: 'Apartment, Villa, Plot, or Penthouse' },
      bedrooms: { type: Type.NUMBER, description: 'Number of bedrooms required (e.g. 2 for 2BHK, 3 for 3BHK)' }
    },
    required: ['location']
  }
};

const scheduleCallbackTool: FunctionDeclaration = {
  name: 'schedule_callback',
  description: 'Schedule a callback from a human real estate sales representative for the customer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customer_name: { type: Type.STRING, description: 'Full name of the customer' },
      customer_phone: { type: Type.STRING, description: 'Phone number or contact details' },
      preferred_time: { type: Type.STRING, description: 'Preferred callback date and time (e.g. Tomorrow at 4 PM)' },
      notes: { type: Type.STRING, description: 'Any specific questions or interest notes' }
    },
    required: ['customer_name', 'preferred_time']
  }
};

const bookSiteVisitTool: FunctionDeclaration = {
  name: 'book_site_visit',
  description: 'Book an in-person or virtual property site visit appointment for a customer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customer_name: { type: Type.STRING, description: 'Full name of the customer' },
      property_id: { type: Type.STRING, description: 'ID of the property (e.g. prop-101)' },
      property_name: { type: Type.STRING, description: 'Name of the property being visited' },
      date: { type: Type.STRING, description: 'Date for the visit (YYYY-MM-DD or readable string)' },
      time: { type: Type.STRING, description: 'Time of the visit e.g. 11:00 AM' }
    },
    required: ['customer_name', 'date', 'time']
  }
};

const saveLeadQualificationTool: FunctionDeclaration = {
  name: 'save_lead_qualification',
  description: 'Record or update lead qualification parameters into the CRM database.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customer_name: { type: Type.STRING, description: 'Customer full name' },
      customer_phone: { type: Type.STRING, description: 'Phone number' },
      location_preference: { type: Type.STRING, description: 'Preferred location' },
      budget_lakhs: { type: Type.NUMBER, description: 'Budget in Lakhs' },
      bedrooms: { type: Type.NUMBER, description: 'Desired bedrooms (BHK)' },
      move_timeline: { type: Type.STRING, description: 'Timeline to purchase/move' },
      lead_score: { type: Type.NUMBER, description: 'Qualification score 0-100' },
      qualification_status: { type: Type.STRING, description: 'Hot Lead, Warm Lead, or Cold Lead' }
    },
    required: ['customer_name', 'budget_lakhs', 'qualification_status']
  }
};

// Server RAG Property Search Helper
function searchRAGProperties(params: { location?: string; max_budget_lakhs?: number; property_type?: string; bedrooms?: number }): Property[] {
  let results = [...propertiesDatabase];
  
  if (params.location) {
    const locLower = params.location.toLowerCase();
    results = results.filter(p => 
      p.location.toLowerCase().includes(locLower) ||
      p.title.toLowerCase().includes(locLower) ||
      p.ragKeywords.some(k => locLower.includes(k) || k.includes(locLower))
    );
  }

  if (params.max_budget_lakhs) {
    // Allow a slight flexibility of up to +10% above budget
    const maxB = params.max_budget_lakhs * 1.1;
    results = results.filter(p => p.priceLakhs <= maxB);
  }

  if (params.bedrooms) {
    results = results.filter(p => p.bedrooms === params.bedrooms);
  }

  if (params.property_type) {
    const pType = params.property_type.toLowerCase();
    results = results.filter(p => p.propertyType.toLowerCase().includes(pType));
  }

  // Fallback: If strict location search yielded empty, return top location-agnostic matches within budget
  if (results.length === 0 && params.max_budget_lakhs) {
    results = propertiesDatabase.filter(p => p.priceLakhs <= params.max_budget_lakhs! * 1.15).slice(0, 3);
  } else if (results.length === 0) {
    results = propertiesDatabase.slice(0, 2);
  }

  return results;
}

// REST Endpoints
app.get('/api/properties', (req, res) => {
  res.json({ properties: propertiesDatabase });
});

app.post('/api/properties', (req, res) => {
  const newProp: Property = {
    id: `prop-${Date.now()}`,
    title: req.body.title || 'New Luxury Project',
    location: req.body.location || 'Kolar Road',
    propertyType: req.body.propertyType || 'Apartment',
    bedrooms: Number(req.body.bedrooms) || 2,
    bathrooms: Number(req.body.bathrooms) || 2,
    areaSqft: Number(req.body.areaSqft) || 1200,
    priceLakhs: Number(req.body.priceLakhs) || 45,
    priceDisplay: `₹${req.body.priceLakhs || 45} Lakhs`,
    possessionDate: req.body.possessionDate || 'Ready to Move',
    amenities: req.body.amenities || ['Gated Security', 'Car Parking'],
    description: req.body.description || 'Newly added property listing.',
    imageUrl: req.body.imageUrl || '/src/assets/images/apartment_modern_bhk_1790109998552.jpg',
    ragKeywords: [(req.body.location || '').toLowerCase(), `${req.body.bedrooms || 2}bhk`, `${req.body.priceLakhs || 45} lakh`]
  };
  propertiesDatabase.unshift(newProp);
  res.json({ success: true, property: newProp });
});

app.get('/api/leads', (req, res) => {
  res.json({ leads: leadsDatabase });
});

app.get('/api/call-logs', (req, res) => {
  res.json({ callLogs: callLogsDatabase });
});

app.get('/api/system-config', (req, res) => {
  res.json({ personaConfig });
});

app.post('/api/system-config', (req, res) => {
  personaConfig = { ...personaConfig, ...req.body };
  res.json({ success: true, personaConfig });
});

// Gemini Voice Agent Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, history = [], customPersona } = req.body;
    const currentPersona = customPersona || personaConfig;

    const systemInstruction = `
You are ${currentPersona.agentName}, an empathetic, polite, and persuasive AI Voice Sales Assistant representing ${currentPersona.agencyName}.
Your objective is to conduct a natural phone call conversation with prospective real estate buyers to qualify leads.

YOUR PERSONALITY & TONE:
- ${currentPersona.personalityTone}
- ${currentPersona.maxUtteranceLength}
- Speak warmly and naturally like a live phone agent. Do NOT use emojis, bullet points, or complex formatted markdown in spoken replies.

STRICT BUSINESS GUARDRAILS:
1. NEVER invent non-existent properties, fake prices, or false amenities.
2. ALWAYS use the tool 'search_properties' whenever the customer asks about available properties, locations, budgets, or configurations.
3. Use 'schedule_callback' when the customer asks for a callback or human sales rep.
4. Use 'book_site_visit' when the customer wants to visit or inspect a property.
5. Use 'save_lead_qualification' to record lead data once budget, location, or timing is mentioned.
6. Guardrail: If asked about properties you don't have in RAG search, politely say you will note down their requirement and schedule a callback with our senior project manager.
`;

    // Format conversation history for Gemini
    const contents: any[] = [];
    
    // Append history
    for (const msg of history) {
      if (msg.sender === 'user' || msg.sender === 'customer') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.sender === 'agent') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    // Append latest user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const llmStartTime = Date.now();
    let response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        tools: [{
          functionDeclarations: [
            searchPropertiesTool,
            scheduleCallbackTool,
            bookSiteVisitTool,
            saveLeadQualificationTool
          ]
        }]
      }
    });

    const llmEndTime = Date.now();
    let llmDurationMs = llmEndTime - llmStartTime;

    const triggeredFunctions: Array<{ name: string; args: any; result: any }> = [];
    let propertyResults: Property[] = [];
    let leadCreatedOrUpdated: Lead | null = null;

    // Handle Tool Calls Loop
    let functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      for (const fc of functionCalls) {
        const name = fc.name;
        const args: Record<string, any> = (fc.args as Record<string, any>) || {};
        let toolResult: any = { status: 'success' };

        if (name === 'search_properties') {
          const props = searchRAGProperties({
            location: String(args.location || ''),
            max_budget_lakhs: Number(args.max_budget_lakhs) || undefined,
            property_type: args.property_type ? String(args.property_type) : undefined,
            bedrooms: args.bedrooms ? Number(args.bedrooms) : undefined
          });
          propertyResults = props;
          toolResult = {
            found_count: props.length,
            properties: props.map(p => ({
              id: p.id,
              title: p.title,
              location: p.location,
              bedrooms: p.bedrooms,
              priceDisplay: p.priceDisplay,
              possessionDate: p.possessionDate,
              amenities: p.amenities
            }))
          };
        } else if (name === 'schedule_callback') {
          const newLead: Lead = {
            id: `lead-${Date.now()}`,
            name: String(args.customer_name || 'Valued Customer'),
            phone: String(args.customer_phone || 'Pending Contact'),
            locationPreference: 'Specified in Call',
            budgetLakhs: 0,
            bedrooms: 0,
            moveTimeline: 'Flexible',
            qualificationStatus: 'Warm Lead',
            leadScore: 70,
            scheduledCallback: {
              preferredTime: String(args.preferred_time || 'Next Business Day'),
              notes: String(args.notes || 'Requested callback via AI agent')
            },
            createdAt: new Date().toISOString(),
            lastConversationSnippet: `Scheduled callback for ${args.preferred_time || 'Next Business Day'}`
          };
          leadsDatabase.unshift(newLead);
          leadCreatedOrUpdated = newLead;
          toolResult = { callback_scheduled: true, confirmation_id: newLead.id };
        } else if (name === 'book_site_visit') {
          const matchedProp = propertiesDatabase.find(p => p.id === String(args.property_id)) || propertiesDatabase[0];
          const newLead: Lead = {
            id: `lead-${Date.now()}`,
            name: String(args.customer_name || 'Valued Customer'),
            phone: '+91 98930 11223',
            locationPreference: matchedProp.location,
            budgetLakhs: matchedProp.priceLakhs,
            bedrooms: matchedProp.bedrooms,
            moveTimeline: 'Immediate',
            qualificationStatus: 'Hot Lead',
            leadScore: 95,
            bookedSiteVisit: {
              propertyId: matchedProp.id,
              propertyName: matchedProp.title,
              date: String(args.date || '2026-09-27'),
              time: String(args.time || '11:00 AM')
            },
            createdAt: new Date().toISOString(),
            lastConversationSnippet: `Booked site visit for ${matchedProp.title} on ${args.date || '2026-09-27'} at ${args.time || '11:00 AM'}`
          };
          leadsDatabase.unshift(newLead);
          leadCreatedOrUpdated = newLead;
          toolResult = { visit_booked: true, property_title: matchedProp.title, date: args.date, time: args.time };
        } else if (name === 'save_lead_qualification') {
          const newLead: Lead = {
            id: `lead-${Date.now()}`,
            name: String(args.customer_name || 'Interested Buyer'),
            phone: String(args.customer_phone || 'Shared on Call'),
            locationPreference: String(args.location_preference || 'Unspecified'),
            budgetLakhs: Number(args.budget_lakhs) || 40,
            bedrooms: Number(args.bedrooms) || 2,
            moveTimeline: String(args.move_timeline || 'Within 3 Months'),
            qualificationStatus: (args.qualification_status as any) || 'Warm Lead',
            leadScore: Number(args.lead_score) || 80,
            createdAt: new Date().toISOString(),
            lastConversationSnippet: `Qualified lead with budget ${args.budget_lakhs || 40} Lakhs in ${args.location_preference || 'preferred location'}`
          };
          leadsDatabase.unshift(newLead);
          leadCreatedOrUpdated = newLead;
          toolResult = { lead_saved: true, lead_id: newLead.id };
        }

        triggeredFunctions.push({ name: String(name || ''), args, result: toolResult });
      }

      // Second turn call to Gemini passing tool results back to synthesize natural spoken response
      const followUpContents = [
        ...contents,
        response.candidates?.[0]?.content,
        {
          role: 'user',
          parts: triggeredFunctions.map(tf => ({
            functionResponse: {
              name: tf.name,
              response: tf.result
            }
          }))
        }
      ];

      const followUpResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: followUpContents as any,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      response = followUpResponse;
    }

    const agentReplyText = response.text || "I'd be glad to help you find the perfect property! Could you let me know your preferred location or budget?";
    
    const totalTimeMs = Date.now() - startTime;
    const sttSimulatedMs = 110 + Math.floor(Math.random() * 40);
    const ttsSimulatedMs = 130 + Math.floor(Math.random() * 50);

    res.json({
      replyText: agentReplyText,
      propertyResults,
      triggeredFunctions,
      leadCreatedOrUpdated,
      latencyStats: {
        sttMs: sttSimulatedMs,
        llmMs: llmDurationMs,
        toolMs: triggeredFunctions.length > 0 ? 35 : 0,
        ttsMs: ttsSimulatedMs,
        totalMs: totalTimeMs + sttSimulatedMs + ttsSimulatedMs
      }
    });

  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to process voice sales agent request',
      details: error.message || String(error)
    });
  }
});

// Gemini TTS Audio synthesis endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    
    // Call Gemini TTS model
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say naturally and politely: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' }
          }
        }
      }
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, mimeType: 'audio/mp3' });
    } else {
      return res.json({ audioBase64: null, message: 'Speech fallback to browser Web Speech API' });
    }
  } catch (error: any) {
    console.warn('Gemini TTS error fallback:', error.message);
    res.json({ audioBase64: null, fallback: true, error: error.message });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EstateVoice AI - Real Estate Voice Sales Agent</title>
    <meta name="description" content="Autonomous AI Voice Sales Agent for real estate lead qualification, multi-turn phone calls, RAG listing search, function calling, and CRM management." />
    <meta property="og:title" content="EstateVoice AI - Real Estate Voice Sales Agent" />
    <meta property="og:description" content="Autonomous AI Voice Sales Agent for real estate lead qualification, multi-turn phone calls, RAG listing search, function calling, and CRM management." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EstateVoice AI Sales Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
