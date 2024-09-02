import React from "react";
import { useTutorial } from "@/hooks/useTutorial";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

export const GameTutorial = (props: { show: boolean }) => {
  const { start } = useTutorial();
  const tutorial = useGlobalState(({ tutorial }) => tutorial);

  React.useEffect(() => {
    if (props.show && tutorial) {
      start();
    }
  }, [props.show, tutorial]);

  return null;
};
