"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CHART_COLORS,
  CHART_DEFAULTS,
} from "@/components/dashboard/chart-theme";

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */

function useAnimatedCounter(target: number, duration = 2000, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Static Data                                                        */
/* ------------------------------------------------------------------ */

const IMPACT_METRICS = [
  {
    label: "Farmers Served",
    target: 50000,
    suffix: "+",
    prefix: "",
    description: "Smallholder farmers across 12 states",
    color: CHART_COLORS.primary,
    icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  },
  {
    label: "Income Improvement",
    target: 23,
    suffix: "%",
    prefix: "",
    subtext: "~\u20B918,000/year per farmer",
    description: "Average income uplift through AI advisory",
    color: CHART_COLORS.success,
    icon: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
  },
  {
    label: "Water Saved",
    target: 2100,
    suffix: "M litres",
    prefix: "",
    description: "Through precision irrigation recommendations",
    color: CHART_COLORS.accent,
    icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582",
  },
  {
    label: "Crop Loss Prevented",
    target: 45000,
    suffix: " tonnes",
    prefix: "",
    description: "Via early disease detection & weather alerts",
    color: CHART_COLORS.secondary,
    icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  },
  {
    label: "Credit Facilitated",
    target: 850,
    suffix: " Cr",
    prefix: "\u20B9",
    description: "Agricultural loans via Kisan Credit scoring",
    color: CHART_COLORS.purple,
    icon: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
  },
] as const satisfies readonly { label: string; target: number; suffix: string; prefix: string; description: string; color: string; icon: string; subtext?: string }[];

const REVENUE_PROJECTION = [
  { year: "Year 1", free: 0, basic: 12, premium: 8, enterprise: 2, total: 22 },
  { year: "Year 2", free: 0, basic: 48, premium: 36, enterprise: 12, total: 96 },
  { year: "Year 3", free: 0, basic: 120, premium: 108, enterprise: 42, total: 270 },
  { year: "Year 4", free: 0, basic: 240, premium: 264, enterprise: 96, total: 600 },
  { year: "Year 5", free: 0, basic: 420, premium: 540, enterprise: 240, total: 1200 },
];

const UNIT_ECONOMICS = [
  { label: "Customer Acquisition Cost", value: "\u20B950", key: "cac" },
  { label: "Lifetime Value", value: "\u20B91,200", key: "ltv" },
  { label: "LTV:CAC Ratio", value: "24:1", key: "ratio" },
  { label: "Payback Period", value: "< 1 month", key: "payback" },
  { label: "Monthly ARPU", value: "\u20B9100", key: "arpu" },
  { label: "Gross Margin", value: "~78%", key: "margin" },
];

const MARKET_SIZE = [
  { name: "TAM", value: 16800, description: "140M smallholder farmers in India", fill: CHART_COLORS.primary },
  { name: "SAM", value: 3360, description: "~20% digitally accessible farmers", fill: CHART_COLORS.accent },
  { name: "SOM", value: 336, description: "~10% realistic capture in 5 years", fill: CHART_COLORS.secondary },
];

const TIER_FEATURES = [
  { feature: "Crop Advisory (Basic)", free: true, basic: true, premium: true, enterprise: true },
  { feature: "Weather Alerts", free: true, basic: true, premium: true, enterprise: true },
  { feature: "MSP Price Tracker", free: true, basic: true, premium: true, enterprise: true },
  { feature: "Soil Analysis Reports", free: false, basic: true, premium: true, enterprise: true },
  { feature: "Disease Detection (AI)", free: false, basic: true, premium: true, enterprise: true },
  { feature: "Precision Irrigation", free: false, basic: false, premium: true, enterprise: true },
  { feature: "Digital Twin Simulation", free: false, basic: false, premium: true, enterprise: true },
  { feature: "Kisan Credit Score", free: false, basic: false, premium: true, enterprise: true },
  { feature: "Market Linkage (Harvest-to-Cart)", free: false, basic: false, premium: true, enterprise: true },
  { feature: "Protein Engineering Insights", free: false, basic: false, premium: false, enterprise: true },
  { feature: "Dedicated API Access", free: false, basic: false, premium: false, enterprise: true },
  { feature: "White-label Solutions", free: false, basic: false, premium: false, enterprise: true },
];

const TIER_PRICES = [
  { name: "Free", price: "\u20B90/mo", color: CHART_COLORS.primary },
  { name: "Basic", price: "\u20B949/mo", color: CHART_COLORS.accent },
  { name: "Premium", price: "\u20B9199/mo", color: CHART_COLORS.secondary },
  { name: "Enterprise", price: "\u20B9999/mo", color: CHART_COLORS.purple },
];

const SDG_GOALS = [
  {
    number: 1,
    title: "No Poverty",
    color: "#e5243b",
    description:
      "AI-powered credit scoring enables financial inclusion for 50K+ unbanked farmers, facilitating \u20B9850Cr in agricultural loans.",
  },
  {
    number: 2,
    title: "Zero Hunger",
    color: "#dda63a",
    description:
      "Crop advisory and disease detection prevent 45,000 tonnes of crop loss annually, improving food security.",
  },
  {
    number: 6,
    title: "Clean Water & Sanitation",
    color: "#26bde2",
    description:
      "Precision irrigation recommendations have saved 2.1 billion litres of water through optimised usage.",
  },
  {
    number: 13,
    title: "Climate Action",
    color: "#3f7e44",
    description:
      "Weather-aware advisories and digital twin simulations help farmers adapt to climate variability and reduce resource waste.",
  },
];

/* ------------------------------------------------------------------ */
/*  Impact Counter Card Component                                      */
/* ------------------------------------------------------------------ */

function ImpactCard({
  label,
  target,
  suffix,
  prefix,
  description,
  color,
  icon,
  subtext,
}: {
  label: string;
  target: number;
  suffix: string;
  prefix: string;
  description: string;
  color: string;
  icon: string;
  subtext?: string;
}) {
  const count = useAnimatedCounter(target);

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundColor: color }}
      />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke={color}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              {label}
            </p>
            <p
              className="mt-1 text-3xl font-bold tabular-nums tracking-tight"
              style={{ color }}
            >
              {prefix}
              {count.toLocaleString("en-IN")}
              {suffix}
            </p>
            {subtext && (
              <p className="mt-0.5 text-sm font-medium text-[var(--color-text-muted)]">
                {subtext}
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier Check/Cross                                                   */
/* ------------------------------------------------------------------ */

function TierCheck({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <svg
        className="mx-auto h-5 w-5"
        style={{ color: CHART_COLORS.success }}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    );
  }
  return (
    <svg
      className="mx-auto h-5 w-5 text-[var(--color-text-muted)] opacity-30"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function ImpactDashboardPage() {
  /* Market size pie needs outer rings — we simulate concentric with multiple Pies */
  const marketPieData = MARKET_SIZE.map((m) => ({
    ...m,
    label: `${m.name}: \u20B9${m.value.toLocaleString("en-IN")} Cr`,
  }));

  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Impact &amp; Economics Dashboard
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Tracking Annadata OS&apos;s real-world impact on Indian agriculture
          and the underlying business economics powering sustainable growth.
        </p>
      </div>

      {/* ---- Section 1: Animated Impact Counter Cards ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Platform Impact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {IMPACT_METRICS.map((metric) => (
            <ImpactCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      {/* ---- Section 2: Revenue Model ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Revenue Model &amp; Projections
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              5-Year Revenue Projection (\u20B9 Crores)
            </CardTitle>
            <CardDescription>
              Stacked revenue from Basic (\u20B949/mo), Premium (\u20B9199/mo),
              and Enterprise (\u20B9999/mo) tiers. Free tier generates no
              direct revenue but drives acquisition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={REVENUE_PROJECTION} margin={CHART_DEFAULTS.margin}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                  axisLine={{ stroke: CHART_DEFAULTS.gridStroke }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `\u20B9${v}Cr`}
                />
                <Tooltip
                  contentStyle={CHART_DEFAULTS.tooltipStyle}
                  formatter={(value: number, name: string) => [
                    `\u20B9${value} Cr`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: CHART_DEFAULTS.fontSize }}
                />
                <Bar
                  dataKey="basic"
                  name="Basic"
                  stackId="revenue"
                  fill={CHART_COLORS.accent}
                  radius={[0, 0, 0, 0]}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
                <Bar
                  dataKey="premium"
                  name="Premium"
                  stackId="revenue"
                  fill={CHART_COLORS.secondary}
                  radius={[0, 0, 0, 0]}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
                <Bar
                  dataKey="enterprise"
                  name="Enterprise"
                  stackId="revenue"
                  fill={CHART_COLORS.purple}
                  radius={[4, 4, 0, 0]}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Revenue Total Area Overlay */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
                Cumulative Revenue Trajectory
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={REVENUE_PROJECTION} margin={CHART_DEFAULTS.margin}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_DEFAULTS.gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                    axisLine={{ stroke: CHART_DEFAULTS.gridStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `\u20B9${v}Cr`}
                  />
                  <Tooltip
                    contentStyle={CHART_DEFAULTS.tooltipStyle}
                    formatter={(value: number) => [`\u20B9${value} Cr`, "Total Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={CHART_COLORS.primary}
                    fill="url(#totalGrad)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS.primary }}
                    animationDuration={CHART_DEFAULTS.animationDuration}
                    animationEasing={CHART_DEFAULTS.animationEasing}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 3: Unit Economics ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Unit Economics
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-Farmer Economics</CardTitle>
            <CardDescription>
              Key metrics demonstrating capital efficiency and sustainable
              growth potential per farmer onboarded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {UNIT_ECONOMICS.map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text)]">Model Summary:</strong>{" "}
                With a CAC of \u20B950 and an LTV of \u20B91,200, Annadata OS
                achieves a{" "}
                <span className="font-semibold" style={{ color: CHART_COLORS.primary }}>
                  24:1 LTV:CAC ratio
                </span>
                , recovering acquisition costs within the first month. At
                \u20B9100/farmer/month revenue, the model supports aggressive
                growth while maintaining positive unit economics.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 4: Market Size ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Market Opportunity
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              TAM / SAM / SOM Analysis
            </CardTitle>
            <CardDescription>
              India&apos;s agricultural technology market sizing based on 140
              million smallholder farmers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              {/* Concentric Pie Chart */}
              <div className="shrink-0">
                <ResponsiveContainer width={320} height={320}>
                  <PieChart>
                    {/* TAM — outermost ring */}
                    <Pie
                      data={[marketPieData[0]]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      innerRadius={110}
                      paddingAngle={0}
                      animationDuration={CHART_DEFAULTS.animationDuration}
                      animationEasing={CHART_DEFAULTS.animationEasing}
                    >
                      <Cell fill={CHART_COLORS.primary} fillOpacity={0.25} />
                    </Pie>
                    {/* SAM — middle ring */}
                    <Pie
                      data={[marketPieData[1]]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      innerRadius={75}
                      paddingAngle={0}
                      animationDuration={CHART_DEFAULTS.animationDuration}
                      animationEasing={CHART_DEFAULTS.animationEasing}
                    >
                      <Cell fill={CHART_COLORS.accent} fillOpacity={0.4} />
                    </Pie>
                    {/* SOM — innermost */}
                    <Pie
                      data={[marketPieData[2]]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={0}
                      paddingAngle={0}
                      animationDuration={CHART_DEFAULTS.animationDuration}
                      animationEasing={CHART_DEFAULTS.animationEasing}
                    >
                      <Cell fill={CHART_COLORS.secondary} fillOpacity={0.6} />
                    </Pie>
                    <Tooltip
                      contentStyle={CHART_DEFAULTS.tooltipStyle}
                      formatter={(value: number, name: string) => [
                        `\u20B9${value.toLocaleString("en-IN")} Cr`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Market legend breakdown */}
              <div className="flex flex-1 flex-col gap-4">
                {MARKET_SIZE.map((m) => (
                  <div
                    key={m.name}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: m.fill }}
                      />
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {m.name}
                      </p>
                      <Badge variant="outline">
                        \u20B9{m.value.toLocaleString("en-IN")} Cr
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      {m.description}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-[var(--color-text-muted)]">
                  Based on 140M smallholder farmers, \u20B912,000/farmer/year
                  addressable spend on agri-tech tools.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 5: Freemium Tier Comparison ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Freemium Tier Comparison
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Comparison</CardTitle>
            <CardDescription>
              Progressive feature unlock across tiers driving conversion from
              free to paid plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tier price headers */}
            <div className="mb-4 grid grid-cols-5 gap-2 text-center">
              <div /> {/* empty cell for feature label column */}
              {TIER_PRICES.map((tier) => (
                <div key={tier.name}>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: tier.color }}
                  >
                    {tier.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {tier.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] overflow-hidden">
              {TIER_FEATURES.map((row, idx) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-5 gap-2 px-4 py-3 text-center ${
                    idx % 2 === 0
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-surface)]"
                  }`}
                >
                  <p className="text-left text-sm text-[var(--color-text)]">
                    {row.feature}
                  </p>
                  <TierCheck enabled={row.free} />
                  <TierCheck enabled={row.basic} />
                  <TierCheck enabled={row.premium} />
                  <TierCheck enabled={row.enterprise} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 6: SDG Alignment ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          UN Sustainable Development Goals Alignment
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SDG_GOALS.map((sdg) => (
            <Card key={sdg.number} className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full w-1.5"
                style={{ backgroundColor: sdg.color }}
              />
              <CardContent className="p-6 pl-8">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: sdg.color }}
                  >
                    {sdg.number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      SDG {sdg.number}: {sdg.title}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {sdg.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Section 7: Data Sources ---- */}
      <section className="border-t border-[var(--color-border)] pt-6">
        <p className="text-xs text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">Data Sources:</strong>{" "}
          AgMarkNet DACNET, IMD Weather Data, ICAR Research, RBI Financial
          Inclusion Data. Impact figures are estimated based on platform usage
          analytics and partner-reported outcomes as of FY 2024-25.
        </p>
      </section>
    </div>
  );
}
