"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CHART_COLORS, CHART_DEFAULTS } from "@/components/dashboard/chart-theme";

/* ---------------------------------------------------------------------------
 * Static data
 * --------------------------------------------------------------------------- */

// Overall environmental score breakdown
const ENV_SCORE = 78;
const ENV_BREAKDOWN = [
  { name: "Carbon", score: 74, color: CHART_COLORS.primary },
  { name: "Water", score: 81, color: CHART_COLORS.accent },
  { name: "Biodiversity", score: 72, color: CHART_COLORS.purple },
  { name: "Soil Health", score: 85, color: CHART_COLORS.secondary },
];

// Donut data for the circular gauge
const GAUGE_DATA = [
  { name: "Score", value: ENV_SCORE },
  { name: "Remaining", value: 100 - ENV_SCORE },
];

// Carbon footprint per crop (kg CO2 / hectare)
const CARBON_DATA = [
  { crop: "Rice", traditional: 3800, optimized: 2200 },
  { crop: "Wheat", traditional: 2100, optimized: 1400 },
  { crop: "Sugarcane", traditional: 4500, optimized: 2800 },
  { crop: "Cotton", traditional: 3200, optimized: 1900 },
  { crop: "Pulses", traditional: 800, optimized: 600 },
];

// Monthly water usage (million litres)
const WATER_DATA = [
  { month: "Jan", actual: 120, optimal: 95 },
  { month: "Feb", actual: 135, optimal: 100 },
  { month: "Mar", actual: 180, optimal: 130 },
  { month: "Apr", actual: 220, optimal: 155 },
  { month: "May", actual: 260, optimal: 175 },
  { month: "Jun", actual: 300, optimal: 200 },
  { month: "Jul", actual: 280, optimal: 190 },
  { month: "Aug", actual: 250, optimal: 170 },
  { month: "Sep", actual: 210, optimal: 150 },
  { month: "Oct", actual: 170, optimal: 125 },
  { month: "Nov", actual: 140, optimal: 105 },
  { month: "Dec", actual: 110, optimal: 90 },
];

// Radar comparison
const RADAR_DATA = [
  { axis: "Water Efficiency", traditional: 40, optimized: 85 },
  { axis: "Carbon Reduction", traditional: 35, optimized: 80 },
  { axis: "Yield", traditional: 60, optimized: 82 },
  { axis: "Cost Efficiency", traditional: 45, optimized: 78 },
  { axis: "Soil Health", traditional: 50, optimized: 75 },
  { axis: "Biodiversity", traditional: 40, optimized: 70 },
];

// Impact summary cards
const IMPACT_METRICS = [
  { label: "CO2 Reduced", value: "1,200", unit: "tonnes/year", delta: "-32%", color: CHART_COLORS.primary },
  { label: "Water Saved", value: "2.1B", unit: "liters/year", delta: "-28%", color: CHART_COLORS.accent },
  { label: "Soil Health Improved", value: "34", unit: "%", delta: "+34%", color: CHART_COLORS.secondary },
  { label: "Biodiversity Index", value: "+18", unit: "%", delta: "+18%", color: CHART_COLORS.purple },
  { label: "Chemical Usage Reduced", value: "42", unit: "%", delta: "-42%", color: CHART_COLORS.error },
  { label: "Energy Saved", value: "28", unit: "%", delta: "-28%", color: CHART_COLORS.teal },
];

// SDG alignment
const SDG_ITEMS = [
  {
    sdg: 2,
    title: "Zero Hunger",
    color: "#DDA63A",
    description: "End hunger, achieve food security and improved nutrition.",
    contribution:
      "Annadata boosts crop yields by 20-35% through AI-driven precision farming, directly reducing food insecurity for smallholder farmers.",
  },
  {
    sdg: 6,
    title: "Clean Water & Sanitation",
    color: "#26BDE2",
    description: "Ensure availability and sustainable management of water.",
    contribution:
      "Jal Shakti reduces water consumption by 28% via smart irrigation scheduling and IoT-controlled drip systems.",
  },
  {
    sdg: 12,
    title: "Responsible Consumption",
    color: "#BF8B2E",
    description: "Ensure sustainable consumption and production patterns.",
    contribution:
      "Harvest-to-Cart minimises post-harvest losses by 40%, reducing waste across the agricultural supply chain.",
  },
  {
    sdg: 13,
    title: "Climate Action",
    color: "#3F7E44",
    description: "Take urgent action to combat climate change.",
    contribution:
      "Carbon-optimised practices reduce CO2 emissions by 1,200 tonnes annually through SRI cultivation, organic inputs, and solar pumps.",
  },
  {
    sdg: 15,
    title: "Life on Land",
    color: "#56C02B",
    description: "Protect, restore and promote sustainable use of terrestrial ecosystems.",
    contribution:
      "Crop rotation and reduced chemical usage improve the biodiversity index by 18%, restoring soil microbiome health.",
  },
];

