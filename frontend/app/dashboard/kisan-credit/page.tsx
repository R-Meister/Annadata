"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_PREFIXES } from "@/lib/utils";
import {
  RadialBarChart,
  RadialBar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CHART_COLORS,
  CHART_DEFAULTS,
  getScoreColor,
} from "@/components/dashboard/chart-theme";

const regions = [
  "Punjab",
  "Maharashtra",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Karnataka",
  "Rajasthan",
  "Tamil Nadu",
  "West Bengal",
] as const;

const GRADE_COLORS: Record<string, string> = {
  A: CHART_COLORS.success,
  B: CHART_COLORS.primary,
  C: CHART_COLORS.secondary,
  D: CHART_COLORS.warning,
  F: CHART_COLORS.error,
};

export default function KisanCreditPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0]);
  const [score, setScore] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const calcRes = await fetch(`${API_PREFIXES.kisanCredit}/credit-score/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            farmer_id: "farmer-001",
            land_area_hectares: 3.2,
            region: selectedRegion.toLowerCase().replaceAll(" ", "_"),
            crop_types: ["wheat", "rice"],
            historical_yields: [20, 22, 23, 21, 24, 19],
            years_farming: 12,
          }),
        });
        if (calcRes.ok) {
          const data = await calcRes.json();
          setScore(data);
        }
        const statsRes = await fetch(`${API_PREFIXES.kisanCredit}/credit-score/stats`);
        if (statsRes.ok) setStats(await statsRes.json());
        const riskRes = await fetch(
          `${API_PREFIXES.kisanCredit}/risk-assessment/${selectedRegion.toLowerCase().replaceAll(" ", "_")}`,
        );
        if (riskRes.ok) setRisk(await riskRes.json());
      } catch {
        setScore(null);
      }
    };
    void load();
  }, [selectedRegion]);

  // Prepare radar data from score components
  const radarData = useMemo(() => {
    const axes = [
      { key: "yield_consistency", label: "Yield Consistency" },
      { key: "land_productivity", label: "Land Productivity" },
      { key: "weather_risk", label: "Weather Risk" },
      { key: "market_diversification", label: "Market Diversification" },
    ];
    return axes.map((axis) => ({
      subject: axis.label,
      value:
        score?.components?.find((c: any) => c.name === axis.key)?.score ?? 0,
      fullMark: 25,
    }));
  }, [score]);

  // Prepare radial bar gauge data
  const gaugeData = useMemo(() => {
    const creditScore = score?.credit_score ?? 0;
    return [
      {
        name: "score",
        value: creditScore,
        fill: getScoreColor(creditScore, 100),
      },
    ];
  }, [score]);

  // Prepare pie chart data from grade distribution
  const gradeData = useMemo(() => {
    if (!stats?.grade_distribution) return [];
    return Object.entries(stats.grade_distribution).map(([grade, count]) => ({
      name: grade,
      value: count as number,
      fill: GRADE_COLORS[grade] ?? CHART_COLORS.accent,
    }));
  }, [stats]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Kisan Credit Score &mdash; Fintech
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          AI-powered farmer credit scoring based on historical yields, land
          productivity, weather risk, and market diversification. Instant loan
          eligibility assessment.
        </p>
      </div>

      {/* Region selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
              <Button
                key={r}
                size="sm"
                variant={selectedRegion === r ? "default" : "outline"}
                onClick={() => setSelectedRegion(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score Components — Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score Components</CardTitle>
          <CardDescription>
            Breakdown across the four credit scoring dimensions (each max 25)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <RadarChart
            width={250}
            height={250}
            data={radarData}
            cx="50%"
            cy="50%"
            outerRadius="70%"
          >
            <PolarGrid stroke={CHART_DEFAULTS.gridStroke} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 25]}
              tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={CHART_COLORS.primary}
              fill={CHART_COLORS.primary}
              fillOpacity={0.3}
              animationDuration={CHART_DEFAULTS.animationDuration}
              animationEasing={CHART_DEFAULTS.animationEasing}
            />
            <Tooltip contentStyle={CHART_DEFAULTS.tooltipStyle} />
          </RadarChart>
        </CardContent>
      </Card>

      {/* Credit Score Result + Loan Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credit Score</CardTitle>
            <CardDescription>
              Overall farmer credit score (0-100)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <RadialBarChart
                width={160}
                height={160}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                data={gaugeData}
                barSize={12}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={6}
                  background={{ fill: "var(--color-border)" }}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
                {/* Center label */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-[var(--color-text)]"
                  style={{ fontSize: 28, fontWeight: 700 }}
                >
                  {score?.credit_score ?? "--"}
                </text>
              </RadialBarChart>
              <Badge variant="outline">Grade: {score?.grade ?? "--"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loan Eligibility</CardTitle>
            <CardDescription>
              Based on credit score and regional assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li className="flex justify-between">
                <span>Eligible</span>
                <span className="font-medium text-[var(--color-text)]">
                  {score?.loan_eligibility ? "Yes" : score ? "No" : "--"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Max Loan Amount</span>
                <span className="font-medium text-[var(--color-text)]">
                  {score?.max_loan_amount ? `₹${score.max_loan_amount}` : "--"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Suggested Interest Rate</span>
                <span className="font-medium text-[var(--color-text)]">
                  {score?.interest_rate_suggestion
                    ? `${score.interest_rate_suggestion}%`
                    : "--"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Risk Assessment</span>
                <span className="font-medium text-[var(--color-text)]">
                  {risk?.risk_category ?? "--"}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {stats ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio Stats</CardTitle>
            <CardDescription>Aggregate credit scoring summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs text-[var(--color-text-muted)]">Total Scores</p>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {stats.total_scores_calculated}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs text-[var(--color-text-muted)]">Average Score</p>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {stats.average_score}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs text-[var(--color-text-muted)]">Avg Loan</p>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  ₹{stats.avg_loan_amount}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs text-[var(--color-text-muted)]">Top Grade</p>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {Object.entries(stats.grade_distribution ?? {})
                    .sort((a: any, b: any) => b[1] - a[1])
                    .map((entry) => entry[0])[0] ?? "--"}
                </p>
              </div>
            </div>

            {/* Grade Distribution Pie Chart */}
            {gradeData.length > 0 && (
              <div className="mt-6 flex flex-col items-center">
                <p className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">
                  Grade Distribution
                </p>
                <PieChart width={200} height={200}>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                    animationDuration={CHART_DEFAULTS.animationDuration}
                    animationEasing={CHART_DEFAULTS.animationEasing}
                  >
                    {gradeData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_DEFAULTS.tooltipStyle} />
                </PieChart>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Regional Risk */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Regional Risk Assessment &mdash; {selectedRegion}
            </CardTitle>
            <Badge variant="outline">Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Weather Risk",
                value: risk ? risk.weather_risk : "--",
              },
              {
                label: "Market Volatility",
                value: risk ? risk.market_volatility : "--",
              },
              {
                label: "Soil Degradation",
                value: risk ? risk.soil_degradation_risk : "--",
              },
            ].map((risk) => (
              <div
                key={risk.label}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-center"
              >
                <p className="text-xs text-[var(--color-text-muted)]">{risk.label}</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-text)]">
                  {risk.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
