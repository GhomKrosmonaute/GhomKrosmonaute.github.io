import React from "react";
import { useHover } from "usehooks-ts";
import { cn } from "@/utils.ts";

const TiltContext = React.createContext<{
  degX: number;
  degY: number;
  isHovered: boolean;
}>({ degX: 0, degY: 0, isHovered: false });

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isHovered = useHover(containerRef);
  const [styleState, setStyle] = React.useState<React.CSSProperties>({});
  const [degX, setDegX] = React.useState(0);
  const [degY, setDegY] = React.useState(0);

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * max;
        const rotateY = ((x - centerX) / centerX) * max;

        setDegX(reverse ? rotateX : -rotateX);
        setDegY(reverse ? -rotateY : rotateY);

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
    },
    [max, perspective, reverse, scale],
  );

  const handleMouseLeave = React.useCallback(() => {
    setDegX(0);
    setDegY(0);

    setStyle({
      ...constantStyle,
      transition: "transform 0.5s ease-in-out",
      transform: `scale(1)`,
    });
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;

    if (isHovered) {
      if (container) {
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
      }
    } else {
      handleMouseLeave();
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }

      handleMouseLeave();
    };
  }, [max, reverse, scale, perspective, isHovered]);

  return (
    <div
      ref={containerRef}
      className={cn("will-change-transform", className)}
      style={{
        ...styleState,
        ...style,
      }}
    >
      <TiltContext.Provider value={{ degX, degY, isHovered }}>
        {children}
      </TiltContext.Provider>
    </div>
  );
};

export const TiltFoil: React.FC = () => {
  const tiltContext = React.useContext(TiltContext);

  return (
    <div className="dark:opacity-70 absolute w-full h-full">
      <div
        className="absolute w-full h-full rounded-xl transition-opacity duration-500 ease-out"
        style={{
          opacity: tiltContext.isHovered ? "50%" : "20%",
          backgroundImage:
            "linear-gradient(110deg,transparent 25%, hsla(var(--image-foil) / 0.6) 48%, hsla(var(--image-foil) / 0.3) 52%,transparent 75%)",
          backgroundPositionX: `${50 + tiltContext.degY + -tiltContext.degX}%`,
          backgroundPositionY: `50%`,
          backgroundSize: "200% 200%",
          // backgroundBlendMode: "multiply",
          // mixBlendMode: "multiply",
          backgroundRepeat: "no-repeat",
          transform: "translateZ(0px)",
        }}
      />
    </div>
  );
};
