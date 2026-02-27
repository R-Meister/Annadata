import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FasalRakshakPage() {
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
          <CardTitle className="text-base">Upload Crop Image</CardTitle>
          <CardDescription>
            Take a photo of the affected leaf, stem, or fruit and upload it for
            instant diagnosis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-background)] transition-colors hover:border-[var(--color-error)]">
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
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <p className="text-sm text-[var(--color-text-muted)]">
              Supported: JPEG, PNG &middot; Max 10 MB
            </p>
            <Button size="sm" variant="outline">
              Upload Image
            </Button>
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
              <Badge variant="outline">Awaiting Upload</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Disease classification will appear here
              </p>
            </div>
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
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Recommendations will appear after diagnosis
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alert summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alert Summary</CardTitle>
              <Badge variant="secondary">0 Alerts</Badge>
            </div>
            <CardDescription>
              Regional disease and pest alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                No active pest alerts in your region
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                No disease outbreaks reported nearby
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
