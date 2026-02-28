"use client";

import { useMemo, useState } from "react";
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

type DetectionResponse = {
  detection_id: string;
  status: string;
  crop: string;
  disease_detected: boolean;
  top_matches: {
    name: string;
    scientific_name: string;
    confidence: number;
    matched_symptoms: string[];
    severity_assessment: string;
    treatment: { chemical: string; organic: string; preventive: string };
  }[];
  environmental_note?: string | null;
  detected_at: string;
};

type AlertsResponse = {
  region: string;
  season: string;
  current_month: string;
  alerts: {
    alert_id: string;
    severity: string;
    crop: string;
    disease_name: string;
    risk_score: number;
    advisory: string;
    issued_at: string;
  }[];
};

export default function FasalRakshakPage() {
  const [crop, setCrop] = useState("wheat");
  const [region, setRegion] = useState("punjab");
  const [symptoms, setSymptoms] = useState("yellowing leaves, brown spots");
  const [temperature, setTemperature] = useState("28");
  const [humidity, setHumidity] = useState("78");
  const [detection, setDetection] = useState<DetectionResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const topMatch = detection?.top_matches?.[0];
  const alertCount = alerts?.alerts?.length ?? 0;

  const badgeLabel = useMemo(() => {
    if (!detection) return "Awaiting Upload";
    return detection.disease_detected ? "Detected" : "No Disease";
  }, [detection]);

  async function runDetection() {
    setStatus("loading");
    try {
      const res = await fetch(`${API_PREFIXES.fasalRakshak}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          symptoms: symptoms
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          temperature_celsius: Number(temperature),
          humidity_pct: Number(humidity),
          region,
          growth_stage: "vegetative",
        }),
      });
      if (!res.ok) throw new Error("Detection failed");
      const data = (await res.json()) as DetectionResponse;
      setDetection(data);

      const alertRes = await fetch(
        `${API_PREFIXES.fasalRakshak}/alerts?region=${encodeURIComponent(region)}&crop=${encodeURIComponent(crop)}`,
      );
      if (alertRes.ok) {
        const alertData = (await alertRes.json()) as AlertsResponse;
        setAlerts(alertData);
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Fasal Rakshak &mdash; Crop Protection
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Upload crop images for AI-powered disease detection, pest
          identification, and integrated management recommendations.
        </p>
      </div>

      {/* Image upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Crop Diagnostics</CardTitle>
          <CardDescription>
            Enter crop details and symptoms to generate an AI diagnosis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                Crop
              </label>
              <input
                value={crop}
                onChange={(event) => setCrop(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                Region
              </label>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                Temperature (C)
              </label>
              <input
                value={temperature}
                onChange={(event) => setTemperature(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                Humidity (%)
              </label>
              <input
                value={humidity}
                onChange={(event) => setHumidity(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                Symptoms (comma separated)
              </label>
              <input
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={runDetection} disabled={status === "loading"}>
              {status === "loading" ? "Analyzing..." : "Run Diagnosis"}
            </Button>
            {status === "error" ? (
              <span className="text-sm text-[var(--color-error)]">
                Failed to fetch detection.
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Results row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Detection result */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Detection Result</CardTitle>
              <Badge variant={detection ? "default" : "outline"}>{badgeLabel}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {topMatch ? (
              <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <div className="text-lg font-semibold text-[var(--color-text)]">
                  {topMatch.name}
                </div>
                <div>Confidence: {(topMatch.confidence * 100).toFixed(1)}%</div>
                <div>Severity: {topMatch.severity_assessment}</div>
                <div className="text-xs">Detected at {detection?.detected_at}</div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Disease classification will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
            <CardDescription>
              Treatment and preventive measures
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topMatch ? (
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>
                  <span className="font-medium text-[var(--color-text)]">
                    Chemical:
                  </span>{" "}
                  {topMatch.treatment.chemical}
                </li>
                <li>
                  <span className="font-medium text-[var(--color-text)]">
                    Organic:
                  </span>{" "}
                  {topMatch.treatment.organic}
                </li>
                <li>
                  <span className="font-medium text-[var(--color-text)]">
                    Preventive:
                  </span>{" "}
                  {topMatch.treatment.preventive}
                </li>
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Recommendations will appear after diagnosis
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alert Summary</CardTitle>
              <Badge variant={alertCount > 0 ? "default" : "secondary"}>
                {alertCount} Alerts
              </Badge>
            </div>
            <CardDescription>
              Regional disease and pest alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {alerts?.alerts?.length ? (
                alerts.alerts.slice(0, 2).map((alert) => (
                  <li key={alert.alert_id} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                    {alert.disease_name} ({alert.severity})
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    No active pest alerts in your region
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    No disease outbreaks reported nearby
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Extended Services */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Nearby Pesticide Shops */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nearby Pesticide Shops</CardTitle>
            <CardDescription>
              Locate verified pesticide retailers near your farm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Find the nearest authorized pesticide dealers based on your
              location. Results include shop name, distance, available products,
              and contact information for quick procurement.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                GPS-based proximity search for pesticide retailers
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Filters by product availability and certification status
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Returns distance, ratings, and contact details
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /nearby-shops
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Protein Engineering Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Protein Engineering Integration
            </CardTitle>
            <CardDescription>
              Bio-engineered protein-based pest control solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Access protein engineering data to explore bio-pesticide
              alternatives. Links detected pathogens to engineered protein
              sequences that can act as targeted biological control agents.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Maps detected diseases to candidate bio-control proteins
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Provides protein structure and efficacy predictions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Sustainable alternative to chemical pesticides
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /protein-engineering-link
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
