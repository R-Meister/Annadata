"use client";

import { useEffect, useState, ReactNode } from "react";

// Leaflet CSS is loaded dynamically since it can't be imported in SSR
const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

interface MapViewProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  height?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * Reusable map component using react-leaflet.
 * Dynamically imports leaflet to avoid SSR issues with Next.js.
 */
export function MapView({
  center = [22.5937, 78.9629], // Center of India
  zoom = 5,
  height = 400,
  className = "",
  children,
}: MapViewProps) {
  const [mapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    Polyline: typeof import("react-leaflet").Polyline;
    Circle: typeof import("react-leaflet").Circle;
    useMap: typeof import("react-leaflet").useMap;
  } | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load leaflet CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    // Dynamic import for SSR compatibility
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, leaflet]) => {
      // Fix default marker icons
      delete (leaflet.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        Polyline: rl.Polyline,
        Circle: rl.Circle,
        useMap: rl.useMap,
      });
      setL(leaflet);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !mapComponents || !L) {
    return (
      <div
        className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-sm text-[var(--color-text-muted)]">
          Loading map...
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer } = mapComponents;

  return (
    <div className={`rounded-xl overflow-hidden border border-[var(--color-border)] ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  );
}

// Re-export a function to create markers dynamically (avoids SSR issues)
export interface MapMarkerData {
  position: [number, number];
  title: string;
  description?: string;
  color?: string;
}

/**
 * Dynamic marker component that loads leaflet on client side.
 */
export function MapMarkers({ markers }: { markers: MapMarkerData[] }) {
  const [components, setComponents] = useState<{
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    import("react-leaflet").then((rl) => {
      setComponents({ Marker: rl.Marker, Popup: rl.Popup });
    });
  }, []);

  if (!components) return null;

  const { Marker, Popup } = components;

  return (
    <>
      {markers.map((m, i) => (
        <Marker key={i} position={m.position}>
          <Popup>
            <div>
              <strong className="text-sm">{m.title}</strong>
              {m.description && (
                <p className="text-xs mt-1 text-gray-600">{m.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/**
 * Polyline component for route visualization.
 */
export function MapRoute({
  positions,
  color = "#16a34a",
}: {
  positions: [number, number][];
  color?: string;
}) {
  const [PolylineComp, setPolyline] = useState<typeof import("react-leaflet").Polyline | null>(null);

  useEffect(() => {
    import("react-leaflet").then((rl) => {
      setPolyline(() => rl.Polyline);
    });
  }, []);

  if (!PolylineComp) return null;

  return <PolylineComp positions={positions} color={color} weight={3} opacity={0.8} />;
}

/**
 * Circle overlay for hotspot/area visualization.
 */
export function MapCircle({
  center,
  radius,
  color = "#ef4444",
  fillOpacity = 0.2,
}: {
  center: [number, number];
  radius: number;
  color?: string;
  fillOpacity?: number;
}) {
  const [CircleComp, setCircle] = useState<typeof import("react-leaflet").Circle | null>(null);

  useEffect(() => {
    import("react-leaflet").then((rl) => {
      setCircle(() => rl.Circle);
    });
  }, []);

  if (!CircleComp) return null;

  return (
    <CircleComp
      center={center}
      radius={radius}
      pathOptions={{ color, fillOpacity }}
    />
  );
}
