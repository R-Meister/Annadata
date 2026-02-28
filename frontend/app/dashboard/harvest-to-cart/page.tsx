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
  const [route, setRoute] = useState<{
    total_distance_km: number;
    estimated_time_hours: number;
    fuel_cost_inr: number;
    freshness_index: number;
  } | null>(null);
  const [buyers, setBuyers] = useState<{ name: string; offered_price_per_kg: number }[]>([]);
  const [windowInfo, setWindowInfo] = useState<{ shelf_life_days: number; max_transport_hours: number; storage_temp_c: number; packaging: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [routeRes, buyersRes, windowRes] = await Promise.all([
          fetch(`${API_PREFIXES.harvestToCart}/logistics/optimize-route`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin_lat: 28.61,
              origin_lon: 77.21,
              destinations: [
                { lat: 28.7, lon: 77.1, demand_tonnes: 12 },
                { lat: 28.58, lon: 77.33, demand_tonnes: 9 },
              ],
              vehicle_capacity_tonnes: 12,
            }),
          }),
          fetch(`${API_PREFIXES.harvestToCart}/connect/farmer-retailer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              farmer_id: "farmer-001",
              crop_type: selectedCrop,
              quantity_tonnes: 8,
              quality_grade: "A",
              preferred_city: "Delhi",
            }),
          }),
          fetch(`${API_PREFIXES.harvestToCart}/harvest-window/${encodeURIComponent(selectedCrop)}`),
        ]);
        if (routeRes.ok) {
          const data = await routeRes.json();
          setRoute({
            total_distance_km: data.total_distance_km,
            estimated_time_hours: data.estimated_time_hours,
            fuel_cost_inr: data.fuel_cost_estimate_inr,
            freshness_index: data.freshness_index,
          });
        }
        if (buyersRes.ok) {
          const data = await buyersRes.json();
          setBuyers(data.matched_buyers ?? []);
        }
        if (windowRes.ok) {
          const data = await windowRes.json();
          setWindowInfo({
            shelf_life_days: data.shelf_life_days,
            max_transport_hours: data.max_transport_hours,
            storage_temp_c: data.recommended_storage_temp_c,
            packaging: data.packaging_type,
          });
        }
      } catch {
        setRoute(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [selectedCrop]);

  const buyersTop = useMemo(() => buyers.slice(0, 3), [buyers]);

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
                {loading ? "Fetching demand forecast..." : "Demand chart will appear here"}
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
                <span className="font-medium text-[var(--color-text)]">
                  {route ? `${route.total_distance_km} km` : "-- km"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Estimated Time</span>
                <span className="font-medium text-[var(--color-text)]">
                  {route ? `${route.estimated_time_hours} hours` : "-- hours"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Fuel Cost</span>
                <span className="font-medium text-[var(--color-text)]">
                  {route ? `₹${route.fuel_cost_inr}` : "-- INR"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Freshness Index</span>
                <span className="font-medium text-[var(--color-text)]">
                  {route ? `${Math.round(route.freshness_index * 100)}%` : "-- %"}
                </span>
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
              {buyersTop.length ? (
                buyersTop.map((buyer) => (
                  <li key={buyer.name} className="flex justify-between">
                    <span>{buyer.name}</span>
                    <span className="font-medium text-[var(--color-text)]">
                      ₹{buyer.offered_price_per_kg}/kg
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-[var(--color-text-muted)]">No buyers yet</li>
              )}
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
              {
                label: "Shelf Life",
                value: windowInfo ? `${windowInfo.shelf_life_days} days` : "-- days",
              },
              {
                label: "Max Transport",
                value: windowInfo
                  ? `${windowInfo.max_transport_hours} hours`
                  : "-- hours",
              },
              {
                label: "Storage Temp",
                value: windowInfo
                  ? `${windowInfo.storage_temp_c} C`
                  : "-- C",
              },
              { label: "Packaging", value: windowInfo?.packaging ?? "--" },
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
