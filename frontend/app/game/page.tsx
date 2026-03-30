"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/hooks/use-demo";
import { Button } from "@/components/ui/button";

/**
 * Game landing page - redirects to /game/home
 * Shows splash screen briefly
 */
export default function GamePage() {
  const router = useRouter();
  const { isLoading } = useDemo();

  useEffect(() => {
    // Auto-redirect after brief splash
    const timer = setTimeout(() => {
      router.push("/game/home");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      {/* Animated logo */}
      <div className="relative mb-8">
        <div className="text-8xl animate-bounce">🌾</div>
        <div className="absolute -top-2 -right-2 text-4xl animate-pulse">✨</div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500 mb-2">
        Krishi Quest
      </h1>
      <p className="text-gray-600 mb-8">खेती को बनाएं मज़ेदार!</p>

      {/* Loading indicator */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <Button
          onClick={() => router.push("/game/home")}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
        >
          Start Quest →
        </Button>
      )}

      {/* Feature highlights */}
      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-3xl mb-2">📈</div>
          <p className="text-xs text-gray-500">Market Prices</p>
        </div>
        <div>
          <div className="text-3xl mb-2">🌤️</div>
          <p className="text-xs text-gray-500">Weather</p>
        </div>
        <div>
          <div className="text-3xl mb-2">🔬</div>
          <p className="text-xs text-gray-500">Disease Scan</p>
        </div>
      </div>
    </div>
  );
}
