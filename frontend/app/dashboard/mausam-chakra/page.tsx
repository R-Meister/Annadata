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
              { label: "Temperature", value: "--", unit: "C" },
              { label: "Humidity", value: "--", unit: "%" },
              { label: "Wind Speed", value: "--", unit: "km/h" },
              { label: "Rainfall", value: "--", unit: "mm" },
              { label: "UV Index", value: "--", unit: "" },
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
                Hourly forecast chart will appear here
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weather Alerts</CardTitle>
              <Badge variant="secondary">0 Active</Badge>
            </div>
            <CardDescription>
              IMD-style severe weather warnings for your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
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
                value: "--",
              },
              {
                label: "Spray Window",
                desc: "Optimal pesticide application time",
                value: "--",
              },
              {
                label: "Harvest Risk",
                desc: "Weather impact on harvest operations",
                value: "--",
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
            {[
              { id: "STN-001", loc: "Ludhiana", status: "Active" },
              { id: "STN-002", loc: "Amritsar", status: "Active" },
              { id: "STN-003", loc: "Nashik", status: "Maintenance" },
            ].map((stn) => (
              <li key={stn.id} className="flex justify-between">
                <span>
                  {stn.id} &mdash; {stn.loc}
                </span>
                <Badge
                  variant={stn.status === "Active" ? "default" : "secondary"}
                >
                  {stn.status}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
