import React from "react"
import { cn } from "@/utils.ts"
import { tags } from "@/game-safe-utils.tsx"
import type { ActionCardFamily } from "@/game-typings.ts"
import { useLazyImport } from "@/hooks/useLazyImport.ts"
import { useHelpPopover } from "@/hooks/useHelpPopover.tsx"

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
}: Omit<React.ComponentProps<"span">, "ref"> & {
  name: keyof typeof tags
  plural?: boolean
}) => {
  const tag = tags[name]

  const ref = React.useRef<HTMLSpanElement>(null)
  useHelpPopover(
    ref,
    <>
      <h3>{tag.name}</h3>
      {tag.description}
    </>,
  )

  return (
    <span
      ref={ref}
      {...props}
      className={cn(
        sharedClassName,
        "className" in tag && tag.className,
        props.className,
      )}
      style={{
        ...sharedStyle,
        ...props.style,
        color: "className" in tag ? undefined : `hsl(var(--${name}))`,
      }}
    >
      {children ?? (
        <>
          {tag.name}
          {plural && "plural" in tag ? tag.plural : ""}
        </>
      )}
    </span>
  )
}

export const Family = ({
  name,
  ...props
}: Omit<React.ComponentProps<"span">, "ref"> & { name: ActionCardFamily }) => {
  const ref = React.useRef<HTMLSpanElement>(null)
  const cards = useLazyImport(() => import("@/data/cards.tsx"))

  useHelpPopover(
    ref,
    <>
      <h3 className="mb-2">Famille {name}</h3>
      <ul className="flex flex-wrap gap-2">
        {cards
          ?.filter(
            (card) => card.type === "action" && card.families.includes(name),
          )
          .map((card) => (
            <li key={card.name} className="border rounded-md px-1 bg-muted">
              {card.name}
            </li>
          ))}
      </ul>
    </>,
  )

  return (
    <span
      ref={ref}
      {...props}
      className={cn(
        "text-lg text-action-foreground font-bold bg-action/30 ring-1 ring-action px-1 rounded-sm inline-flex leading-3 pt-1",
        props.className,
      )}
      style={{
        ...sharedStyle,
        ...props.style,
      }}
    >
      # {name}
    </span>
  )
}

export const New = () => {
  return (
    <span
      className="text-xs text-white bg-pink-800 px-1 py-0.5 rounded-md inline-block font-changa"
      style={{
        transform: "translateZ(25px)",
      }}
    >
      NEW!
    </span>
  )
}
