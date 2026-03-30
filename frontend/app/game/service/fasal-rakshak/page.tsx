"use client";

import { useState } from "react";
import { useGameSync } from "@/hooks/use-game-sync";
import { SERVICES } from "@/lib/gamification";
import { API_PREFIXES } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const service = SERVICES.find((s) => s.id === "fasal_rakshak")!;

interface ScanResult {
  disease?: string;
  confidence?: number;
  severity?: string;
  treatment?: string;
  preventive_measures?: string[];
}

export default function FasalRakshakPage() {
  const { earnXP } = useGameSync();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    
    // Simulate scanning
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Try to call backend API
      const res = await fetch(`${API_PREFIXES.fasalRakshak}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "demo_wheat_leaf" }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Use mock data for demo
        setResult({
          disease: "Leaf Rust",
          confidence: 87,
          severity: "Moderate",
          treatment: "Apply fungicide containing Propiconazole (25% EC) @ 0.1% spray",
          preventive_measures: [
            "Remove infected plant debris",
            "Ensure proper plant spacing",
            "Apply balanced NPK fertilizer",
            "Monitor regularly for early detection",
          ],
        });
      }

      // Award XP for disease scan
      if (!xpAwarded) {
        await earnXP("disease_scan", { service: "fasal_rakshak" });
        setXpAwarded(true);
      }
    } catch (error) {
      console.error("Scan failed:", error);
      // Use mock data
      setResult({
        disease: "Leaf Rust",
        confidence: 87,
        severity: "Moderate",
        treatment: "Apply fungicide containing Propiconazole (25% EC) @ 0.1% spray",
        preventive_measures: [
          "Remove infected plant debris",
          "Ensure proper plant spacing",
          "Apply balanced NPK fertilizer",
          "Monitor regularly for early detection",
        ],
      });

      if (!xpAwarded) {
        await earnXP("disease_scan", { service: "fasal_rakshak" });
        setXpAwarded(true);
      }
    } finally {
      setScanning(false);
    }
  };

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
        <Badge className="bg-red-100 text-red-700 border-red-200">
          FREE
        </Badge>
      </div>

      {/* XP notification */}
      {xpAwarded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-medium">+25 XP earned for disease scan!</span>
        </div>
      )}

      {/* Upload/Scan section */}
      {!result ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Scan Your Crop</h3>
            <p className="text-sm text-gray-500 mb-6">
              Take or upload a photo of the affected leaf to detect diseases
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleScan}
                disabled={scanning}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleScan}
                disabled={scanning}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Demo mode - Click to simulate disease detection
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Scan result */}
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-orange-800">
                  Disease Detected
                </CardTitle>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  {result.confidence}% confident
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800 text-lg mb-1">{result.disease}</p>
                  <p className="text-sm text-gray-600">
                    Severity: <span className="font-medium text-orange-600">{result.severity}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                💊 Recommended Treatment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{result.treatment}</p>
            </CardContent>
          </Card>

          {/* Preventive measures */}
          {result.preventive_measures && result.preventive_measures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Preventive Measures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.preventive_measures.map((measure, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Scan another button */}
          <Button
            onClick={() => {
              setResult(null);
              setXpAwarded(false);
            }}
            variant="outline"
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Another Crop
          </Button>
        </>
      )}

      {/* Info card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Quick Tip</p>
            <p className="text-blue-600">
              For best results, take clear photos in natural daylight. 
              Focus on the affected part of the leaf showing symptoms clearly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