// Sustainability recommendations
const RECOMMENDATIONS = [
  {
    title: "Switch to SRI rice cultivation",
    description:
      "System of Rice Intensification reduces water usage by 40% and methane emissions by 50% while maintaining yield.",
    impact: "High",
  },
  {
    title: "Adopt drip irrigation across all plots",
    description:
      "Drip irrigation delivers water directly to roots, cutting consumption by 30-60% compared to flood irrigation.",
    impact: "High",
  },
  {
    title: "Use organic fertilizers for wheat",
    description:
      "Replace synthetic urea with vermicompost and biofertilizers to lower nitrous oxide emissions and improve soil biology.",
    impact: "Medium",
  },
  {
    title: "Implement crop rotation with pulses",
    description:
      "Legume-cereal rotation fixes atmospheric nitrogen, reducing fertilizer dependency and boosting soil health.",
    impact: "Medium",
  },
  {
    title: "Install solar-powered irrigation pumps",
    description:
      "Solar pumps eliminate diesel consumption, saving 1.2 tonnes CO2 per hectare per year and lowering operating costs.",
    impact: "High",
  },
  {
    title: "Adopt integrated pest management (IPM)",
    description:
      "Combine biological controls, pheromone traps, and targeted spraying to reduce pesticide use by 42%.",
    impact: "Medium",
  },
];

const IMPACT_BADGE_COLOR: Record<string, string> = {
  High: CHART_COLORS.primary,
  Medium: CHART_COLORS.secondary,
  Low: CHART_COLORS.accent,
};

/* ---------------------------------------------------------------------------
 * Component
 * --------------------------------------------------------------------------- */

