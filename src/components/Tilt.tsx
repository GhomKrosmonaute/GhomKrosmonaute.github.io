import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { cn } from "@/utils.ts";

interface TiltProps {
  max?: number; // Inclinaison maximale en degrés
  reverse?: boolean; // Inverser l'inclinaison
  scale?: number; // Augmenter la scale au hover
  perspective?: number; // Définir la perspective CSS
  className?: string; // Classe CSS pour styliser le conteneur
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const constantStyle = {
  transformStyle: "preserve-3d",
} as const;

export const Tilt: React.FC<TiltProps> = ({
  max = 20,
  reverse = false,
  scale = 1,
  perspective = 1000,
  className = "",
  children,
  style,
}) => {
  const [styleState, setStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useDebounceCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * max;
      const rotateY = ((x - centerX) / centerX) * max;

      setStyle({
        ...constantStyle,
        transform: `
            perspective(${perspective}px)
            rotateX(${reverse ? rotateX : -rotateX}deg)
            rotateY(${reverse ? -rotateY : rotateY}deg)
            scale(${scale})
          `,
      });
    }
  }, 10);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      ...constantStyle,
      transform: `scale(1)`,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [max, reverse, scale, perspective]);

  return (
    <div
      ref={containerRef}
      className={cn("will-change-transform", className)}
      style={{
        ...styleState,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
