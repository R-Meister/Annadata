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
import { API_PREFIXES } from "@/lib/utils";

export default function ProteinEngineeringPage() {
  const [region, setRegion] = useState("Punjab");
  const [climate, setClimate] = useState<any>(null);
  const [traits, setTraits] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [climateRes, traitsRes] = await Promise.all([
        fetch(`${API_PREFIXES.proteinEngineering}/climate/${encodeURIComponent(region)}`),
        fetch(`${API_PREFIXES.proteinEngineering}/protein-traits`),
      ]);
      if (climateRes.ok) setClimate(await climateRes.json());
      if (traitsRes.ok) {
        const data = await traitsRes.json();
        const list = Object.entries(data.traits ?? {}).map(([name, value]: any) => ({
          name,
          ...value,
        }));
        setTraits(list);
      }
    };
    void load();
  }, [region]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Protein Engineering &mdash; Biotech
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          AI-powered crop protein engineering with climate profiling, trait-to-protein
          mapping, yield projection, and resistant variety recommendations.
        </p>
      </div>

      {/* Climate Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Climate Profile</CardTitle>
            <Badge variant="outline">Regional</Badge>
          </div>
          <CardDescription>
            Climate analysis for crop protein engineering based on historical weather
            and soil data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">
              Region
            </label>
            <input
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Avg Temperature",
                value: climate?.avg_temperature?.toFixed?.(1) ?? "--",
                unit: "C",
              },
              {
                label: "Annual Rainfall",
                value: climate?.avg_rainfall?.toFixed?.(0) ?? "--",
                unit: "mm",
              },
              {
                label: "Growing Season",
                value: climate?.samples ?? "--",
                unit: "days",
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

      {/* Trait Engineering + Protein Map */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trait Engineering</CardTitle>
            <CardDescription>
              Select a desired crop trait to analyze protein targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Drought Tolerance", "Disease Resistance", "High Yield", "Pest Resistance", "Heat Tolerance"].map(
                (trait) => (
                  <div
                    key={trait}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
                  >
                    <span className="text-sm text-[var(--color-text)]">{trait}</span>
                    <Badge variant="outline">Analyze</Badge>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Protein Database</CardTitle>
            <CardDescription>
              PDB structures linked to agricultural traits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {(traits.length ? traits.slice(0, 5) : []).map((trait) => (
                <li key={trait.name} className="flex justify-between">
                  <span>
                    {trait.proteins?.[0] ?? trait.name} ({trait.name})
                  </span>
                  <span className="font-mono text-[var(--color-primary)]">
                    {trait.pdb_ids?.[0] ?? "--"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendations</CardTitle>
          <CardDescription>
            AI-generated crop variety recommendations based on climate and protein analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              Select a region and trait to generate recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
