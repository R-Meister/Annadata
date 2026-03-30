"use client";

import { cn } from "@/lib/utils";
import { type ServiceConfig, canAccessService, type SubscriptionTier } from "@/lib/gamification";
import { useGameStore } from "@/store/game-store";
import { Lock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  service: ServiceConfig;
  className?: string;
}

/**
 * Service Card Component - Shows a service with lock state for premium
 */
export function ServiceCard({ service, className }: ServiceCardProps) {
  const tier = useGameStore((state) => state.tier);
  const isAccessible = canAccessService(service, tier);

  const tierBadge: Record<SubscriptionTier, { label: string; color: string }> = {
    free: { label: "FREE", color: "bg-green-100 text-green-700" },
    basic: { label: "BASIC", color: "bg-blue-100 text-blue-700" },
    premium: { label: "PREMIUM", color: "bg-purple-100 text-purple-700" },
    enterprise: { label: "ENTERPRISE", color: "bg-orange-100 text-orange-700" },
  };

  const CardContent = (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
        isAccessible
          ? "bg-white border-gray-200 hover:border-green-400 hover:shadow-lg cursor-pointer"
          : "bg-gray-50 border-gray-200 opacity-75",
        className
      )}
    >
      {/* Service icon */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: `${service.color}20` }}
      >
        {service.icon}
      </div>

      {/* Service info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 truncate">{service.name}</h3>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              tierBadge[service.tier].color
            )}
          >
            {tierBadge[service.tier].label}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{service.description}</p>
      </div>

      {/* Arrow or lock */}
      <div className="flex-shrink-0">
        {isAccessible ? (
          <ChevronRight className="w-6 h-6 text-gray-400" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </div>

      {/* Lock overlay for inaccessible services */}
      {!isAccessible && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500 font-medium">
              Upgrade to {service.tier}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (isAccessible) {
    return <Link href={service.route}>{CardContent}</Link>;
  }

  return CardContent;
}
