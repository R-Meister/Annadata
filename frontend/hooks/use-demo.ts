"use client";

import { useEffect, useState } from "react";
import { generateDemoUserId } from "@/lib/gamification";

const DEMO_USER_KEY = "krishi-quest-demo-user";

/**
 * Hook for managing demo user identity.
 * Auto-generates and persists a demo user ID in localStorage.
 */
export function useDemo() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing demo user
    const storedUserId = localStorage.getItem(DEMO_USER_KEY);

    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Generate new demo user
      const newUserId = generateDemoUserId();
      localStorage.setItem(DEMO_USER_KEY, newUserId);
      setUserId(newUserId);
    }

    setIsLoading(false);
  }, []);

  const resetDemoUser = () => {
    const newUserId = generateDemoUserId();
    localStorage.setItem(DEMO_USER_KEY, newUserId);
    setUserId(newUserId);
    return newUserId;
  };

  return {
    userId,
    isLoading,
    resetDemoUser,
    isDemo: true,
  };
}

/**
 * Demo farmer profiles for simulation
 */
export const DEMO_FARMERS = [
  {
    id: "f1",
    name: "Raman Singh",
    nameHi: "रमन सिंह",
    village: "Kheri Kalan",
    district: "Karnal",
    state: "Haryana",
    land: 5.2,
    crops: ["Wheat", "Rice", "Mustard"],
  },
  {
    id: "f2",
    name: "Sunita Devi",
    nameHi: "सुनीता देवी",
    village: "Pataudi",
    district: "Gurugram",
    state: "Haryana",
    land: 3.8,
    crops: ["Vegetables", "Wheat"],
  },
  {
    id: "f3",
    name: "Mukesh Yadav",
    nameHi: "मुकेश यादव",
    village: "Tigaon",
    district: "Faridabad",
    state: "Haryana",
    land: 7.5,
    crops: ["Rice", "Sugarcane", "Wheat"],
  },
];

export type DemoFarmer = (typeof DEMO_FARMERS)[number];
