# Annadata OS -- Product Requirements Document (PRD)

> Last updated: March 1, 2026
> Context: Hackathon optimization -- FOCUSS rubric judging

---

## 1. Product Vision

Transform Annadata OS from a well-architected proof-of-concept into a **demo-ready, competition-winning** platform that convincingly demonstrates real AI-powered agriculture decision support for Indian smallholder farmers.

**Target outcome**: Score 10/10 on all 6 FOCUSS criteria. Beat all 4 competitor teams, especially Team 4 (AI-driven Digital Twin for Smart Farming).

---

## 2. Judging Rubric (FOCUSS)

| Criterion | Weight | What Judges Look For |
|-----------|--------|---------------------|
| **F** -- Financial Viability | Equal | Clear revenue model, unit economics, market size, monetization path |
| **O** -- Originality/Innovativeness | Equal | Novel approach, not a copy, unique technical angle |
| **C** -- Customer End Applicability | Equal | Real users can use it, solves actual problems, accessible |
| **U** -- Usefulness to Society | Equal | Addresses large cross-section, social impact, food security |
| **S** -- Sustainability | Equal | Long-term viability, environmental friendliness, scalability |
| **S** -- Structured Approach | Equal | Clean architecture, methodology, documentation, testing |

---

## 3. Feature Requirements

### 3.1 TIER 1: Must-Have (Critical for Winning)

These features close the gap with Team 4 and address the biggest weaknesses.

---

#### FR-1.1: Real Weather API Integration

**Priority**: P0 -- Blocker
**Service**: Mausam Chakra (Port 8011)
**Current State**: All weather data is seeded RNG. OpenWeather env var exists but is unused.

**Requirements**:
- [ ] Integrate OpenWeather API (free tier: 1000 calls/day)
- [ ] Replace RNG-generated current weather with real API data for `/weather/current/{village_code}`
- [ ] Replace RNG-generated forecasts with real API data for `/weather/forecast/{village_code}`
- [ ] Map village codes to lat/lon coordinates for API calls
- [ ] Graceful fallback to simulated data if API key is missing or rate-limited
- [ ] Cache responses in Redis (TTL: 30 min for current, 3 hours for forecast)
- [ ] Update `/advisory/agricultural` to use real weather data for advisory generation
- [ ] Add `OPENWEATHER_API_KEY` to `.env.example` with setup instructions

**Acceptance Criteria**:
- Weather data matches reality when API key is configured
- No breaking changes to existing endpoint contracts
- Fallback works gracefully without API key

---

#### FR-1.2: Real Data Visualizations (Recharts)

**Priority**: P0 -- Blocker
**Service**: Frontend (all dashboard pages)
**Current State**: Every chart slot is a placeholder div. Recharts is installed but unused.

**Requirements**:

**MSP Mitra Dashboard (`/dashboard/msp-mitra`)**:
- [ ] Line chart: Historical price trends (commodity prices over time)
- [ ] Area chart: Price volatility bands (Bollinger bands visualization)
- [ ] Bar chart: Market comparison across mandis
- [ ] Pie/donut chart: Top-performing commodities breakdown

**SoilScan AI Dashboard (`/dashboard/soilscan-ai`)**:
- [ ] Radar chart: Soil nutrient profile (N, P, K, pH, organic carbon)
- [ ] Bar chart: Soil health score breakdown by parameter
- [ ] Trend line: Historical soil health over time

**Jal Shakti Dashboard (`/dashboard/jal-shakti`)**:
- [ ] Line chart: Water usage over time (daily/weekly)
- [ ] Gauge/radial: Current soil moisture level
- [ ] Bar chart: Irrigation schedule (7-day view)

**Kisan Credit Dashboard (`/dashboard/kisan-credit`)**:
- [ ] Radial/gauge: Credit score visualization (0-900 scale)
- [ ] Bar chart: Score component breakdown (land, income, history, etc.)
- [ ] Comparison chart: Regional credit distribution

**Mausam Chakra Dashboard (`/dashboard/mausam-chakra`)**:
- [ ] Line chart: Temperature forecast (7-day)
- [ ] Bar chart: Rainfall prediction
- [ ] Area chart: Humidity trends
- [ ] Wind rose or directional chart

**Dashboard Overview (`/dashboard`)**:
- [ ] Replace hardcoded stats with API-fetched data (or realistic computed values)
- [ ] Mini sparkline charts for key metrics
- [ ] Replace static "Recent Activity" with dynamic feed

**Acceptance Criteria**:
- Every dashboard page has at least 2 interactive charts
- Charts render real data from backend API calls
- Responsive design (works on mobile widths)
- Smooth animations on chart load

---

#### FR-1.3: Map Integration (React-Leaflet)

