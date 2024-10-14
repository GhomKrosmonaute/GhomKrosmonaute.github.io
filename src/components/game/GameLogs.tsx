import React from "react"
import { cn } from "@/utils.ts"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { GameMiniature } from "@/components/game/GameMiniature.tsx"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"
import {
  gameLogCardManagementValues,
  gameLogIcons,
  map,
} from "@/game-safe-utils.tsx"
import { HelpPopoverTrigger } from "@/components/game/HelpPopoverTrigger.tsx"
import { Tag } from "@/components/game/Texts.tsx"

const DISPLAYED_LOGS = 10
const ITEM_HEIGHT = 41

export const GameLogs = (props: { show: boolean }) => {
  const logs = useCardGame((state) => state.logs)
  const scrollBox = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollBox.current) {
      scrollBox.current.scrollTop = scrollBox.current.scrollHeight
    }
  }, [logs])

  return (
    <>
      <div
        id="logs"
        className="absolute w-52 right-0 bottom-0 translate-x-full pointer-events-none"
        style={{
          height: DISPLAYED_LOGS * ITEM_HEIGHT,
        }}
      />
      <div
        ref={scrollBox}
        className={cn(
          "absolute right-0 bottom-0 translate-x-full min-w-52 overflow-y-scroll",
          {
            "hidden pointer-events-none": !props.show,
          },
        )}
        style={{
          maxHeight: DISPLAYED_LOGS * ITEM_HEIGHT,
          maskImage: `linear-gradient(to bottom, transparent, black ${Math.floor(
            map(logs.length, 0, DISPLAYED_LOGS, 0, 100, true),
          )}%)`,
          scrollbarWidth: "none",
          scrollBehavior: "smooth",
        }}
      >
        <table>
          <tbody>
            {logs.map((log, index) => {
              return log ? (
                <tr key={index}>
                  <td>
                    <GameMiniature item={log.reason} />
                  </td>
                  <td className="pb-1.5">
                    <span
                      className={cn(
                        "inline-block ring-2",
                        log.type !== "cardManagement" &&
                          (log.value > 0 ? "ring-green-500" : "ring-red-500"),
                        log.type === "money" ? "" : "rounded-full",
                      )}
                    >
                      {log.type === "money" ? (
                        <GameMoneyIcon miniature value={log.value} symbol />
                      ) : log.type === "reputation" || log.type === "energy" ? (
                        <GameValueIcon
                          miniature
                          symbol
                          value={log.value}
                          colors={
                            cn({
                              "bg-reputation": log.type === "reputation",
                              "bg-energy": log.type === "energy",
                            }) as `bg-${string}`
                          }
                        />
                      ) : (
                        <>
                          {(() => {
                            const key = Object.entries(
                              gameLogCardManagementValues,
                            ).find(
                              (entry) => entry[1] === log.value,
                            )![0] as keyof typeof gameLogIcons

                            const Icon = gameLogIcons[key]

                            return (
                              <HelpPopoverTrigger
                                popover={
                                  key === "drawFromDiscard" ? (
                                    "Pioche dans la défausse"
                                  ) : key === "play" ? (
                                    "Joue"
                                  ) : (
                                    <Tag name={key} />
                                  )
                                }
                              >
                                <Icon
                                  className="h-6 w-auto"
                                  aria-label="w-5 h-5"
                                />
                              </HelpPopoverTrigger>
                            )
                          })()}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                  <td className="pb-1.5">
                    <span className="inline-block h-7"></span>
                  </td>
                  <td></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
