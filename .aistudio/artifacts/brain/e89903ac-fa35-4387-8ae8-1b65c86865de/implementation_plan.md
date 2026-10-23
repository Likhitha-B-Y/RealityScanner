# Reality Scanner — Implementation Plan & System Architecture

Reality Scanner is a mobile-first Progressive Web App (PWA) designed to reduce civic reporting from ~5 minutes of tedious form-filling to a 5-second camera point. Using multimodal vision AI, explainable severity scoring, multi-signal geospatial and perceptual deduplication, and automated multilingual complaint generation, it converts real-world civic problems into actionable, routed municipal tickets.

---

## (a) System Architecture

Reality Scanner is built as a full-stack application with clean separation between the mobile-first frontend client and the AI/civic engine backend, running seamlessly through standard npm scripts on Node.js / Express / Vite.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CITIZEN CLIENT (Frontend PWA)                         │
│                                                                                 │
│  ┌─────────────────────────┐  ┌───────────────────────┐  ┌───────────────────┐  │
│  │    Live Camera View     │  │  Severity Breakdown   │  │  Duplicate Match  │  │
│  │   HUD Reticle + EXIF    │  │  Gauge + SLA Counter  │  │  Map & Merge Tool │  │
│  └────────────┬────────────┘  └───────────┬───────────┘  └─────────┬─────────┘  │
│               │                           │                        │            │
│               ▼                           ▼                        ▼            │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │   State Engine: Offline IndexedDB Queue · Multilingual Toggle (EN/HI/KN)  │  │
│  │   Demo Mode Replay · Authority Dashboard · Public Live Map (Leaflet)     │  │
│  └──────────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────────┼───────────────────────────────────────┘
                                          │ HTTP / REST API (Client -> Backend)
┌─────────────────────────────────────────▼───────────────────────────────────────┐
│                         BACKEND SERVICE (Node.js / Express)                     │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                           Express API Gateway                             │  │
│  │   /api/scan · /api/reports · /api/duplicates · /api/resolve · /api/stats  │  │
│  └──────┬──────────────────────┬───────────────────────────────┬─────────────┘  │
│         │                      │                               │                │
│         ▼                      ▼                               ▼                │
│  ┌───────────────┐   ┌───────────────────┐           ┌──────────────────────┐   │
│  │ Stage D:      │   │ Stage A:          │           │ Stage B:             │   │
│  │ Evidence      │   │ Perception Engine │           │ Explainable Severity │   │
│  │ Integrity     │   │ Gemini Flash      │           │ Weighted Rubric      │   │
│  │ SHA-256 + EXIF│   │ Structured JSON   │           │ P1–P4 SLA Generator  │   │
│  └──────┬────────┘   └─────────┬─────────┘           └──────────┬───────────┘   │
│         │                      │                                │               │
│         └──────────────┬───────┴────────────────────────────────┘               │
│                        ▼                                                        │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Stage C: Multi-Signal Duplicate Detection Engine                          │  │
│  │ 1. Geospatial Haversine Filter (Radius: 25m Pothole, 50m Garbage, etc.)  │  │
│  │ 2. Visual Embedding / Perceptual Hash Distance                            │  │
│  │ 3. Semantic Similarity (Issue Type, Hazards, Context)                     │  │
│  │ 4. Bayesian Probability Fusion: >0.85 Auto-Merge | 0.6-0.85 User Confirm  │  │
│  └──────────────────────────────────────┬────────────────────────────────────┘  │
│                                         │                                       │
│         ┌───────────────────────────────┴───────────────┐                       │
│         ▼                                               ▼                       │
│  ┌───────────────────────────────┐            ┌─────────────────────────────┐   │
│  │ Stage E: Multilingual         │            │ Stage F & G: Smart Routing  │   │
│  │ Complaint Generator           │            │ Rules Engine + Municipal    │   │
│  │ Formal Letter + Portal + Post │            │ Adapter + Before/After Loop │   │
│  └──────────────┬────────────────┘            └──────────────┬──────────────┘   │
│                 │                                            │                  │
│                 ▼                                            ▼                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ SQLite Database & In-Memory Geospatial Spatial Index                      │  │
│  │ 150+ Seeded Real-World Neighborhood Reports (Bangalore/Indiranagar Ward) │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## (b) Database Schema (ERD & Table Specifications)

The database uses SQLite (persisted to disk with WAL mode enabled, easily swappable with PostgreSQL/PostGIS) with clean relational integrity, geospatial indexing, evidence verification records, and activity logs.

