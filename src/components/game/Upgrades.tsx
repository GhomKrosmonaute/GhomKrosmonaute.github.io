import { cn } from "@/utils.ts";
import { Progress } from "@/components/ui/progress.tsx";
import {
  formatText,
  formatUpgradeText,
  useCardGame,
} from "@/hooks/useCardGame.ts";

export const Upgrades = () => {
  const upgrades = useCardGame((state) => state.upgrades);

  return (
    <div className="grid grid-cols-3 p-2 gap-5 relative shrink-0 w-max">
      {upgrades.map((upgrade, index) => (
        <div key={index} className="group/upgrade shrink-0">
          <img
            src={`images/upgrades/${upgrade.image}`}
            alt={upgrade.name}
            className={cn(
              "block object-cover w-16 h-16 aspect-square rounded-full pointer-events-auto cursor-pointer mx-auto ring-upgrade ring-4",
              {
                // "": upgrade.state === "idle",
                // "animate-appear": upgrade.state === "appear",
                "animate-trigger": upgrade.state === "triggered",
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
              <div className="absolute text-center font-changa left-0 -translate-y-3 aspect-square h-6 rounded-full bg-upgrade shadow shadow-black">
                {upgrade.cumul}
              </div>
            </div>
          </div>

          <div className="hidden group-hover/upgrade:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-3">
            <h3 className="text-lg">
              {upgrade.name}{" "}
              <span className="text-upgrade font-changa">
                {upgrade.cumul}{" "}
                {upgrade.max !== Infinity ? `/ ${upgrade.max}` : ""}
              </span>
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html: formatText(
                  formatUpgradeText(upgrade.description, upgrade.cumul),
                ),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
