# Annadata OS - Phased Implementation Plan

> Each phase is designed to be completed in ONE focused session (2-4 hours)
> Total: 8 Phases across 2-3 days

---

## Quick Reference

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| **Phase 1** | FOCUSS Quick Wins (SDGs + Labels) | 1.5 hrs | P0 |
| **Phase 2** | Impact Dashboard Enhancement | 2 hrs | P0 |
| **Phase 3** | Digital Twin Fix | 2.5 hrs | P0 |
| **Phase 4** | Gamified App Setup | 2 hrs | P1 |
| **Phase 5** | Gamification Backend | 3 hrs | P1 |
| **Phase 6** | Gamified Frontend - Core | 3 hrs | P1 |
| **Phase 7** | Animations & Polish | 2.5 hrs | P2 |
| **Phase 8** | Integration & Demo Prep | 2 hrs | P2 |

---

# PHASE 1: FOCUSS Quick Wins
**Duration: 1.5 hours | Priority: P0 | FOCUSS Impact: U+, S+**

## Goal
Add missing SDG badges and data source labels to existing dashboards.

## Tasks

### 1.1 Add SDG 1 & 8 to Impact Dashboard (30 min)
**File:** `/frontend/app/dashboard/impact/page.tsx`

**Find the `SDG_GOALS` array (around line 160) and add:**
```typescript
{ 
  number: 1, 
  title: "No Poverty", 
  color: "#E5243B",
  description: "Financial inclusion through Kisan Credit Score",
  contribution: "Enables ₹50K-2L credit access per farmer, reducing poverty cycles"
},
{ 
  number: 8, 
  title: "Decent Work & Economic Growth", 
  color: "#A21942",
  description: "Market linkage via MSP Mitra",
  contribution: "15-25% income improvement through better price discovery"
},
```

### 1.2 Add SDG 1 & 8 to Sustainability Page (30 min)
**File:** `/frontend/app/dashboard/sustainability/page.tsx`

**Find the `SDG_GOALS` array and add same SDGs as above.**

### 1.3 Add "Projected Data" Labels (30 min)
**Files:** Both `impact/page.tsx` and `sustainability/page.tsx`

**Add a badge/banner at the top of data sections:**
```tsx
<Badge variant="outline" className="mb-4">
  📊 Projected Data - Based on market research and pilot studies
</Badge>
```

## Verification
- [ ] Impact Dashboard shows 6 SDGs (was 4)
- [ ] Sustainability page shows 7 SDGs (was 5)
- [ ] Both pages have data source labels
- [ ] No TypeScript errors
- [ ] Frontend builds successfully

## Context for Next Session
After this phase, the FOCUSS Usefulness and Sustainability scores should improve by ~1 point each.

---

# PHASE 2: Impact Dashboard Enhancement
**Duration: 2 hours | Priority: P0 | FOCUSS Impact: F++**

## Goal
Add B2G (Government) revenue section and enhance financial viability presentation.

## Tasks

### 2.1 Add B2G Revenue Section (1 hour)
**File:** `/frontend/app/dashboard/impact/page.tsx`

**Add new constant after existing revenue data:**
```typescript
const B2G_PRICING = [
  { 
    tier: "District Dashboard", 
    price: "₹50,000/year",
    target: "District Collectors",
    features: [
      "Real-time farmer registry",
      "Scheme enrollment tracking", 
      "Crop health heatmaps",
      "Weather alert distribution"
    ]
  },
  { 
    tier: "State Analytics", 
    price: "₹5,00,000/year",
    target: "State Agriculture Dept",
    features: [
      "Multi-district aggregation",
      "Policy impact metrics",
      "Subsidy optimization",
      "API access for integration"
    ]
  },
  { 
    tier: "National Platform", 
    price: "Custom Pricing",
    target: "Ministry of Agriculture",
    features: [
      "Pan-India coverage",
      "Real-time monitoring",
      "Ministry dashboard integration",
      "Custom reporting"
    ]
  }
];
```

