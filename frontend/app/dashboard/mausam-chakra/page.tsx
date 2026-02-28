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

const villages = [
  { code: "PB-LDH-01", name: "Ludhiana, Punjab" },
  { code: "MH-NSK-01", name: "Nashik, Maharashtra" },
  { code: "UP-LKO-01", name: "Lucknow, UP" },
  { code: "KA-MYS-01", name: "Mysuru, Karnataka" },
  { code: "RJ-JPR-01", name: "Jaipur, Rajasthan" },
  { code: "TN-MDU-01", name: "Madurai, Tamil Nadu" },
] as const;

type Village = (typeof villages)[number];

export default function MausamChakraPage() {
  const [selectedVillage, setSelectedVillage] = useState<Village>(villages[0]);
  const [current, setCurrent] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [advisory, setAdvisory] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [currentRes, forecastRes, alertsRes, advisoryRes, stationsRes] = await Promise.all([
          fetch(`${API_PREFIXES.mausamChakra}/weather/current/${selectedVillage.code}`),
          fetch(`${API_PREFIXES.mausamChakra}/weather/forecast/${selectedVillage.code}?hours=24`),
          fetch(`${API_PREFIXES.mausamChakra}/weather/alerts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              state: selectedVillage.name.split(", ")[1] ?? "Punjab",
              district: selectedVillage.name.split(", ")[0],
              village_code: selectedVillage.code,
            }),
          }),
          fetch(`${API_PREFIXES.mausamChakra}/advisory/agricultural`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              village_code: selectedVillage.code,
              crop_type: "wheat",
              growth_stage: "vegetative",
            }),
          }),
          fetch(`${API_PREFIXES.mausamChakra}/iot/stations?active_only=true`),
        ]);
        if (currentRes.ok) setCurrent(await currentRes.json());
        if (forecastRes.ok) {
          const data = await forecastRes.json();
          setForecast(data.forecasts ?? []);
        }
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data.active_alerts ?? []);
        }
        if (advisoryRes.ok) setAdvisory(await advisoryRes.json());
        if (stationsRes.ok) {
          const data = await stationsRes.json();
          setStations(data.stations ?? []);
        }
      } catch {
        setCurrent(null);
      }
    };
    void load();
  }, [selectedVillage]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Mausam Chakra &mdash; Hyper-Local Weather
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Field-level weather forecasts with IoT station data fusion, hour-by-hour
          predictions, severe weather alerts, and crop-specific advisories.
        </p>
      </div>

      {/* Village selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Village</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {villages.map((v) => (
              <Button
                key={v.code}
                size="sm"
                variant={
                  selectedVillage.code === v.code ? "default" : "outline"
                }
                onClick={() => setSelectedVillage(v)}
              >
                {v.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Weather */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Current Weather &mdash; {selectedVillage.name}
            </CardTitle>
            <Badge>Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              {
                label: "Temperature",
                value: current?.temperature_c ?? "--",
                unit: "C",
              },
              {
                label: "Humidity",
                value: current?.humidity_pct ?? "--",
                unit: "%",
              },
              {
                label: "Wind Speed",
                value: current?.wind_speed_kmh ?? "--",
                unit: "km/h",
              },
              {
                label: "Rainfall",
                value: current?.rainfall_mm ?? "--",
                unit: "mm",
              },
              { label: "UV Index", value: current?.uv_index ?? "--", unit: "" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
              >
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.label}
                </span>
                <span className="mt-1 text-xl font-bold text-[var(--color-text)]">
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

      {/* Hourly Forecast + Alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">24-Hour Forecast</CardTitle>
            <CardDescription>
              Hour-by-hour temperature and rain probability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                {forecast.length
                  ? `Next hour: ${forecast[0].temperature_c} C, ${forecast[0].conditions}`
                  : "Hourly forecast chart will appear here"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weather Alerts</CardTitle>
              <Badge variant={alerts.length ? "default" : "secondary"}>
                {alerts.length} Active
              </Badge>
            </div>
            <CardDescription>
              IMD-style severe weather warnings for your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {alerts.length ? (
                alerts.slice(0, 3).map((alert, index) => (
                  <li key={`${alert.alert_type}-${index}`} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                    {alert.alert_type}: {alert.severity}
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    No active severe weather alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    No hailstorm warnings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    No frost warnings
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Agricultural Advisory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agricultural Advisory</CardTitle>
          <CardDescription>
            Weather-based farming recommendations for your crop and growth stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Irrigation",
                desc: "Based on rain forecast and soil moisture",
                value: advisory?.irrigation_recommendation ?? "--",
              },
              {
                label: "Spray Window",
                desc: "Optimal pesticide application time",
                value: advisory?.spray_window ?? "--",
              },
              {
                label: "Harvest Risk",
                desc: "Weather impact on harvest operations",
                value: advisory?.harvest_risk ?? "--",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {item.label}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {item.desc}
                </p>
                <p className="mt-2 text-lg font-bold text-[var(--color-primary)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IoT Stations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">IoT Weather Stations</CardTitle>
            <Badge variant="outline">Network</Badge>
          </div>
          <CardDescription>
            Registered field-level weather monitoring stations
          </CardDescription>
        </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              {stations.length ? (
                stations.slice(0, 3).map((stn) => (
                  <li key={stn.station_id} className="flex justify-between">
                    <span>
                      {stn.station_id} &mdash; {stn.district}
                    </span>
                    <Badge variant={stn.status === "active" ? "default" : "secondary"}>
                      {stn.status}
                    </Badge>
                  </li>
                ))
              ) : (
                <li className="text-[var(--color-text-muted)]">
                  No stations registered
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}
