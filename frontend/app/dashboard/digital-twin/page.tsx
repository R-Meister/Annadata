"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartWrapper, StatCard } from "@/components/dashboard/chart-wrapper";
import { CHART_COLORS, SERIES_COLORS, CHART_DEFAULTS } from "@/components/dashboard/chart-theme";
import { exportToPDF } from "@/lib/export";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ----------------------------------------------------------------
// Demo Farmer Profiles (selectable)
// ----------------------------------------------------------------

const DEMO_FARMERS = [
  { id: "f1", name: "Raman Singh", village: "Kheri Kalan", district: "Karnal", state: "Haryana", landHolding: "4.5 acres", primaryCrops: ["Wheat", "Rice", "Mustard"], farmerId: "KRN-2024-0847", season: "Rabi 2025-26", memberSince: "June 2024", lat: 29.6857, lon: 76.9905 },
  { id: "f2", name: "Sunita Devi", village: "Pataudi", district: "Gurugram", state: "Haryana", landHolding: "3.8 acres", primaryCrops: ["Wheat", "Bajra", "Vegetables"], farmerId: "GGN-2024-1203", season: "Rabi 2025-26", memberSince: "August 2024", lat: 28.3256, lon: 76.7726 },
  { id: "f3", name: "Mukesh Yadav", village: "Tigaon", district: "Faridabad", state: "Haryana", landHolding: "7.5 acres", primaryCrops: ["Rice", "Sugarcane", "Wheat"], farmerId: "FBD-2024-0562", season: "Rabi 2025-26", memberSince: "May 2024", lat: 28.3752, lon: 77.3129 },
];

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIXES = {
  mspMitra: `${API_BASE}/api/msp-mitra`,
  mausamChakra: `${API_BASE}/api/mausam-chakra`,
};

// Aggregated service data (simulated but realistic)
const serviceData = {
  soilHealth: {
    score: 72,
    ph: 7.2,
    nitrogen: 245,
    phosphorus: 18,
    potassium: 185,
    organicCarbon: 0.58,
    fertility: "Moderate",
    lastTested: "12 Jan 2026",
  },
  cropStatus: {
    currentCrop: "Wheat",
    variety: "HD-3226",
    growthStage: "Tillering (40 DAS)",
    healthStatus: "Good",
    diseaseRisk: "Low",
    diseaseDetected: "None",
    nextAction: "First top-dressing of urea at CRI stage",
  },
  irrigation: {
    nextScheduled: "5 Mar 2026",
    waterUsedLiters: 184000,
    efficiency: 78,
    method: "Border irrigation",
    soilMoisture: 62,
  },
  weather: {
    currentTemp: 18.5,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    forecast: "Light rain expected in 3 days",
    advisory: "Good conditions for urea top-dressing in next 2 days",
  },
  market: {
    wheatMSP: 2275,
    currentPrice: 2340,
    bestMandi: "Karnal Mandi",
    priceChange: "+2.8%",
    recommendation: "Hold stock; prices trending upward",
  },
  credit: {
    score: 74,
    grade: "B+",
    kccLimit: 300000,
    utilized: 185000,
    eligibleSchemes: 4,
  },
  harvest: {
    expectedYield: "52 qtl/ha",
    daysToHarvest: 85,
    yieldForecast: "Above average",
    weatherRisk: "Low",
  },
  seedVerification: {
    status: "Verified",
    seedLot: "HD3226-KRN-2024-B07",
    germination: 94,
    purity: 98.5,
  },
  supplyChain: {
    activeOrders: 0,
    nearestFPC: "Karnal FPO",
    storageAvailable: true,
    coldStorageKm: 8,
  },
};

// Radar chart data for risk dimensions
const riskRadarData = [
  { dimension: "Soil", value: serviceData.soilHealth.score, fullMark: 100 },
  { dimension: "Crop", value: 85, fullMark: 100 },
  { dimension: "Water", value: serviceData.irrigation.efficiency, fullMark: 100 },
  { dimension: "Weather", value: 80, fullMark: 100 },
  { dimension: "Market", value: 70, fullMark: 100 },
  { dimension: "Credit", value: serviceData.credit.score, fullMark: 100 },
];

