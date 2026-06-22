"use client";

import { useEffect, useState } from "react";

// Apparition en fondu après un délai configurable, durée configurable.
interface FadeInProps {
  delay?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
}

export default function FadeIn({
  delay = 0,
  duration = 1000,
  className = "",
  children,
}: FadeInProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{ opacity: shown ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
