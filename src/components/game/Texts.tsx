import React from "react"
import { cn } from "@/utils.ts"
import { getRarityName, tags } from "@/game-safe-utils.tsx"
import type { ActionCardFamily } from "@/game-typings.ts"
import { useLazyImport } from "@/hooks/useLazyImport.ts"
import { useHelpPopover } from "@/hooks/useHelpPopover.tsx"

const sharedClassName = "inline-block font-bold px-0.5 -mx-0.5 py-0 rounded-sm"
// const sharedParentStyle = { transformStyle: "preserve-3d" } as const
const sharedStyle = { transform: "translateZ(3px)" }

export const Muted = (props: React.ComponentProps<"span">) => {
  return <span {...props} className="grayscale opacity-50" />
}

export const Bracket = ({
  children,
  ...props
}: React.ComponentProps<"span">) => {
  return (
    <span
      {...props}
      className={cn(
        " text-sm whitespace-nowrap top-0 inline-block",
        props.className,
      )}
      style={{
        transform: `rotate(3deg) ${sharedStyle.transform}`,
        ...props.style,
      }}
    >
      ( {children} )
    </span>
  )
}

export const Money = ({
  M$,
  ...props
}: Omit<React.ComponentProps<"span">, "ref"> & { M$: number }) => {
  const ref = React.useRef<HTMLSpanElement>(null)

  useHelpPopover(
    ref,
    <>
      <h3>Argent</h3>
      <p>
        L'argent est la monnaie du jeu. <br />
        Il est utilisé pour jouer certaines cartes.
      </p>
    </>,
  )

  const final =
    M$ >= 1000
      ? `${(M$ / 1000).toFixed(2).replace(".00", "").replace(/\.0\b/, "")}B`
      : `${M$}M`

  return (
    <span
      ref={ref}
      {...props}
      className={cn(sharedClassName, "text-money font-changa", props.className)}
      style={{
        ...sharedStyle,
        ...props.style,
      }}
    >
      {final}
      <span className="text-money">$</span>
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
      <BadgeList>
        {cards
          ?.filter(
            (card) => card.type === "action" && card.families.includes(name),
          )
          .map((card) => (
            <li key={card.name}>
              <Badge>{card.name}</Badge>
            </li>
          ))}
      </BadgeList>
    </>,
  )

  return (
    <span
      ref={ref}
      {...props}
      className={cn(
        "text-lg text-foreground font-bold bg-action/30 ring-1 ring-action px-1 rounded-sm inline-flex leading-3 pt-1",
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

export const RarityBadge = (props: { advantage: number; orphan?: boolean }) => {
  const [name, full] = React.useMemo(() => {
    return [
      getRarityName(props.advantage),
      getRarityName(props.advantage, true),
    ]
  }, [props.advantage])

  return (
    <span
      className={cn(
        "inline-block z-10 w-fit",
        props.orphan && "rounded-lg px-1",
      )}
      style={{
        color: `hsl(var(--${name}-foreground))`,
        backgroundColor: `hsl(var(--${name}))`,
      }}
    >
      {full}
    </span>
  )
}

export const Badge = (props: React.ComponentProps<"span">) => {
  return (
    <span className="inline-block border rounded-md px-1 bg-muted text-foreground">
      {props.children}
    </span>
  )
}

export const BadgeList = (props: { children: React.ReactNode }) => {
  return <ul className="flex flex-wrap gap-x-2 gap-y-1">{props.children}</ul>
}
