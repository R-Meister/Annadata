import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "Annadata OS - AI Agriculture Platform",
  description:
    "Multi-service AI agriculture platform for Indian farmers. MSP Mitra, SoilScan AI, Fasal Rakshak, Jal Shakti, Harvest Shakti, Kisaan Sahayak.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
