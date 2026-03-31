# 🌾 Gamified Platform — Sustainable Farming Made Fun

> Part of the **Annadata** Ecosystem | Service #11

A gamified digital platform that educates and motivates farmers to adopt sustainable agricultural practices through interactive challenges, rewards, and community participation.

**Tagline**: *Khelein, Seekhein, Ugaayein* (खेलें, सीखें, उगाएं) — Play, Learn, Grow

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**  
- **Python** 3.12+ and **pip**  
- **PostgreSQL** 16+  
- **Redis** 7+  

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Copy env and configure
copy .env.example .env

# Start server
python main.py
# → API running at http://localhost:8011
# → Docs at http://localhost:8011/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → App running at http://localhost:3001
```

### Docker (Full Stack)
```bash
docker-compose up -d
# → Backend: http://localhost:8011
# → Frontend: http://localhost:3001
```

---

## 🏗️ Architecture

```
Gamified_Platform/
├── backend/                  # FastAPI + PostgreSQL
│   ├── main.py               # Entry point
│   ├── models/               # 7 SQLAlchemy ORM models
│   ├── schemas/               # Pydantic request/response
│   ├── routers/               # 6 API router modules
│   ├── services/              # Business logic engines
│   ├── tasks/                 # Background tasks (Celery)
│   ├── utils/                 # XP calculator, image verifier
│   ├── seed_data.py           # 10 initial quests
│   └── tests/                 # Unit tests
│
├── frontend/                  # Next.js 15 + React 19 + Tailwind v4
│   ├── app/                   # Pages (App Router)
│   │   ├── gamification/      # Dashboard, quests, leaderboard, etc.
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   ├── lib/api.ts             # Typed API client
│   ├── store/                 # Zustand state management
│   └── public/assets/         # SVGs, Lottie, sounds (placeholders)
│
├── docker-compose.yml         # Full stack orchestration
└── Idea.txt                   # Original problem statement
```

---

## 🎮 Core Features

| Feature | Description |
|---|---|
| **🎯 Mission System** | Sustainable farming practices as interactive quests |
| **🧭 Personalized Quests** | AI-tailored challenges based on crop, location, farm size |
| **📊 Progress Dashboard** | Sustainability score, XP timeline, streak counter |
| **🏆 Leaderboards** | Village → National rankings with podium display |
| **🎁 Incentive System** | Real-world rewards (soil vouchers, training credits, recognition) |
| **👥 Community Feed** | Activity feed, photo stories, shout-outs |

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4, Zustand, Lucide |
| **Backend** | FastAPI, SQLAlchemy 2, Pydantic 2, Alembic |
| **Database** | PostgreSQL 16, Redis 7 |
| **AI** | Google Gemini API (quest generation, daily tips) |
| **Infra** | Docker, Docker Compose |

---

## 📡 API Endpoints

25+ REST endpoints across 6 modules:

- **Profile**: Register, get, update, onboard
- **Quests**: List, recommended, accept, submit, active, history
- **Gamification**: Stats, badges, streaks, XP history
- **Leaderboard**: Scoped rankings, self-rank
- **Community**: Feed, stories, shout-outs
- **Rewards**: Catalog, redeem, history

Full API docs: `http://localhost:8011/docs`

---

## 🎨 Assets (Placeholders)

All asset placeholders are in `frontend/public/assets/gamification/`:
- **12** SVG illustrations
- **11** badge icon SVGs
- **10** Lottie animation JSONs
- **5** sound effect MP3s

See `ASSETS_README.md` for the full inventory and descriptions.

---

## 🔗 Annadata Integration

Connects with existing Annadata services via event bus:
- **Harvest Shakti** → Soil data for quest personalization
- **Jal Shakti** → Irrigation data for water quests
- **Fasal Rakshak** → Disease-free streaks → bonus badges
- **MSP Mitra** → Sell timing → bonus XP
- **SoilScan AI** → Auto-verify soil test quests
- **Kisaan Sahayak** → Advisory compliance → XP