**Add new section in JSX after existing revenue charts:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>B2G Revenue Model</CardTitle>
    <CardDescription>Government Partnership Opportunities</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {B2G_PRICING.map((tier) => (
        <Card key={tier.tier} className="border-2">
          <CardHeader>
            <Badge>{tier.target}</Badge>
            <CardTitle className="text-lg">{tier.tier}</CardTitle>
            <p className="text-2xl font-bold text-green-600">{tier.price}</p>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {tier.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  </CardContent>
</Card>
```

### 2.2 Add Revenue Breakdown Pie Chart (45 min)
**Same file - add visualization showing B2C vs B2B vs B2G split:**
```typescript
const REVENUE_BREAKDOWN = [
  { name: "B2C (Farmers)", value: 60, color: "#22c55e" },
  { name: "B2B (Agribusiness)", value: 25, color: "#3b82f6" },
  { name: "B2G (Government)", value: 15, color: "#f59e0b" }
];
```

### 2.3 Add Break-even Timeline (15 min)
**Add text section showing path to profitability:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Path to Profitability</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p><strong>Break-even Point:</strong> Month 18 (Year 2, Q2)</p>
      <p><strong>Gross Margin:</strong> 78% (SaaS industry standard)</p>
      <p><strong>Burn Rate:</strong> ₹15L/month (4-person team)</p>
      <p><strong>Runway:</strong> 24 months with seed funding of ₹3.6 Cr</p>
    </div>
  </CardContent>
</Card>
```

## Verification
- [ ] B2G section renders with 3 tier cards
- [ ] Revenue breakdown pie chart shows
- [ ] Break-even timeline is visible
- [ ] No layout issues on mobile
- [ ] Frontend builds successfully

## Context for Next Session
Financial Viability score should improve by ~2-3 points. The gamified app will demonstrate this freemium model live.

---

# PHASE 3: Digital Twin Fix
**Duration: 2.5 hours | Priority: P0 | FOCUSS Impact: O+, C++**

## Goal
Make Digital Twin dynamic with farmer selection and connect to real APIs.

## Tasks

### 3.1 Add Farmer Selector (45 min)
**File:** `/frontend/app/dashboard/digital-twin/page.tsx`

**Replace hardcoded farmer with selectable profiles:**
```typescript
const DEMO_FARMERS = [
  { id: "f1", name: "Raman Singh", village: "Kheri Kalan", district: "Karnal", state: "Haryana", land: 5.2 },
  { id: "f2", name: "Sunita Devi", village: "Pataudi", district: "Gurugram", state: "Haryana", land: 3.8 },
  { id: "f3", name: "Mukesh Yadav", village: "Tigaon", district: "Faridabad", state: "Haryana", land: 7.5 },
];

const [selectedFarmer, setSelectedFarmer] = useState(DEMO_FARMERS[0]);
```

**Add dropdown UI:**
```tsx
<Select value={selectedFarmer.id} onValueChange={(id) => setSelectedFarmer(DEMO_FARMERS.find(f => f.id === id)!)}>
  <SelectTrigger>
    <SelectValue placeholder="Select Farmer" />
  </SelectTrigger>
  <SelectContent>
    {DEMO_FARMERS.map((f) => (
      <SelectItem key={f.id} value={f.id}>{f.name} - {f.village}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3.2 Add "Demo Mode" Banner (15 min)
```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
  <p className="text-amber-800 text-sm">
    <strong>Demo Mode:</strong> Showing simulated data for demonstration. 
    In production, this would display real-time data from IoT sensors and service APIs.
  </p>
</div>
```

### 3.3 Wire to Real MSP Mitra API (45 min)
**Add API fetch for real market prices:**
```typescript
const [marketData, setMarketData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMarketData = async () => {
    try {
      const res = await fetch(`${API_PREFIXES.mspMitra}/prices/wheat`);
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      }
    } catch (error) {
      console.error("MSP API error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchMarketData();
}, []);
```

### 3.4 Wire to Mausam Chakra API (30 min)
**Add weather fetch:**
```typescript
const [weatherData, setWeatherData] = useState(null);

useEffect(() => {
  const fetchWeather = async () => {
    try {
      const res = await fetch(`${API_PREFIXES.mausamChakra}/weather/current?lat=29.0&lon=77.0`);
      if (res.ok) {
        setWeatherData(await res.json());
      }
    } catch (error) {
      console.error("Weather API error:", error);
    }
  };
  fetchWeather();
}, []);
```

### 3.5 Add Loading States (15 min)
**Add skeleton loaders for API data:**
```tsx
{loading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <div>{/* Actual data */}</div>
)}
```

## Verification
- [ ] Farmer dropdown works and switches profiles
- [ ] Demo mode banner is visible
- [ ] MSP Mitra API returns real prices (or graceful fallback)
- [ ] Weather API returns data (or graceful fallback)
- [ ] Loading states show while fetching
- [ ] No console errors
- [ ] Frontend builds successfully

## Context for Next Session
Digital Twin now shows dynamic content. Ready to start gamified app.

---

# PHASE 4: Gamified App Setup
**Duration: 2 hours | Priority: P1 | FOCUSS Impact: F+, C+**

## Goal
Bootstrap the new gamified frontend app with project structure.

## Tasks

### 4.1 Create Next.js App (30 min)
**Commands to run:**
```bash
cd /Users/ramanmendiratta/Documents/code/MajorProject/Annadata/Annadata
npx create-next-app@latest frontend-gamified --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

### 4.2 Copy Shared Dependencies (15 min)
**Update `frontend-gamified/package.json` to include:**
```json
{
  "dependencies": {
    "gsap": "^3.12.0",
    "lottie-react": "^2.4.0",
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "recharts": "^2.14.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

**Run:** `npm install`

### 4.3 Copy UI Components (30 min)
**Copy from existing frontend:**
```bash
cp -r frontend/components/ui frontend-gamified/components/
```

### 4.4 Set Up API Configuration (15 min)
**Create `frontend-gamified/lib/api.ts`:**
```typescript
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_PREFIXES = {
  mspMitra: `${API_BASE}/api/msp-mitra`,
  mausamChakra: `${API_BASE}/api/mausam-chakra`,
  fasalRakshak: `${API_BASE}/api/fasal-rakshak`,
  gamification: `${API_BASE}/api/gamification`,
};
```

### 4.5 Create Folder Structure (30 min)
**Create directories:**
```
frontend-gamified/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (game)/
│   │   ├── home/page.tsx
│   │   ├── services/page.tsx
│   │   ├── quests/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── gamification/
│   │   └── (empty for now)
│   └── ui/
│       └── (copied from main frontend)
├── lib/
│   ├── api.ts
│   ├── gamification.ts
│   └── store.ts
└── public/
    └── lottie/
        └── (empty for now)
```

## Verification
- [ ] `npm run dev` starts without errors
- [ ] Basic pages render
- [ ] UI components work
- [ ] Tailwind styling applies
- [ ] No TypeScript errors

## Context for Next Session
Skeleton app is ready. Next phase builds the gamification backend.

---

# PHASE 5: Gamification Backend
**Duration: 3 hours | Priority: P1 | FOCUSS Impact: F++**

## Goal
Create the gamification microservice with FastAPI.

## Tasks

### 5.1 Create Service Structure (20 min)
**Create directory:** `services/gamification/`
```
services/gamification/
├── app.py
├── models.py
├── schemas.py
├── requirements.txt
└── Dockerfile
```

### 5.2 Create requirements.txt (5 min)
```
fastapi>=0.100.0
uvicorn>=0.22.0
sqlalchemy>=2.0.0
asyncpg>=0.28.0
pydantic>=2.0.0
python-jose>=3.3.0
passlib>=1.7.4
```

### 5.3 Create Database Models (30 min)
**File:** `services/gamification/models.py`
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, JSON
from sqlalchemy.orm import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    user_id = Column(String, primary_key=True)
    current_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    total_xp_earned = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date)
    subscription_tier = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class XPEvent(Base):
    __tablename__ = "xp_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user_progress.user_id"))
    action_type = Column(String, nullable=False)
    xp_earned = Column(Integer, nullable=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserQuest(Base):
    __tablename__ = "user_quests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user_progress.user_id"))
    quest_type = Column(String, nullable=False)
    quest_id = Column(String, nullable=False)
    status = Column(String, default="pending")
    assigned_date = Column(Date, nullable=False)
    completed_at = Column(DateTime)
```

### 5.4 Create Pydantic Schemas (20 min)
**File:** `services/gamification/schemas.py`
```python
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

class UserProgressResponse(BaseModel):
    user_id: str
    current_xp: int
    current_level: int
    xp_to_next_level: int
    level_title: str
    level_badge: str
    current_streak: int
    subscription_tier: str

class EarnXPRequest(BaseModel):
    action: str
    metadata: Optional[dict] = None

class EarnXPResponse(BaseModel):
    xp_earned: int
    total_xp: int
    level_up: bool
    new_level: Optional[int] = None

class QuestResponse(BaseModel):
    id: str
    title: str
    description: str
    xp_reward: int
    status: str
    action_required: str
```

### 5.5 Create FastAPI App (1 hour)
**File:** `services/gamification/app.py`
```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from datetime import date, datetime
from typing import List
import os

from models import Base, UserProgress, XPEvent, UserQuest
from schemas import UserProgressResponse, EarnXPRequest, EarnXPResponse, QuestResponse

app = FastAPI(title="Gamification Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/annadata")
engine = create_async_engine(DATABASE_URL)
async_session = async_sessionmaker(engine, expire_on_commit=False)

# Level configuration
LEVELS = [
    {"level": 1, "xp": 0, "title": "Naya Kisan", "badge": "🌱"},
    {"level": 5, "xp": 500, "title": "Sikhta Kisan", "badge": "🌿"},
    {"level": 10, "xp": 1500, "title": "Samajhdar Kisan", "badge": "🌾"},
    {"level": 20, "xp": 5000, "title": "Anubhavi Kisan", "badge": "🏆"},
    {"level": 35, "xp": 15000, "title": "Krishi Guru", "badge": "👑"},
    {"level": 50, "xp": 30000, "title": "Annadata", "badge": "✨"},
]

XP_REWARDS = {
    "daily_checkin": 10,
    "weather_check": 5,
    "market_check": 10,
    "disease_scan": 25,
    "chat_query": 15,
    "quest_complete": 25,
}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "gamification"}

@app.get("/progress/{user_id}", response_model=UserProgressResponse)
async def get_progress(user_id: str):
    async with async_session() as session:
        result = await session.get(UserProgress, user_id)
        if not result:
            # Create new user progress
            result = UserProgress(user_id=user_id)
            session.add(result)
            await session.commit()
        
        level_info = get_level_info(result.current_xp)
        return UserProgressResponse(
            user_id=result.user_id,
            current_xp=result.current_xp,
            current_level=level_info["level"],
            xp_to_next_level=level_info["xp_to_next"],
            level_title=level_info["title"],
            level_badge=level_info["badge"],
            current_streak=result.current_streak,
            subscription_tier=result.subscription_tier
        )

@app.post("/xp/earn", response_model=EarnXPResponse)
async def earn_xp(user_id: str, request: EarnXPRequest):
    xp_amount = XP_REWARDS.get(request.action, 5)
    
    async with async_session() as session:
        progress = await session.get(UserProgress, user_id)
        if not progress:
            progress = UserProgress(user_id=user_id)
            session.add(progress)
        
        old_level = get_level_info(progress.current_xp)["level"]
        progress.current_xp += xp_amount
        progress.total_xp_earned += xp_amount
        new_level = get_level_info(progress.current_xp)["level"]
        
        # Log XP event
        event = XPEvent(user_id=user_id, action_type=request.action, xp_earned=xp_amount, metadata=request.metadata)
        session.add(event)
        
        await session.commit()
        
        return EarnXPResponse(
            xp_earned=xp_amount,
            total_xp=progress.current_xp,
            level_up=new_level > old_level,
            new_level=new_level if new_level > old_level else None
        )

@app.post("/checkin/{user_id}")
async def daily_checkin(user_id: str):
    async with async_session() as session:
        progress = await session.get(UserProgress, user_id)
        if not progress:
            progress = UserProgress(user_id=user_id)
            session.add(progress)
        
        today = date.today()
        if progress.last_active_date == today:
            return {"message": "Already checked in today", "xp_earned": 0}
        
        # Update streak
        if progress.last_active_date and (today - progress.last_active_date).days == 1:
            progress.current_streak += 1
        else:
            progress.current_streak = 1
        
        if progress.current_streak > progress.longest_streak:
            progress.longest_streak = progress.current_streak
        
        progress.last_active_date = today
        progress.current_xp += 10
        progress.total_xp_earned += 10
        
        await session.commit()
        
        return {"message": "Check-in successful!", "xp_earned": 10, "streak": progress.current_streak}

@app.get("/quests/daily/{user_id}", response_model=List[QuestResponse])
async def get_daily_quests(user_id: str):
    # Return 3 daily quests
    return [
        QuestResponse(id="q1", title="Weather Watcher", description="Check today's weather forecast", xp_reward=25, status="pending", action_required="weather_check"),
        QuestResponse(id="q2", title="Market Scout", description="Check MSP for any 2 crops", xp_reward=25, status="pending", action_required="market_check"),
        QuestResponse(id="q3", title="Crop Doctor", description="Scan one crop for diseases", xp_reward=25, status="pending", action_required="disease_scan"),
    ]

@app.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    async with async_session() as session:
        progress = await session.get(UserProgress, user_id)
        tier = progress.subscription_tier if progress else "free"
        
        return {
            "tier": tier,
            "free_services": ["msp_mitra", "mausam_chakra", "fasal_rakshak"],
            "premium_services": ["soilscan_ai", "jal_shakti", "harvest_shakti", "kisan_credit", "kisaan_sahayak"],
            "enterprise_services": ["digital_twin", "protein_engineering", "beej_suraksha", "harvest_to_cart"]
        }

def get_level_info(xp: int) -> dict:
    current = LEVELS[0]
    for level in LEVELS:
        if xp >= level["xp"]:
            current = level
    
    # Find next level
    next_level = None
    for level in LEVELS:
        if level["xp"] > xp:
            next_level = level
            break
    
    xp_to_next = next_level["xp"] - xp if next_level else 0
    
    return {
        "level": current["level"],
        "title": current["title"],
        "badge": current["badge"],
        "xp_to_next": xp_to_next
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012)
```

### 5.6 Create Dockerfile (10 min)
**File:** `services/gamification/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8012

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8012"]
```

### 5.7 Update docker-compose.yml (15 min)
**Add to existing docker-compose.yml:**
```yaml
  gamification:
    build: ./services/gamification
    ports:
      - "8012:8012"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/annadata
    depends_on:
      - postgres
    networks:
      - annadata-network
```

## Verification
- [ ] Service starts with `uvicorn app:app --reload`
- [ ] `/health` returns healthy status
- [ ] `/progress/{user_id}` creates and returns user
- [ ] `/xp/earn` awards XP correctly
- [ ] `/checkin/{user_id}` updates streak
- [ ] Docker build succeeds

## Context for Next Session
Backend is ready. Now build the frontend that consumes these APIs.

---

# PHASE 6: Gamified Frontend - Core
**Duration: 3 hours | Priority: P1 | FOCUSS Impact: C++, F+**

## Goal
Build the main gamified app pages (home, services).

## Tasks

### 6.1 Create Gamification Store (20 min)
**File:** `frontend-gamified/lib/store.ts`
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  userId: string | null;
  xp: number;
  level: number;
  levelTitle: string;
  levelBadge: string;
  streak: number;
  tier: "free" | "basic" | "premium" | "enterprise";
  setUser: (userId: string) => void;
  updateProgress: (data: any) => void;
  addXP: (amount: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      userId: null,
      xp: 0,
      level: 1,
      levelTitle: "Naya Kisan",
      levelBadge: "🌱",
      streak: 0,
      tier: "free",
      setUser: (userId) => set({ userId }),
      updateProgress: (data) => set({
        xp: data.current_xp,
        level: data.current_level,
        levelTitle: data.level_title,
        levelBadge: data.level_badge,
        streak: data.current_streak,
        tier: data.subscription_tier,
      }),
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
    }),
    { name: "krishi-quest-storage" }
  )
);
```

### 6.2 Create Home Page (1 hour)
**File:** `frontend-gamified/app/(game)/home/page.tsx`

Build dashboard showing:
- Level badge + title
- XP progress bar to next level
- Current streak (fire animation)
- Daily check-in button
- Quick action buttons (Weather, Market, Disease)
- Today's quests

### 6.3 Create Services Grid (45 min)
**File:** `frontend-gamified/app/(game)/services/page.tsx`

Build grid showing:
- Free services (MSP Mitra, Mausam Chakra, Fasal Rakshak) - accessible
- Premium services - locked with blur + lock icon
- Enterprise services - locked with blur + lock icon
- "Upgrade" button for locked services

### 6.4 Create Service Lock Component (30 min)
**File:** `frontend-gamified/components/gamification/ServiceLock.tsx`
```tsx
interface ServiceLockProps {
  serviceName: string;
  requiredTier: "premium" | "enterprise";
  children: React.ReactNode;
}

export function ServiceLock({ serviceName, requiredTier, children }: ServiceLockProps) {
  const { tier } = useGameStore();
  const isLocked = tier === "free" || (tier === "basic" && requiredTier === "enterprise");
  
  if (!isLocked) return <>{children}</>;
  
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
        <div className="text-center text-white">
          <Lock className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">{serviceName}</p>
          <p className="text-sm">Upgrade to {requiredTier}</p>
          <Button size="sm" className="mt-2">Unlock</Button>
        </div>
      </div>
    </div>
  );
}
```

### 6.5 Wire to Gamification API (25 min)
**Create API hooks in `frontend-gamified/lib/api.ts`:**
```typescript
export async function fetchProgress(userId: string) {
  const res = await fetch(`${API_PREFIXES.gamification}/progress/${userId}`);
  return res.json();
}

