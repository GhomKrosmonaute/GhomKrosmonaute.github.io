import { accordStyleToTheme, cn } from "@/utils.ts"
import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

export const Macbook = ({ force }: { force?: true }) => {
  const theme = useSettings((state) => state.theme)
  const isLoaded = useGlobalState((state) => state.splineLoaded)

  return (
    <div
      className={cn(
        "absolute w-full h-full overflow-hidden flex justify-center items-center",
        { hidden: isLoaded && !force },
      )}
      style={{
        ...accordStyleToTheme(theme),
        backgroundImage: "url(images/spline-placeholder.png)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  )
}
