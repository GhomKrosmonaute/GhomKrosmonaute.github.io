import React from "react"
import { cn } from "@/utils.ts"
import { tags } from "@/game-safe-utils.tsx"
import type { ActionCardFamily } from "@/game-typings.ts"
import { useLazyImport } from "@/hooks/useLazyImport.ts"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx"

const sharedClassName = "inline-block font-bold"
const sharedParentStyle = { transformStyle: "preserve-3d" } as const
const sharedStyle = { transform: "translateZ(3px)" }

export const Muted = (props: React.ComponentProps<"span">) => {
  return <span {...props} className="grayscale opacity-50" />
}

export const Bracket = (props: React.ComponentProps<"span">) => {
  return (
    <span
      className="relative inline-block w-0 h-auto"
      style={sharedParentStyle}
    >
      <span
        {...props}
        className={cn(
          "absolute text-xs whitespace-nowrap top-0 inline-block",
          props.className,
        )}
        style={{
          transform: `rotate(5deg) translateX(-50%) translateY(-30%) ${sharedStyle.transform}`,
          ...props.style,
        }}
      />
    </span>
  )
}

export const Money = ({
  M$,
  ...props
}: React.ComponentProps<"span"> & { M$: number }) => {
  const final =
    M$ >= 1000
      ? `${(M$ / 1000).toFixed(2).replace(".00", "").replace(/\.0\b/, "")}B$`
      : `${M$}M$`

  return (
    <span
      {...props}
      className={cn(
        "bg-money text-money-foreground px-1 py-0 border border-money-foreground font-changa",
        sharedClassName,
      )}
      style={{
        ...sharedStyle,
        ...props.style,
      }}
    >
      {final}
    </span>
  )
}

export const Tag = ({
  name,
  plural,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  name: keyof typeof tags
  plural?: boolean
}) => {
  const tag = tags[name]

  return (
    <HoverCard openDelay={1000} closeDelay={1500}>
      <HoverCardTrigger asChild>
        <span
          {...props}
          className={cn(
            sharedClassName,
            "className" in tag && tag.className,
            props.className,
          )}
          style={{
            ...sharedStyle,
            ...props.style,
          }}
        >
          {children ?? (
            <>
              {tag.name}
              {plural && "plural" in tag ? tag.plural : ""}
            </>
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="left" sideOffset={100}>
        {tag.description}
      </HoverCardContent>
    </HoverCard>
  )
}

export const Family = ({
  name,
  ...props
}: React.ComponentProps<"span"> & { name: ActionCardFamily }) => {
  const cards = useLazyImport(() => import("@/data/cards.tsx"))

  return (
    <HoverCard openDelay={1000} closeDelay={1500}>
      <HoverCardTrigger asChild>
        <span
          {...props}
          className={cn(
            "text-lg text-action-foreground font-bold bg-action/30 ring-1 ring-action px-1 rounded-sm inline-flex leading-3 pt-1",
            props.className,
          )}
          style={{
            ...sharedParentStyle,
            ...sharedStyle,
            ...props.style,
          }}
        >
          # {name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent asChild side="left" sideOffset={100}>
        {cards && (
          <div
            style={{
              ...sharedParentStyle,
              ...sharedStyle,
              ...props.style,
            }}
          >
            Famille {name} :
            <ul className="flex flex-wrap gap-1 text-sm">
              {cards
                .filter(
                  (card) =>
                    card.type === "action" && card.families.includes(name),
                )
                .map((card) => (
                  <li key={card.name} className="border rounded-md px-1">
                    {card.name}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
