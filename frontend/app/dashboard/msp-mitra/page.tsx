"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import { Button } from "@/components/ui/button";
import { API_PREFIXES } from "@/lib/utils";
import { CHART_COLORS, CHART_DEFAULTS } from "@/components/dashboard/chart-theme";

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
  const [priceStats, setPriceStats] = useState<{
    average: number;
    min: number;
    max: number;
  } | null>(null);
  const [predictions, setPredictions] = useState<
    { date?: string; predicted_price?: number; price?: number }[]
  >([]);
  const [volatility, setVolatility] = useState<number | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPrice = useMemo(() => {
    if (!predictions.length) return null;
    const first = predictions[0];
    return first.predicted_price ?? first.price ?? null;
  }, [predictions]);

  const chartData = useMemo(
    () =>
      predictions.map((p, i) => ({
        date: p.date ?? `Day ${i + 1}`,
        price: p.predicted_price ?? p.price ?? 0,
      })),
    [predictions],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [priceRes, predictRes, volatilityRes, insightsRes] = await Promise.all([
          fetch(
            `${API_PREFIXES.mspMitra}/prices/${encodeURIComponent(
              selectedCommodity,
            )}/${encodeURIComponent(selectedState)}?limit=8`,
          ),
          fetch(
            `${API_PREFIXES.mspMitra}/predict/${encodeURIComponent(
              selectedCommodity,
            )}/${encodeURIComponent(selectedState)}?days=7`,
          ),
          fetch(
            `${API_PREFIXES.mspMitra}/analytics/volatility/${encodeURIComponent(
              selectedCommodity,
            )}/${encodeURIComponent(selectedState)}?days=30`,
          ),
          fetch(
            `${API_PREFIXES.mspMitra}/analytics/insights/${encodeURIComponent(
              selectedCommodity,
            )}/${encodeURIComponent(selectedState)}?days=30`,
          ),
        ]);

        if (priceRes.ok) {
          const data = await priceRes.json();
          setPriceStats({
            average: data.stats?.average_price ?? 0,
            min: data.stats?.min_price ?? 0,
            max: data.stats?.max_price ?? 0,
          });
        }
        if (predictRes.ok) {
          const data = await predictRes.json();
          setPredictions(data.predictions ?? []);
        }
        if (volatilityRes.ok) {
          const data = await volatilityRes.json();
          setVolatility(data.volatility ?? data.volatility_pct ?? null);
        }
        if (insightsRes.ok) {
          const data = await insightsRes.json();
          setInsights(Array.isArray(data.insights) ? data.insights : []);
        }
      } catch {
        setPriceStats(null);
        setPredictions([]);
        setInsights([]);
        setVolatility(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [selectedCommodity, selectedState]);

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
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Loading price trend...
              </p>
            </div>
          ) : chartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={chartData}
                margin={CHART_DEFAULTS.margin}
              >
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0.2}
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
                  dataKey="date"
                  stroke={CHART_DEFAULTS.axisStroke}
                  fontSize={CHART_DEFAULTS.fontSize}
                  tickLine={false}
                />
                <YAxis
                  stroke={CHART_DEFAULTS.axisStroke}
                  fontSize={CHART_DEFAULTS.fontSize}
                  tickLine={false}
                  tickFormatter={(v: number) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={CHART_DEFAULTS.tooltipStyle}
                  formatter={(value: number) => [`₹${value}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={CHART_COLORS.primary}
                  fill="url(#priceFill)"
                  strokeWidth={2}
                  animationDuration={CHART_DEFAULTS.animationDuration}
                  animationEasing={CHART_DEFAULTS.animationEasing}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-60 items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                No price data available. Select a commodity and state above.
              </p>
            </div>
          )}
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
            {predictions.length ? (
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                {predictions.slice(0, 5).map((p, index) => (
                  <li key={`${p.date ?? index}`} className="flex justify-between">
                    <span>{p.date ?? `Day ${index + 1}`}</span>
                    <span className="font-medium text-[var(--color-text)]">
                      ₹{p.predicted_price ?? p.price ?? "--"}/q
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {loading
                    ? "Loading predictions..."
                    : "No predictions available for the selected commodity and state."}
                </p>
              </div>
            )}
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
                  {priceStats ? `₹${priceStats.average}` : "--"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>MSP (Current)</span>
                <span className="font-medium text-[var(--color-text)]">
                  {currentPrice ? `₹${currentPrice}` : "--"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>30-day Volatility</span>
                <span className="font-medium text-[var(--color-text)]">
                  {volatility !== null ? `${volatility.toFixed(1)}%` : "--"}
                </span>
              </li>
              {volatility !== null && (
                <li>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(volatility, 100)}%`,
                        backgroundColor:
                          volatility > 60
                            ? CHART_COLORS.error
                            : volatility > 30
                              ? CHART_COLORS.secondary
                              : CHART_COLORS.primary,
                      }}
                    />
                  </div>
                </li>
              )}
              <li className="flex justify-between">
                <span>Price Spread (Min–Max)</span>
                <span className="font-medium text-[var(--color-text)]">
                  {priceStats
                    ? `₹${priceStats.min} - ₹${priceStats.max}`
                    : "--"}
                </span>
              </li>
            </ul>
            {insights.length ? (
              <div className="mt-4 text-xs text-[var(--color-text-muted)]">
                {insights[0]}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
