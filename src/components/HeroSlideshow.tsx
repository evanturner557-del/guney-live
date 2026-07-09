"use client";

import { useEffect, useState } from "react";

// Crossfading background slideshow. Advances every 10s.
export default function HeroSlideshow({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % images.length), 10000);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0)
    return <div className="w-full h-full bg-gradient-to-b from-sage to-olive" />;

  return (
    <div className="w-full h-full">
      {images.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={idx} src={src} alt="Güney & Lake Salda" aria-hidden={idx !== i}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