**Priority**: P0 -- Blocker
**Service**: Frontend
**Current State**: No map library installed. No geospatial visualization anywhere.

**Requirements**:
- [ ] Install `react-leaflet` + `leaflet` + types
- [ ] Create reusable `<MapView>` component with OpenStreetMap tiles
- [ ] MSP Mitra: Mandi locations map with price markers
- [ ] Fasal Rakshak: Disease hotspot overlay map
- [ ] Harvest-to-Cart: Delivery route visualization with polylines
- [ ] Jal Shakti: Plot locations with irrigation status indicators
- [ ] Mausam Chakra: Weather station locations with current conditions
- [ ] Dashboard overview: India map with service activity indicators

**Acceptance Criteria**:
- Map renders on at least 3 dashboard pages
- Markers are interactive (click for details)
- Graceful loading states

---

#### FR-1.4: LLM Integration for Kisaan Sahayak

**Priority**: P0 -- Blocker
**Service**: Kisaan Sahayak (Port 8006)
**Current State**: 100% keyword matching against a static FAQ. Zero LLM capability. If a judge types a free-form question, it returns a generic fallback.

**Requirements**:
- [ ] Integrate an LLM API (Google Gemini Flash free tier recommended, or Ollama local)
- [ ] Use existing knowledge base (7 crops, 12 gov schemes, crop calendars, pest management) as RAG context
- [ ] System prompt: "You are Kisaan Sahayak, an AI farming assistant for Indian farmers..."
- [ ] Inject relevant knowledge base sections based on query topic detection
- [ ] Support Hindi queries (existing Hindi crop aliases already in knowledge base)
- [ ] Maintain conversation memory per session (existing `_session_store` structure)
- [ ] Graceful fallback to keyword matching if LLM API is unavailable
- [ ] Stream responses if possible (SSE from FastAPI to frontend)
- [ ] Update frontend chat interface to handle streaming responses
- [ ] Add `GOOGLE_API_KEY` or `OLLAMA_BASE_URL` to `.env.example`

**Acceptance Criteria**:
- Free-form questions get intelligent, contextual responses
- Hindi queries produce Hindi responses
- Knowledge base content is accurately referenced (not hallucinated)
- Response time < 5 seconds for typical queries
- Works without LLM API key (falls back to keyword matching)

---

#### FR-1.5: Farmer Digital Twin Page

**Priority**: P1 -- High
**Service**: Frontend (new page: `/dashboard/digital-twin`)
**Current State**: Does not exist. No unified farmer view.

**Requirements**:
- [ ] New dashboard page: `/dashboard/digital-twin`
- [ ] Unified farmer profile card (name, location, land holdings, crops)
- [ ] Aggregated data panels pulling from ALL 11 services:
  - Soil health summary (SoilScan AI)
  - Current crop status and disease risk (Fasal Rakshak)
  - Irrigation schedule and water usage (Jal Shakti)
  - Yield forecast and crop recommendations (Harvest Shakti)
  - Market prices for farmer's crops (MSP Mitra)
  - Credit score and loan eligibility (Kisan Credit)
  - Weather forecast for farmer's location (Mausam Chakra)
  - Seed verification status (Beej Suraksha)
  - Supply chain status (Harvest-to-Cart)
  - AI assistant chat widget (Kisaan Sahayak)
  - Protein engineering insights (Protein Engineering)
- [ ] Interactive timeline showing farming lifecycle events
- [ ] Risk score aggregation across all dimensions
- [ ] Action items / recommendations panel
- [ ] Export farmer report (stretch goal)

**Acceptance Criteria**:
- Single page shows holistic farmer view
- Data from at least 6 services is displayed
- Visual hierarchy makes it scannable in 30 seconds
- Works with simulated backend data

---

### 3.2 TIER 2: High-Impact Differentiation

These features push us ahead of competitors on specific FOCUSS criteria.

---

#### FR-2.1: Impact/Economics Dashboard

**Target FOCUSS criteria**: Financial Viability, Usefulness to Society

**Requirements**:
- [ ] New dashboard page or section: `/dashboard/impact`
- [ ] Revenue model visualization:
  - Freemium tier breakdown (free vs premium features)
  - Unit economics per farmer (CAC, LTV, revenue/farmer/month)
  - Market size (140M smallholder farmers in India, TAM/SAM/SOM)
- [ ] Impact metrics dashboard:
  - Farmers served counter
  - Estimated income improvement (% and INR)
  - Water saved (liters)
  - Crop loss prevented (tonnes)
  - Credit facilitated (INR)
- [ ] Animated counters for key numbers
- [ ] Data source citations

---

#### FR-2.2: Landing Page Animations

**Target FOCUSS criteria**: Structured Approach, Customer Applicability (first impressions)

