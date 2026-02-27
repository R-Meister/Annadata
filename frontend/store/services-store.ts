import { create } from "zustand";
import { API_URLS } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServiceStatus {
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  lastChecked: string | null;
}

interface ServicesState {
  services: Record<string, ServiceStatus>;
  checkServiceHealth: (serviceName: string, url: string) => Promise<void>;
  checkAllServices: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Initial state — all services start as unknown
// ---------------------------------------------------------------------------

const SERVICE_ENTRIES: { key: string; name: string; url: string }[] = [
  { key: "mspMitra", name: "MSP Mitra", url: API_URLS.mspMitra },
  { key: "soilscan", name: "SoilScan", url: API_URLS.soilscan },
  { key: "fasalRakshak", name: "Fasal Rakshak", url: API_URLS.fasalRakshak },
  { key: "jalShakti", name: "Jal Shakti", url: API_URLS.jalShakti },
  { key: "harvestShakti", name: "Harvest Shakti", url: API_URLS.harvestShakti },
  { key: "kisaanSahayak", name: "Kisaan Sahayak", url: API_URLS.kisaanSahayak },
];

function buildInitialServices(): Record<string, ServiceStatus> {
  const map: Record<string, ServiceStatus> = {};
  for (const entry of SERVICE_ENTRIES) {
    map[entry.key] = {
      name: entry.name,
      status: "unknown",
      lastChecked: null,
    };
  }
  return map;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useServicesStore = create<ServicesState>()((set, get) => ({
  services: buildInitialServices(),

  checkServiceHealth: async (serviceName, url) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);

      const res = await fetch(`${url}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      set((state) => ({
        services: {
          ...state.services,
          [serviceName]: {
            ...state.services[serviceName],
            status: res.ok ? "healthy" : "unhealthy",
            lastChecked: new Date().toISOString(),
          },
        },
      }));
    } catch {
      set((state) => ({
        services: {
          ...state.services,
          [serviceName]: {
            ...state.services[serviceName],
            status: "unhealthy",
            lastChecked: new Date().toISOString(),
          },
        },
      }));
    }
  },

  checkAllServices: async () => {
    const { checkServiceHealth } = get();
    await Promise.allSettled(
      SERVICE_ENTRIES.map((entry) => checkServiceHealth(entry.key, entry.url)),
    );
  },
}));
