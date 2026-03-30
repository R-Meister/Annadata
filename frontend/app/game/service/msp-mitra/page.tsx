"use client";

import { useEffect, useState } from "react";
import { useGameSync } from "@/hooks/use-game-sync";
import { SERVICES } from "@/lib/gamification";
import { API_PREFIXES } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const service = SERVICES.find((s) => s.id === "msp_mitra")!;

interface CropPrice {
  crop: string;
  variety?: string;
  msp: number;
  market_price: number;
  change_pct?: number;
  mandi?: string;
}

export default function MSPMitraPage() {
  const { earnXP } = useGameSync();
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Fetch market prices
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_PREFIXES.mspMitra}/msp/wheat`);
        if (res.ok) {
          const data = await res.json();
          // Transform backend response to display format
          const formattedPrices = [
            {
              crop: data.crop_name || "Wheat",
              variety: data.variety,
              msp: data.msp_price || 2275,
              market_price: data.market_price || 2350,
              change_pct: data.market_price && data.msp_price 
                ? ((data.market_price - data.msp_price) / data.msp_price * 100).toFixed(1)
                : 3.3,
            }
          ];
          setPrices(formattedPrices as any);
        } else {
          // Use mock data for demo
          setPrices([
            { crop: "Wheat", variety: "Common", msp: 2275, market_price: 2350, change_pct: 3.3, mandi: "Karnal" },
            { crop: "Rice", variety: "Basmati", msp: 2183, market_price: 2150, change_pct: -1.5, mandi: "Kurukshetra" },
            { crop: "Mustard", variety: "Yellow", msp: 5650, market_price: 5800, change_pct: 2.7, mandi: "Ambala" },
          ] as any);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
        // Use mock data for demo
        setPrices([
          { crop: "Wheat", variety: "Common", msp: 2275, market_price: 2350, change_pct: 3.3, mandi: "Karnal" },
          { crop: "Rice", variety: "Basmati", msp: 2183, market_price: 2150, change_pct: -1.5, mandi: "Kurukshetra" },
          { crop: "Mustard", variety: "Yellow", msp: 5650, market_price: 5800, change_pct: 2.7, mandi: "Ambala" },
        ] as any);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Award XP on first view
  useEffect(() => {
    if (!loading && !xpAwarded && prices.length > 0) {
      earnXP("market_check", { service: "msp_mitra" });
      setXpAwarded(true);
    }
  }, [loading, xpAwarded, prices, earnXP]);

  return (
    <div className="space-y-4">
      {/* Service header */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${service.color}20` }}
        >
          {service.icon}
        </div>
        <div className="flex-grow">
          <h1 className="text-xl font-bold text-gray-800">{service.name}</h1>
          <p className="text-gray-500 text-sm">{service.description}</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200">
          FREE
        </Badge>
      </div>

      {/* XP notification */}
      {xpAwarded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-medium">+10 XP earned for checking market prices!</span>
        </div>
      )}

      {/* Price cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
          <p>Loading prices...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prices.map((item, idx) => (
            <Card key={idx} className="border-2 hover:border-green-300 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{item.crop}</h3>
                  {item.variety && (
                    <p className="text-xs text-gray-500">{item.variety}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    MSP: <span className="font-medium">₹{item.msp}</span>/quintal
                  </p>
                  {item.mandi && (
                    <p className="text-xs text-gray-400 mt-1">📍 {item.mandi}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">₹{item.market_price}</p>
                  <p className="text-xs text-gray-500 mb-1">/quintal</p>
                  {item.change_pct !== undefined && (
                    <div className="flex items-center gap-1 text-sm">
                      {Number(item.change_pct) >= 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">+{item.change_pct}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-medium">{item.change_pct}%</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Pro Tip</p>
            <p className="text-blue-600">
              Check prices daily to earn XP and stay updated with market trends. 
              Compare multiple mandis for the best rates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
