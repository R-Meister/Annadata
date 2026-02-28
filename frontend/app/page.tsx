"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguageStore } from "@/store/language-store";
import { Languages } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Data
   ------------------------------------------------------------------ */

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
  { label: "stat.services", value: 11, suffix: "", display: "11" },
  { label: "stat.models", value: 15, suffix: "+", display: "15+" },
  { label: "stat.records", value: 1.1, suffix: "M+", display: "1.1M+" },
  { label: "stat.quantum", value: 3, suffix: "", display: "3" },
];

const teamMembers = [
  { name: "Pranav", role: "Quantum/AI" },
  { name: "Raman Mendiratta", role: "ML/Data Science" },
  { name: "Kritika", role: "Data Pipeline" },
  { name: "Kshitij", role: "Full-Stack" },
];

/* ------------------------------------------------------------------
   Animated Counter Hook
   ------------------------------------------------------------------ */

function useAnimatedCounter(
  target: number,
  duration: number = 2000,
  trigger: boolean = false,
) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    let raf: number;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);

  return current;
}

/* ------------------------------------------------------------------
   Stat Counter Component
   ------------------------------------------------------------------ */

function StatCounter({
  target,
  suffix,
  label,
  isDecimal,
}: {
  target: number;
  suffix: string;
  label: string;
  isDecimal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const animated = useAnimatedCounter(target, 2000, visible);
  const display = isDecimal ? animated.toFixed(1) : Math.floor(animated).toString();

  return (
    <div
      ref={ref}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
    >
      <p className="text-2xl font-bold text-[var(--color-primary)]">
        {display}
        {suffix}
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------
   Landing Page
   ------------------------------------------------------------------ */

export default function HomePage() {
  const mainRef = useRef<HTMLElement>(null);
  const { language, setLanguage, t } = useLanguageStore();

  useEffect(() => {
    if (!mainRef.current) return;

    const ctx = gsap.context(() => {
      // Hero section — fade in + slide up
      gsap.from("[data-animate='hero-badge']", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from("[data-animate='hero-title']", {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from("[data-animate='hero-desc']", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
      });

      gsap.from("[data-animate='hero-cta']", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.6,
        ease: "power3.out",
      });

      // Stats — scroll triggered stagger
      gsap.from("[data-animate='stat']", {
        scrollTrigger: {
          trigger: "[data-section='stats']",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });

      // Services section title
      gsap.from("[data-animate='services-header']", {
        scrollTrigger: {
          trigger: "[data-section='services']",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      });

      // Service cards — staggered reveal
      gsap.from("[data-animate='service-card']", {
        scrollTrigger: {
          trigger: "[data-section='services']",
          start: "top 75%",
          once: true,
        },
        opacity: 0,
        y: 50,
        stagger: 0.06,
        duration: 0.5,
        ease: "power2.out",
      });

      // Team section
      gsap.from("[data-animate='team-header']", {
        scrollTrigger: {
          trigger: "[data-section='team']",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from("[data-animate='team-card']", {
        scrollTrigger: {
          trigger: "[data-section='team']",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(1.5)",
      });

      // Tech stack
      gsap.from("[data-animate='tech']", {
        scrollTrigger: {
          trigger: "[data-section='tech']",
          start: "top 90%",
          once: true,
        },
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={mainRef} className="min-h-screen bg-[var(--color-background)]">
      {/* Language toggle (floating, top-right) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] shadow-md hover:shadow-lg transition-all hover:bg-[var(--color-border)]"
          title={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
        >
          <Languages className="h-4 w-4" />
          <span>{language === "en" ? "हिन्दी" : "English"}</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[var(--color-primary)]/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div
            data-animate="hero-badge"
            className="mb-4 inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm text-[var(--color-text-muted)]"
          >
            {t("landing.badge")}
          </div>
          <h1 data-animate="hero-title" className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="text-[var(--color-primary)]">Annadata</span>{" "}
            <span className="text-[var(--color-text)]">OS</span>
          </h1>
          <p data-animate="hero-desc" className="mt-6 text-lg leading-8 text-[var(--color-text-muted)]">
            {t("landing.tagline")}
          </p>
          <div data-animate="hero-cta" className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              {t("landing.cta")}
            </Link>
            <Link
              href="/auth"
              className="text-sm font-semibold leading-6 text-[var(--color-text)]"
            >
              {t("landing.signin")} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section data-section="stats" className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} data-animate="stat">
              <StatCounter
                target={stat.value}
                suffix={stat.suffix}
                label={t(stat.label as "stat.services" | "stat.models" | "stat.records" | "stat.quantum")}
                isDecimal={stat.value % 1 !== 0}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section data-section="services" className="mx-auto max-w-7xl px-6 pb-24">
        <div data-animate="services-header">
          <h2 className="text-2xl font-bold text-center mb-4 text-[var(--color-text)]">
            {t("landing.services")}
          </h2>
          <p className="text-center text-[var(--color-text-muted)] mb-12 max-w-2xl mx-auto">
            {t("landing.servicesDesc")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              data-animate="service-card"
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
      <section data-section="team" className="border-t border-[var(--color-border)] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 data-animate="team-header" className="text-xl font-bold text-center mb-8 text-[var(--color-text)]">
            {t("landing.team")}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                data-animate="team-card"
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
      <section data-section="tech" className="border-t border-[var(--color-border)] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p data-animate="tech" className="text-sm text-[var(--color-text-muted)]">
            {t("landing.tech")}
          </p>
        </div>
      </section>
    </main>
  );
}