```sql
-- 1. REPORTS TABLE (Core civic issues)
CREATE TABLE reports (
  id TEXT PRIMARY KEY,                       -- e.g. "REP-2026-0841"
  issue_type TEXT NOT NULL,                  -- 'pothole', 'garbage_overflow', etc.
  title TEXT NOT NULL,                       -- Human-readable short title
  description TEXT NOT NULL,                 -- Detailed AI description
  status TEXT NOT NULL DEFAULT 'submitted',  -- 'submitted', 'triaged', 'in_progress', 'resolved', 'escalated'
  
  -- Geospatial & Device Telemetry
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  heading REAL,                             -- Compass heading (0-360)
  device_info TEXT,                         -- JSON: { userAgent, platform, screen }
  address TEXT NOT NULL,                    -- Reverse-geocoded street address
  landmark TEXT,                            -- Proximate landmark
  ward_id TEXT NOT NULL,                     -- e.g. "WARD-112"
  
  -- Severity & SLA
  severity_level TEXT NOT NULL,             -- 'P1', 'P2', 'P3', 'P4'
  severity_score REAL NOT NULL,             -- 0.0 to 5.0
  severity_breakdown TEXT NOT NULL,         -- JSON: { hazard_to_life, footfall_traffic, size_extent, weather_risk, duration_recurrence }
  sla_hours INTEGER NOT NULL,               -- e.g. 12 (P1), 24 (P2), 72 (P3), 168 (P4)
  sla_deadline TEXT NOT NULL,               -- ISO timestamp
  
  -- Department Routing
  department_id TEXT NOT NULL,              -- e.g. "BBMP_ROADS", "BESCOM_ELEC", "SWM_CLEAN"
  department_name TEXT NOT NULL,
  routed_endpoint TEXT NOT NULL,
  
  -- Evidence & Verification
  photo_url TEXT NOT NULL,
  photo_hash TEXT NOT NULL,                  -- SHA-256 hash of image data
  exif_data TEXT,                           -- JSON: { captureTime, gpsMatch, cameraMake }
  evidence_verified INTEGER NOT NULL DEFAULT 1,
  evidence_verification_flags TEXT,         -- JSON: ['exif_timestamp_matched', 'gps_consistent', 'no_screenshot_detected']
  
  -- Engagement & Duplication
  upvote_count INTEGER NOT NULL DEFAULT 1,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  parent_report_id TEXT,                    -- Set if merged into a parent ticket
  
  -- Resolution Verification (Stage G)
  resolution_photo_url TEXT,
  resolution_photo_hash TEXT,
  resolution_notes TEXT,
  resolution_verified_by_ai INTEGER DEFAULT 0,
  resolved_at TEXT,
  
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. REPORT_EVIDENCE_ATTACHMENTS TABLE (Multiple citizen contributions to same ticket)
CREATE TABLE report_evidence (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_hash TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  citizen_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. COMPLAINTS TABLE (Generated tri-format drafts)
CREATE TABLE complaints (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',       -- 'en', 'hi', 'kn'
  formal_letter TEXT NOT NULL,
  portal_fields TEXT NOT NULL,              -- JSON key-values for municipal portal
  social_post TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. ROUTING_RULES TABLE (Configurable municipal departments)
CREATE TABLE routing_rules (
  id TEXT PRIMARY KEY,
  issue_type TEXT NOT NULL,
  department_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  portal_endpoint TEXT NOT NULL,
  sla_p1_hours INTEGER NOT NULL,
  sla_p2_hours INTEGER NOT NULL,
  sla_p3_hours INTEGER NOT NULL,
  sla_p4_hours INTEGER NOT NULL
);

-- 5. AUDIT_LOGS TABLE (Immutable verification trail)
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  actor TEXT NOT NULL,                       -- 'citizen', 'gemini_vision_ai', 'authority_system'
  action TEXT NOT NULL,                      -- 'captured', 'classified', 'duplicate_merged', 'escalated', 'resolved'
  metadata TEXT,                             -- JSON payload
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## (c) Exact JSON Schema for the Vision Output (Stage A)

This is the strict JSON schema passed to `responseSchema` in `@google/genai` (using `Type.OBJECT` specifications) with a system instruction enforcing refusal to guess on blurry/dark/non-civic inputs:

```json
{
  "type": "OBJECT",
  "properties": {
    "is_civic_issue": {
      "type": "BOOLEAN",
      "description": "True if the photo depicts a genuine public/municipal civic issue (e.g. road, sanitation, lighting, infrastructure). False if selfie, document, indoor furniture, or non-civic scene."
    },
    "needs_better_photo": {
      "type": "BOOLEAN",
      "description": "True if image is too blurry, too dark, obstructed, or lacking sufficient visual clarity to inspect accurately."
    },
    "refusal_reason": {
      "type": "STRING",
      "description": "If is_civic_issue is false or needs_better_photo is true, concise actionable advice for the citizen (e.g. 'Photo is too dark; step closer and turn on flashlight'). Empty string if valid."
    },
    "issue_type": {
      "type": "STRING",
      "description": "Categorized civic problem. Must be one of: pothole, garbage_overflow, broken_streetlight, damaged_footpath, open_manhole, waterlogging, fallen_tree, damaged_public_facility, graffiti, other"
    },
    "primary_title": {
      "type": "STRING",
      "description": "Crisp 4-8 word title describing the issue (e.g. 'Deep Pothole with Exposed Gravel on Main Carriage Way')"
    },
    "detailed_description": {
      "type": "STRING",
      "description": "Objective, factual description of the defect, physical characteristics, and current state."
    },
    "estimated_dimensions": {
      "type": "STRING",
      "description": "Estimated physical size or scale inferred from environmental cues (e.g. 'approx. 65cm diameter, 10cm depth' or 'spilling across 4 meters of sidewalk')"
    },
    "confidence": {
      "type": "NUMBER",
      "description": "Classification confidence score between 0.00 and 1.00."
    },
    "visible_hazards": {
      "type": "ARRAY",
      "items": { "type": "STRING" },
      "description": "List of immediate surrounding danger signals (e.g. 'exposed high-voltage cable', 'near pedestrian crosswalk', 'adjacent to elementary school', 'hidden water depth')"
    },
    "severity_factors": {
      "type": "OBJECT",
      "properties": {
        "hazard_to_life": {
          "type": "NUMBER",
          "description": "Score 0 to 5 based on immediate bodily injury or fatality risk (e.g. 5 for open manhole on dark road, 4 for deep crater on fast road, 1 for surface graffiti)."
        },
        "affected_footfall_or_traffic": {
          "type": "NUMBER",
          "description": "Score 0 to 5 based on proximity to high-density zones (arterial roads, school gates, transit hubs, commercial markets)."
        },
        "size_or_extent": {
          "type": "NUMBER",
          "description": "Score 0 to 5 reflecting volume, area, or obstruction scale."
        },
        "weather_escalation_risk": {
          "type": "NUMBER",
          "description": "Score 0 to 5 for vulnerability to rain/monsoon flooding, electrocution, or vector breeding."
        }
      },
      "required": ["hazard_to_life", "affected_footfall_or_traffic", "size_or_extent", "weather_escalation_risk"]
    },
    "suggested_department": {
      "type": "STRING",
      "description": "Recommended municipal body (e.g. 'Road Infrastructure & Maintenance', 'Solid Waste Management', 'Electricity Supply & Distribution')"
    }
  },
  "required": [
    "is_civic_issue",
    "needs_better_photo",
    "refusal_reason",
    "issue_type",
    "primary_title",
    "detailed_description",
    "estimated_dimensions",
    "confidence",
    "visible_hazards",
    "severity_factors",
    "suggested_department"
  ]
}
```

---

## (d) Folder Structure (Backend & Frontend Split with Single npm Setup)

```
reality-scanner/
├── package.json                   # Top-level dependencies and orchestration scripts ("npm run dev", "npm run build")
├── tsconfig.json                  # Root TypeScript configuration
├── vite.config.ts                 # Vite bundler configuration with backend proxy and alias mapping
├── metadata.json                  # AI Studio permissions (camera, geolocation)
├── index.html                     # Mobile PWA HTML entry point with viewport and PWA meta tags
│
├── backend/                       # BACKEND SERVICE LAYER (Express + Node.js + Gemini API)
│   ├── server.ts                  # Main Express app, API router mounting & Vite middleware integration
│   ├── config.ts                  # Environment variables, department routing rules, thresholds
│   ├── db/
│   │   ├── database.ts            # SQLite client & schema initialization
│   │   ├── seedData.ts            # 150+ realistic geolocated neighborhood reports (Bangalore / Indiranagar)
│   │   └── seedRunner.ts          # One-command DB populator
│   ├── ai/
│   │   ├── geminiClient.ts        # @google/genai initialization with User-Agent telemetry
│   │   ├── perceptionStageA.ts    # Multimodal vision prompt, schema validation & retake handler
│   │   ├── severityStageB.ts      # Explainable weighted rubric formula & SLA calculator
│   │   ├── deduplicationStageC.ts # Geospatial Haversine + Perceptual & Semantic similarity fusion
│   │   ├── integrityStageD.ts     # SHA-256 hash, EXIF timestamp/GPS cross-verification & fraud detector
│   │   ├── complaintsStageE.ts    # Multilingual generation (English, Hindi, Kannada) for Letter/Form/Social
│   │   └── resolutionStageG.ts    # Before/after verification comparison engine
│   └── routes/
│       ├── scanRoutes.ts          # POST /api/scan, POST /api/verify-evidence
│       ├── reportRoutes.ts        # GET/POST /api/reports, POST /api/reports/:id/upvote, merge
│       ├── authorityRoutes.ts     # GET /api/authority/dashboard, POST /api/authority/resolve, CSV export
│       └── demoRoutes.ts          # 8 curated demo fixtures (pothole angles, blur, fraud screenshot)
│
├── frontend/                      # FRONTEND CLIENT LAYER (React 19 + Tailwind + Lucide + PWA)
│   ├── src/
│   │   ├── main.tsx               # Client entry point
│   │   ├── App.tsx                # App shell, tab router, offline banner & demo mode switcher
│   │   ├── index.css              # Tailwind styling, mobile safe-area insets & HUD animations
│   │   ├── types/
│   │   │   └── realityScanner.ts  # Shared TypeScript interfaces (Report, Severity, DuplicateMatch, etc.)
│   │   ├── components/
│   │   │   ├── scanner/
│   │   │   │   ├── CameraView.tsx           # getUserMedia live camera + HUD reticle + capture button
│   │   │   │   ├── ScanProgressOverlay.tsx  # Progressive 4-stage pipeline animation
│   │   │   │   └── DemoSelectorSheet.tsx    # 8 instant-tap test scenarios for live judges
│   │   │   ├── result/
│   │   │   │   ├── ResultCard.tsx           # Defect summary, confidence meter & retake alert
│   │   │   │   ├── SeverityBreakdown.tsx    # Explainable weighted sum gauge & SLA badge
│   │   │   │   ├── DuplicateMergeModal.tsx  # Geospatial match carousel + "Add Evidence" upvote button
│   │   │   │   └── EvidenceVerifiedBadge.tsx# SHA-256 hash, EXIF match audit pill
│   │   │   ├── complaint/
│   │   │   │   ├── ComplaintPreview.tsx     # Letter vs Portal Form vs Tweet tab views
│   │   │   │   └── MultilingualToggle.tsx   # English / Hindi / Kannada instant switcher
│   │   │   ├── tracker/
│   │   │   │   ├── TicketTracker.tsx        # Public ticket status, SLA timer, timeline & share button
│   │   │   │   └── BeforeAfterSlider.tsx    # Interactive resolution comparison slider
│   │   │   ├── map/
│   │   │   │   ├── PublicCityMap.tsx        # Leaflet interactive map with clusters & severity markers
│   │   │   │   └── MapFilters.tsx           # Category, status, and urgency filter controls
│   │   │   └── authority/
│   │   │       ├── AuthorityDashboard.tsx   # Municipal queue, SLA countdowns, bulk assign
│   │   │       └── ResolutionUploadModal.tsx# Authority resolution upload with AI photo verification
│   │   ├── services/
│   │   │   ├── api.ts                       # Fetch wrapper for all backend routes
│   │   │   └── offlineStore.ts              # IndexedDB queue for offline submission & sync
│   │   └── utils/
│   │       ├── exifExtractor.ts             # Client-side EXIF reader (GPS, timestamp, device)
│   │       ├── imageCompression.ts         # Client-side canvas compressor for fast 4G upload
│   │       └── privacyBlur.ts               # Client-side facial/license plate blurring filter
│   └── public/
│       ├── manifest.json                    # PWA web manifest
│       └── sw.js                            # Service Worker for offline asset caching
│
└── docs/
    ├── AI_PIPELINE.md                       # Comprehensive guide to Stages A through G
    └── EVALUATION.md                        # 50-image benchmark report & precision/recall metrics
