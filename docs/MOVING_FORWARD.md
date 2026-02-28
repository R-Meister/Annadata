# Annadata OS -- Moving Forward: Execution Roadmap

> Last updated: February 28, 2026
> Status: Planning complete, implementation not yet started

---

## Where We Are

### Completed (Pre-Implementation Sprint)
- [x] Deep codebase audit -- every service analyzed, real vs simulated documented
- [x] Fixed 4 failing SoilScan integration tests (aiosqlite swap)
- [x] Fixed ESLint configuration for Next.js 16
- [x] Verified: 55/55 Python tests passing
- [x] Verified: Frontend builds cleanly (all 16 routes)
- [x] Verified: Docker Compose config valid
- [x] Competitive analysis completed
- [x] FOCUSS scoring completed (current vs target)
- [x] Full PRD written with acceptance criteria

### Current FOCUSS Scores
| Criterion | Current | Target | Gap |
|-----------|---------|--------|-----|
| Financial Viability | 5/10 | 10/10 | -5 |
| Originality | 8/10 | 10/10 | -2 |
| Customer Applicability | 5/10 | 10/10 | -5 |
| Usefulness to Society | 7/10 | 10/10 | -3 |
| Sustainability | 5/10 | 10/10 | -5 |
| Structured Approach | 7/10 | 10/10 | -3 |
| **Total** | **37/60** | **60/60** | **-23** |

---

## Execution Plan

### Phase 1: Foundation Layer (Do First)

These are dependencies for everything else.

| # | Task | Owner | Effort | Dependencies | FOCUSS Impact |
|---|------|-------|--------|--------------|---------------|
| 1.1 | Wire OpenWeather API into Mausam Chakra | Backend | 3-4 hours | API key | O, C, S |
| 1.2 | Install react-leaflet + create reusable MapView component | Frontend | 1-2 hours | None | C, S |
| 1.3 | Set up Recharts base components (chart wrappers, theme) | Frontend | 1-2 hours | None | C, S |

**Why first**: Weather data feeds into charts, digital twin, and advisory. Map and chart components are used by every dashboard page.

---

### Phase 2: Dashboard Transformation (Highest Visual Impact)

| # | Task | Owner | Effort | Dependencies | FOCUSS Impact |
|---|------|-------|--------|--------------|---------------|
| 2.1 | MSP Mitra charts (price trends, volatility, market comparison) | Frontend | 3-4 hours | 1.3 | F, C |
| 2.2 | SoilScan AI charts (radar, health score, trends) | Frontend | 2-3 hours | 1.3 | C, U |
| 2.3 | Jal Shakti charts (water usage, moisture gauge, schedule) | Frontend | 2-3 hours | 1.3 | C, S |
| 2.4 | Kisan Credit charts (score gauge, breakdown, regional) | Frontend | 2-3 hours | 1.3 | F, C |
| 2.5 | Mausam Chakra charts (temp forecast, rainfall, humidity) | Frontend | 2-3 hours | 1.1, 1.3 | C, U |
| 2.6 | Dashboard overview dynamic stats + sparklines | Frontend | 2-3 hours | 1.3 | S (structured) |
| 2.7 | Map integration on MSP Mitra (mandi locations) | Frontend | 2-3 hours | 1.2 | C |
| 2.8 | Map integration on Fasal Rakshak (disease hotspots) | Frontend | 2-3 hours | 1.2 | C, U |
| 2.9 | Map integration on Harvest-to-Cart (delivery routes) | Frontend | 2-3 hours | 1.2 | F, C |

**Why second**: Charts and maps are the single biggest visual upgrade. Every judge will see them immediately.

---

### Phase 3: Intelligence Layer (Biggest Competitive Edge)

| # | Task | Owner | Effort | Dependencies | FOCUSS Impact |
|---|------|-------|--------|--------------|---------------|
| 3.1 | LLM integration in Kisaan Sahayak backend | Backend | 4-6 hours | LLM API key | O, C, U |
| 3.2 | Frontend chat UI update (streaming, better UX) | Frontend | 2-3 hours | 3.1 | C |
| 3.3 | Farmer Digital Twin page (unified view, all 11 services) | Frontend | 6-8 hours | 2.x charts | O, C, U |

