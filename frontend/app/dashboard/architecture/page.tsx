"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Server,
  Globe,
  Cpu,
  Cloud,
  ArrowRight,
  Layers,
  MessageCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Service {
  id: string;
  name: string;
  port: number;
  description: string;
  category: string;
  color: string;
  dependencies: string[];
  endpoints: number;
  dashboardPath: string;
}

const SERVICES: Service[] = [
  { id: "msp-mitra", name: "MSP Mitra", port: 8001, description: "Market Intelligence — real-time MSP tracking, price forecasting & mandi analytics", category: "Market", color: "bg-green-500/20 border-green-500/50 text-green-400", dependencies: ["PostgreSQL", "Redis", "Celery"], endpoints: 22, dashboardPath: "/dashboard/msp-mitra" },
  { id: "soilscan", name: "SoilScan AI", port: 8002, description: "Soil Analysis — NPK profiling, health scoring & fertiliser recommendations", category: "Soil", color: "bg-amber-500/20 border-amber-500/50 text-amber-400", dependencies: ["PostgreSQL"], endpoints: 18, dashboardPath: "/dashboard/soilscan" },
  { id: "fasal-rakshak", name: "Fasal Rakshak", port: 8003, description: "Crop Protection — pest/disease detection, treatment plans & alerts", category: "Protection", color: "bg-red-500/20 border-red-500/50 text-red-400", dependencies: ["PostgreSQL"], endpoints: 20, dashboardPath: "/dashboard/fasal-rakshak" },
  { id: "jal-shakti", name: "Jal Shakti", port: 8004, description: "Water Management — irrigation scheduling, moisture monitoring & water budgeting", category: "Water", color: "bg-blue-500/20 border-blue-500/50 text-blue-400", dependencies: ["PostgreSQL", "Redis"], endpoints: 16, dashboardPath: "/dashboard/jal-shakti" },
  { id: "harvest-shakti", name: "Harvest Shakti", port: 8005, description: "Smart Farming DSS — yield prediction, crop planning & decision support", category: "Farming", color: "bg-orange-500/20 border-orange-500/50 text-orange-400", dependencies: ["PostgreSQL"], endpoints: 19, dashboardPath: "/dashboard/harvest-shakti" },
  { id: "kisaan-sahayak", name: "Kisaan Sahayak", port: 8006, description: "AI Assistant — conversational farming advisor powered by Gemini LLM", category: "AI", color: "bg-purple-500/20 border-purple-500/50 text-purple-400", dependencies: ["PostgreSQL", "Redis", "Gemini API"], endpoints: 14, dashboardPath: "/dashboard/kisaan-sahayak" },
  { id: "protein-eng", name: "Protein Engineering", port: 8007, description: "Biotech — protein structure analysis, crop trait optimisation", category: "Biotech", color: "bg-teal-500/20 border-teal-500/50 text-teal-400", dependencies: ["PostgreSQL"], endpoints: 15, dashboardPath: "/dashboard/protein-engineering" },
  { id: "kisan-credit", name: "Kisan Credit", port: 8008, description: "Fintech — credit scoring, loan management & subsidy tracking", category: "Fintech", color: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400", dependencies: ["PostgreSQL"], endpoints: 21, dashboardPath: "/dashboard/kisan-credit" },
  { id: "harvest-to-cart", name: "Harvest-to-Cart", port: 8009, description: "Supply Chain — farm-to-market logistics, inventory & order tracking", category: "Supply", color: "bg-cyan-500/20 border-cyan-500/50 text-cyan-400", dependencies: ["PostgreSQL", "Redis"], endpoints: 24, dashboardPath: "/dashboard/harvest-to-cart" },
  { id: "beej-suraksha", name: "Beej Suraksha", port: 8010, description: "Seed Verification — authenticity checks, germination testing & QR traceability", category: "Seed", color: "bg-lime-500/20 border-lime-500/50 text-lime-400", dependencies: ["PostgreSQL"], endpoints: 17, dashboardPath: "/dashboard/beej-suraksha" },
  { id: "mausam-chakra", name: "Mausam Chakra", port: 8011, description: "Weather — hyper-local forecasts, climate risk scoring & seasonal advisories", category: "Weather", color: "bg-sky-500/20 border-sky-500/50 text-sky-400", dependencies: ["PostgreSQL", "OpenWeather API"], endpoints: 16, dashboardPath: "/dashboard/mausam-chakra" },
];

const INFRA = [
  { name: "PostgreSQL 15", port: 5432, icon: Database, note: "Shared by all 11 services" },
  { name: "Redis 7", port: 6379, icon: Layers, note: "MSP Mitra · Jal Shakti · Kisaan Sahayak · Harvest-to-Cart" },
  { name: "Celery Workers", port: null, icon: Cpu, note: "Background tasks for MSP Mitra" },
];

const EXTERNAL_APIS = [
  { name: "Gemini API", consumer: "Kisaan Sahayak", icon: MessageCircle },
  { name: "OpenWeather API", consumer: "Mausam Chakra", icon: Cloud },
];

const TECH_STACK = [
  "FastAPI", "SQLAlchemy 2.0", "PostgreSQL 15", "Redis 7",
  "Celery", "Next.js 16", "React 19", "TypeScript",
  "Tailwind v4", "Docker Compose",
];

const METRICS = [
  { label: "Microservices", value: "11" },
  { label: "API Endpoints", value: "200+" },
  { label: "Database Tables", value: "50+" },
  { label: "Docker Containers", value: "15" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ArchitecturePage() {
  const [selected, setSelected] = useState<Service | null>(null);

  return (
    <div className="space-y-8 p-6">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          System Architecture
        </h1>
        <p className="mt-1" style={{ color: "var(--color-text-muted)" }}>
          Interactive service dependency graph for the Annadata OS platform — 11 FastAPI
          microservices orchestrated via Docker Compose.
        </p>
      </div>

      {/* ---- Key Metrics ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{m.value}</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Architecture Diagram ---- */}
      <Card className="border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <CardHeader>
          <CardTitle style={{ color: "var(--color-text)" }}>Architecture Diagram</CardTitle>
          <CardDescription style={{ color: "var(--color-text-muted)" }}>
            Click any service to inspect its dependencies and details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-x-auto">
          {/* -- Frontend Layer -- */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-text-muted)" }}>
              Client Layer
            </label>
            <div
              className="rounded-lg border-2 border-dashed p-4 flex items-center gap-3 cursor-default"
              style={{ borderColor: "var(--color-primary)", background: "var(--color-primary)" + "10" }}
            >
              <Globe className="h-6 w-6 shrink-0" style={{ color: "var(--color-primary)" }} />
              <div>
                <p className="font-semibold" style={{ color: "var(--color-text)" }}>Next.js Frontend</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Port 3000 — connects to all 11 services via API proxy rewrites
                </p>
              </div>
              <Badge variant="outline" className="ml-auto shrink-0" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                :3000
              </Badge>
            </div>
          </div>

          {/* -- Arrow down -- */}
          <div className="flex justify-center">
            <svg width="24" height="32" viewBox="0 0 24 32">
              <line x1="12" y1="0" x2="12" y2="24" stroke="var(--color-primary)" strokeWidth="2" />
              <polygon points="6,24 18,24 12,32" fill="var(--color-primary)" />
            </svg>
          </div>

          {/* -- Services Layer -- */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-text-muted)" }}>
              Microservices Layer
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {SERVICES.map((svc) => {
                const isSelected = selected?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelected(isSelected ? null : svc)}
                    className={`rounded-lg border p-3 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 ${svc.color} ${isSelected ? "ring-2 ring-offset-1 shadow-lg scale-[1.03]" : ""}`}
                    style={{ ringColor: "var(--color-primary)" } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="font-semibold text-sm truncate">{svc.name}</span>
                    </div>
                    <p className="text-[11px] opacity-75 leading-tight">{svc.category}</p>
                    <Badge variant="outline" className="mt-2 text-[10px] px-1.5 py-0 border-current opacity-60">
                      :{svc.port}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* -- Arrow down -- */}
          <div className="flex justify-center">
            <svg width="24" height="32" viewBox="0 0 24 32">
              <line x1="12" y1="0" x2="12" y2="24" stroke="var(--color-primary)" strokeWidth="2" />
              <polygon points="6,24 18,24 12,32" fill="var(--color-primary)" />
            </svg>
          </div>

          {/* -- Infrastructure Layer -- */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-text-muted)" }}>
              Infrastructure Layer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INFRA.map((inf) => {
                const Icon = inf.icon;
                return (
                  <div
                    key={inf.name}
                    className="rounded-lg border p-4 flex items-start gap-3"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}
                  >
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                        {inf.name}
                        {inf.port && (
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                            :{inf.port}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{inf.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* -- External APIs -- */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-text-muted)" }}>
              External APIs
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXTERNAL_APIS.map((api) => {
                const Icon = api.icon;
                return (
                  <div
                    key={api.name}
                    className="rounded-lg border-2 border-dashed p-4 flex items-center gap-3"
                    style={{ borderColor: "var(--color-border)", background: "transparent" }}
                  >
                    <Icon className="h-5 w-5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{api.name}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Consumer: {api.consumer}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto shrink-0 opacity-40" style={{ color: "var(--color-text-muted)" }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* -- Data Flow Legend -- */}
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
              Data Flow Summary
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              {[
                "Frontend → All 11 services (API proxy)",
                "All services → PostgreSQL (storage)",
                "4 services → Redis (cache/queues)",
                "MSP Mitra → Celery → Redis (jobs)",
                "Kisaan Sahayak → Gemini API (LLM)",
                "Mausam Chakra → OpenWeather API",
              ].map((flow) => (
                <div key={flow} className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 shrink-0" style={{ color: "var(--color-primary)" }} />
                  <span style={{ color: "var(--color-text-muted)" }}>{flow}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Service Detail Panel ---- */}
      {selected && (
        <Card className="border animate-in fade-in slide-in-from-top-2 duration-200" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <Server className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                {selected.name}
                <Badge variant="outline" className="text-xs" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                  :{selected.port}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1" style={{ color: "var(--color-text-muted)" }}>
                {selected.description}
              </CardDescription>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-sm px-2 py-1 rounded border hover:opacity-80 transition-opacity shrink-0"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            >
              Close
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Dependencies */}
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Dependencies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Endpoints */}
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  API Endpoints
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {selected.endpoints}
                </p>
              </div>

              {/* Status */}
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="text-sm font-medium text-green-400">Healthy</span>
                </div>
              </div>

              {/* Dashboard Link */}
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Dashboard
                </p>
                <a
                  href={selected.dashboardPath}
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  Open Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Connection map for selected service */}
            <div className="mt-4 rounded-lg border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-background)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
                Connection Map
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge className="text-xs" style={{ background: "var(--color-primary)", color: "var(--color-background)" }}>
                  Frontend :3000
                </Badge>
                <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
                <Badge variant="outline" className={`text-xs ${selected.color}`}>
                  {selected.name} :{selected.port}
                </Badge>
                {selected.dependencies.map((dep) => (
                  <span key={dep} className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
                    <Badge variant="outline" className="text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                      {dep}
                    </Badge>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---- Tech Stack ---- */}
      <Card className="border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: "var(--color-text)" }}>
            <Layers className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
            Tech Stack
          </CardTitle>
          <CardDescription style={{ color: "var(--color-text-muted)" }}>
            Core technologies powering the Annadata OS platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-sm px-3 py-1"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
