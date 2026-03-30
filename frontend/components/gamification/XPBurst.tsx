"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Lottie from "lottie-react";
import { useGameStore } from "@/store/game-store";
import coinsAnimation from "@/public/lottie/coins.json";

/**
 * XP Burst Animation - Shows floating "+X XP" text when XP is earned
 * Duolingo-style celebration effect
 */
export function XPBurst() {
  const { showXPBurst, lastXPEarned, dismissXPBurst } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | undefined;

    if (showXPBurst && containerRef.current) {
      // Create particle effects
      const particles = Array.from({ length: 8 }).map((_, i) => {
        const particle = document.createElement("div");
        particle.className =
          "absolute w-2 h-2 rounded-full bg-yellow-400 opacity-80";
        containerRef.current?.appendChild(particle);
        return particle;
      });

      // Animate the main XP text
      const textTweenIn = gsap.fromTo(
        containerRef.current.querySelector(".xp-text"),
        { opacity: 0, y: 20, scale: 0.5 },
        {
          opacity: 1,
          y: 0,
          scale: 1.2,
          duration: 0.4,
          ease: "back.out(2)",
        }
      );

      // Animate particles outward
      particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 60 + Math.random() * 30;

        gsap.fromTo(
          particle,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => particle.remove(),
          }
        );
      });

      // Fade out and dismiss
      const textTweenOut = gsap.to(containerRef.current.querySelector(".xp-text"), {
        opacity: 0,
        y: -30,
        scale: 0.8,
        duration: 0.5,
        delay: 1,
        ease: "power2.in",
        onComplete: () => {
          dismissXPBurst();
        },
      });

      cleanup = () => {
        textTweenIn.kill();
        textTweenOut.kill();
        particles.forEach((particle) => particle.remove());
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [showXPBurst, dismissXPBurst]);

  if (!showXPBurst) return null;

  return (
    <div
      ref={containerRef}
      className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <div className="absolute inset-0 -z-10 scale-150 opacity-90">
        <Lottie animationData={coinsAnimation} loop={false} />
      </div>
      <div className="xp-text relative">
        <span className="text-4xl font-bold text-yellow-500 drop-shadow-lg">
          +{lastXPEarned} XP
        </span>
        <span className="absolute -top-1 -right-1 text-2xl">✨</span>
      </div>
    </div>
  );
}