**Why third**: LLM makes or breaks the Q&A portion of the demo. Digital Twin is our unique differentiator vs Team 4.

---

### Phase 4: Differentiation Features (Push Ahead)

| # | Task | Owner | Effort | Dependencies | FOCUSS Impact |
|---|------|-------|--------|--------------|---------------|
| 4.1 | Impact/Economics Dashboard | Frontend | 4-5 hours | None | F, U, S |
| 4.2 | Landing page animations (GSAP + Lottie) | Frontend | 3-4 hours | None | S (structured), C |
| 4.3 | Hindi/English toggle | Frontend + Backend | 3-4 hours | 3.1 (for LLM Hindi) | C, U |
| 4.4 | Carbon/Water Sustainability Tracker | Frontend | 3-4 hours | None | S |
| 4.5 | SMS/WhatsApp alert simulation | Frontend | 2-3 hours | None | C, O |

---

### Phase 5: Polish (If Time Permits)

| # | Task | Owner | Effort | Dependencies | FOCUSS Impact |
|---|------|-------|--------|--------------|---------------|
| 5.1 | PWA support (manifest + service worker) | Frontend | 2-3 hours | None | C |
| 5.2 | Voice input (Web Speech API) | Frontend | 2-3 hours | 3.1 | C, O |
| 5.3 | Data export (CSV/PDF) | Frontend | 2-3 hours | None | C |
| 5.4 | Interactive architecture diagram | Frontend | 2-3 hours | None | S (structured) |
| 5.5 | Service status monitoring page | Frontend | 1-2 hours | None | S (structured) |
| 5.6 | Government/District dashboard | Frontend | 4-5 hours | 2.x charts | F, U |

---

## Estimated Total Effort

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 1: Foundation | 3 | 5-8 hours |
| Phase 2: Dashboards | 9 | 20-27 hours |
| Phase 3: Intelligence | 3 | 12-17 hours |
| Phase 4: Differentiation | 5 | 15-20 hours |
| Phase 5: Polish | 6 | 13-19 hours |
| **Total** | **26** | **65-91 hours** |

---

## Execution Order (Recommended)

```
1.1 (Weather API)  ──┐
1.2 (Leaflet setup) ──┼── Phase 1 (parallel)
1.3 (Recharts setup) ─┘
          │
          ▼
2.1-2.9 (All charts + maps) ── Phase 2 (can parallelize across pages)
          │
          ▼
3.1 (LLM backend) ──► 3.2 (Chat UI) ──► 3.3 (Digital Twin) ── Phase 3
          │
          ▼
4.1-4.5 (Differentiation features) ── Phase 4 (can parallelize)
          │
          ▼
5.1-5.6 (Polish) ── Phase 5 (pick based on remaining time)
          │
          ▼
Final: Run all tests + build + verify
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenWeather API rate limiting (1000 calls/day) | Medium | Low | Redis caching (30-min TTL), fallback to simulated |
| Gemini Flash free tier rate limiting (15 RPM) | Medium | Medium | Request queuing, fallback to keyword matching |
| Ollama too slow on demo machine | Medium | Medium | Pre-warm model, or switch to Gemini Flash |
| Chart rendering performance with large datasets | Low | Medium | Data sampling, virtualization for large series |
| Breaking existing tests while adding features | Medium | High | Run test suite after every major change |
| LLM hallucination during demo Q&A | Medium | High | Strong system prompt, RAG grounding, knowledge base injection |

---

## Definition of Done (Per Feature)

- [ ] Feature works as described in PRD acceptance criteria
- [ ] No regressions -- all 55+ existing tests still pass
- [ ] Frontend builds without errors
- [ ] ESLint: 0 errors, 0 warnings
- [ ] Graceful fallback if external dependency is unavailable
- [ ] Responsive design (mobile-friendly)

---

## Demo Preparation (After Implementation)

1. Record walkthrough video following the narrative script (see `docs/DEMO_SCRIPT.md`)
2. Prepare answers for likely Q&A questions (see `docs/COMPETITIVE_ANALYSIS.md`)
3. Ensure all external APIs have valid keys configured
4. Test full Docker Compose startup with all services
5. Verify all charts render with real data
6. Test LLM with typical farmer questions in Hindi and English
