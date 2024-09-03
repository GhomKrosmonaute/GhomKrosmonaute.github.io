import { cn } from "@/utils.ts";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

export const EventNotifier = (props: { show: boolean }) => {
  const game = useCardGame((state) => ({
    notification: state.notification,
  }));

  const quality = useQualitySettings((state) => ({
    animations: state.animations,
    transparency: state.transparency,
  }));

  return (
    <div
      // key={key}
      className={cn(
        "absolute w-full h-full z-50 flex justify-center items-center pointer-events-none",
        {
          "bg-gradient-to-b from-transparent to-transparent animate-notification-bg":
            !!game.notification,
          hidden: !props.show || !quality.transparency || !quality.animations,
        },
        game.notification?.[1],
      )}
    >
      {game.notification && (
        <div className="animate-notification font-changa text-8xl">
          {game.notification[0]}
        </div>
      )}
    </div>
  );
};
