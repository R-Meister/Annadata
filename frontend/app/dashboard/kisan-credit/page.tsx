"use client";

import { useEffect, useState } from "react";
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

      {/* Score Components */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Yield Consistency", key: "yield_consistency", max: 25, color: "text-emerald-500" },
            { label: "Land Productivity", key: "land_productivity", max: 25, color: "text-amber-500" },
            { label: "Weather Risk", key: "weather_risk", max: 25, color: "text-blue-500" },
            { label: "Market Diversification", key: "market_diversification", max: 25, color: "text-purple-500" },
          ].map((component) => (
            <Card key={component.label}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide">
                  {component.label}
                </CardDescription>
                <p className={`text-2xl font-bold ${component.color}`}>
                  {score?.components?.find((c: any) => c.name === component.key)?.score ?? "--"} / {component.max}
                </p>
              </CardHeader>
            </Card>
          ))}
      </div>

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
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[var(--color-border)] bg-[var(--color-background)]">
                <span className="text-3xl font-bold text-[var(--color-text)]">
                  {score?.credit_score ?? "--"}
                </span>
              </div>
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
