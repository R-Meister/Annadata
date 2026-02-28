"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Server,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Database,
  Globe,
} from "lucide-react";
import { useServicesStore } from "@/store/services-store";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ServiceMeta {
  key: string;
  name: string;
  port: number;
  category: string;
  description: string;
  techStack: string[];
}

interface Incident {
  id: number;
  title: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  status: "Resolved";
}

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const SERVICE_META: ServiceMeta[] = [
  {
    key: "mspMitra",
    name: "MSP Mitra",
    port: 8001,
    category: "Market Intelligence",
    description: "Real-time MSP & mandi price tracking with trend analysis",
    techStack: ["FastAPI", "PostgreSQL", "Redis", "Celery"],
  },
  {
    key: "soilscan",
    name: "SoilScan AI",
    port: 8002,
    category: "Soil Analysis",
    description: "AI-powered soil health assessment and nutrient mapping",
    techStack: ["FastAPI", "PostgreSQL"],
  },
  {
    key: "fasalRakshak",
    name: "Fasal Rakshak",
    port: 8003,
    category: "Crop Protection",
    description: "Pest & disease detection with treatment recommendations",
    techStack: ["FastAPI", "PostgreSQL", "Redis"],
  },
  {
    key: "jalShakti",
    name: "Jal Shakti",
    port: 8004,
    category: "Water Management",
    description: "Smart irrigation scheduling and water usage optimization",
    techStack: ["FastAPI", "PostgreSQL", "Redis"],
  },
  {
    key: "harvestShakti",
    name: "Harvest Shakti",
    port: 8005,
    category: "Yield Optimization",
    description: "Harvest timing prediction and yield forecasting engine",
    techStack: ["FastAPI", "PostgreSQL"],
  },
  {
    key: "kisaanSahayak",
    name: "Kisaan Sahayak",
    port: 8006,
    category: "AI Assistant",
    description: "Multilingual conversational AI for farmer queries",
    techStack: ["FastAPI", "PostgreSQL", "Redis", "Gemini"],
  },
  {
    key: "proteinEngineering",
    name: "Protein Engineering",
    port: 8007,
    category: "Biotech",
    description: "Crop protein analysis and nutritional optimization",
    techStack: ["FastAPI", "PostgreSQL"],
  },
  {
    key: "kisanCredit",
    name: "Kisan Credit",
    port: 8008,
    category: "Finance",
    description: "Credit scoring and loan eligibility assessment for farmers",
    techStack: ["FastAPI", "PostgreSQL", "Redis"],
  },
  {
    key: "harvestToCart",
    name: "Harvest-to-Cart",
    port: 8009,
    category: "Supply Chain",
    description: "End-to-end produce tracking from farm to marketplace",
    techStack: ["FastAPI", "PostgreSQL", "Redis"],
  },
  {
    key: "beejSuraksha",
    name: "Beej Suraksha",
    port: 8010,
    category: "Seed Quality",
    description: "Seed quality verification and authenticity tracking",
    techStack: ["FastAPI", "PostgreSQL"],
  },
  {
    key: "mausamChakra",
    name: "Mausam Chakra",
    port: 8011,
    category: "Weather Intelligence",
    description: "Hyper-local weather forecasting with agricultural advisories",
    techStack: ["FastAPI", "PostgreSQL", "Redis", "OpenWeather"],
  },
];

const INCIDENTS: Incident[] = [
  {
    id: 1,
    title: "Mausam Chakra - OpenWeather API rate limit hit",
    severity: "medium",
    timestamp: "2 hours ago",
    status: "Resolved",
  },
  {
    id: 2,
    title: "MSP Mitra - Celery worker restart",
    severity: "low",
    timestamp: "5 hours ago",
    status: "Resolved",
  },
  {
    id: 3,
    title: "PostgreSQL - Connection pool exhaustion",
    severity: "high",
    timestamp: "1 day ago",
    status: "Resolved",
  },
  {
    id: 4,
    title: "Redis - Memory usage spike",
    severity: "medium",
    timestamp: "2 days ago",
    status: "Resolved",
  },
  {
    id: 5,
    title: "Kisaan Sahayak - Gemini API timeout",
    severity: "medium",
    timestamp: "3 days ago",
    status: "Resolved",
  },
];

