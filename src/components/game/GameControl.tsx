import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { useCardGame } from "@/hooks/useCardGame.ts";
import { cn } from "@/utils.ts";

export const GameControl = (props: { show: boolean; delay: boolean }) => {
  const reset = useCardGame((state) => state.reset);
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 -translate-x-1/2 transition-[bottom] duration-500 ease-in-out",
        {
          "-bottom-12": props.show,
          "delay-500": props.delay,
        },
      )}
    >
      <div className="flex gap-2">
        <Button onClick={() => navigate("/")} variant="default">
          Revenir à l'accueil
        </Button>
        <Button onClick={() => reset()} variant="default">
          Recommencer
        </Button>
      </div>
    </div>
  );
};
