"use client";

import { useEffect, useRef } from "react";

// Adds .in when the element scrolls into view; CSS does the rest.
export default function Reveal({ children, className = "", slow = false }: {
  children: React.ReactNode; className?: string; slow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${slow ? "reveal-slow" : ""} ${className}`}>{children}</div>;
}
