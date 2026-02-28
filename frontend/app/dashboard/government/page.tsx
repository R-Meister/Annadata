"use client";

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
import {
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  Droplets,
  Shield,
  Wheat,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static Data                                                        */
/* ------------------------------------------------------------------ */

const KPI_DATA = [
  {
    label: "Total Farmers Registered",
    value: "48,520",
    icon: Users,
    color: CHART_COLORS.primary,
    change: "+3,210 this quarter",
  },
  {
    label: "Active Beneficiaries",
    value: "35,180",
    subtext: "72.5% of registered",
    icon: Shield,
    color: CHART_COLORS.accent,
    change: "+5.2% from last season",
  },
  {
    label: "Avg. Yield Improvement",
    value: "18.5%",
    icon: TrendingUp,
    color: CHART_COLORS.success,
    change: "vs. district 3-yr average",
  },
  {
    label: "Credit Disbursed",
    value: "\u20B9142 Cr",
    icon: IndianRupee,
    color: CHART_COLORS.purple,
    change: "KCC + institutional loans",
  },
  {
    label: "Crop Loss Prevented",
    value: "\u20B928.4 Cr",
    icon: Wheat,
    color: CHART_COLORS.secondary,
    change: "Early alerts & advisories",
  },
  {
    label: "Water Saved",
    value: "320M litres",
    icon: Droplets,
    color: CHART_COLORS.accent,
    change: "Precision irrigation impact",
  },
];

const TEHSILS = [
  { name: "Nashik", farmers: 12400, risk: "Low", color: CHART_COLORS.success },
  { name: "Igatpuri", farmers: 5820, risk: "High", color: CHART_COLORS.error },
  { name: "Dindori", farmers: 7340, risk: "High", color: CHART_COLORS.error },
  { name: "Sinnar", farmers: 8100, risk: "Medium", color: CHART_COLORS.secondary },
  { name: "Niphad", farmers: 9600, risk: "Critical", color: "#dc2626" },
  { name: "Malegaon", farmers: 5260, risk: "Medium", color: CHART_COLORS.secondary },
];

const INTERVENTIONS = [
  { rank: 1, intervention: "Drought preparedness in Niphad", priority: "Critical", category: "Water Management", affected: 4200 },
  { rank: 2, intervention: "Pest outbreak containment in Dindori", priority: "High", category: "Crop Protection", affected: 3100 },
  { rank: 3, intervention: "Credit access expansion in Malegaon", priority: "High", category: "Financial Inclusion", affected: 2800 },
  { rank: 4, intervention: "Irrigation infrastructure in Igatpuri", priority: "Medium", category: "Infrastructure", affected: 2400 },
  { rank: 5, intervention: "Market linkage for onion farmers", priority: "Medium", category: "Market Access", affected: 3600 },
  { rank: 6, intervention: "Soil health improvement in Sinnar", priority: "Medium", category: "Soil Management", affected: 1900 },
  { rank: 7, intervention: "Seed quality enforcement", priority: "Low", category: "Input Quality", affected: 1200 },
  { rank: 8, intervention: "Weather station coverage expansion", priority: "Low", category: "Infrastructure", affected: 800 },
];

const PRODUCTION_TRENDS = [
  { season: "Kharif 2022", onion: 185, grapes: 92, wheat: 68, tomato: 42 },
  { season: "Rabi 2023", onion: 210, grapes: 98, wheat: 74, tomato: 38 },
  { season: "Kharif 2023", onion: 195, grapes: 105, wheat: 71, tomato: 45 },
  { season: "Rabi 2024", onion: 228, grapes: 112, wheat: 80, tomato: 48 },
  { season: "Kharif 2024", onion: 215, grapes: 118, wheat: 76, tomato: 52 },
  { season: "Rabi 2025", onion: 248, grapes: 125, wheat: 85, tomato: 56 },
];

const SCHEME_UTILIZATION = [
  { scheme: "PM-KISAN", utilization: 89 },
  { scheme: "PM Fasal Bima", utilization: 62 },
  { scheme: "Soil Health Card", utilization: 45 },
  { scheme: "PKVY (Organic)", utilization: 28 },
  { scheme: "KCC", utilization: 71 },
  { scheme: "eNAM Registration", utilization: 38 },
];

const RISK_DISTRIBUTION = [
  { name: "Low Risk", value: 2, color: CHART_COLORS.success },
  { name: "Medium Risk", value: 2, color: CHART_COLORS.secondary },
  { name: "High Risk", value: 1, color: CHART_COLORS.orange },
  { name: "Critical", value: 1, color: CHART_COLORS.error },
];

const RECENT_ALERTS = [
  { message: "Heavy rainfall warning for Igatpuri \u2014 48hr forecast", severity: "Warning", time: "2 hours ago" },
  { message: "Onion price drop below MSP at Lasalgaon APMC", severity: "Alert", time: "5 hours ago" },
  { message: "Fall armyworm detected in 3 villages of Dindori", severity: "Critical", time: "8 hours ago" },
  { message: "KCC loan repayment deadline approaching for 2,400 farmers", severity: "Info", time: "1 day ago" },
  { message: "Soil moisture critical in Niphad \u2014 irrigation advisory issued", severity: "Warning", time: "1 day ago" },
  { message: "New PM-KISAN beneficiary enrollment drive starting", severity: "Info", time: "2 days ago" },
];

/* ------------------------------------------------------------------ */
/*  Helper: Priority / Severity Badge                                  */
/* ------------------------------------------------------------------ */

function priorityColor(priority: string): string {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-700";
    case "High":
      return "bg-orange-100 text-orange-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "Low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function severityColor(severity: string): string {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-700";
    case "Warning":
      return "bg-amber-100 text-amber-700";
    case "Alert":
      return "bg-orange-100 text-orange-700";
    case "Info":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function schemeBarColor(utilization: number): string {
  if (utilization >= 70) return CHART_COLORS.success;
  if (utilization >= 50) return CHART_COLORS.accent;
  if (utilization >= 35) return CHART_COLORS.secondary;
  return CHART_COLORS.error;
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function GovernmentDashboardPage() {
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              District Agricultural Dashboard
            </h1>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              District: Nashik, Maharashtra
            </span>
            <span className="text-[var(--color-border)]">|</span>
            <span className="text-sm">Collector&apos;s Office, Nashik</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
            Kharif 2025
          </Badge>
          <Badge className="px-3 py-1.5 text-sm font-medium">
            Live Data
          </Badge>
        </div>
      </div>

      {/* ---- Section 1: Key Performance Indicators ---- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Key Performance Indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KPI_DATA.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundColor: kpi.color }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${kpi.color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: kpi.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-muted)]">
                        {kpi.label}
                      </p>
                      <p
                        className="mt-1 text-2xl font-bold tracking-tight"
                        style={{ color: kpi.color }}
                      >
                        {kpi.value}
                      </p>
                      {kpi.subtext && (
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">
                          {kpi.subtext}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {kpi.change}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---- Section 2: District Map Placeholder + Intervention Priorities ---- */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* District Tehsil Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">District Tehsil View</CardTitle>
            <CardDescription>
              Risk status by tehsil — hover for details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {TEHSILS.map((t) => (
                <div
                  key={t.name}
                  className="relative flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 transition-shadow hover:shadow-md"
                >
                  <div
                    className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <MapPin className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {t.farmers.toLocaleString("en-IN")} farmers
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor(t.risk)}`}
                  >
                    {t.risk}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                Low
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-700" />
                Critical
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Intervention Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--color-text-muted)]" />
              Intervention Priorities
            </CardTitle>
            <CardDescription>
              Ranked by urgency and affected population
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {INTERVENTIONS.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-border)] text-xs font-bold text-[var(--color-text)]">
                    {item.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {item.intervention}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor(item.priority)}`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {item.affected.toLocaleString("en-IN")} farmers affected
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 3: Crop Production Trends ---- */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Crop Production Trends
            </CardTitle>
            <CardDescription>
              Seasonal production in &apos;000 tonnes across major crops (Kharif
              2022 &ndash; Rabi 2025)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={PRODUCTION_TRENDS} margin={CHART_DEFAULTS.margin}>
                <defs>
                  <linearGradient id="gradOnion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGrapes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradWheat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTomato" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.error} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS.error} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="season"
                  tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                  axisLine={{ stroke: CHART_DEFAULTS.gridStroke }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}`}
                  label={{
                    value: "'000 tonnes",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                  }}
                />
                <Tooltip
                  contentStyle={CHART_DEFAULTS.tooltipStyle}
                  formatter={(value: number, name: string) => [
                    `${value} '000 T`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: CHART_DEFAULTS.fontSize }}
                />
                <Area
                  type="monotone"
                  dataKey="onion"
                  name="Onion"
                  stroke={CHART_COLORS.primary}
                  fill="url(#gradOnion)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.primary }}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
                <Area
                  type="monotone"
                  dataKey="grapes"
                  name="Grapes"
                  stroke={CHART_COLORS.purple}
                  fill="url(#gradGrapes)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.purple }}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
                <Area
                  type="monotone"
                  dataKey="wheat"
                  name="Wheat"
                  stroke={CHART_COLORS.secondary}
                  fill="url(#gradWheat)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.secondary }}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
                <Area
                  type="monotone"
                  dataKey="tomato"
                  name="Tomato"
                  stroke={CHART_COLORS.error}
                  fill="url(#gradTomato)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.error }}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 4: Scheme Utilization + Risk Assessment ---- */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Scheme Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Government Scheme Utilization
            </CardTitle>
            <CardDescription>
              % of eligible farmers enrolled in each scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={SCHEME_UTILIZATION}
                layout="vertical"
                margin={{ ...CHART_DEFAULTS.margin, left: 100 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                  axisLine={{ stroke: CHART_DEFAULTS.gridStroke }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="scheme"
                  tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                  axisLine={false}
                  tickLine={false}
                  width={95}
                />
                <Tooltip
                  contentStyle={CHART_DEFAULTS.tooltipStyle}
                  formatter={(value: number) => [`${value}%`, "Utilization"]}
                />
                <Bar
                  dataKey="utilization"
                  radius={[0, 4, 4, 0]}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                >
                  {SCHEME_UTILIZATION.map((entry) => (
                    <Cell
                      key={entry.scheme}
                      fill={schemeBarColor(entry.utilization)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Assessment by Tehsil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Risk Assessment by Tehsil
            </CardTitle>
            <CardDescription>
              Distribution of risk levels across 6 tehsils
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    animationDuration={CHART_DEFAULTS.animationDuration}
                    animationEasing={CHART_DEFAULTS.animationEasing}
                    label={({ name, value }: { name: string; value: number }) =>
                      `${name} (${value})`
                    }
                  >
                    {RISK_DISTRIBUTION.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_DEFAULTS.tooltipStyle}
                    formatter={(value: number, name: string) => [
                      `${value} tehsil(s)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-1 flex-col gap-3">
                {RISK_DISTRIBUTION.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {r.name}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[var(--color-text)]">
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Section 5: Recent Alerts ---- */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Recent Alerts &amp; Advisories
            </CardTitle>
            <CardDescription>
              Real-time alerts affecting district agriculture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_ALERTS.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {alert.message}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {alert.time}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${severityColor(alert.severity)}`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Footer: Data Sources ---- */}
      <section className="border-t border-[var(--color-border)] pt-6">
        <p className="text-xs text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">Data Sources:</strong>{" "}
          District Agriculture Office, Nashik; AgMarkNet DACNET; IMD Regional
          Centre, Pune; Maharashtra State Seed Corporation. Data refreshed
          daily. For official reporting, verify with the District Agriculture
          Officer.
        </p>
        <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
          Annadata OS &mdash; FR-3.6 Government &amp; District Dashboard |
          Aggregated view for district collectors and government officials
        </p>
      </section>
    </div>
  );
}
