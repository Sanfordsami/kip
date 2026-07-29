"use client";

import { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-blob-1 absolute -left-20 top-0 h-96 w-96 rounded-full bg-brand-400/25 blur-3xl" />
      <div className="bg-blob-2 absolute right-0 top-20 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="bg-blob-1 absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />
      <div
        ref={glowRef}
        className="absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl transition-[left,top] duration-300 ease-out"
      />
    </div>
  );
}
