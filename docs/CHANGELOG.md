# Annadata OS -- Changelog

> Session log of all changes made during the hackathon optimization sprint

---

## Sprint 1: Audit & Stabilization (February 28, 2026)

### Overview
Deep codebase audit, test stabilization, and comprehensive planning. No feature implementation yet -- this sprint was about understanding exactly what exists and creating a plan to win.

---

### Changes Made

#### 1. Fixed SoilScan AI Integration Tests
**File**: `tests/integration/test_soilscan_api.py`
**Problem**: 4 integration tests were failing because they tried to connect to a real PostgreSQL database during testing.
**Fix**: Rewrote the test file to use `dependency_overrides[get_db]` with an in-memory `aiosqlite` async session instead of trying to connect to PostgreSQL.
**Result**: All 8 SoilScan tests now pass. Total test suite: 55/55 passing.

#### 2. Fixed ESLint Configuration for Next.js 16
**Files**: 
- `frontend/eslint.config.mjs` (NEW FILE)
- `frontend/package.json` (MODIFIED)

**Problem**: Next.js 16 removed the `next lint` subcommand and `eslint-config-next` v16 exports a native ESLint flat config, but the project had no flat config file.
**Fix**: 
- Created `frontend/eslint.config.mjs` using `eslint-config-next`'s flat config export
- Changed the lint script in `package.json` from `next lint` to `eslint .`
- Added `@eslint/eslintrc` as a devDependency
**Result**: ESLint runs successfully with 0 errors and 0 warnings.

#### 3. Installed Test Dependencies
**Action**: Installed `aiosqlite`, `httpx`, and other test dependencies into the Python virtual environment.
**Note**: The venv has a stale interpreter path from a previous directory location. Use `./venv/bin/python3 -m pip` or `./venv/bin/python3 -m pytest` instead of activating the venv.

---

### Verification Results

| Check | Status | Command |
|-------|--------|---------|
| Python tests | 55/55 passing | `./venv/bin/python3 -m pytest tests/ -v` |
| Frontend build | Passing (16 routes) | `npm run build` (in frontend/) |
| ESLint | 0 errors, 0 warnings | `npm run lint` (in frontend/) |
| Docker Compose | Valid config | `docker compose config --quiet` |

---

### Documentation Created

| Document | Purpose |
|----------|---------|
| `docs/CURRENT_STATE.md` | Honest snapshot of what's real vs simulated |
| `docs/PRD.md` | Full Product Requirements Document for all planned features |
| `docs/MOVING_FORWARD.md` | Execution roadmap with phases, owners, and effort estimates |
| `docs/COMPETITIVE_ANALYSIS.md` | Analysis of all 4 competitor teams and strategy |
| `docs/FOCUSS_SCORECARD.md` | Current vs target scores with actions per criterion |
| `docs/DEMO_SCRIPT.md` | Video demo narrative, talking points, and Q&A preparation |
| `docs/ARCHITECTURE_OVERVIEW.md` | Technical architecture with diagrams and data flow |
| `docs/CHANGELOG.md` | This file |

---

### Key Discoveries

1. **Only 2 of 11 services are real**: MSP Mitra (1.1M records, Prophet ML) and Protein Engineering (real CSVs, trait mapping). The other 9 use simulated data.

2. **8 trained ML models exist but aren't wired in**: Models in `src/models/saved_models/` serve a standalone `src/api/app.py`, not the Docker microservices.

3. **Frontend has zero data visualizations**: Recharts is installed but unused. Every chart is a placeholder. No maps, no real-time, no animations.

4. **Kisaan Sahayak has zero LLM**: It's 100% keyword matching against a static FAQ. However, the knowledge base content is excellent (7 crops, 12 government schemes, crop calendars, pest management) and can serve as RAG context for a real LLM.

5. **OpenWeather API is configured but unused**: The env var `OPENWEATHER_API_KEY` exists in `.env.example` but no code ever reads it.

6. **GSAP and Lottie are installed but unused**: Package.json includes both, but neither is imported anywhere. Landing page is clean but completely static.

7. **Dashboard stats are hardcoded strings**: "12,450 Active Farmers" and "89% Yield Accuracy" are static text, not API-derived.

---

## Sprint 2: Implementation (Upcoming)

### Planned (Not Yet Started)

**Tier 1 (Must-Have)**:
- [ ] Wire OpenWeather API into Mausam Chakra
- [ ] Real Recharts on all dashboard pages
- [ ] Map integration with react-leaflet
- [ ] LLM integration for Kisaan Sahayak
- [ ] Farmer Digital Twin page

**Tier 2 (Differentiation)**:
- [ ] Impact/Economics Dashboard
- [ ] Landing page animations (GSAP + Lottie)
- [ ] Hindi/English toggle
- [ ] SMS/WhatsApp alert simulation
- [ ] Carbon/Water Sustainability Tracker

**Tier 3 (Polish)**:
- [ ] PWA support
- [ ] Interactive architecture diagram
- [ ] Voice input
- [ ] Data export
- [ ] Service status monitoring
- [ ] Government/District dashboard

See `docs/MOVING_FORWARD.md` for full execution plan.
