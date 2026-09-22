# Real Estate AI Voice Sales Agent — Working Build

A working implementation of the STT → LLM → TTS lead-qualification voice
agent, with RAG over real property listings and function calling for
booking callbacks.

```
Customer speaks → STT (browser) → LLM + RAG + tools (backend) → TTS (browser) → Customer hears
```

## What's actually implemented here

| Piece | Real implementation used |
|---|---|
| LLM + persona + multi-turn memory | `backend/agent.py` — real Anthropic Claude API call, tool-use loop |
| RAG over property inventory | `backend/rag.py` — TF-IDF retrieval + metadata filters over `data/listings.json` |
| Function calling | `backend/tools.py` — `search_properties`, `schedule_callback` (writes to `data/callbacks.json`, standing in for a CRM) |
| Backend API | `backend/main.py` — FastAPI, one `/chat` endpoint, session per call |
| STT + TTS | `frontend/index.html` — browser's native Web Speech API (`SpeechRecognition` + `SpeechSynthesis`). Real voice in, real voice out, zero API keys, works in Chrome. |

This gets you an actually-working, speakable demo without needing a
Twilio/Deepgram/ElevenLabs account. Swapping in real telephony is a drop-in
replacement (see "Going to a real phone line" below) — the LLM/RAG/tools
layer doesn't change at all.

## How the pieces connect

1. **`frontend/index.html`** — you hold the mic button, browser's
   `SpeechRecognition` transcribes your speech to text client-side.
2. That text is POSTed to **`backend/main.py`**'s `/chat` endpoint.
3. **`backend/agent.py`** appends it to that session's conversation history
   and calls Claude with the `tools` schema attached.
4. If the customer asks about availability/price, Claude calls
   `search_properties` → **`backend/rag.py`** filters + ranks
   `data/listings.json` → real listings go back into the conversation →
   Claude answers using only that real data (guardrail: it's told never to
   invent price/availability).
5. Once name + phone + preferred time are known, Claude calls
   `schedule_callback` → written to `data/callbacks.json`.
6. The final reply text comes back to the browser, which speaks it via
   `SpeechSynthesis`.

## Setup

```bash
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...          # your key
uvicorn main:app --reload --port 8000
```

Then open `frontend/index.html` directly in Chrome (double-click it, or
serve it with any static server). Hold "🎙 Hold to talk", speak, release —
Riya replies out loud.

### Text-only test (no browser needed)

```bash
cd backend
python3 agent.py
```

Talk to it by typing — useful for quickly testing the RAG/tool logic
without touching audio at all.

## Try it with

- *"I need a 2BHK on Kolar Road, budget 40 lakh."* → triggers `search_properties`,
  should surface P001 and P003 from the sample data, not P002 (over budget).
- *"Do you have a 5BHK in Timbuktu?"* → no match → agent should say so
  honestly instead of making something up (this is the guardrail working).
- *"Book me a call, I'm Sarthak, number 9876543210, tomorrow 6pm"* →
  triggers `schedule_callback`, writes to `backend/data/callbacks.json`.

## Going to a real phone line (production path)

Only the STT/TTS edges change — the agent/RAG/tools core is reused as-is:

- Replace the browser mic with **Twilio Voice** (`<Gather input="speech">`
  on incoming calls, or Twilio Media Streams for lower latency).
- Or replace browser STT with **Deepgram/AssemblyAI** and browser TTS with
  **ElevenLabs/Azure Neural TTS** for more natural voices.
- Replace `data/listings.json` + TF-IDF with a real vector DB
  (pgvector/Pinecone/Weaviate) holding embeddings of your live listings feed.
- Replace `data/callbacks.json` with a real CRM API call (Salesforce/HubSpot)
  or a proper Postgres table + calendar booking.
- Replace the in-memory `SESSIONS` dict in `main.py` with Redis so sessions
  survive restarts and scale across multiple backend instances.

## Honest limitations (matches the brief's "disadvantages")

- **Latency**: STT → LLM → TTS is a real round trip; a full telephony
  setup (Twilio + Deepgram + ElevenLabs) typically adds 1–2s per turn.
  Streaming responses (not implemented here) is the usual fix.
- **STT accuracy**: browser `SpeechRecognition` struggles with heavy
  accents/background noise — a production system would want a dedicated
  STT vendor with domain-tuned models.
- **Scope**: this agent is deliberately narrow (qualify + book callback).
  It's instructed to hand off anything emotional/complex/legal to a human
  rather than improvise — by design, not as a bug to fix later.

## File tree

```
real_estate_voice_agent/
├── README.md
├── backend/
│   ├── main.py          FastAPI app, /chat endpoint
│   ├── agent.py          Claude conversation + tool-use loop, system prompt
│   ├── tools.py           Tool schemas + executors (search, schedule)
│   ├── rag.py              TF-IDF retrieval over listings
│   ├── requirements.txt
│   └── data/
│       ├── listings.json    Sample property inventory
│       └── callbacks.json   Created at runtime — booked callbacks
└── frontend/
    └── index.html       Voice UI (Web Speech API STT + TTS)
```
