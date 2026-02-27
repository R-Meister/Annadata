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

export default function BeejSurakshaPage() {
  const [activeTab, setActiveTab] = useState<"verify" | "report" | "catalog">(
    "verify",
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Beej Suraksha &mdash; Seed Purity
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          QR-code based seed tracking, AI-powered seed authenticity verification,
          and community fake-seed reporting platform.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2">
        {[
          { key: "verify" as const, label: "Verify Seed" },
          { key: "report" as const, label: "Report Issue" },
          { key: "catalog" as const, label: "Seed Catalog" },
        ].map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "verify" && (
        <>
          {/* QR Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR Code Verification</CardTitle>
              <CardDescription>
                Enter the QR code ID from your seed packet to verify authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter QR Code ID (e.g., BS-XXXXXXXX)"
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <Button size="sm">Verify</Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Verification Result
                  </CardTitle>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li className="flex justify-between">
                    <span>Authentic</span>
                    <span className="font-medium text-[var(--color-text)]">--</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Manufacturer</span>
                    <span className="font-medium text-[var(--color-text)]">--</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Variety</span>
                    <span className="font-medium text-[var(--color-text)]">--</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Expiry Status</span>
                    <span className="font-medium text-[var(--color-text)]">--</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Community Trust</span>
                    <span className="font-medium text-[var(--color-text)]">-- %</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supply Chain History</CardTitle>
                <CardDescription>
                  Tracked checkpoints from manufacturer to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Supply chain timeline will appear after verification
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "report" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Seed Issue</CardTitle>
            <CardDescription>
              Help the farming community by reporting fake or low-quality seeds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Dealer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter dealer name"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Issue Type
                  </label>
                  <select className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    <option>Fake Seeds</option>
                    <option>Low Germination</option>
                    <option>Wrong Variety</option>
                    <option>Expired Seeds</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <Button size="sm">Submit Report</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "catalog" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verified Seed Catalog</CardTitle>
            <CardDescription>
              Known genuine seed varieties with expected characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="py-2 text-left font-medium text-[var(--color-text-muted)]">
                      Variety
                    </th>
                    <th className="py-2 text-left font-medium text-[var(--color-text-muted)]">
                      Crop
                    </th>
                    <th className="py-2 text-left font-medium text-[var(--color-text-muted)]">
                      Manufacturer
                    </th>
                    <th className="py-2 text-left font-medium text-[var(--color-text-muted)]">
                      Germination
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { variety: "Pusa Basmati 1121", crop: "Rice", mfr: "IARI", germ: "85%" },
                    { variety: "HD-2967", crop: "Wheat", mfr: "IARI", germ: "88%" },
                    { variety: "Bt Cotton Bollgard II", crop: "Cotton", mfr: "Mahyco", germ: "82%" },
                    { variety: "Pioneer 30V92", crop: "Maize", mfr: "Corteva", germ: "90%" },
                    { variety: "Pusa Bold", crop: "Mustard", mfr: "IARI", germ: "87%" },
                    { variety: "Kaveri Jadoo", crop: "Rice", mfr: "Kaveri Seeds", germ: "86%" },
                  ].map((seed) => (
                    <tr
                      key={seed.variety}
                      className="border-b border-[var(--color-border)]"
                    >
                      <td className="py-2 font-medium text-[var(--color-text)]">
                        {seed.variety}
                      </td>
                      <td className="py-2 text-[var(--color-text-muted)]">
                        {seed.crop}
                      </td>
                      <td className="py-2 text-[var(--color-text-muted)]">
                        {seed.mfr}
                      </td>
                      <td className="py-2 text-[var(--color-text-muted)]">
                        {seed.germ}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Registered Batches", value: "--" },
          { label: "Verifications", value: "--" },
          { label: "Community Reports", value: "--" },
          { label: "Flagged Dealers", value: "--" },
        ].map((stat) => (
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

      {/* Blockchain Supply Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blockchain Supply Chain</CardTitle>
          <CardDescription>
            Immutable ledger for seed provenance and supply chain transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-muted)]">
            Track every seed batch from manufacturer to farmer on a
            blockchain-backed ledger. Add supply chain transactions, verify the
            integrity of the full chain for any QR code, and trace the complete
            journey of a seed batch through all checkpoints.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <h4 className="text-sm font-medium text-[var(--color-text)]">
                Add Transaction
              </h4>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Record a new supply chain event (production, dispatch, receipt)
                with timestamp and actor details.
              </p>
              <div className="mt-3">
                <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                  POST /blockchain/add-transaction
                </code>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <h4 className="text-sm font-medium text-[var(--color-text)]">
                Verify Chain
              </h4>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Validate the integrity of the entire blockchain for a specific
                QR code to detect any tampering or inconsistencies.
              </p>
              <div className="mt-3">
                <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                  GET /blockchain/verify-chain/&#123;qr_code_id&#125;
                </code>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <h4 className="text-sm font-medium text-[var(--color-text)]">
                Trace Seed Batch
              </h4>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Retrieve the full provenance trail for a seed batch — every
                handler, location, and timestamp from origin to delivery.
              </p>
              <div className="mt-3">
                <code className="rounded bg-[var(--color-background)] px-2 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                  GET /blockchain/trace/&#123;qr_code_id&#125;
                </code>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
              Tamper-proof transaction history with cryptographic hashing
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
              End-to-end traceability from manufacturer to farmer
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
              Chain integrity verification to detect fraud or data corruption
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
