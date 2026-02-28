import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "Annadata OS - AI Agriculture Platform",
  description:
    "Multi-service AI agriculture platform for Indian farmers. MSP Mitra, SoilScan AI, Fasal Rakshak, Jal Shakti, Harvest Shakti, Kisaan Sahayak.",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Annadata OS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Annadata OS" />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
