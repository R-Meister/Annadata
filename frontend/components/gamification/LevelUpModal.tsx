"use client";

import { useGameStore } from "@/store/game-store";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Lottie from "lottie-react";
import confettiAnimation from "@/public/lottie/confetti.json";

/**
 * Level Up Modal - Celebratory modal shown when user levels up
 */
export function LevelUpModal() {
  const { showLevelUp, newLevelInfo, dismissLevelUp } = useGameStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLevelUp && modalRef.current && confettiRef.current) {
      // Animate modal entrance
      gsap.fromTo(
        modalRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
      );

      // Create confetti particles
      const colors = ["#fbbf24", "#22c55e", "#3b82f6", "#ec4899", "#8b5cf6"];
      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        particle.className = "absolute rounded-sm";
        particle.style.width = `${8 + Math.random() * 8}px`;
        particle.style.height = `${8 + Math.random() * 8}px`;
        particle.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = "50%";
        particle.style.top = "50%";
        confettiRef.current.appendChild(particle);
        particles.push(particle);

        // Animate each particle
        const angle = (Math.random() - 0.5) * Math.PI * 2;
        const velocity = 100 + Math.random() * 200;
        const rotations = Math.random() * 720 - 360;

        gsap.to(particle, {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity + 100,
          rotation: rotations,
          opacity: 0,
          duration: 1 + Math.random() * 0.5,
          ease: "power2.out",
          onComplete: () => particle.remove(),
        });
      }
    }
  }, [showLevelUp]);

  if (!showLevelUp || !newLevelInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {/* Confetti container */}
      <div
        ref={confettiRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl"
      >
        <div className="absolute -inset-6 -z-10 pointer-events-none opacity-80">
          <Lottie animationData={confettiAnimation} loop={false} />
        </div>
        {/* Close button */}
        <button
          onClick={dismissLevelUp}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sparkles decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <Sparkles className="w-12 h-12 text-yellow-400" />
        </div>

        {/* Badge */}
        <div className="text-7xl mb-4 animate-bounce">{newLevelInfo.badge}</div>

        {/* Level up text */}
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-yellow-500 mb-2">
          Level Up!
        </h2>

        <p className="text-2xl font-semibold text-gray-800 mb-1">
          Level {newLevelInfo.level}
        </p>

        <p className="text-lg text-gray-600 mb-6">{newLevelInfo.title}</p>

        <Button
          onClick={dismissLevelUp}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
