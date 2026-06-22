"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Titre animé caractère par caractère : chaque lettre part de
// opacity:0 / translateX(-18px) et glisse en place, avec un délai échelonné.
const CHAR_DELAY = 30; // ms entre chaque caractère
const INITIAL_DELAY = 200; // ms avant le début de l'animation
const CHAR_DURATION = 500; // ms par caractère

interface AnimatedHeadingProps {
  text: string; // les sauts de ligne sont notés "\n"
  className?: string;
  style?: CSSProperties;
}

export default function AnimatedHeading({ text, className, style }: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Déclenche l'animation au montage ; les transition-delay font l'échelonnement.
    const id = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const lines = text.split("\n");

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {Array.from(line).map((char, charIndex) => {
            const delay =
              INITIAL_DELAY +
              lineIndex * line.length * CHAR_DELAY +
              charIndex * CHAR_DELAY;
            return (
              <span
                key={charIndex}
                className="inline-block"
                style={{
                  opacity: started ? 1 : 0,
                  transform: started ? "translateX(0)" : "translateX(-18px)",
                  transition: `opacity ${CHAR_DURATION}ms ease, transform ${CHAR_DURATION}ms ease`,
                  transitionDelay: `${delay}ms`,
                }}
              >
                {char === " " ? " " : char}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
