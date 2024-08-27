import { GameLog, Upgrade } from "@/hooks/useCardGame.ts";
import { cn } from "@/utils.ts";

function isUpgrade(item: GameLog["reason"]): item is Upgrade {
  return typeof item === "object" && "triggerEvent" in item;
}

export const GameMiniature = (props: { item: GameLog["reason"] }) => {
  // `images/${
  //           isUpgrade(props.item)
  //             ? "upgrades"
  //             : props.item.type === "action"
  //               ? "projects"
  //               : "techno"
  //         }/${props.item.image}`
  return (
    <span
      className={cn(
        "inline-flex items-center h-7 w-full rounded-full",
        typeof props.item === "string"
          ? ""
          : isUpgrade(props.item)
            ? "bg-upgrade text-foreground"
            : {
                "bg-action text-action-foreground":
                  props.item.type === "action",
                "bg-support text-support-foreground":
                  props.item.type === "support",
              },
      )}
    >
      {typeof props.item === "object" && (
        <img
          src={
            isUpgrade(props.item)
              ? `images/upgrades/${props.item.image}`
              : props.item.image
          }
          alt="oops"
          className={cn(
            "aspect-square rounded-full h-full",
            {
              "object-cover":
                isUpgrade(props.item) || props.item.type === "action",
              "object-contain":
                !isUpgrade(props.item) && props.item.type === "support",
            },
            isUpgrade(props.item)
              ? "ring-upgrade shadow ring-4"
              : {
                  "ring-action ring-4": props.item.type === "action",
                  "ring-support ring-4": props.item.type === "support",
                },
          )}
        />
      )}
      <div className="px-2">
        {typeof props.item === "object" ? props.item?.name : props.item}
      </div>
    </span>
  );
};