export default function SustainabilityPage() {
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Sustainability Tracker
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Carbon &amp; water footprint analytics, environmental impact scoring, and
          UN SDG alignment for your farming operations.
        </p>
      </div>

      {/* ---- Section 1: Overall Environmental Score ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Donut gauge */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Environmental Score</CardTitle>
            <CardDescription>Composite sustainability index</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={GAUGE_DATA}
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    animationDuration={CHART_DEFAULTS.animationDuration}
                    animationEasing={CHART_DEFAULTS.animationEasing}
                  >
                    <Cell fill={CHART_COLORS.primary} />
                    <Cell fill="var(--color-border)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[var(--color-text)]">
                  {ENV_SCORE}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  out of 100
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown cards */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
            <CardDescription>
              Individual performance across environmental dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {ENV_BREAKDOWN.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">
                      {item.name}
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: item.color }}
                    >
                      {item.score}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.score}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Section 2: Carbon Footprint by Crop ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Carbon Footprint by Crop</CardTitle>
              <CardDescription>
                kg CO&#8322; per hectare &mdash; traditional farming vs
                Annadata-optimized practices
              </CardDescription>
            </div>
            <Badge>kg CO&#8322;/ha</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={CARBON_DATA} margin={CHART_DEFAULTS.margin}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_DEFAULTS.gridStroke}
              />
              <XAxis
                dataKey="crop"
                stroke={CHART_DEFAULTS.axisStroke}
                fontSize={CHART_DEFAULTS.fontSize}
                tickLine={false}
              />
              <YAxis
                stroke={CHART_DEFAULTS.axisStroke}
                fontSize={CHART_DEFAULTS.fontSize}
                tickLine={false}
                label={{
                  value: "kg CO₂/ha",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontSize: CHART_DEFAULTS.fontSize,
                    fill: CHART_DEFAULTS.axisStroke,
                  },
                }}
              />
              <Tooltip
                contentStyle={CHART_DEFAULTS.tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} kg`,
                  name === "traditional" ? "Traditional" : "Optimized",
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === "traditional" ? "Traditional" : "Annadata-Optimized"
                }
              />
              <Bar
                dataKey="traditional"
                fill={CHART_COLORS.error}
                radius={[4, 4, 0, 0]}
                animationDuration={CHART_DEFAULTS.animationDuration}
                animationEasing={CHART_DEFAULTS.animationEasing}
              />
              <Bar
                dataKey="optimized"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
                animationDuration={CHART_DEFAULTS.animationDuration}
                animationEasing={CHART_DEFAULTS.animationEasing}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---- Section 3: Water Footprint ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Water Footprint</CardTitle>
              <CardDescription>
                Monthly water consumption (million litres) &mdash; actual vs
                Annadata-recommended optimal
              </CardDescription>
            </div>
            <Badge variant="outline">ML/month</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={WATER_DATA} margin={CHART_DEFAULTS.margin}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.accent}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.accent}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gradOptimal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_DEFAULTS.gridStroke}
              />
              <XAxis
                dataKey="month"
                stroke={CHART_DEFAULTS.axisStroke}
                fontSize={CHART_DEFAULTS.fontSize}
                tickLine={false}
              />
              <YAxis
                stroke={CHART_DEFAULTS.axisStroke}
                fontSize={CHART_DEFAULTS.fontSize}
                tickLine={false}
                label={{
                  value: "ML",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontSize: CHART_DEFAULTS.fontSize,
                    fill: CHART_DEFAULTS.axisStroke,
                  },
                }}
              />
              <Tooltip
                contentStyle={CHART_DEFAULTS.tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${value} ML`,
                  name === "actual" ? "Actual Usage" : "Optimal (Recommended)",
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === "actual" ? "Actual Usage" : "Optimal (Recommended)"
                }
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={CHART_COLORS.accent}
                fill="url(#gradActual)"
                strokeWidth={2}
                animationDuration={CHART_DEFAULTS.animationDuration}
                animationEasing={CHART_DEFAULTS.animationEasing}
              />
              <Area
                type="monotone"
                dataKey="optimal"
                stroke={CHART_COLORS.primary}
                fill="url(#gradOptimal)"
                strokeWidth={2}
                animationDuration={CHART_DEFAULTS.animationDuration}
                animationEasing={CHART_DEFAULTS.animationEasing}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---- Section 4: Traditional vs Optimized Radar ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Traditional vs Optimized Farming</CardTitle>
          <CardDescription>
            Multi-axis comparison of farming performance across key
            sustainability dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke={CHART_DEFAULTS.gridStroke} />
              <PolarAngleAxis
                dataKey="axis"
                stroke={CHART_DEFAULTS.axisStroke}
                fontSize={CHART_DEFAULTS.fontSize}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke={CHART_DEFAULTS.axisStroke}
                fontSize={CHART_DEFAULTS.fontSize}
              />
              <Radar
                name="Traditional"
                dataKey="traditional"
                stroke={CHART_COLORS.error}
                fill={CHART_COLORS.error}
                fillOpacity={0.15}
                animationDuration={CHART_DEFAULTS.animationDuration}
                animationEasing={CHART_DEFAULTS.animationEasing}
              />
              <Radar
                name="Annadata-Optimized"
                dataKey="optimized"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.25}
                animationDuration={CHART_DEFAULTS.animationDuration}
                animationEasing={CHART_DEFAULTS.animationEasing}
              />
              <Legend />
              <Tooltip contentStyle={CHART_DEFAULTS.tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---- Section 5: Impact Summary Cards ---- */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Impact Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT_METRICS.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                      {metric.value}{" "}
                      <span className="text-sm font-normal text-[var(--color-text-muted)]">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${metric.color}1a`,
                      color: metric.color,
                    }}
                  >
                    {metric.delta}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.abs(parseInt(metric.delta)), 100)}%`,
                      backgroundColor: metric.color,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ---- Section 6: SDG Alignment ---- */}
      <Card>
        <CardHeader>
          <CardTitle>UN Sustainable Development Goals Alignment</CardTitle>
          <CardDescription>
            How Annadata OS contributes to global sustainability targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {SDG_ITEMS.map((sdg) => (
              <div
                key={sdg.sdg}
                className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:flex-row sm:items-start sm:gap-4"
              >
                {/* SDG badge */}
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: sdg.color }}
                  >
                    {sdg.sdg}
                  </span>
                  <Badge
                    className="whitespace-nowrap"
                    style={{
                      backgroundColor: `${sdg.color}1a`,
                      color: sdg.color,
                    }}
                  >
                    SDG {sdg.sdg}
                  </Badge>
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">
                    {sdg.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {sdg.description}
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                    {sdg.contribution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---- Section 7: Sustainability Recommendations ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sustainability Recommendations</CardTitle>
              <CardDescription>
                AI-generated actionable steps to improve your environmental
                footprint
              </CardDescription>
            </div>
            <Badge>{RECOMMENDATIONS.length} actions</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {RECOMMENDATIONS.map((rec, idx) => (
              <li
                key={idx}
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:flex-row sm:items-start sm:gap-4"
              >
                {/* Index circle */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {idx + 1}
                </span>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      {rec.title}
                    </h4>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${IMPACT_BADGE_COLOR[rec.impact]}1a`,
                        color: IMPACT_BADGE_COLOR[rec.impact],
                      }}
                    >
                      {rec.impact} Impact
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {rec.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
