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

const commodities = ["Rice", "Wheat", "Maize", "Cotton", "Soybean"] as const;
const states = [
  "Maharashtra",
  "Punjab",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Karnataka",
] as const;

export default function MspMitraPage() {
  const [selectedCommodity, setSelectedCommodity] = useState<string>(
    commodities[0],
  );
  const [selectedState, setSelectedState] = useState<string>(states[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          MSP Mitra &mdash; Price Intelligence
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Real-time MSP tracking, price forecasting, and market analytics for
          agricultural commodities across Indian mandis.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Commodity selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commodity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commodities.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={selectedCommodity === c ? "default" : "outline"}
                  onClick={() => setSelectedCommodity(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* State selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {states.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={selectedState === s ? "default" : "outline"}
                  onClick={() => setSelectedState(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price chart placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Price Trend &mdash; {selectedCommodity}
            </CardTitle>
            <Badge>{selectedState}</Badge>
          </div>
          <CardDescription>
            Historical and predicted mandi prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              Price chart will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom panels */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Predictions</CardTitle>
            <CardDescription>
              ML-based price forecasts for the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Prediction panel &mdash; connect to MSP Mitra API
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Analytics</CardTitle>
            <CardDescription>
              Volume, volatility, and regional price spread summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li className="flex justify-between">
                <span>Average Mandi Price</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
                </span>
              </li>
              <li className="flex justify-between">
                <span>MSP (Current)</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
                </span>
              </li>
              <li className="flex justify-between">
                <span>30-day Volatility</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
                </span>
              </li>
              <li className="flex justify-between">
                <span>Price Spread (Min–Max)</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
