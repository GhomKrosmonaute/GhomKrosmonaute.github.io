import React from "react";
import { useTutorial } from "@/hooks/useTutorial";
import { useCardGame } from "@/hooks/useCardGame";
import { useQualitySettings } from "@/hooks/useQualitySettings";
import { cn } from "@/utils";

export const GameTutorial = (props: { show: boolean }) => {
  const { start } = useTutorial();
  const masks = useCardGame(({ masks }) => masks);
  const tutorial = useCardGame(({ tutorial }) => tutorial);
  const enabled = useQualitySettings(
    ({ transparency, animations }) => transparency && animations,
  );

  const maskUrl = React.useMemo(() => {
    // Créez une chaîne SVG pour les masques
    const svgMasks = masks
      .map(
        (mask) =>
          `<rect x="${mask.x}" y="${mask.y}" width="${mask.width}" height="${mask.height}" fill="white" />`,
      )
      .join("");
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${svgMasks}</svg>`;

    return `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [masks]);

  React.useEffect(() => {
    if (enabled && props.show && tutorial) {
      start();
    }
  }, [enabled, props.show, tutorial]);

  if (!enabled && props.show) return null;

  return (
    <div
      style={{
        mask: `url(${maskUrl})`,
        WebkitMask: `url(${maskUrl})`,
      }}
      className={cn(
        "absolute inset-0 bg-black/50 pointer-events-none opacity-0 transition-opacity duration-100",
        {
          "opacity-100": masks.length > 0,
        },
      )}
    />
  );
};
