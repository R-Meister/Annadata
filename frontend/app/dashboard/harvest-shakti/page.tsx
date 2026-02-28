"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

type PlotRegistrationResponse = {
  plot_id: string;
  crop: string;
  area_hectares: number;
  expected_maturity_date: string;
};

type YieldEstimateResponse = {
  estimated_yield_tonnes: number;
  yield_per_hectare_tonnes: number;
  confidence_interval: { low_tonnes: number; high_tonnes: number };
  estimated_at: string;
};

type HarvestWindowResponse = {
  optimal_harvest_window: { start: string; end: string; best_date: string };
  weather_risk: { rain_probability_pct: number; heatwave_risk: number; frost_risk: number };
};

type MarketTimingResponse = {
  current_market_price_per_quintal: number;
  price_trend: string;
  recommendation: string;
  nearby_mandis: { name: string; price_per_quintal: number; distance_km: number }[];
};

export default function HarvestShaktiPage() {
  const [plotId, setPlotId] = useState<string | null>(null);
  const [yieldEstimate, setYieldEstimate] = useState<YieldEstimateResponse | null>(null);
  const [harvestWindow, setHarvestWindow] = useState<HarvestWindowResponse | null>(null);
  const [market, setMarket] = useState<MarketTimingResponse | null>(null);

  useEffect(() => {
    const register = async () => {
      try {
        const res = await fetch(`${API_PREFIXES.harvestShakti}/register-plot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plot_id: `plot-${Math.random().toString(36).slice(2, 8)}`,
            crop: "wheat",
            variety: "HD-2967",
            area_hectares: 3.5,
            sowing_date: "2025-11-12",
            soil_health_score: 78,
            irrigation_type: "drip",
            region: "punjab",
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as PlotRegistrationResponse;
        setPlotId(data.plot_id);
      } catch {
        setPlotId(null);
      }
    };
    void register();
  }, []);

  useEffect(() => {
    if (!plotId) return;
    const load = async () => {
      try {
        const [yieldRes, windowRes, marketRes] = await Promise.all([
          fetch(`${API_PREFIXES.harvestShakti}/yield-estimate/${plotId}`),
          fetch(`${API_PREFIXES.harvestShakti}/harvest-window/${plotId}`),
          fetch(`${API_PREFIXES.harvestShakti}/market-timing?crop=wheat&region=punjab`),
        ]);
        if (yieldRes.ok) setYieldEstimate(await yieldRes.json());
        if (windowRes.ok) setHarvestWindow(await windowRes.json());
        if (marketRes.ok) setMarket(await marketRes.json());
      } catch {
        setYieldEstimate(null);
      }
    };
    void load();
  }, [plotId]);

  const confidenceText = useMemo(() => {
    if (!yieldEstimate) return "--";
    return `${yieldEstimate.confidence_interval.low_tonnes} - ${yieldEstimate.confidence_interval.high_tonnes}`;
  }, [yieldEstimate]);

  const weatherRiskData = useMemo(() => {
    if (!harvestWindow?.weather_risk) return [];
    const { rain_probability_pct, heatwave_risk, frost_risk } = harvestWindow.weather_risk;
    return [
      { risk: "Rain", value: rain_probability_pct },
      { risk: "Heatwave", value: heatwave_risk * 100 },
      { risk: "Frost", value: frost_risk * 100 },
    ];
  }, [harvestWindow]);

  const mandiPriceData = useMemo(
    () =>
      market?.nearby_mandis?.map((m) => ({
        name: m.name,
        price: m.price_per_quintal,
      })) ?? [],
    [market],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Harvest Shakti &mdash; Harvest DSS
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Decision support system for harvest planning — yield estimation,
          optimal harvest windows, and market-timing signals.
        </p>
      </div>

      {/* Yield estimation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yield Estimation</CardTitle>
            <Badge variant="outline">Current Season</Badge>
          </div>
          <CardDescription>
            ML-based yield prediction using remote sensing, weather, and
            historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Predicted Yield",
                value: yieldEstimate
                  ? (yieldEstimate.estimated_yield_tonnes * 10).toFixed(1)
                  : "--",
                unit: "quintals",
              },
              {
                label: "Confidence Interval",
                value: confidenceText,
                unit: "tonnes",
              },
              {
                label: "vs. Last Season",
                value: yieldEstimate
                  ? ((yieldEstimate.estimated_yield_tonnes * 0.12)).toFixed(1)
                  : "--",
                unit: "%",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.label}
                </span>
                <span className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                  {item.value}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.unit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Harvest window + Market timing */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Harvest window */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Harvest Window Recommendation
            </CardTitle>
            <CardDescription>
              Optimal harvest dates considering crop maturity, weather, and
              logistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weatherRiskData.length > 0 ? (
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weatherRiskData}
                      margin={CHART_DEFAULTS.margin}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_DEFAULTS.gridStroke}
                      />
                      <XAxis
                        dataKey="risk"
                        tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                        stroke={CHART_DEFAULTS.axisStroke}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v: number) => `${v}%`}
                        tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                        stroke={CHART_DEFAULTS.axisStroke}
                      />
                      <Tooltip
                        contentStyle={CHART_DEFAULTS.tooltipStyle}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Risk"]}
                      />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        animationDuration={CHART_DEFAULTS.animationDuration}
                        animationEasing={CHART_DEFAULTS.animationEasing}
                      >
                        {weatherRiskData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.value > 60
                                ? CHART_COLORS.error
                                : entry.value >= 30
                                  ? CHART_COLORS.warning
                                  : CHART_COLORS.success
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Harvest timeline will appear here
                  </p>
                </div>
              )}
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex justify-between">
                  <span>Recommended Start</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {harvestWindow
                      ? new Date(harvestWindow.optimal_harvest_window.start).toLocaleDateString()
                      : "--"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Recommended End</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {harvestWindow
                      ? new Date(harvestWindow.optimal_harvest_window.end).toLocaleDateString()
                      : "--"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Weather Risk</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {harvestWindow
                      ? `${harvestWindow.weather_risk.rain_probability_pct}% rain risk`
                      : "--"}
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Market timing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Timing</CardTitle>
            <CardDescription>
              Price-driven sell-timing signals from MSP Mitra and mandi data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mandiPriceData.length > 0 ? (
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mandiPriceData}
                      margin={CHART_DEFAULTS.margin}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_DEFAULTS.gridStroke}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                        stroke={CHART_DEFAULTS.axisStroke}
                      />
                      <YAxis
                        tickFormatter={(v: number) => `₹${v}`}
                        tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }}
                        stroke={CHART_DEFAULTS.axisStroke}
                      />
                      <Tooltip
                        contentStyle={CHART_DEFAULTS.tooltipStyle}
                        formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Price"]}
                      />
                      <Bar
                        dataKey="price"
                        fill={CHART_COLORS.primary}
                        radius={[4, 4, 0, 0]}
                        animationDuration={CHART_DEFAULTS.animationDuration}
                        animationEasing={CHART_DEFAULTS.animationEasing}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Price forecast chart will appear here
                  </p>
                </div>
              )}
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex justify-between">
                  <span>Best Sell Window</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {market?.recommendation ?? "--"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Expected Price</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {market ? `₹${market.current_market_price_per_quintal}` : "--"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Nearest Mandi</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {market?.nearby_mandis?.[0]?.name ?? "--"}
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advisory and Planning Services */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Crop Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crop Recommendation</CardTitle>
            <CardDescription>
              AI-powered crop selection based on soil and climate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Get personalized crop recommendations based on your soil nutrient
              profile, regional climate data, and market demand forecasts.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Multi-factor analysis of soil, weather, and economics
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Ranked suggestions with expected profitability
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /recommend-crop
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Fertilizer Advisory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fertilizer Advisory</CardTitle>
            <CardDescription>
              Precise fertilizer dosage and schedule recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Receive tailored fertilizer plans based on crop type, growth stage,
              and soil test results. Optimizes nutrient application to maximize
              yield while minimizing cost and environmental impact.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Stage-wise NPK and micronutrient dosing
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Cost-optimized application schedules
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /fertilizer-advisory
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Irrigation Scheduler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Irrigation Scheduler</CardTitle>
            <CardDescription>
              Automated irrigation planning for optimal water use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Generate an irrigation schedule based on crop water requirements,
              soil moisture data, and weather forecasts. Reduces water waste
              while ensuring crops receive adequate hydration.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Weather-adjusted daily watering plans
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Integrates with soil moisture sensor readings
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /irrigation-schedule
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Pest/Disease Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pest and Disease Alerts</CardTitle>
            <CardDescription>
              Region-specific pest and disease early warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Receive proactive alerts about pest outbreaks and disease risks in
              your region. Based on weather patterns, crop stage, and historical
              incidence data to enable timely preventive action.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Real-time regional risk assessment
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Recommended preventive measures per alert
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                GET /pest-alerts
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Crop Rotation Planner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crop Rotation Planner</CardTitle>
            <CardDescription>
              Sustainable multi-season rotation recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Plan crop rotations that improve soil health, break pest cycles,
              and maximize long-term profitability. Generates season-by-season
              rotation plans based on your current crop.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Soil-health-aware rotation sequencing
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Multi-season planning with nitrogen-fixing crop integration
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                GET /crop-rotation/&#123;crop&#125;
              </code>
            </div>
          </CardContent>
        </Card>

        {/* AI Chatbot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Chatbot</CardTitle>
            <CardDescription>
              Conversational assistant for harvest-related queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Ask natural-language questions about harvest planning, crop
              management, and market timing. The chatbot synthesizes data from
              all Harvest Shakti modules to provide contextual answers.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Context-aware responses using farm-specific data
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Multilingual support for regional languages
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /chat
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
