import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { accordStyleToTheme, cn } from "@/utils.ts"
import Spline from "@splinetool/react-spline"
import { useEffect, useState } from "react"
import { useSettings } from "@/hooks/useSettings.ts"

export const SplineMacbook = (props: { showGame: boolean }) => {
  const theme = useSettings((state) => state.theme)
  const [isLoaded, setIsLoaded] = useGlobalState((state) => [
    state.splineLoaded,
    state.setSplineLoaded,
  ])

  const [unload, setUnload] = useState(false)

  useEffect(() => {
    let timeoutId = null

    if (!isLoaded) {
      timeoutId = setTimeout(() => {
        setIsLoaded(true)
      }, 1000)
    }

    return () => clearTimeout(timeoutId!)
  }, [isLoaded, setIsLoaded])

  useEffect(() => {
    if (props.showGame) {
      const timeout = setTimeout(() => {
        setUnload(true)
      }, 2000)

      return () => clearTimeout(timeout)
    } else {
      setUnload(false)
    }
  }, [props.showGame])

  return (
    <Spline
      scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
      className={cn("absolute", {
        "pointer-events-none opacity-0": !isLoaded,
        hidden: unload,
      })}
      style={accordStyleToTheme(theme)}
      // onLoad={() => {
      //   if (!isLoaded) {
      //     setIsLoaded(true)
      //   }
      // }}
    />
  )
}
