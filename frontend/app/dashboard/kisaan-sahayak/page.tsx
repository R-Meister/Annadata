"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const quickActions = [
  "Ask about schemes",
  "Get crop calendar",
  "Check weather",
] as const;

export default function KisaanSahayakPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    // TODO: call Kisaan Sahayak API and push assistant response
  }

  function handleQuickAction(action: string) {
    setMessages((prev) => [...prev, { role: "user", content: action }]);
    // TODO: call Kisaan Sahayak API
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Kisaan Sahayak &mdash; AI Assistant
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Your multilingual AI farming assistant — ask about government schemes,
          crop calendars, weather advisories, and more.
        </p>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Chat area */}
        <Card className="flex flex-col">
          <CardHeader className="border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Chat</CardTitle>
              <Badge variant="outline">Online</Badge>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto pt-4">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 text-center">
                <svg
                  className="h-12 w-12 text-[var(--color-text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
                  />
                </svg>
                <p className="text-sm text-[var(--color-text-muted)]">
                  No messages yet. Start a conversation or use a quick action
                  below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-border)] text-[var(--color-text)]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Input */}
          <div className="border-t border-[var(--color-border)] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your question..."
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Previous conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Previous Conversations
              </CardTitle>
              <CardDescription>Your recent chat sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  No previous conversations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Multi-Agent AI Pipeline */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Multi-Agent Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Multi-Agent Pipeline</CardTitle>
            <CardDescription>
              Orchestrated analysis using multiple specialized AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Submit a farm query and receive a comprehensive analysis
              orchestrated across vision, weather, market, and memory agents.
              Each agent contributes domain-specific insights that are
              synthesized into a unified recommendation.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Automated multi-agent orchestration pipeline
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Synthesized cross-domain recommendations
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /pipeline/analyze
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Vision Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vision Agent</CardTitle>
            <CardDescription>
              Image-based crop and field analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Analyze field images using computer vision to detect crop health
              status, growth stage, weed pressure, and visible nutrient
              deficiencies. Supports satellite imagery and phone camera uploads.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Multi-model image classification and segmentation
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Detects visual anomalies and stress indicators
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /agent/vision
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Weather Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weather Agent</CardTitle>
            <CardDescription>
              Hyper-local weather intelligence for farming decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Provides localized weather forecasts, historical trends, and
              agro-meteorological advisories tailored to your crop type and
              growth stage. Includes frost, heatwave, and rainfall alerts.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                7-day and seasonal forecast with confidence intervals
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Extreme weather early warning system
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                GET /agent/weather
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Market Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Agent</CardTitle>
            <CardDescription>
              Real-time market prices and demand intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Access live mandi prices, demand trends, and optimal selling
              strategies. The market agent aggregates data from multiple mandis
              and provides price forecasts to help time your sales.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Multi-mandi price comparison and trend analysis
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Demand forecasting and sell-timing signals
              </li>
            </ul>
            <div className="mt-4">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                GET /agent/market
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Memory Agent */}
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Memory Agent</CardTitle>
            <CardDescription>
              Persistent farmer interaction history and context management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)]">
              Logs all farmer interactions, recommendations, and outcomes to
              build a persistent knowledge base. Retrieves historical context to
              personalize future recommendations and track farming decisions over
              time.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Logs interactions with timestamps and context metadata
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Retrieves full interaction history per farmer
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                Enables personalized, context-aware recommendations
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                POST /agent/memory/log
              </code>
              <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                GET /agent/memory/&#123;farmer_id&#125;
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