**Requirements**:
- [ ] GSAP scroll-triggered animations for landing page sections
- [ ] Lottie animations for key feature illustrations (farming, AI, weather, etc.)
- [ ] Hero section with animated stat counters
- [ ] Smooth section transitions on scroll
- [ ] Performance: animations should not block page load

---

#### FR-2.3: Hindi/English Language Toggle

**Target FOCUSS criteria**: Customer Applicability, Usefulness to Society

**Requirements**:
- [ ] Language toggle in header (Hindi / English)
- [ ] Kisaan Sahayak: Full Hindi support (already has Hindi crop aliases)
- [ ] Key dashboard labels in both languages
- [ ] Landing page key sections translated
- [ ] Store language preference in localStorage

---

#### FR-2.4: SMS/WhatsApp Alert Simulation

**Target FOCUSS criteria**: Customer Applicability, Originality

**Requirements**:
- [ ] Alert configuration panel in dashboard
- [ ] Simulated SMS/WhatsApp preview (phone mockup UI)
- [ ] Alert types: price alerts, weather warnings, irrigation reminders, disease alerts
- [ ] Visual demonstration of how notifications would reach farmers
- [ ] "Send Test Alert" button with toast notification

---

#### FR-2.5: Carbon/Water Sustainability Tracker

**Target FOCUSS criteria**: Sustainability

**Requirements**:
- [ ] Sustainability dashboard section
- [ ] Carbon footprint estimation per crop/farming practice
- [ ] Water footprint calculation (actual vs optimal)
- [ ] Environmental impact score
- [ ] Comparison: traditional farming vs Annadata-optimized farming
- [ ] SDG alignment badges (UN Sustainable Development Goals)

---

### 3.3 TIER 3: Polish & Extras

Lower priority but each one adds a point somewhere on FOCUSS.

---

#### FR-3.1: PWA Support
- [ ] `manifest.json` with app metadata
- [ ] Service worker for offline caching
- [ ] "Add to Home Screen" prompt
- **FOCUSS target**: Customer Applicability (farmers with intermittent internet)

#### FR-3.2: Interactive Architecture Diagram
- [ ] Clickable service dependency graph on landing page or docs
- [ ] Shows data flow between services
- **FOCUSS target**: Structured Approach

#### FR-3.3: Voice Input
- [ ] Web Speech API integration in Kisaan Sahayak chat
- [ ] Hindi + English voice recognition
- **FOCUSS target**: Customer Applicability (low-literacy farmers)

#### FR-3.4: Data Export
- [ ] CSV export for price data, soil reports, credit scores
- [ ] PDF report generation for farmer profile
- **FOCUSS target**: Customer Applicability

#### FR-3.5: Service Status Monitoring
- [ ] `/dashboard/status` page with health check for all 11 services
- [ ] Green/red indicators, response times
- **FOCUSS target**: Structured Approach

#### FR-3.6: Government/District Dashboard
- [ ] Aggregated view for government officials / district collectors
- [ ] Regional statistics, intervention priorities
- **FOCUSS target**: Usefulness to Society, Financial Viability (B2G revenue)

---

## 4. Non-Functional Requirements

### Performance
- Frontend page load: < 3 seconds on 3G
- API response time: < 2 seconds for non-ML endpoints
- Chart render: < 500ms after data arrives

### Reliability
- All services must gracefully handle missing API keys
- Frontend must work with any subset of services running
- Fallback behavior documented for every external dependency

### Security
- No API keys committed to git (`.env` in `.gitignore`)
- JWT tokens expire after 24 hours
- CORS properly configured per service

### Testing
- Maintain 55+ passing tests
- Frontend builds without errors
- ESLint: 0 errors, 0 warnings

---

## 5. Technical Constraints

| Constraint | Detail |
|------------|--------|
| Budget | $0 -- only free-tier APIs |
| LLM options | Gemini Flash (free: 15 RPM), Ollama (local), or OpenAI (costs money) |
| Weather API | OpenWeather free tier: 1000 calls/day |
| Maps | OpenStreetMap via Leaflet (free, no API key) |
| Hosting | Local Docker only (no cloud deployment required for hackathon) |
| Model size | Ollama requires ~4GB RAM for Llama 3 8B |

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| FOCUSS: Financial Viability | 10/10 |
| FOCUSS: Originality | 10/10 |
| FOCUSS: Customer Applicability | 10/10 |
| FOCUSS: Usefulness to Society | 10/10 |
| FOCUSS: Sustainability | 10/10 |
| FOCUSS: Structured Approach | 10/10 |
| Python tests passing | 55+ |
| Frontend build | Clean |
| Services with real data/ML | 4+ (up from 2) |
| Dashboard pages with charts | 6+ (up from 0) |
| Dashboard pages with maps | 3+ (up from 0) |
