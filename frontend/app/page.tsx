import Link from "next/link";

const services = [
  {
    name: "MSP Mitra",
    description: "Price intelligence and market analytics for agricultural commodities",
    href: "/dashboard/msp-mitra",
    icon: "chart",
    color: "bg-emerald-500",
  },
  {
    name: "SoilScan AI",
    description: "AI-powered soil health analysis using satellite imagery",
    href: "/dashboard/soilscan",
    icon: "scan",
    color: "bg-amber-500",
  },
  {
    name: "Fasal Rakshak",
    description: "Crop disease detection and pest management recommendations",
    href: "/dashboard/fasal-rakshak",
    icon: "shield",
    color: "bg-red-500",
  },
  {
    name: "Jal Shakti",
    description: "Smart irrigation scheduling and water resource management",
    href: "/dashboard/jal-shakti",
    icon: "droplet",
    color: "bg-blue-500",
  },
  {
    name: "Harvest Shakti",
    description: "Harvest timing optimization and yield estimation DSS",
    href: "/dashboard/harvest-shakti",
    icon: "wheat",
    color: "bg-orange-500",
  },
  {
    name: "Kisaan Sahayak",
    description: "Multi-agent AI assistant for personalized farming guidance",
    href: "/dashboard/kisaan-sahayak",
    icon: "message",
    color: "bg-purple-500",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="text-[var(--color-primary)]">Annadata</span>{" "}
            <span className="text-[var(--color-text)]">OS</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--color-text-muted)]">
            Multi-service AI agriculture platform empowering Indian farmers with
            quantum-aware yield forecasting, market intelligence, soil analysis,
            crop protection, and smart irrigation.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              href="/auth"
              className="text-sm font-semibold leading-6 text-[var(--color-text)]"
            >
              Sign In <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12 text-[var(--color-text)]">
          Platform Services
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-all hover:border-[var(--color-primary)]"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${service.color} text-white text-sm font-bold mb-4`}
              >
                {service.name.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-[var(--color-border)] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Built with FastAPI + SQLAlchemy 2.0 + PostgreSQL + Redis + Celery |
            Next.js 16 + React 19 + TypeScript + Tailwind v4 | Docker Compose
          </p>
        </div>
      </section>
    </main>
  );
}
