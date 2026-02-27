import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HarvestShaktiPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Harvest Shakti &mdash; Harvest DSS
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Decision support system for harvest planning — yield estimation,
          optimal harvest windows, and market-timing signals.
        </p>
      </div>

      {/* Yield estimation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yield Estimation</CardTitle>
            <Badge variant="outline">Current Season</Badge>
          </div>
          <CardDescription>
            ML-based yield prediction using remote sensing, weather, and
            historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Predicted Yield", value: "--", unit: "quintals/ha" },
              {
                label: "Confidence Interval",
                value: "--",
                unit: "quintals/ha",
              },
              { label: "vs. Last Season", value: "--", unit: "%" },
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

      {/* Harvest window + Market timing */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Harvest window */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Harvest Window Recommendation
            </CardTitle>
            <CardDescription>
              Optimal harvest dates considering crop maturity, weather, and
              logistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Harvest timeline will appear here
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex justify-between">
                  <span>Recommended Start</span>
                  <span className="font-medium text-[var(--color-text)]">
                    --
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Recommended End</span>
                  <span className="font-medium text-[var(--color-text)]">
                    --
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Weather Risk</span>
                  <span className="font-medium text-[var(--color-text)]">
                    --
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Market timing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Timing</CardTitle>
            <CardDescription>
              Price-driven sell-timing signals from MSP Mitra and mandi data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Price forecast chart will appear here
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex justify-between">
                  <span>Best Sell Window</span>
                  <span className="font-medium text-[var(--color-text)]">
                    --
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Expected Price</span>
                  <span className="font-medium text-[var(--color-text)]">
                    --
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Nearest Mandi</span>
                  <span className="font-medium text-[var(--color-text)]">
                    --
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
