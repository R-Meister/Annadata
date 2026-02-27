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
import { Button } from "@/components/ui/button";

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

const crops = [
  "Wheat",
  "Rice",
  "Cotton",
  "Sugarcane",
  "Maize",
  "Soybean",
  "Mustard",
  "Chickpea",
] as const;

export default function KisanCreditPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0]);

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
          { label: "Yield Consistency", max: 25, color: "text-emerald-500" },
          { label: "Land Productivity", max: 25, color: "text-amber-500" },
          { label: "Weather Risk", max: 25, color: "text-blue-500" },
          { label: "Market Diversification", max: 25, color: "text-purple-500" },
        ].map((component) => (
          <Card key={component.label}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wide">
                {component.label}
              </CardDescription>
              <p className={`text-2xl font-bold ${component.color}`}>
                -- / {component.max}
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
                  --
                </span>
              </div>
              <Badge variant="outline">Grade: --</Badge>
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
                <span className="font-medium text-[var(--color-text)]">--</span>
              </li>
              <li className="flex justify-between">
                <span>Max Loan Amount</span>
                <span className="font-medium text-[var(--color-text)]">--</span>
              </li>
              <li className="flex justify-between">
                <span>Suggested Interest Rate</span>
                <span className="font-medium text-[var(--color-text)]">--</span>
              </li>
              <li className="flex justify-between">
                <span>Risk Assessment</span>
                <span className="font-medium text-[var(--color-text)]">--</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

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
              { label: "Weather Risk", value: "--" },
              { label: "Market Volatility", value: "--" },
              { label: "Soil Degradation", value: "--" },
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
