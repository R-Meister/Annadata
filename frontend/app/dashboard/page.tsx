"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServicesStore } from "@/store/services-store";
import { CHART_COLORS } from "@/components/dashboard/chart-theme";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/* ------------------------------------------------------------------
   Service catalogue - static data for the overview grid
   ------------------------------------------------------------------ */

const services = [
  {
    name: "MSP Mitra",
    href: "/dashboard/msp-mitra",
    description:
      "Price intelligence and MSP analysis for agricultural commodities across Indian markets.",
    borderColor: "border-l-green-600",
    key: "mspMitra",
  },
  {
    name: "SoilScan AI",
    href: "/dashboard/soilscan",
    description:
      "AI-powered soil health analysis with nutrient mapping and fertilizer recommendations.",
    borderColor: "border-l-amber-500",
    key: "soilscan",
  },
  {
    name: "Fasal Rakshak",
    href: "/dashboard/fasal-rakshak",
    description:
      "Crop disease detection, pest management, and integrated remedy recommendations.",
    borderColor: "border-l-red-500",
    key: "fasalRakshak",
  },
  {
    name: "Jal Shakti",
    href: "/dashboard/jal-shakti",
    description:
      "Smart irrigation scheduling and water-use analytics powered by IoT sensor data.",
    borderColor: "border-l-sky-500",
    key: "jalShakti",
  },
  {
    name: "Harvest Shakti",
    href: "/dashboard/harvest-shakti",
    description:
      "Harvest decision support with yield estimation, crop recommendation, and AI chatbot.",
    borderColor: "border-l-purple-500",
    key: "harvestShakti",
  },
  {
    name: "Kisaan Sahayak",
    href: "/dashboard/kisaan-sahayak",
    description:
      "Multi-agent AI assistant with vision, verifier, weather, market, and memory agents.",
    borderColor: "border-l-orange-500",
    key: "kisaanSahayak",
  },
  {
    name: "Protein Engineering",
    href: "/dashboard/protein-engineering",
    description:
      "AI-powered crop protein engineering with climate profiling and trait analysis.",
    borderColor: "border-l-teal-500",
    key: "proteinEngineering",
  },
  {
    name: "Kisan Credit Score",
    href: "/dashboard/kisan-credit",
    description:
      "Farmer credit scoring based on yields, land productivity, weather risk, and market diversification.",
    borderColor: "border-l-indigo-500",
    key: "kisanCredit",
  },
  {
    name: "Harvest-to-Cart",
    href: "/dashboard/harvest-to-cart",
    description:
      "Cold chain optimization, demand prediction, and farmer-retailer logistics.",
    borderColor: "border-l-cyan-500",
    key: "harvestToCart",
  },
  {
    name: "Beej Suraksha",
    href: "/dashboard/beej-suraksha",
    description:
      "QR-based seed tracking, AI seed authenticity verification, and community reporting.",
    borderColor: "border-l-lime-500",
    key: "beejSuraksha",
  },
  {
    name: "Mausam Chakra",
    href: "/dashboard/mausam-chakra",
    description:
      "Hyper-local hour-by-hour weather forecasts with IoT station data fusion and crop advisories.",
    borderColor: "border-l-sky-400",
    key: "mausamChakra",
  },
] as const;

const recentActivity = [
  "MSP Mitra model retrained on latest Agmarknet data",
  "SoilScan AI processed 12 new satellite tiles for Maharashtra",
  "Fasal Rakshak detected early blight in Nashik district",
  "Jal Shakti sensors calibrated for Rabi season",
  "Harvest Shakti yield model updated for wheat",
  "Kisan Credit scored 150 farmers in Punjab cooperative",
  "Harvest-to-Cart optimized 8 cold chain routes in UP",
  "Beej Suraksha flagged counterfeit seed batch in MP",
  "Mausam Chakra issued hailstorm alert for Nashik",
  "Protein Engineering completed trait analysis for drought resistance",
] as const;

/* ------------------------------------------------------------------
   Dashboard Page
   ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { services: statusMap, checkAllServices } = useServicesStore();

  useEffect(() => {
    void checkAllServices();
  }, [checkAllServices]);

  /* ---- Derived counts for the donut chart ---- */
  const healthCounts = useMemo(() => {
    let healthy = 0;
    let unhealthy = 0;
    let unknown = 0;

    for (const key of Object.keys(statusMap)) {
      const status = statusMap[key]?.status;
      if (status === "healthy") healthy++;
      else if (status === "unhealthy") unhealthy++;
      else unknown++;
    }

    return { healthy, unhealthy, unknown, total: healthy + unhealthy + unknown };
  }, [statusMap]);

  const pieData = useMemo(
    () => [
      { name: "Healthy", value: healthCounts.healthy, color: CHART_COLORS.success },
      { name: "Unhealthy", value: healthCounts.unhealthy, color: CHART_COLORS.error },
      { name: "Unknown", value: healthCounts.unknown, color: "#9ca3af" },
    ],
    [healthCounts],
  );

  /* ---- Dynamic quick stats ---- */
  const quickStats = useMemo(
    () => [
      {
        label: "Active Services",
        value: `${healthCounts.healthy}`,
        accent: "border-l-green-500",
      },
      {
        label: "Data Records",
        value: "1.1M+",
        accent: "border-l-sky-500",
      },
      {
        label: "ML Models",
        value: "15+",
        accent: "border-l-amber-500",
      },
      {
        label: "Quantum Strategies",
        value: "3",
        accent: "border-l-purple-500",
      },
    ],
    [healthCounts.healthy],
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Platform overview and service status
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.accent}`}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wide">
                {stat.label}
              </CardDescription>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {stat.value}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Service Health Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>
            Real-time health status across all platform services
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-8">
          <div className="relative h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  strokeWidth={2}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[var(--color-text)]">
                {healthCounts.healthy}/{healthCounts.total}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                healthy
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 text-sm">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[var(--color-text-muted)]">
                  {entry.name}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service status grid */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Services
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Link key={svc.href} href={svc.href} className="group">
              <Card
                className={`border-l-4 ${svc.borderColor} transition-shadow group-hover:shadow-md`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{svc.name}</CardTitle>
                    {statusMap[svc.key]?.status === "healthy" ? (
                      <Badge variant="default">Healthy</Badge>
                    ) : statusMap[svc.key]?.status === "unhealthy" ? (
                      <Badge variant="destructive">Down</Badge>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </div>
                  <CardDescription>{svc.description}</CardDescription>
                  {statusMap[svc.key]?.lastChecked ? (
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      Last checked: {new Date(statusMap[svc.key].lastChecked!).toLocaleString()}
                    </p>
                  ) : null}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Recent Activity
        </h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {recentActivity.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
