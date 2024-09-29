import { cn } from "@/utils.ts"
import { useSettings } from "@/hooks/useSettings.ts"
import { buttonVariants } from "@/components/ui/button.tsx"
import Coffee from "@/assets/icons/coffee.svg"

export const BuyMeACoffee = (props: { animated?: boolean }) => {
  const quality = useSettings((state) => ({
    animation: state.quality.animations,
    transparency: state.quality.transparency,
  }))

  if (!props.animated)
    return (
      <a
        href="http://buymeacoffee.com/ghom"
        target="_blank"
        className={buttonVariants({
          variant: "icon",
          className: "border-2 border-singularity text-singularity gap-2",
        })}
      >
        <Coffee /> Buy me a coffee
      </a>
    )

  return (
    <div
      className={cn({
        "animate-bounce w-full hover:duration-500":
          quality.animation && props.animated,
      })}
    >
      <a
        href="https://buymeacoffee.com/ghom"
        target="_blank"
        className={cn(
          "text-2xl flex justify-center ring-2 ring-singularity text-singularity rounded-md py-2 mx-auto w-[220px] gap-2",
          {
            "bg-card/50 hover:bg-card": quality.transparency,
            "bg-card": !quality.transparency,
          },
        )}
      >
        <Coffee className="w-8 h-8" /> Buy me a coffee
      </a>
    </div>
  )
}