export async function earnXP(userId: string, action: string) {
  const res = await fetch(`${API_PREFIXES.gamification}/xp/earn?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  return res.json();
}

export async function dailyCheckin(userId: string) {
  const res = await fetch(`${API_PREFIXES.gamification}/checkin/${userId}`, {
    method: "POST",
  });
  return res.json();
}
```

## Verification
- [ ] Home page shows level, XP, streak
- [ ] Check-in button awards XP
- [ ] Services grid shows free/locked correctly
- [ ] Lock overlay appears on premium services
- [ ] API calls work correctly

## Context for Next Session
Core functionality works. Next phase adds the Duolingo-style animations.

---

# PHASE 7: Animations & Polish
**Duration: 2.5 hours | Priority: P2 | FOCUSS Impact: O+, C+**

## Goal
Add Duolingo-style animations for XP, level-up, and streaks.

## Tasks

### 7.1 Download Lottie Files (15 min)
**Download from LottieFiles.com:**
- `confetti.json` - for level up
- `coins.json` - for XP earned
- `fire.json` - for streak

**Save to:** `frontend-gamified/public/lottie/`

### 7.2 Create XP Burst Animation (45 min)
**File:** `frontend-gamified/components/gamification/XPBurst.tsx`
```tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface XPBurstProps {
  amount: number;
  onComplete?: () => void;
}

export function XPBurst({ amount, onComplete }: XPBurstProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 1, y: 0, scale: 0.5 },
        {
          opacity: 0,
          y: -50,
          scale: 1.5,
          duration: 1.5,
          ease: "power2.out",
          onComplete,
        }
      );
    }
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <span className="text-4xl font-bold text-yellow-500 drop-shadow-lg">
        +{amount} XP
      </span>
    </div>
  );
}
```

### 7.3 Create Level Up Modal (45 min)
**File:** `frontend-gamified/components/gamification/LevelUpModal.tsx`
```tsx
import Lottie from "lottie-react";
import confettiAnimation from "@/public/lottie/confetti.json";

interface LevelUpModalProps {
  level: number;
  title: string;
  badge: string;
  onClose: () => void;
}

export function LevelUpModal({ level, title, badge, onClose }: LevelUpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative">
        <Lottie
          animationData={confettiAnimation}
          loop={false}
          className="absolute inset-0 w-full h-full"
        />
        <div className="bg-white rounded-2xl p-8 text-center relative z-10">
          <p className="text-6xl mb-4">{badge}</p>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Level Up!</h2>
          <p className="text-xl mb-1">Level {level}</p>
          <p className="text-lg text-gray-600 mb-6">{title}</p>
          <Button onClick={onClose} className="w-full">Continue</Button>
        </div>
      </div>
    </div>
  );
}
```

### 7.4 Create Streak Fire Animation (30 min)
**File:** `frontend-gamified/components/gamification/StreakFire.tsx`
```tsx
import Lottie from "lottie-react";
import fireAnimation from "@/public/lottie/fire.json";

interface StreakFireProps {
  streak: number;
}

export function StreakFire({ streak }: StreakFireProps) {
  const size = Math.min(48 + streak * 2, 80); // Grows with streak

  return (
    <div className="flex items-center gap-2">
      <Lottie
        animationData={fireAnimation}
        loop
        style={{ width: size, height: size }}
      />
      <span className="text-2xl font-bold text-orange-500">{streak}</span>
    </div>
  );
}
```

### 7.5 Create Progress Ring (25 min)
**File:** `frontend-gamified/components/gamification/ProgressRing.tsx`
```tsx
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 120, strokeWidth = 10 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}
```

### 7.6 Integrate Animations (30 min)
**Update Home page to use animations:**
- Show XPBurst when XP is earned
- Show LevelUpModal when level increases
- Show StreakFire next to streak count
- Show ProgressRing for XP to next level

## Verification
- [ ] XP burst animates and fades out
- [ ] Level up modal shows with confetti
- [ ] Streak fire animates and grows with streak
- [ ] Progress ring fills correctly
- [ ] No animation glitches

## Context for Next Session
App is polished. Final phase integrates everything and preps for demo.

---

# PHASE 8: Integration & Demo Prep
**Duration: 2 hours | Priority: P2 | FOCUSS Impact: All**

## Goal
Final integration, testing, and demo preparation.

## Tasks

### 8.1 Integration Testing (45 min)
**Test complete flows:**
1. Register/Login flow
2. Daily check-in → XP earned → animation plays
3. Check weather → XP earned → quest progress
4. Check market prices → XP earned
5. Disease scan → XP earned
6. Level up → modal shows
7. Locked service → shows upgrade prompt

### 8.2 Update Docker Compose (15 min)
**Ensure all services start together:**
- All 11 original services
- New gamification service
- Frontend and frontend-gamified

### 8.3 Create Demo Script (30 min)
**File:** `.opencode/plans/DEMO_SCRIPT.md`

Write step-by-step demo flow:
1. Show main Annadata dashboard (FOCUSS context)
2. Switch to gamified app
3. Demonstrate daily check-in
4. Show XP earning
5. Demonstrate service lock/unlock
6. Show level progression
7. Return to Impact Dashboard for revenue model

### 8.4 Prepare FOCUSS Talking Points (20 min)
**Review and memorize key points for each parameter:**
- F: Freemium model demonstrated live
- O: Duolingo-style gamification is unique in agritech
- C: Hindi voice, low-barrier UX
- U: 140M farmers, 6 SDGs
- S: Water/carbon savings
- S: 11 microservices, 55 tests

### 8.5 Final Polish (10 min)
- Fix any remaining UI issues
- Ensure all loading states work
- Test on mobile viewport
- Clear console errors

## Verification
- [ ] Complete flow works end-to-end
- [ ] All animations play correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Demo script ready
- [ ] Talking points memorized

---

# Summary: Phase Dependencies

```
Phase 1 (SDGs) ──────┐
                     │
Phase 2 (Impact) ────┼──► FOCUSS Ready
                     │
Phase 3 (Digital Twin)┘

Phase 4 (App Setup) ─────► Phase 5 (Backend) ─────► Phase 6 (Frontend)
                                                           │
                                                           ▼
                                              Phase 7 (Animations)
                                                           │
                                                           ▼
                                              Phase 8 (Demo Prep)
```

## Minimum Viable for Demo

If time is tight, complete in this order:
1. **Phase 1** - Quick SDG wins (1.5 hrs)
2. **Phase 2** - B2G revenue (2 hrs)
3. **Phase 4** - App setup (2 hrs)
4. **Phase 5** - Backend (3 hrs)
5. **Phase 6** - Frontend core (3 hrs)

Total: ~11.5 hours for core gamified app + FOCUSS fixes

---

*Ready to start? Say "Start Phase 1" to begin implementation!*
