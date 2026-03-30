"use client";

import { useGameStore } from "@/store/game-store";
import { SERVICES, getServicesByTier, type SubscriptionTier } from "@/lib/gamification";
import { ServiceCard } from "@/components/gamification";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Rocket } from "lucide-react";

/**
 * Services Page - Grid of all 11+ services with free/locked states
 */
export default function ServicesPage() {
  const tier = useGameStore((state) => state.tier);
  const servicesByTier = getServicesByTier();

  const tierInfo: Record<
    SubscriptionTier,
    { title: string; icon: React.ReactNode; description: string }
  > = {
    free: {
      title: "Free Services",
      icon: <Sparkles className="w-5 h-5 text-green-500" />,
      description: "Essential tools for every farmer",
    },
    basic: {
      title: "Basic Services",
      icon: <Sparkles className="w-5 h-5 text-blue-500" />,
      description: "Enhanced farming tools",
    },
    premium: {
      title: "Premium Services",
      icon: <Crown className="w-5 h-5 text-purple-500" />,
      description: "Advanced AI-powered tools",
    },
    enterprise: {
      title: "Enterprise Services",
      icon: <Rocket className="w-5 h-5 text-orange-500" />,
      description: "Full platform access",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Services</h1>
        <p className="text-gray-500">
          Access 11+ AI-powered farming tools
        </p>
      </div>

      {/* Current tier badge */}
      <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            {tier === "free" ? "🌱" : tier === "premium" ? "👑" : "✨"}
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Plan</p>
            <p className="font-semibold text-gray-800 capitalize">{tier}</p>
          </div>
        </div>
        {tier === "free" && (
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            Upgrade
          </Button>
        )}
      </div>

      {/* Free services */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          {tierInfo.free.icon}
          <h2 className="font-semibold text-gray-800">{tierInfo.free.title}</h2>
          <Badge variant="secondary" className="text-xs">
            Always Free
          </Badge>
        </div>
        <div className="space-y-3">
          {servicesByTier.free.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Premium services */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          {tierInfo.premium.icon}
          <h2 className="font-semibold text-gray-800">{tierInfo.premium.title}</h2>
          <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
            ₹49-199/mo
          </Badge>
        </div>
        <div className="space-y-3">
          {servicesByTier.premium.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Enterprise services */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          {tierInfo.enterprise.icon}
          <h2 className="font-semibold text-gray-800">{tierInfo.enterprise.title}</h2>
          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
            ₹999/mo
          </Badge>
        </div>
        <div className="space-y-3">
          {servicesByTier.enterprise.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Upgrade CTA */}
      {tier === "free" && (
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">Unlock Premium</h3>
            <p className="text-purple-100 text-sm mb-4">
              Get access to advanced AI tools, unlimited chat, and more!
            </p>
            <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold">
              Upgrade Now - ₹49/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
