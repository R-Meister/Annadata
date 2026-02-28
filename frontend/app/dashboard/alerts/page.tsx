"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  MessageCircle,
  Phone,
  Send,
  CloudSun,
  TrendingUp,
  Bug,
  Droplets,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface AlertType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  frequency: "Instant" | "Daily Digest" | "Weekly";
}

interface ChatMessage {
  id: number;
  text: string;
  time: string;
  incoming: boolean; // true = received by farmer, false = sent by farmer
  icon: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const INITIAL_ALERT_TYPES: AlertType[] = [
  {
    id: "price",
    name: "Price Alerts",
    description: "MSP & mandi price changes for your crops",
    icon: <TrendingUp className="h-4 w-4" />,
    enabled: true,
    frequency: "Instant",
  },
  {
    id: "weather",
    name: "Weather Warnings",
    description: "Severe weather forecasts for your district",
    icon: <CloudSun className="h-4 w-4" />,
    enabled: true,
    frequency: "Instant",
  },
  {
    id: "irrigation",
    name: "Irrigation Reminders",
    description: "Smart irrigation scheduling based on soil moisture",
    icon: <Droplets className="h-4 w-4" />,
    enabled: true,
    frequency: "Daily Digest",
  },
  {
    id: "disease",
    name: "Disease Alerts",
    description: "Crop disease risk warnings & treatment advice",
    icon: <Bug className="h-4 w-4" />,
    enabled: false,
    frequency: "Instant",
  },
  {
    id: "market",
    name: "Market Updates",
    description: "Best selling opportunities across mandis",
    icon: <TrendingUp className="h-4 w-4" />,
    enabled: true,
    frequency: "Weekly",
  },
  {
    id: "scheme",
    name: "Scheme Notifications",
    description: "Government scheme updates & disbursements",
    icon: <Bell className="h-4 w-4" />,
    enabled: false,
    frequency: "Daily Digest",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    text: "MSP Alert: Wheat price increased to \u20B92,275/qtl at Azadpur Mandi (+3.2%)",
    time: "9:15 AM",
    incoming: true,
    icon: <TrendingUp className="h-3 w-3" />,
  },
  {
    id: 2,
    text: "\u26A0\uFE0F Weather Warning: Heavy rainfall expected in your area tomorrow. Secure harvested crops.",
    time: "10:02 AM",
    incoming: true,
    icon: <CloudSun className="h-3 w-3" />,
  },
  {
    id: 3,
    text: "\uD83D\uDCA7 Irrigation Reminder: Soil moisture at 28%. Recommended: 30min irrigation for wheat field.",
    time: "11:30 AM",
    incoming: true,
    icon: <Droplets className="h-3 w-3" />,
  },
  {
    id: 4,
    text: "\uD83D\uDD34 Disease Alert: Early blight risk HIGH in your district. Apply Mancozeb 75 WP.",
    time: "1:45 PM",
    incoming: true,
    icon: <Bug className="h-3 w-3" />,
  },
  {
    id: 5,
    text: "\u2705 Scheme Update: PM-KISAN 16th installment of \u20B92,000 credited.",
    time: "3:10 PM",
    incoming: true,
    icon: <Bell className="h-3 w-3" />,
  },
  {
    id: 6,
    text: "\uD83D\uDCC8 Market: Best selling opportunity for tomatoes at Pune APMC \u2013 \u20B945/kg (peak price)",
    time: "4:30 PM",
    incoming: true,
    icon: <TrendingUp className="h-3 w-3" />,
  },
];

const TEST_MESSAGES: Record<string, string> = {
  price:
    "\uD83D\uDCC8 Price Alert: Cotton price surged to \u20B97,200/qtl at Nagpur Mandi (+5.1%). Consider selling.",
  weather:
    "\u26A0\uFE0F Weather Alert: Heatwave warning for next 3 days. Max temperature 44\u00B0C. Irrigate crops early morning.",
  irrigation:
    "\uD83D\uDCA7 Irrigation Alert: Soil moisture dropped to 22%. Immediate 45min irrigation recommended for rice paddy.",
  disease:
    "\uD83D\uDD34 Disease Alert: Brown plant-hopper infestation detected nearby. Apply Imidacloprid 17.8 SL immediately.",
  market:
    "\uD83D\uDCC8 Market Alert: Onion prices peaked at \u20B935/kg at Lasalgaon APMC. Best time to sell.",
  scheme:
    "\u2705 Scheme Alert: PM Fasal Bima Yojana claim of \u20B915,000 approved for Kharif 2025.",
};

const STATS = [
  { label: "Alerts Sent Today", value: "1,247", icon: <Send className="h-5 w-5" /> },
  { label: "Delivery Rate", value: "98.5%", icon: <CheckCircle className="h-5 w-5" /> },
  { label: "Avg Response Time", value: "4.2 min", icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Farmers Reached", value: "12,340", icon: <Phone className="h-5 w-5" /> },
  { label: "Most Popular", value: "Price Alerts (45%)", icon: <TrendingUp className="h-5 w-5" /> },
];

const STEPS = [
  { label: "Data Collection", icon: <Settings className="h-5 w-5" />, desc: "Sensors, APIs & satellite feeds" },
  { label: "AI Analysis", icon: <Bug className="h-5 w-5" />, desc: "ML models process real-time data" },
  { label: "Alert Generation", icon: <AlertTriangle className="h-5 w-5" />, desc: "Context-aware alert creation" },
  { label: "Multi-channel Delivery", icon: <Send className="h-5 w-5" />, desc: "SMS / WhatsApp / Push" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AlertsPage() {
  const [alertTypes, setAlertTypes] = useState<AlertType[]>(INITIAL_ALERT_TYPES);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [language, setLanguage] = useState<"Hindi" | "English">("Hindi");
  const [selectedTestType, setSelectedTestType] = useState("price");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleAlert = useCallback((id: string) => {
    setAlertTypes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  }, []);

  const changeFrequency = useCallback(
    (id: string, frequency: AlertType["frequency"]) => {
      setAlertTypes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, frequency } : a)),
      );
    },
    [],
  );

