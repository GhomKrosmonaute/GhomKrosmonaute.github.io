import { cn } from "@/utils.ts";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { useSettings } from "@/hooks/useSettings.ts";

export const EventNotifier = (props: { show: boolean }) => {
  const game = useCardGame((state) => ({
    notification: state.notification,
  }));

  const quality = useSettings((state) => ({
    animations: state.animations,
    transparency: state.transparency,
  }));

  if (
    !props.show ||
    !quality.transparency ||
    !quality.animations ||
    !game.notification
  )
    return null;

  //new code avec l'animation décrite plus haut:
  return (
    <div className="absolute top-0 left-0 w-full h-full z-50 flex justify-center items-center">
      {/* bande de gauche */}
      <div
        className={cn(
          game.notification[1],
          "absolute animate-to-right rounded-r-full rounded-bl-full w-full h-[120px] opacity-50",
        )}
      />

      {/* bande de droite */}
      <div
        className={cn(
          game.notification[1],
          "absolute animate-to-left rounded-l-full rounded-tr-full w-full h-[120px] opacity-50",
        )}
      />

      {/* texte de la notification */}
      <div
        className={cn(
          game.notification[1],
          "bg-transparent font-changa italic animate-notification text-6xl w-fit h-fit text-center",
        )}
        dangerouslySetInnerHTML={{ __html: game.notification[0] }}
      />
    </div>
  );
};
