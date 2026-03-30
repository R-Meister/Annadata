"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/game/services")}
        className="text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </Button>

      {children}
    </div>
  );
}
