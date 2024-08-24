import React from "react";

import helpers from "@/data/helpers.json";

import Question from "@/assets/icons/question.svg";

import { formatText } from "@/hooks/useCardGame.ts";

export const Helpers = () => {
  const [helpIndex, setHelpIndex] = React.useState<number>(0);
  const [helpOpened, openHelp] = React.useState<boolean>(false);

  return (
    <div className="flex gap-2 items-center justify-start">
      <div
        className="flex items-center gap-2 pointer-events-auto"
        onMouseEnter={() => setHelpIndex((helpIndex + 1) % helpers.length)}
      >
        <Question
          className="h-6 cursor-pointer"
          onClick={() => openHelp(!helpOpened)}
        />
        {helpOpened && (
          <span
            className="whitespace-nowrap"
            dangerouslySetInnerHTML={{
              __html: formatText(helpers[helpIndex]),
            }}
          />
        )}
      </div>
    </div>
  );
};
