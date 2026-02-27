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

const crops = [
  "Tomato",
  "Potato",
  "Onion",
  "Apple",
  "Mango",
  "Banana",
  "Grape",
  "Orange",
] as const;

export default function HarvestToCartPage() {
  const [selectedCrop, setSelectedCrop] = useState<string>(crops[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Harvest-to-Cart &mdash; Cold Chain
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Cold chain optimization, demand prediction, farmer-retailer connection,
          and logistics route planning to reduce post-harvest losses.
        </p>
      </div>

      {/* Crop selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Crop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {crops.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={selectedCrop === c ? "default" : "outline"}
                onClick={() => setSelectedCrop(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cold Storage + Demand */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Nearest Cold Storage</CardTitle>
              <Badge variant="outline">Map</Badge>
            </div>
            <CardDescription>
              Cold storage facilities near your location sorted by distance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              {[
                { name: "Delhi Cold Chain Hub", dist: "12 km", cap: "500 MT" },
                { name: "Ghaziabad Storage", dist: "25 km", cap: "200 MT" },
                { name: "Noida Fresh Store", dist: "30 km", cap: "150 MT" },
              ].map((f) => (
                <li key={f.name} className="flex justify-between">
                  <span>{f.name}</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {f.dist} | {f.cap}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Demand Forecast &mdash; {selectedCrop}
            </CardTitle>
            <CardDescription>
              Predicted demand in major cities for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Demand chart will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Optimization + Buyer Matching */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Route Optimization</CardTitle>
            <CardDescription>
              Optimized delivery route with cost and freshness estimates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li className="flex justify-between">
                <span>Total Distance</span>
                <span className="font-medium text-[var(--color-text)]">-- km</span>
              </li>
              <li className="flex justify-between">
                <span>Estimated Time</span>
                <span className="font-medium text-[var(--color-text)]">-- hours</span>
              </li>
              <li className="flex justify-between">
                <span>Fuel Cost</span>
                <span className="font-medium text-[var(--color-text)]">-- INR</span>
              </li>
              <li className="flex justify-between">
                <span>Freshness Index</span>
                <span className="font-medium text-[var(--color-text)]">-- %</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matched Buyers</CardTitle>
            <CardDescription>
              Retailers and restaurants matched to your produce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              {[
                { name: "FreshMart Delhi", price: "-- /kg" },
                { name: "BigBasket", price: "-- /kg" },
                { name: "Reliance Fresh", price: "-- /kg" },
              ].map((buyer) => (
                <li key={buyer.name} className="flex justify-between">
                  <span>{buyer.name}</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {buyer.price}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Harvest Window */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Harvest Window &mdash; {selectedCrop}
          </CardTitle>
          <CardDescription>
            Optimal harvest timing and transport guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Shelf Life", value: "-- days" },
              { label: "Max Transport", value: "-- hours" },
              { label: "Storage Temp", value: "-- C" },
              { label: "Packaging", value: "--" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-center"
              >
                <p className="text-xs text-[var(--color-text-muted)]">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
