import { useCardGame } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

import events from "@/data/events.ts";

import { formatText, formatUpgradeText } from "@/game-utils.ts";
import { cn } from "@/utils.ts";

import { Card } from "@/components/Card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx";
import { EventText } from "@/components/game/EventText.tsx";

export const GameUpgrades = (props: { show: boolean }) => {
  const quality = useQualitySettings((state) => ({
    shadows: state.shadows,
    animation: state.animations,
    transparency: state,
  }));

  const upgrades = useCardGame((state) => state.upgrades);

  return (
    <>
      <div
        id="upgrades"
        className="pointer-events-none fixed w-[300px] h-24 top-2 left-1/2 -translate-x-1/2"
      />
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
              "-translate-y-1/3": upgrades.length > 5,
              "-translate-y-[25%]": upgrades.length > 10,
              "shadow shadow-black/50": quality.shadows && quality.transparency,
              "bg-card/50": quality.transparency,
              "bg-card": !quality.transparency,
            },
          )}
        >
          <div
            className={cn(
              "flex p-5 gap-10 gap-y-0 relative shrink-0 w-max translate-y-1/2",
              {
                "translate-y-1/3 grid grid-cols-5": upgrades.length > 5,
                "translate-y-[25%]": upgrades.length > 10,
              },
            )}
          >
            {upgrades.map((upgrade, index) => {
              const event = events[upgrade.eventName];

              return (
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
                      <GameValueIcon
                        value={<event.icon className="h-5" />}
                        colors={
                          "colors" in event ? event.colors : "bg-background"
                        }
                        miniature
                        className="absolute h-6 w-6"
                        style={{
                          top: "-15px",
                          left: "-15px",
                          transform: "translate(0, -50%)",
                        }}
                      />
                      <GameValueIcon
                        value={upgrade.cumul}
                        colors="bg-upgrade"
                        miniature
                        className="absolute h-6 w-6"
                        style={{
                          top: "50%",
                          left: "0",
                          transform: "translate(0, -50%)",
                        }}
                      />
                    </div>
                  </div>

                  <Card className="hidden group-hover/upgrade:block absolute left-1/2 bottom-0 translate-y-full -translate-x-1/2 w-max max-w-[300px] z-50 space-y-3">
                    <h3 className="text-xl font-changa">
                      {upgrade.name}{" "}
                      <span className="text-upgrade font-bold">
                        {upgrade.cumul}
                        {upgrade.max !== Infinity && upgrade.max !== null
                          ? `/${upgrade.max}`
                          : ""}
                      </span>
                    </h3>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: formatText(
                          formatUpgradeText(upgrade.description, upgrade.cumul),
                        ),
                      }}
                    />
                    <EventText eventName={upgrade.eventName} />
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
