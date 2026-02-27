import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SoilScanPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          SoilScan AI &mdash; Soil Health Analysis
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Upload soil images or satellite data to receive AI-driven soil health
          assessments, nutrient mapping, and amendment recommendations.
        </p>
      </div>

      {/* Upload section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Soil Data</CardTitle>
          <CardDescription>
            Drag and drop soil images or satellite tiles, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-background)] transition-colors hover:border-[var(--color-primary)]">
            <svg
              className="h-10 w-10 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16v-8m0 0-3 3m3-3 3 3M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
              />
            </svg>
            <p className="text-sm text-[var(--color-text-muted)]">
              Supported formats: JPEG, PNG, GeoTIFF
            </p>
            <Button size="sm" variant="outline">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Soil health score */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Soil Health Score</CardTitle>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Upload data to generate score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nutrient analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nutrient Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Organic Carbon", "pH Level"].map(
                (nutrient) => (
                  <li key={nutrient} className="flex justify-between">
                    <span>{nutrient}</span>
                    <span className="font-medium text-[var(--color-text)]">
                      --
                    </span>
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
            <CardDescription>
              AI-generated amendment suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Recommendations will appear after analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