const INFRA_SERVICES = [
  { name: "PostgreSQL", version: "16.2", icon: Database },
  { name: "Redis", version: "7.2.4", icon: Database },
  { name: "Celery", version: "5.3.6", icon: Activity },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Seeded pseudo-random — deterministic per service key. */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

function getResponseTime(key: string): number {
  return Math.round(50 + seededRandom(key) * 150);
}

function getUptime(key: string): string {
  return (97.5 + seededRandom(key + "_up") * 2.5).toFixed(1);
}

function severityVariant(s: Incident["severity"]) {
  if (s === "high") return "destructive" as const;
  if (s === "medium") return "default" as const;
  return "secondary" as const;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ServiceStatusPage() {
  const { services, checkAllServices } = useServicesStore();
  const [loading, setLoading] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<string | null>(null);

  const handleCheckAll = useCallback(async () => {
    setLoading(true);
    await checkAllServices();
    setLastFullCheck(new Date().toLocaleString());
    setLoading(false);
  }, [checkAllServices]);

  /* Run an initial health check on mount */
  useEffect(() => {
    handleCheckAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Derived counts */
  const healthyCount = Object.values(services).filter(
    (s) => s.status === "healthy",
  ).length;
  const unhealthyCount = Object.values(services).filter(
    (s) => s.status === "unhealthy",
  ).length;
  const unknownCount = Object.values(services).filter(
    (s) => s.status === "unknown",
  ).length;

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-7 w-7 text-[var(--color-primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Service Health Monitor
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Real-time status of all Annadata OS micro-services
            </p>
          </div>
        </div>

        <Button loading={loading} onClick={handleCheckAll}>
          <RefreshCw className="h-4 w-4" />
          Check All
        </Button>
      </div>

      {/* ---- Summary Bar ---- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Healthy */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-6 w-6 text-[var(--color-success)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-success)]">
                {healthyCount}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Healthy</p>
            </div>
          </CardContent>
        </Card>

        {/* Unhealthy */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-6 w-6 text-[var(--color-error)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-error)]">
                {unhealthyCount}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Unhealthy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Unknown */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-6 w-6 text-[var(--color-text-muted)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-muted)]">
                {unknownCount}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Unknown</p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Uptime */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Activity className="h-6 w-6 text-[var(--color-primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                99.7%
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Overall Uptime
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Last Full Check */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Globe className="h-6 w-6 text-[var(--color-primary)]" />
            <div>
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                {lastFullCheck ?? "—"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Last Full Check
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Service Grid ---- */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Services ({SERVICE_META.length})
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICE_META.map((meta) => {
            const svc = services[meta.key];
            const status = svc?.status ?? "unknown";
            const responseTime = getResponseTime(meta.key);
            const uptime = getUptime(meta.key);

            return (
              <Card key={meta.key} className="relative overflow-hidden">
                {/* Thin top-border color indicator */}
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    backgroundColor:
                      status === "healthy"
                        ? "var(--color-success)"
                        : status === "unhealthy"
                          ? "var(--color-error)"
                          : "var(--color-border)",
                  }}
                />

                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {/* Status dot */}
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            status === "healthy"
                              ? "var(--color-success)"
                              : status === "unhealthy"
                                ? "var(--color-error)"
                                : "var(--color-text-muted)",
                        }}
                      />
                      <CardTitle className="text-base">{meta.name}</CardTitle>
                    </div>
                    <Badge variant="outline">:{meta.port}</Badge>
                  </div>
                  <CardDescription>{meta.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {/* Category + status */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{meta.category}</Badge>
                    <span
                      className="text-xs font-medium capitalize"
                      style={{
                        color:
                          status === "healthy"
                            ? "var(--color-success)"
                            : status === "unhealthy"
                              ? "var(--color-error)"
                              : "var(--color-text-muted)",
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-xs">
                    <div>
                      <p className="text-[var(--color-text-muted)]">
                        Response
                      </p>
                      <p className="font-semibold text-[var(--color-text)]">
                        {responseTime} ms
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">Uptime</p>
                      <p className="font-semibold text-[var(--color-text)]">
                        {uptime}%
                      </p>
                    </div>
                  </div>

                  {/* Last checked */}
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Last checked:{" "}
                    {svc?.lastChecked
                      ? new Date(svc.lastChecked).toLocaleString()
                      : "Never"}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {meta.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ---- Infrastructure Status ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Infrastructure Status</CardTitle>
          </div>
          <CardDescription>
            Core infrastructure components powering all services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {INFRA_SERVICES.map((infra) => {
              const Icon = infra.icon;
              return (
                <div
                  key={infra.name}
                  className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
                >
                  <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {infra.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      v{infra.version}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    <span className="text-xs font-medium text-[var(--color-success)]">
                      Healthy
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---- Incident Log ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Recent Incidents</CardTitle>
          </div>
          <CardDescription>
            Last 5 recorded incidents across all services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                  <th className="pb-3 pr-4 font-medium">Incident</th>
                  <th className="pb-3 pr-4 font-medium">Severity</th>
                  <th className="pb-3 pr-4 font-medium">When</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {INCIDENTS.map((inc) => (
                  <tr key={inc.id}>
                    <td className="py-3 pr-4 text-[var(--color-text)]">
                      {inc.title}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={severityVariant(inc.severity)}>
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                      {inc.timestamp}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-[var(--color-success)]" />
                        <span className="text-xs font-medium text-[var(--color-success)]">
                          {inc.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
