"use client";

import { useEffect, useMemo, useState } from "react";
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

type PlotResponse = {
  plot_id: string;
  farm_id: string;
  crop: string;
  area_hectares: number;
  soil_type: string;
  irrigation_method: string;
  current_moisture_pct: number;
  registered_at: string;
};

type ScheduleResponse = {
  schedule: { date: string; time: string; duration_minutes: number; water_volume_liters: number }[];
  efficiency_pct: number;
  generated_at: string;
};

type UsageResponse = {
  total_usage_liters: number;
  efficiency_score: number;
  savings_vs_flood_irrigation_pct: number;
};

type SensorResponse = {
  sensors: { sensor_id: string; type: string; value: number; unit: string; status: string }[];
  irrigation_active: boolean;
  last_updated: string;
};

type ValveStatusResponse = {
  valve_status: string;
  flow_rate_pct: number;
  battery_level_pct: number;
  last_action_timestamp: string;
  auto_decision_reason?: string | null;
};

export default function JalShaktiPage() {
  const [plotId, setPlotId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [sensors, setSensors] = useState<SensorResponse | null>(null);
  const [valve, setValve] = useState<ValveStatusResponse | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const res = await fetch(`${API_PREFIXES.jalShakti}/register-plot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            farm_id: "farm-001",
            crop: "wheat",
            area_hectares: 2.2,
            soil_type: "loam",
            irrigation_method: "drip",
            current_moisture_pct: 28,
            latitude: 28.61,
            longitude: 77.21,
          }),
        });
        if (!res.ok) return;
        const plot = (await res.json()) as PlotResponse;
        setPlotId(plot.plot_id);
      } catch {
        setPlotId(null);
      }
    };
    void setup();
  }, []);

  useEffect(() => {
    if (!plotId) return;
    const load = async () => {
      try {
        const [scheduleRes, usageRes, sensorRes, valveRes] = await Promise.all([
          fetch(`${API_PREFIXES.jalShakti}/schedule/${plotId}`),
          fetch(`${API_PREFIXES.jalShakti}/usage?farm_id=farm-001&days=30`),
          fetch(`${API_PREFIXES.jalShakti}/sensors/${plotId}`),
          fetch(`${API_PREFIXES.jalShakti}/iot/valve-status/${plotId}`),
        ]);
        if (scheduleRes.ok) setSchedule(await scheduleRes.json());
        if (usageRes.ok) setUsage(await usageRes.json());
        if (sensorRes.ok) setSensors(await sensorRes.json());
        if (valveRes.ok) setValve(await valveRes.json());
      } catch {
        setSchedule(null);
      }
    };
    void load();
  }, [plotId]);

  const scheduleDays = useMemo(() => schedule?.schedule?.slice(0, 7) || [], [schedule]);
  const efficiency = usage?.efficiency_score?.toFixed(1) ?? "--";
  const totalUsage = usage ? `${usage.total_usage_liters.toFixed(0)} L` : "--";
  const savings = usage ? `${usage.savings_vs_flood_irrigation_pct.toFixed(1)}%` : "--";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Jal Shakti &mdash; Water Management
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Smart irrigation scheduling, water-use analytics, and IoT sensor
          monitoring for optimal water management on your farm.
        </p>
      </div>

      {/* Irrigation schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Irrigation Schedule</CardTitle>
            <Badge>This Week</Badge>
          </div>
          <CardDescription>
            AI-optimised watering plan based on crop stage, soil moisture, and
            weather forecast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div
                key={day}
                className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
              >
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  {day}
                </span>
                <span className="text-lg font-semibold text-[var(--color-text)]">
                  {scheduleDays[index]
                    ? Math.round(scheduleDays[index].water_volume_liters)
                    : "--"}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  litres
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics + Sensor data */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Water usage analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Water Usage Analytics</CardTitle>
            <CardDescription>
              Consumption trends and efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Schedule generated at {schedule?.generated_at ? new Date(schedule.generated_at).toLocaleString() : "--"}
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
              <li className="flex justify-between">
                <span>Total Usage (This Month)</span>
                <span className="font-medium text-[var(--color-text)]">
                  {totalUsage}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Efficiency Score</span>
                <span className="font-medium text-[var(--color-text)]">
                  {efficiency}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Savings vs. Flood Irrigation</span>
                <span className="font-medium text-[var(--color-text)]">
                  {savings}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Sensor data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sensor Data</CardTitle>
              <Badge variant="outline">Live</Badge>
            </div>
            <CardDescription>
              Real-time readings from field IoT sensors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {sensors?.sensors?.length ? (
                sensors.sensors.slice(0, 5).map((sensor) => (
                  <li
                    key={sensor.sensor_id}
                    className="flex justify-between text-[var(--color-text-muted)]"
                  >
                    <span>{sensor.type}</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {sensor.value.toFixed(1)} {sensor.unit}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-[var(--color-text-muted)]">
                  No sensor data available
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Smart IoT and Optimization */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* IoT Smart Valve Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">IoT Smart Valve Control</CardTitle>
            <CardDescription>
              Remote control and monitoring of field irrigation valves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Send commands to open or close IoT-connected irrigation valves
              remotely. Monitor real-time valve status per plot including flow
              rate, duration, and last activity timestamp.
            </p>
            {valve ? (
              <div className="mt-3 text-sm text-[var(--color-text-muted)]">
                Status: {valve.valve_status} | Flow: {valve.flow_rate_pct}% | Battery:
                {" "}{valve.battery_level_pct}%
              </div>
            ) : null}
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Open/close valves with configurable flow rate and duration
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Real-time valve status polling per plot
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Tracks water consumption and last-active timestamps
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /iot/valve-control
              </code>
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                GET /iot/valve-status/&#123;plot_id&#125;
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Quantum Multi-Field Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Quantum Multi-Field Optimization
            </CardTitle>
            <CardDescription>
              Optimize water distribution across multiple fields simultaneously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Uses quantum-inspired optimization algorithms to compute the best
              water allocation strategy across all your plots, accounting for
              crop water needs, soil types, and available water budget.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Multi-objective optimization across fields and crops
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Accounts for water budget constraints and priority rankings
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Returns per-field allocation with predicted yield impact
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /quantum-optimize
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
