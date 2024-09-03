import React from "react";
import { cn } from "@/utils.ts";

import type { GameLog, Upgrade, GameCardInfo } from "@/game-typings.ts";

export const GameMiniature = (props: { item: GameLog["reason"] }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center h-7 w-full rounded-full",
        typeof props.item === "string"
          ? ""
          : {
              "bg-action text-action-foreground": props.item.type === "action",
              "bg-support text-support-foreground":
                props.item.type === "support",
              "bg-upgrade text-upgrade-foreground":
                props.item.type === "upgrade",
            },
      )}
    >
      {typeof props.item === "object" && <MiniatureImage item={props.item} />}
      <div className="px-2">
        {typeof props.item === "object" ? props.item?.name : props.item}
      </div>
    </span>
  );
};

export const MiniatureImage = ({
  item,
  ...props
}: React.ComponentProps<"img"> & {
  item: Upgrade | GameCardInfo;
}) => {
  return (
    <img
      {...props}
      src={
        item.type === "upgrade" ? `images/upgrades/${item.image}` : item.image
      }
      alt={`miniature of ${item.name} ${item.type}`}
      className={cn(
        "aspect-square rounded-full h-full",
        {
          "object-cover": item.type === "upgrade" || item.type === "action",
          "object-contain bg-support-foreground": item.type === "support",
          "ring-upgrade shadow ring-4": item.type === "upgrade",
          "ring-action ring-4": item.type === "action",
          "ring-support ring-4": item.type === "support",
        },
        props.className,
      )}
    />
  );
};
