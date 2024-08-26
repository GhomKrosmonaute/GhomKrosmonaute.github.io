import React from "react";

import helpers from "@/data/helpers.json";

import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

import Question from "@/assets/icons/question.svg";

import { formatText } from "@/hooks/useCardGame.ts";
import { cn } from "@/utils.ts";

export const Helpers = (props: { show: boolean }) => {
  const { animation, shadow, transparency } = useQualitySettings((state) => ({
    animation: state.animations,
    transparency: state.transparency,
    shadow: state.shadows,
  }));

  const [helpIndex, setHelpIndex] = React.useState<number>(0);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 -translate-y-full -translate-x-full w-fit",
        "rounded-br-3xl border-8 border-upgrade border-t-0 border-l-0 p-4",
        {
          "bg-card/50": transparency,
          "bg-card": !transparency,
          "shadow shadow-black/50": shadow && transparency,
          "transition-transform duration-500 ease-in-out": animation,
          "translate-x-0 translate-y-0 cursor-pointer": props.show,
        },
      )}
      onClick={() => setHelpIndex((helpIndex + 1) % helpers.length)}
    >
      <div className="flex gap-2 items-center justify-start select-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Question className="h-6 cursor-pointer" />
          <span
            className="whitespace-nowrap"
            dangerouslySetInnerHTML={{
              __html: formatText(helpers[helpIndex]),
            }}
          />
        </div>
      </div>
    </div>
  );
};