  const handleSavePreferences = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast("Preferences saved successfully!");
    }, 800);
  }, []);

  const handleSendTest = useCallback(() => {
    const text = TEST_MESSAGES[selectedTestType] ?? TEST_MESSAGES.price;
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newMsg: ChatMessage = {
      id: Date.now(),
      text,
      time,
      incoming: true,
      icon: <CheckCircle className="h-3 w-3" />,
    };

    setMessages((prev) => [...prev, newMsg]);
    setToast(`Test alert sent to ${phoneNumber}`);
  }, [selectedTestType, phoneNumber]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Toast notification ---- */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">{toast}</span>
        </div>
      )}

      {/* ---- Page header ---- */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
            <Bell className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              SMS &amp; WhatsApp Alert Simulation
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Configure and preview how Annadata OS notifications reach farmers
              (FR-2.4)
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  TOP SECTION: Config + Phone Preview                             */}
      {/* ================================================================ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ---------- LEFT: Alert Configuration Panel ---------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[var(--color-primary)]" />
              Alert Configuration
            </CardTitle>
            <CardDescription>
              Choose which alerts to receive, delivery frequency, and preferred
              language.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alert type toggles */}
            <div className="space-y-3">
              {alertTypes.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-[var(--color-border)]/30"
                >
                  {/* Icon + text */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        alert.enabled
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {alert.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {alert.name}
                      </p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Frequency selector */}
                  <select
                    value={alert.frequency}
                    onChange={(e) =>
                      changeFrequency(
                        alert.id,
                        e.target.value as AlertType["frequency"],
                      )
                    }
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  >
                    <option>Instant</option>
                    <option>Daily Digest</option>
                    <option>Weekly</option>
                  </select>

                  {/* Toggle switch */}
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={alert.enabled}
                      onChange={() => toggleAlert(alert.id)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-9 rounded-full bg-[var(--color-border)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>

            {/* Phone number & language */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                  <Phone className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                  Language Preference
                </label>
                <div className="flex gap-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                  {(["Hindi", "English"] as const).map((lang) => (
                    <label key={lang} className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        checked={language === lang}
                        onChange={() => setLanguage(lang)}
                        className="accent-[var(--color-primary)]"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button loading={saving} onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* ---------- RIGHT: Phone Mockup Preview ---------- */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Phone outer frame */}
            <div
              className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-gray-800 bg-gray-900 shadow-2xl"
              style={{ width: 320, height: 580 }}
            >
              {/* Notch */}
              <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900" />
              {/* Status bar */}
              <div className="relative z-10 flex items-center justify-between bg-gray-900 px-6 pt-2 pb-0.5 text-[10px] text-gray-400">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                  LTE
                </span>
              </div>

              {/* WhatsApp header */}
              <div className="flex items-center gap-2 bg-[#075E54] px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Annadata Alerts
                  </p>
                  <p className="text-[10px] text-green-200">online</p>
                </div>
                <div className="ml-auto flex items-center gap-3 text-white/70">
                  <Phone className="h-3.5 w-3.5" />
                  <Settings className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Chat area */}
              <div
                className="flex flex-col gap-2 overflow-y-auto px-3 py-3"
                style={{
                  height: "calc(100% - 100px)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                  backgroundColor: "#ECE5DD",
                }}
              >
                {/* Date chip */}
                <div className="flex justify-center">
                  <span className="rounded-md bg-white/80 px-3 py-0.5 text-[10px] text-gray-500 shadow-sm">
                    Today
                  </span>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.incoming ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-lg px-2.5 py-1.5 shadow-sm ${
                        msg.incoming
                          ? "rounded-tl-none bg-white text-gray-800"
                          : "rounded-tr-none bg-[#DCF8C6] text-gray-800"
                      }`}
                    >
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <span className="text-[9px] text-gray-400">
                          {msg.time}
                        </span>
                        {/* Checkmarks */}
                        <svg
                          className="h-3 w-3 text-[#53BDEB]"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M1.5 8.5l3 3 7-7M5.5 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-[#F0F0F0] px-2 py-1.5">
                <div className="flex flex-1 items-center rounded-full bg-white px-3 py-1.5">
                  <span className="text-[11px] text-gray-400">
                    Type a message...
                  </span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#075E54]">
                  <Send className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Side buttons */}
            <div className="absolute -left-[5px] top-24 h-8 w-[3px] rounded-l bg-gray-700" />
            <div className="absolute -left-[5px] top-36 h-14 w-[3px] rounded-l bg-gray-700" />
            <div className="absolute -left-[5px] top-52 h-14 w-[3px] rounded-l bg-gray-700" />
            <div className="absolute -right-[5px] top-32 h-16 w-[3px] rounded-r bg-gray-700" />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  SEND TEST ALERT                                                 */}
      {/* ================================================================ */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-[var(--color-primary)]" />
            Send Test Alert
          </CardTitle>
          <CardDescription>
            Send a simulated alert to preview delivery on the phone mockup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                Alert Type
              </label>
              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="price">Price Alert</option>
                <option value="weather">Weather Warning</option>
                <option value="irrigation">Irrigation Reminder</option>
                <option value="disease">Disease Alert</option>
                <option value="market">Market Update</option>
                <option value="scheme">Scheme Notification</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                Destination
              </label>
              <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                <Phone className="h-4 w-4" />
                {phoneNumber}
              </div>
            </div>

            <Button onClick={handleSendTest} className="gap-2">
              <Send className="h-4 w-4" />
              Send Test Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/*  ALERT STATISTICS                                                */}
      {/* ================================================================ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================================================================ */}
      {/*  HOW IT WORKS — Stepper                                          */}
      {/* ================================================================ */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--color-primary)]" />
            How It Works
          </CardTitle>
          <CardDescription>
            End-to-end flow from data ingestion to farmer notification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-0 sm:flex-row sm:items-center sm:gap-0">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center">
                {/* Step card */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {step.icon}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {step.label}
                  </p>
                  <p className="mt-0.5 max-w-[140px] text-[11px] leading-tight text-[var(--color-text-muted)]">
                    {step.desc}
                  </p>
                </div>

                {/* Connector arrow */}
                {i < STEPS.length - 1 && (
                  <div className="mx-3 hidden h-0.5 w-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/30 sm:block" />
                )}
                {i < STEPS.length - 1 && (
                  <div className="my-2 ml-6 h-8 w-0.5 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)]/30 sm:hidden" />
                )}
              </div>
            ))}
          </div>

          {/* Channel badges */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Delivery Channels:
            </span>
            <Badge>
              <MessageCircle className="mr-1 h-3 w-3" /> WhatsApp
            </Badge>
            <Badge variant="secondary">
              <Phone className="mr-1 h-3 w-3" /> SMS
            </Badge>
            <Badge variant="outline">
              <Bell className="mr-1 h-3 w-3" /> Push Notification
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
