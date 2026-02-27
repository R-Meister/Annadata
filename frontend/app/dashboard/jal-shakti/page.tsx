import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JalShaktiPage() {
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
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
              >
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  {day}
                </span>
                <span className="text-lg font-semibold text-[var(--color-text)]">
                  --
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
                Usage chart will appear here
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
              <li className="flex justify-between">
                <span>Total Usage (This Month)</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
                </span>
              </li>
              <li className="flex justify-between">
                <span>Efficiency Score</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
                </span>
              </li>
              <li className="flex justify-between">
                <span>Savings vs. Flood Irrigation</span>
                <span className="font-medium text-[var(--color-text)]">
                  --
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
              {[
                { label: "Soil Moisture (0–30 cm)", unit: "%" },
                { label: "Soil Moisture (30–60 cm)", unit: "%" },
                { label: "Air Temperature", unit: "°C" },
                { label: "Humidity", unit: "%" },
                { label: "Rainfall (last 24h)", unit: "mm" },
              ].map((sensor) => (
                <li
                  key={sensor.label}
                  className="flex justify-between text-[var(--color-text-muted)]"
                >
                  <span>{sensor.label}</span>
                  <span className="font-medium text-[var(--color-text)]">
                    -- {sensor.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
