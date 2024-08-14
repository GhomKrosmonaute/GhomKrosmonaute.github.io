import React from "react";
import { GameCard } from "../components/GameCard.tsx";

export const Hand = (props: React.PropsWithChildren<{ show?: boolean }>) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: props.show ? -50 : "-100%",
        left: "50vw",
        transition: "bottom 1s ease-in-out",
        display: "flex",
      }}
    >
      <GameCard />
      <GameCard />
      <GameCard />
      <GameCard />
      <GameCard />
      <GameCard />
    </div>
  );
};
