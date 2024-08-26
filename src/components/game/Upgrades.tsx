import {
  formatText,
  formatUpgradeText,
  useCardGame,
} from "@/hooks/useCardGame.ts";

import { cn } from "@/utils.ts";

import { Progress } from "@/components/ui/progress.tsx";
import { Card } from "@/components/Card.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const Upgrades = (props: { show: boolean }) => {
  const quality = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.animations,
    transparency: state,
  }));

  const upgrades = useCardGame((state) => state.upgrades);

  return (
    <div
      className={cn("absolute w-full -top-full left-0 pointer-events-none", {
        "transition-all ease-in-out duration-500": quality.animation,
        "top-0": props.show && upgrades.length > 0,
      })}
    >
      <div
        className={cn(
          "mx-auto w-fit h-fit -translate-y-1/2 flex justify-center rounded-3xl border-8 border-t-0 border-upgrade",
          {
            "shadow shadow-black/50": quality.shadows && quality.transparency,
            "bg-card/50": quality.transparency,
            "bg-card": !quality.transparency,
          },
        )}
      >
        <div className="flex p-5 gap-10 relative shrink-0 w-max  translate-y-1/2">
          {upgrades.map((upgrade, index) => (
            <div key={index} className="group/upgrade shrink-0 relative">
              <img
                src={`images/upgrades/${upgrade.image}`}
                alt={upgrade.name}
                className={cn(
                  "block object-cover w-16 h-16 aspect-square rounded-full pointer-events-auto cursor-pointer mx-auto ring-upgrade ring-4",
                  {
                    // "": upgrade.state === "idle",
                    // "animate-appear": upgrade.state === "appear",
                    "animate-trigger":
                      upgrade.state === "triggered" && quality.animation,
                    "ring-foreground":
                      upgrade.state === "triggered" && !quality.animation,
                  },
                )}
              />

              <div className="h-6 relative">
                <div className="relative">
                  {upgrade.max !== Infinity && (
                    <Progress
                      className="absolute -translate-y-2 w-full"
                      barColor="bg-upgrade"
                      value={(upgrade.cumul / upgrade.max) * 100}
                    />
                  )}
                  <div
                    className={cn(
                      "absolute text-center font-changa left-0 -translate-y-3 aspect-square h-6 rounded-full bg-upgrade",
                      { "shadow shadow-black": quality.shadows },
                    )}
                  >
                    {upgrade.cumul}
                  </div>
                </div>
              </div>

              <Card className="hidden group-hover/upgrade:block absolute left-1/2 bottom-0 translate-y-full -translate-x-1/2 w-max max-w-[300px]">
                <h3 className="text-xl">
                  {upgrade.name}{" "}
                  <span className="text-upgrade font-bold">
                    {upgrade.cumul}
                    {upgrade.max !== Infinity ? `/${upgrade.max}` : ""}
                  </span>
                </h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: formatText(
                      formatUpgradeText(upgrade.description, upgrade.cumul),
                    ),
                  }}
                />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