// Nutrient bar chart data
const nutrientData = [
  { nutrient: "N", value: serviceData.soilHealth.nitrogen, ideal: 280, unit: "kg/ha" },
  { nutrient: "P", value: serviceData.soilHealth.phosphorus, ideal: 22, unit: "kg/ha" },
  { nutrient: "K", value: serviceData.soilHealth.potassium, ideal: 200, unit: "kg/ha" },
  { nutrient: "OC", value: serviceData.soilHealth.organicCarbon * 100, ideal: 75, unit: "%" },
  { nutrient: "pH", value: serviceData.soilHealth.ph * 10, ideal: 70, unit: "" },
];

// Timeline events
const timelineEvents = [
  { date: "15 Oct 2025", event: "Land preparation", status: "completed" },
  { date: "5 Nov 2025", event: "Seed sowing (HD-3226)", status: "completed" },
  { date: "10 Nov 2025", event: "Pre-emergence irrigation", status: "completed" },
  { date: "28 Nov 2025", event: "Seed verification completed", status: "completed" },
  { date: "20 Dec 2025", event: "CRI irrigation + urea top-dressing", status: "completed" },
  { date: "12 Jan 2026", event: "Soil health test", status: "completed" },
  { date: "5 Mar 2026", event: "Flowering stage irrigation", status: "upcoming" },
  { date: "15 Mar 2026", event: "Second top-dressing (urea)", status: "upcoming" },
  { date: "20 Apr 2026", event: "Grain filling irrigation", status: "upcoming" },
  { date: "25 May 2026", event: "Expected harvest", status: "upcoming" },
];

// Service status for the aggregation panel
const serviceModules = [
  { name: "SoilScan AI", status: "active", metric: `Score: ${serviceData.soilHealth.score}/100`, href: "/dashboard/soilscan", color: CHART_COLORS.secondary },
  { name: "Fasal Rakshak", status: "active", metric: `Risk: ${serviceData.cropStatus.diseaseRisk}`, href: "/dashboard/fasal-rakshak", color: CHART_COLORS.error },
  { name: "Jal Shakti", status: "active", metric: `Efficiency: ${serviceData.irrigation.efficiency}%`, href: "/dashboard/jal-shakti", color: CHART_COLORS.accent },
  { name: "Harvest Shakti", status: "active", metric: `Yield: ${serviceData.harvest.expectedYield}`, href: "/dashboard/harvest-shakti", color: CHART_COLORS.purple },
  { name: "MSP Mitra", status: "active", metric: `MSP: ₹${serviceData.market.wheatMSP}`, href: "/dashboard/msp-mitra", color: CHART_COLORS.primary },
  { name: "Kisan Credit", status: "active", metric: `Score: ${serviceData.credit.score}`, href: "/dashboard/kisan-credit", color: CHART_COLORS.teal },
  { name: "Mausam Chakra", status: "active", metric: `${serviceData.weather.currentTemp}°C`, href: "/dashboard/mausam-chakra", color: CHART_COLORS.indigo },
  { name: "Beej Suraksha", status: "active", metric: serviceData.seedVerification.status, href: "/dashboard/beej-suraksha", color: CHART_COLORS.pink },
  { name: "Harvest-to-Cart", status: "active", metric: `FPC: ${serviceData.supplyChain.nearestFPC}`, href: "/dashboard/harvest-to-cart", color: CHART_COLORS.orange },
  { name: "Kisaan Sahayak", status: "active", metric: "LLM Active", href: "/dashboard/kisaan-sahayak", color: CHART_COLORS.primary },
  { name: "Protein Eng.", status: "active", metric: "Analysis ready", href: "/dashboard/protein-engineering", color: CHART_COLORS.teal },
];

// Credit utilization pie chart
const creditPieData = [
  { name: "Utilized", value: serviceData.credit.utilized },
  { name: "Available", value: serviceData.credit.kccLimit - serviceData.credit.utilized },
];

