import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { cn } from "@/utils.ts"
import Spline from "@splinetool/react-spline"
import { useEffect } from "react"

export const SplineMacbook = () => {
  const [isLoaded, setIsLoaded] = useGlobalState((state) => [
    state.splineLoaded,
    state.setSplineLoaded,
  ])

  useEffect(() => {
    let timeoutId = null

    if (!isLoaded) {
      timeoutId = setTimeout(() => {
        setIsLoaded(true)
      }, 1000)
    }

    return () => clearTimeout(timeoutId!)
  }, [isLoaded, setIsLoaded])

  return (
    <Spline
      scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
      className={cn("absolute", {
        "pointer-events-none": !isLoaded,
      })}
      onLoad={() => {
        if (!isLoaded) {
          setIsLoaded(true)
        }
      }}
    />
  )
}
