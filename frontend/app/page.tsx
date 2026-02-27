import Link from "next/link";

const services = [
  {
    name: "MSP Mitra",
    description:
      "Real-time Mandi price tracking, ML price forecasting, and route optimization to nearest mandis",
    href: "/dashboard/msp-mitra",
    color: "bg-emerald-500",
    tag: "Market Intelligence",
  },
  {
    name: "SoilScan AI",
    description:
      "Phone-based soil testing with AI-predicted pH, NPK levels, and fertilizer recommendations",
    href: "/dashboard/soilscan",
    color: "bg-amber-500",
    tag: "Soil Analysis",
  },
  {
    name: "Fasal Rakshak",
    description:
      "Leaf scan disease detection with 95%+ accuracy, remedy suggestions, and nearby pesticide shop prices",
    href: "/dashboard/fasal-rakshak",
    color: "bg-red-500",
    tag: "Crop Protection",
  },
  {
    name: "Jal Shakti",
    description:
      "Smart irrigation scheduling using weather data, soil moisture, and crop requirements with IoT integration",
    href: "/dashboard/jal-shakti",
    color: "bg-blue-500",
    tag: "Water Management",
  },
  {
    name: "Harvest Shakti",
    description:
      "Complete farming DSS with crop recommendation, fertilizer advisory, irrigation scheduling, and AI chatbot",
    href: "/dashboard/harvest-shakti",
    color: "bg-orange-500",
    tag: "Smart Farming",
  },
  {
    name: "Kisaan Sahayak",
    description:
      "Multi-agent AI system: vision, verifier, weather, market, and memory agents for comprehensive crop advisory",
    href: "/dashboard/kisaan-sahayak",
    color: "bg-purple-500",
    tag: "AI Assistant",
  },
  {
    name: "Protein Engineering",
    description:
      "AI-powered crop protein engineering with climate profiling, trait analysis, and yield projection",
    href: "/dashboard/protein-engineering",
    color: "bg-teal-500",
    tag: "Biotech",
  },
  {
    name: "Kisan Credit Score",
    description:
      "Farmer credit scoring based on yield history, land productivity, weather risk, and market diversification",
    href: "/dashboard/kisan-credit",
    color: "bg-indigo-500",
    tag: "Fintech",
  },
  {
    name: "Harvest-to-Cart",
    description:
      "Cold chain optimization, demand prediction, farmer-retailer connection, and logistics route planning",
    href: "/dashboard/harvest-to-cart",
    color: "bg-cyan-500",
    tag: "Supply Chain",
  },
  {
    name: "Beej Suraksha",
    description:
      "QR-based seed tracking, AI seed authenticity verification, and community fake-seed reporting",
    href: "/dashboard/beej-suraksha",
    color: "bg-lime-600",
    tag: "Seed Purity",
  },
  {
    name: "Mausam Chakra",
    description:
      "Hyper-local weather forecasts, IoT station data fusion, hour-by-hour predictions, and crop-specific advisories",
    href: "/dashboard/mausam-chakra",
    color: "bg-sky-500",
    tag: "Weather",
  },
];

const stats = [
  { label: "Services", value: "11" },
  { label: "ML Models", value: "15+" },
  { label: "Data Records", value: "1.1M+" },
  { label: "Quantum Strategies", value: "3" },
];

const teamMembers = [
  { name: "Pranav", role: "Quantum/AI" },
  { name: "Raman Mendiratta", role: "ML/Data Science" },
  { name: "Kritika", role: "Data Pipeline" },
  { name: "Kshitij", role: "Full-Stack" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[var(--color-primary)]/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm text-[var(--color-text-muted)]">
            11 AI-Powered Microservices for Agriculture
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="text-[var(--color-primary)]">Annadata</span>{" "}
            <span className="text-[var(--color-text)]">OS</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--color-text-muted)]">
            A multi-service AI agriculture platform empowering Indian farmers
            with quantum-aware yield forecasting, market intelligence, soil
            analysis, crop protection, smart irrigation, fintech credit scoring,
            cold chain optimization, seed verification, and hyper-local weather.
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

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
            >
              <p className="text-2xl font-bold text-[var(--color-primary)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-4 text-[var(--color-text)]">
          Platform Services
        </h2>
        <p className="text-center text-[var(--color-text-muted)] mb-12 max-w-2xl mx-auto">
          Each service runs as an independent FastAPI microservice with shared
          PostgreSQL, Redis, and Celery background workers.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-all hover:border-[var(--color-primary)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${service.color} text-white text-sm font-bold`}
                >
                  {service.name.charAt(0)}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-background)] px-2 py-0.5 rounded-full">
                  {service.tag}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-3">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="border-t border-[var(--color-border)] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold text-center mb-8 text-[var(--color-text)]">
            Team
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm">
                  {member.name.charAt(0)}
                </div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {member.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
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
