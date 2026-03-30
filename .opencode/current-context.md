# Annadata OS - Current Implementation Context

> Last Updated: March 30, 2026
> Phase: 5 (Gamification Backend) Complete

---

## Project Overview

Annadata OS is an AI-powered agricultural platform with 12 microservices (including the new gamification service), providing Duolingo-style gamified farming education and tools.

---

## Phase 4: Gamified Frontend Components

The gamification frontend exists in the main `frontend/` directory (not a separate app).

### Frontend Files Created

| File | Purpose |
|------|---------|
| `frontend/lib/gamification.ts` | Level system, XP rewards, service tiers, quest definitions |
| `frontend/hooks/use-demo.ts` | Demo user hook for auto-generating user IDs |
| `frontend/store/game-store.ts` | Zustand store for game state (XP, level, streak, quests) |
| `frontend/components/gamification/XPBurst.tsx` | GSAP-animated XP earned effect |
| `frontend/components/gamification/LevelBadge.tsx` | Level badge with progress ring |
| `frontend/components/gamification/StreakFire.tsx` | Animated streak counter |
| `frontend/components/gamification/ProgressRing.tsx` | Circular progress indicator |
| `frontend/components/gamification/QuestCard.tsx` | Quest display with completion state |
| `frontend/components/gamification/ServiceCard.tsx` | Service card with lock overlay |
| `frontend/components/gamification/LevelUpModal.tsx` | Level up celebration modal |
| `frontend/components/gamification/index.ts` | Component exports |
| `frontend/app/game/layout.tsx` | Mobile-first layout with bottom nav |
| `frontend/app/game/page.tsx` | Landing/splash page |
| `frontend/app/game/home/page.tsx` | Main dashboard |
| `frontend/app/game/services/page.tsx` | Services grid with free/locked |
| `frontend/app/game/quests/page.tsx` | Daily/weekly quests page |
| `frontend/app/game/profile/page.tsx` | Farmer profile & achievements |

---

## Phase 5: Gamification Backend (Complete)

### Service Structure

```
services/gamification/
├── __init__.py           # Package marker
├── app.py                # FastAPI application (700+ lines)
├── requirements.txt      # Service dependencies
└── Dockerfile            # Container build
```

### Database Models Added

In `services/shared/db/models.py`:

| Model | Purpose |
|-------|---------|
| `UserProgress` | XP, level, streak tracking per user |
| `XPEvent` | Log of all XP-earning actions |
| `UserQuest` | Daily/weekly quest assignments and completion |
| `SubscriptionTier` (Enum) | FREE, PREMIUM, ENTERPRISE |
| `QuestStatus` (Enum) | PENDING, COMPLETED, EXPIRED |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /health` | - | Health check |
| `GET /` | - | API info |
| `GET /progress/{user_id}` | - | Get user progress (XP, level, streak) |
| `POST /xp/earn?user_id={id}` | `{action, metadata}` | Award XP for action |
| `GET /xp/history/{user_id}` | - | Get XP event history |
| `POST /checkin/{user_id}` | - | Daily check-in with streak |
| `GET /quests/daily/{user_id}` | - | Get today's daily quests |
| `POST /quests/{quest_id}/complete?user_id={id}` | - | Complete a quest |
| `GET /subscription/{user_id}` | - | Get subscription tier & services |
| `POST /subscription/upgrade?user_id={id}&new_tier={tier}` | - | Upgrade subscription |
| `GET /leaderboard` | - | Top users by XP |
| `GET /config/levels` | - | Level configuration |
| `GET /config/rewards` | - | XP rewards configuration |
| `GET /config/services` | - | Service access by tier |

### Level System

| Level Range | Title | Hindi | Badge | XP Required |
|-------------|-------|-------|-------|-------------|
| 1-4 | Naya Kisan | नया किसान | 🌱 | 0 |
| 5-9 | Sikhta Kisan | सीखता किसान | 🌿 | 500 |
| 10-19 | Samajhdar Kisan | समझदार किसान | 🌾 | 1,500 |
| 20-34 | Anubhavi Kisan | अनुभवी किसान | 🏆 | 5,000 |
| 35-49 | Krishi Guru | कृषि गुरु | 👑 | 15,000 |
| 50+ | Annadata | अन्नदाता | ✨ | 30,000 |

### XP Rewards

| Action | XP |
|--------|-----|
| `daily_checkin` | 10 |
| `weather_check` | 5 |
| `market_check` | 10 |
| `disease_scan` | 25 |
| `chat_query` | 15 |
| `quest_complete` | 25 |
| `streak_7_day` | 100 |
| `streak_30_day` | 500 |
| `premium_upgrade` | 1000 |

### Service Tiers

| Tier | Services |
|------|----------|
| **FREE** | msp_mitra, mausam_chakra, fasal_rakshak |
| **PREMIUM** | soilscan_ai, jal_shakti, harvest_shakti, kisan_credit, kisaan_sahayak |
| **ENTERPRISE** | digital_twin, protein_engineering, beej_suraksha, harvest_to_cart |

---

## Docker Configuration

The gamification service is configured in `docker-compose.yml`:

```yaml
gamification:
  build:
    context: .
    dockerfile: services/gamification/Dockerfile
  container_name: annadata-gamification
  ports:
    - "8012:8012"
  environment:
    - DATABASE_URL=postgresql+asyncpg://annadata:annadata_dev_password@postgres:5432/annadata
```

---

## Next Steps

### Phase 6: Wire Frontend to Backend

- Connect `frontend/store/game-store.ts` to gamification API
- Add API calls in `frontend/app/game/` pages
- Implement real-time XP updates

### Phase 7: Animations & Polish

- Add Lottie animations
- Implement level-up celebrations
- Polish mobile experience

### Phase 8: Integration & Demo Prep

- End-to-end testing
- Demo script preparation
- FOCUSS talking points

---

## Running the Service

```bash
# Development (standalone)
cd services/gamification
uvicorn app:app --reload --port 8012

# Docker
docker compose up gamification

# Test health
curl http://localhost:8012/health
```

---

*Document maintained for OpenCode context continuity*