// Action items
const actionItems = [
  { priority: "high", action: "Apply urea top-dressing (60 kg/ha) before 7 Mar", source: "Kisaan Sahayak" },
  { priority: "high", action: "Schedule flowering-stage irrigation for 5 Mar", source: "Jal Shakti" },
  { priority: "medium", action: "Monitor weather — light rain in 3 days may delay irrigation", source: "Mausam Chakra" },
  { priority: "medium", action: "Consider selling 40% wheat stock at Karnal Mandi (above MSP)", source: "MSP Mitra" },
  { priority: "low", action: "Apply foliar ZnSO4 spray if zinc deficiency symptoms appear", source: "SoilScan AI" },
  { priority: "low", action: "Renew KCC before 30 Apr for next season", source: "Kisan Credit" },
];

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function DigitalTwinPage() {
  // State for farmer selection
  const [selectedFarmerId, setSelectedFarmerId] = useState(DEMO_FARMERS[0].id);
  const selectedFarmer = DEMO_FARMERS.find((f) => f.id === selectedFarmerId) || DEMO_FARMERS[0];

  // State for live API data
  const [marketData, setMarketData] = useState<{
    msp: number;
    currentPrice: number;
    bestMandi: string;
    priceChange: string;
  } | null>(null);
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    forecast: string;
  } | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Fetch market data from MSP Mitra API
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoadingMarket(true);
      try {
        const res = await fetch(`${API_PREFIXES.mspMitra}/prices/wheat`);
        if (res.ok) {
          const data = await res.json();
          setMarketData({
            msp: data.msp || 2275,
            currentPrice: data.current_price || 2340,
            bestMandi: data.best_mandi || `${selectedFarmer.district} Mandi`,
            priceChange: data.price_change || "+2.8%",
          });
        } else {
          // Fallback to simulated data
          setMarketData({
            msp: 2275,
            currentPrice: 2340,
            bestMandi: `${selectedFarmer.district} Mandi`,
            priceChange: "+2.8%",
          });
        }
      } catch (error) {
        console.error("MSP API error:", error);
        // Fallback to simulated data
        setMarketData({
          msp: 2275,
          currentPrice: 2340,
          bestMandi: `${selectedFarmer.district} Mandi`,
          priceChange: "+2.8%",
        });
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchMarketData();
  }, [selectedFarmer.district]);

  // Fetch weather data from Mausam Chakra API
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const res = await fetch(
          `${API_PREFIXES.mausamChakra}/weather/current?lat=${selectedFarmer.lat}&lon=${selectedFarmer.lon}`
        );
        if (res.ok) {
          const data = await res.json();
          setWeatherData({
            temp: data.temperature || data.temp || 18.5,
            condition: data.condition || data.weather || "Partly Cloudy",
            humidity: data.humidity || 65,
            windSpeed: data.wind_speed || data.windSpeed || 12,
            forecast: data.forecast || "Good conditions for farming",
          });
        } else {
          // Fallback to simulated data based on location
          setWeatherData({
            temp: 18.5 + (Math.random() * 4 - 2),
            condition: "Partly Cloudy",
            humidity: 65,
            windSpeed: 12,
            forecast: "Light rain expected in 3 days",
          });
        }
      } catch (error) {
        console.error("Weather API error:", error);
        // Fallback
        setWeatherData({
          temp: 18.5,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          forecast: "Light rain expected in 3 days",
        });
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [selectedFarmer.lat, selectedFarmer.lon]);

  const overallScore = useMemo(() => {
    const scores = riskRadarData.map((d) => d.value);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, []);

  const handleExportPDF = () => {
    const profileHtml = `
      <h2>Farmer Profile</h2>
      <table>
        <tr><th>Field</th><th>Value</th></tr>
        <tr><td>Name</td><td>${selectedFarmer.name}</td></tr>
        <tr><td>Location</td><td>${selectedFarmer.village}, ${selectedFarmer.district}, ${selectedFarmer.state}</td></tr>
        <tr><td>Farmer ID</td><td>${selectedFarmer.farmerId}</td></tr>
        <tr><td>Land Holding</td><td>${selectedFarmer.landHolding}</td></tr>
        <tr><td>Primary Crops</td><td>${selectedFarmer.primaryCrops.join(", ")}</td></tr>
        <tr><td>Season</td><td>${selectedFarmer.season}</td></tr>
        <tr><td>Overall Health Score</td><td>${overallScore}/100</td></tr>
      </table>
      <h2>Soil Health</h2>
      <table>
        <tr><th>Parameter</th><th>Value</th></tr>
        <tr><td>pH</td><td>${serviceData.soilHealth.ph}</td></tr>
        <tr><td>Nitrogen</td><td>${serviceData.soilHealth.nitrogen} kg/ha</td></tr>
        <tr><td>Phosphorus</td><td>${serviceData.soilHealth.phosphorus} kg/ha</td></tr>
        <tr><td>Potassium</td><td>${serviceData.soilHealth.potassium} kg/ha</td></tr>
        <tr><td>Organic Carbon</td><td>${serviceData.soilHealth.organicCarbon}%</td></tr>
        <tr><td>Fertility</td><td>${serviceData.soilHealth.fertility}</td></tr>
      </table>
      <h2>Crop Status</h2>
      <table>
        <tr><th>Parameter</th><th>Value</th></tr>
        <tr><td>Current Crop</td><td>${serviceData.cropStatus.currentCrop} (${serviceData.cropStatus.variety})</td></tr>
        <tr><td>Growth Stage</td><td>${serviceData.cropStatus.growthStage}</td></tr>
        <tr><td>Health</td><td>${serviceData.cropStatus.healthStatus}</td></tr>
        <tr><td>Disease Risk</td><td>${serviceData.cropStatus.diseaseRisk}</td></tr>
        <tr><td>Next Action</td><td>${serviceData.cropStatus.nextAction}</td></tr>
      </table>
      <h2>Action Items</h2>
      <table>
        <tr><th>Priority</th><th>Action</th><th>Source</th></tr>
        ${actionItems.map((a) => `<tr><td><span class="badge badge-${a.priority === "high" ? "red" : a.priority === "medium" ? "yellow" : "green"}">${a.priority.toUpperCase()}</span></td><td>${a.action}</td><td>${a.source}</td></tr>`).join("")}
      </table>`;
    exportToPDF(`Digital Twin Report — ${selectedFarmer.name}`, profileHtml);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Demo Mode</p>
            <p className="text-sm text-amber-700">
              Showing simulated data for demonstration purposes. In production, this displays real-time data from IoT sensors, 
              government APIs (AgMarkNet, IMD), and service integrations. Weather and market data are fetched live when available.
            </p>
          </div>
        </div>
      </div>

      {/* Page header with Farmer Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              Farmer Digital Twin
            </h1>
            <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select Farmer" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_FARMERS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} - {f.village}, {f.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Unified view of {selectedFarmer.name}&apos;s farm &mdash; aggregating insights from all
            11 Annadata services into a single actionable dashboard.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportPDF} className="shrink-0">
          Export PDF Report
        </Button>
      </div>

      {/* Row 1: Farmer Profile + Overall Score + Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile card */}
        <Card className="sm:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-2xl font-bold text-[var(--color-primary)]">
                {selectedFarmer.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-lg">{selectedFarmer.name}</CardTitle>
                <CardDescription>
                  {selectedFarmer.village}, {selectedFarmer.district}, {selectedFarmer.state}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[var(--color-text-muted)]">Farmer ID</span>
                <p className="font-mono font-medium text-[var(--color-text)]">{selectedFarmer.farmerId}</p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Land Holding</span>
                <p className="font-medium text-[var(--color-text)]">{selectedFarmer.landHolding}</p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Crops</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {selectedFarmer.primaryCrops.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Season</span>
                <p className="font-medium text-[var(--color-text)]">{selectedFarmer.season}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall farm health score */}
        <StatCard
          label="Farm Health Score"
          value={`${overallScore}/100`}
          change="All dimensions assessed"
          changeType={overallScore >= 70 ? "positive" : overallScore >= 50 ? "neutral" : "negative"}
        />

        {/* Days to harvest */}
        <StatCard
          label="Days to Harvest"
          value={serviceData.harvest.daysToHarvest}
          change={`Yield forecast: ${serviceData.harvest.yieldForecast}`}
          changeType="positive"
        />
      </div>

      {/* Row 2: Risk Radar + Nutrient Profile + Weather + Market */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Risk radar */}
        <ChartWrapper title="Multi-Dimensional Risk Profile" subtitle="Scores across all farm dimensions (higher = better)">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={riskRadarData}>
              <PolarGrid stroke={CHART_DEFAULTS.gridStroke} />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: CHART_DEFAULTS.axisStroke }} />
              <Radar
                name="Score"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.25}
                animationDuration={CHART_DEFAULTS.animationDuration}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Soil nutrient profile */}
        <ChartWrapper title="Soil Nutrient Profile" subtitle={`Last tested: ${serviceData.soilHealth.lastTested} | pH: ${serviceData.soilHealth.ph}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutrientData} margin={CHART_DEFAULTS.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} />
              <XAxis dataKey="nutrient" tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }} />
              <YAxis tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_DEFAULTS.axisStroke }} />
              <Tooltip contentStyle={CHART_DEFAULTS.tooltipStyle} />
              <Bar dataKey="value" name="Actual" radius={[4, 4, 0, 0]} animationDuration={CHART_DEFAULTS.animationDuration}>
                {nutrientData.map((entry, i) => (
                  <Cell key={i} fill={entry.value >= entry.ideal * 0.8 ? CHART_COLORS.success : entry.value >= entry.ideal * 0.5 ? CHART_COLORS.warning : CHART_COLORS.error} />
                ))}
              </Bar>
              <Bar dataKey="ideal" name="Ideal" fill={CHART_COLORS.accent} fillOpacity={0.3} radius={[4, 4, 0, 0]} animationDuration={CHART_DEFAULTS.animationDuration} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Row 3: Crop status + Weather + Market + Credit */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current crop status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Crop Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Crop</span>
              <span className="font-medium text-[var(--color-text)]">{serviceData.cropStatus.currentCrop} ({serviceData.cropStatus.variety})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Stage</span>
              <span className="font-medium text-[var(--color-text)]">{serviceData.cropStatus.growthStage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Health</span>
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">{serviceData.cropStatus.healthStatus}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Disease Risk</span>
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">{serviceData.cropStatus.diseaseRisk}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Weather */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Weather Now</CardTitle>
              {!loadingWeather && weatherData && (
                <Badge variant="outline" className="text-[10px] border-green-400 text-green-600">Live</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {loadingWeather ? (
              <div className="space-y-2">
                <div className="h-8 w-20 animate-pulse rounded bg-[var(--color-border)]" />
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
              </div>
            ) : weatherData ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-[var(--color-text)]">{weatherData.temp.toFixed(1)}°C</span>
                  <span className="text-[var(--color-text-muted)]">{weatherData.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Humidity</span>
                  <span className="text-[var(--color-text)]">{weatherData.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Wind</span>
                  <span className="text-[var(--color-text)]">{weatherData.windSpeed} km/h</span>
                </div>
                <p className="text-xs text-[var(--color-warning)] mt-1">{weatherData.forecast}</p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Weather data unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Market */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Market Prices</CardTitle>
              {!loadingMarket && marketData && (
                <Badge variant="outline" className="text-[10px] border-green-400 text-green-600">Live</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {loadingMarket ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]" />
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
              </div>
            ) : marketData ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">MSP (Wheat)</span>
                  <span className="font-medium text-[var(--color-text)]">₹{marketData.msp}/qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Current</span>
                  <span className="font-medium text-green-600">₹{marketData.currentPrice}/qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Best Mandi</span>
                  <span className="text-[var(--color-text)]">{marketData.bestMandi}</span>
                </div>
                <p className="text-xs text-green-600">{marketData.priceChange} this week</p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Market data unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Credit score + KCC utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Credit & Finance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Credit Score</span>
              <span className="font-bold text-[var(--color-text)]">{serviceData.credit.score} ({serviceData.credit.grade})</span>
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={34}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={CHART_DEFAULTS.animationDuration}
                  >
                    <Cell fill={CHART_COLORS.primary} />
                    <Cell fill={CHART_DEFAULTS.gridStroke} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-[var(--color-text-muted)]">
              KCC: ₹{(serviceData.credit.utilized / 1000).toFixed(0)}K / ₹{(serviceData.credit.kccLimit / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Timeline + Action Items */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Farming lifecycle timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Farming Lifecycle Timeline</CardTitle>
            <CardDescription>Key events for {selectedFarmer.season}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative ml-3 border-l-2 border-[var(--color-border)] pl-6 space-y-4">
              {timelineEvents.map((evt, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2 ${
                      evt.status === "completed"
                        ? "border-green-500 bg-green-500"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]"
                    }`}
                  />
                  <div className="flex items-baseline gap-3">
                    <span className="min-w-[90px] text-xs font-mono text-[var(--color-text-muted)]">
                      {evt.date}
                    </span>
                    <span
                      className={`text-sm ${
                        evt.status === "completed"
                          ? "text-[var(--color-text-muted)]"
                          : "font-medium text-[var(--color-text)]"
                      }`}
                    >
                      {evt.event}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action items / recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items</CardTitle>
            <CardDescription>
              Recommendations aggregated from all services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      item.priority === "high"
                        ? "bg-red-500"
                        : item.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)]">{item.action}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Source: {item.source}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] ${
                      item.priority === "high"
                        ? "border-red-300 text-red-600"
                        : item.priority === "medium"
                          ? "border-amber-300 text-amber-600"
                          : "border-green-300 text-green-600"
                    }`}
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: All 11 service modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Modules</CardTitle>
          <CardDescription>
            Data flowing from all 11 Annadata microservices into this Digital Twin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {serviceModules.map((svc) => (
              <Link
                key={svc.name}
                href={svc.href}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: svc.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {svc.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{svc.metric}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] border-green-400 text-green-600">
                  {svc.status}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Row 6: Seed verification + Supply chain + Irrigation summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Seed Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Status</span>
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                {serviceData.seedVerification.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Lot ID</span>
              <span className="font-mono text-xs text-[var(--color-text)]">{serviceData.seedVerification.seedLot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Germination</span>
              <span className="text-[var(--color-text)]">{serviceData.seedVerification.germination}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Purity</span>
              <span className="text-[var(--color-text)]">{serviceData.seedVerification.purity}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Supply Chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Nearest FPC</span>
              <span className="text-[var(--color-text)]">{serviceData.supplyChain.nearestFPC}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Cold Storage</span>
              <span className="text-[var(--color-text)]">{serviceData.supplyChain.coldStorageKm} km away</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Storage Available</span>
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">Yes</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Active Orders</span>
              <span className="text-[var(--color-text)]">{serviceData.supplyChain.activeOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Irrigation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Next Scheduled</span>
              <span className="font-medium text-[var(--color-text)]">{serviceData.irrigation.nextScheduled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Method</span>
              <span className="text-[var(--color-text)]">{serviceData.irrigation.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Soil Moisture</span>
              <span className="text-[var(--color-text)]">{serviceData.irrigation.soilMoisture}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Efficiency</span>
              <span className="text-[var(--color-text)]">{serviceData.irrigation.efficiency}%</span>
            </div>
            {/* Efficiency bar */}
            <div className="mt-1 h-2 w-full rounded-full bg-[var(--color-border)]">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${serviceData.irrigation.efficiency}%`,
                  backgroundColor: serviceData.irrigation.efficiency >= 80 ? CHART_COLORS.success : serviceData.irrigation.efficiency >= 60 ? CHART_COLORS.warning : CHART_COLORS.error,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
