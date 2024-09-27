import { cn } from "@/utils.ts"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import React from "react"

export const ScreenMessages = (props: { show: boolean }) => {
  const [message, next] = useCardGame((state) => [
    state.screenMessageQueue[0],
    () => {
      state.dangerouslyUpdate({
        screenMessageQueue: state.screenMessageQueue.slice(1),
      })
    },
  ])

  React.useEffect(() => {
    if (!message) return

    // On attend 2s avant de retirer le message actuel de la queue, puis on met à jour le message actuel
    const timeout = setTimeout(() => {
      next()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [message, next])

  if (!props.show || !message) return null

  //new code avec l'animation décrite plus haut:
  return (
    <div
      key={message.id}
      className="absolute top-0 left-0 w-full h-full z-50 flex justify-center items-center"
    >
      {/* bande de gauche */}
      <div
        className={cn(
          message.className,
          "absolute animate-to-right duration-[2s] rounded-r-full rounded-bl-full w-full h-[120px] opacity-50",
        )}
      />

      {/* bande de droite */}
      <div
        className={cn(
          message.className,
          "absolute animate-to-left duration-[2s] rounded-l-full rounded-tr-full w-full h-[120px] opacity-50",
        )}
      />

      {/* texte de la notification */}
      <div
        className={cn(
          message.className,
          "bg-transparent font-changa italic animate-notification duration-[2s] w-fit h-fit text-center",
        )}
      >
        {message.header && (
          <>
            <span className="text-3xl">{message.header}</span>
            <br />
          </>
        )}
        <span className="text-6xl">{message.message}</span>
      </div>
    </div>
  )
}
