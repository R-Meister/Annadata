import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------
   Service catalogue - static data for the overview grid
   ------------------------------------------------------------------ */

const services = [
  {
    name: "MSP Mitra",
    href: "/dashboard/msp-mitra",
    description:
      "Price intelligence and MSP analysis for agricultural commodities across Indian markets.",
    borderColor: "border-l-green-600",
  },
  {
    name: "SoilScan AI",
    href: "/dashboard/soilscan",
    description:
      "AI-powered soil health analysis with nutrient mapping and fertilizer recommendations.",
    borderColor: "border-l-amber-500",
  },
  {
    name: "Fasal Rakshak",
    href: "/dashboard/fasal-rakshak",
    description:
      "Crop disease detection, pest management, and integrated remedy recommendations.",
    borderColor: "border-l-red-500",
  },
  {
    name: "Jal Shakti",
    href: "/dashboard/jal-shakti",
    description:
      "Smart irrigation scheduling and water-use analytics powered by IoT sensor data.",
    borderColor: "border-l-sky-500",
  },
  {
    name: "Harvest Shakti",
    href: "/dashboard/harvest-shakti",
    description:
      "Harvest decision support with yield estimation, crop recommendation, and AI chatbot.",
    borderColor: "border-l-purple-500",
  },
  {
    name: "Kisaan Sahayak",
    href: "/dashboard/kisaan-sahayak",
    description:
      "Multi-agent AI assistant with vision, verifier, weather, market, and memory agents.",
    borderColor: "border-l-orange-500",
  },
  {
    name: "Protein Engineering",
    href: "/dashboard/protein-engineering",
    description:
      "AI-powered crop protein engineering with climate profiling and trait analysis.",
    borderColor: "border-l-teal-500",
  },
  {
    name: "Kisan Credit Score",
    href: "/dashboard/kisan-credit",
    description:
      "Farmer credit scoring based on yields, land productivity, weather risk, and market diversification.",
    borderColor: "border-l-indigo-500",
  },
  {
    name: "Harvest-to-Cart",
    href: "/dashboard/harvest-to-cart",
    description:
      "Cold chain optimization, demand prediction, and farmer-retailer logistics.",
    borderColor: "border-l-cyan-500",
  },
  {
    name: "Beej Suraksha",
    href: "/dashboard/beej-suraksha",
    description:
      "QR-based seed tracking, AI seed authenticity verification, and community reporting.",
    borderColor: "border-l-lime-500",
  },
  {
    name: "Mausam Chakra",
    href: "/dashboard/mausam-chakra",
    description:
      "Hyper-local hour-by-hour weather forecasts with IoT station data fusion and crop advisories.",
    borderColor: "border-l-sky-400",
  },
] as const;

const quickStats = [
  { label: "Active Services", value: "11" },
  { label: "Data Records", value: "1.1M+" },
  { label: "ML Models", value: "15+" },
  { label: "Quantum Strategies", value: "3" },
] as const;

const recentActivity = [
  "MSP Mitra model retrained on latest Agmarknet data",
  "SoilScan AI processed 12 new satellite tiles for Maharashtra",
  "Fasal Rakshak detected early blight in Nashik district",
  "Jal Shakti sensors calibrated for Rabi season",
  "Harvest Shakti yield model updated for wheat",
  "Kisan Credit scored 150 farmers in Punjab cooperative",
  "Harvest-to-Cart optimized 8 cold chain routes in UP",
  "Beej Suraksha flagged counterfeit seed batch in MP",
  "Mausam Chakra issued hailstorm alert for Nashik",
  "Protein Engineering completed trait analysis for drought resistance",
] as const;

/* ------------------------------------------------------------------
   Dashboard Page (Server Component)
   ------------------------------------------------------------------ */

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Platform overview and service status
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wide">
                {stat.label}
              </CardDescription>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {stat.value}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Service status grid */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Services
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Link key={svc.href} href={svc.href} className="group">
              <Card
                className={`border-l-4 ${svc.borderColor} transition-shadow group-hover:shadow-md`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{svc.name}</CardTitle>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <CardDescription>{svc.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Recent Activity
        </h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {recentActivity.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
