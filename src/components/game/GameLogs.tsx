import { cn } from "@/utils.ts"
import { useCardGame } from "@/hooks/useCardGame.ts"
import { GameMiniature } from "@/components/game/GameMiniature.tsx"
import { GameMoneyIcon } from "@/components/game/GameMoneyIcon.tsx"
import { GameValueIcon } from "@/components/game/GameValueIcon.tsx"

const SIZE = 10

export const GameLogs = (props: { show: boolean }) => {
  const logs = useCardGame((state) => state.logs.toReversed())

  return (
    <div
      id="logs"
      className={cn(
        "absolute right-0 bottom-0 translate-x-full pointer-events-none min-w-52",
        {
          hidden: !props.show,
        },
      )}
    >
      <table>
        <tbody>
          {new Array(SIZE).fill(0).map((_, index) => {
            const log = logs.slice()[SIZE - 1 - index]

            return log ? (
              <tr
                key={index}
                style={{
                  opacity: index / SIZE,
                }}
              >
                <td>
                  <GameMiniature item={log.reason} />
                </td>
                <td className="pb-1.5">
                  <span
                    className={cn(
                      "inline-block ring-2",
                      log.value > 0 ? "ring-green-500" : "ring-red-500",
                      log.type === "money" ? "" : "rounded-full",
                    )}
                  >
                    {log.type === "money" ? (
                      <GameMoneyIcon miniature value={log.value} />
                    ) : (
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
  )
}
