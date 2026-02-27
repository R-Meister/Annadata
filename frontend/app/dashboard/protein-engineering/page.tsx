import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProteinEngineeringPage() {
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
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Avg Temperature", value: "--", unit: "C" },
              { label: "Annual Rainfall", value: "--", unit: "mm" },
              { label: "Growing Season", value: "--", unit: "days" },
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
              {[
                { protein: "DREB2A", pdb: "3OGP", trait: "Drought" },
                { protein: "NPR1", pdb: "3ZGA", trait: "Disease" },
                { protein: "GW2", pdb: "5GML", trait: "Yield" },
                { protein: "Bt Cry1Ac", pdb: "4ARY", trait: "Pest" },
                { protein: "HSP101", pdb: "1KP8", trait: "Heat" },
              ].map((p) => (
                <li key={p.pdb} className="flex justify-between">
                  <span>
                    {p.protein} ({p.trait})
                  </span>
                  <span className="font-mono text-[var(--color-primary)]">
                    {p.pdb}
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