```

---

## Vertical Slices & Execution Milestones

- **Slice 1 (The Core Perception & Camera Loop)**: Camera capture via `getUserMedia`, client-side canvas compression, EXIF extraction, SHA-256 integrity hash, Stage A Gemini multimodal vision with strict JSON schema and "uncertain/retake" refusal advice.
- **Slice 2 (Severity Engine & Deduplication Moat)**: Stage B explainable weighted sum rubric (P1–P4 SLA hours), Stage C multi-signal geospatial Haversine radius + visual/semantic similarity fusion, 150+ seeded realistic neighborhood reports.
- **Slice 3 (Multilingual Complaint Generator & Instant Submission)**: Stage E formal complaint letter + short portal form + social post (English, Hindi, Kannada), Stage F municipal department routing, public ticket tracker with live SLA countdown and shareable link.
- **Slice 4 (Authority Command Center & Resolution Closing-the-Loop)**: Municipal priority queue, SLA breach warnings, bulk assignment, CSV export, Stage G before/after photo comparison engine for AI-verified resolution.
- **Slice 5 (Demo Mode, Evaluation Benchmark & PWA Offline Sync)**: 8 curated demo fixtures (pothole angles, blur, fraud screenshot), 50-image benchmark script and evaluation report, IndexedDB offline sync queue.
