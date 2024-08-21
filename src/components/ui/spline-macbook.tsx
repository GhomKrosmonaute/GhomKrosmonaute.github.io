import Spline from "@splinetool/react-spline";
import { useGlobalState } from "@/hooks/useGlobalState.ts";
import { cn } from "@/utils.ts";

export const SplineMacbook = () => {
  const [isLoaded, setIsLoaded] = useGlobalState((state) => [
    state.splineLoaded,
    state.setSplineLoaded,
  ]);

  return (
    <Spline
      scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
      className={cn("absolute", {
        "pointer-events-none": !isLoaded,
      })}
      onLoad={() => {
        if (!isLoaded)
          setTimeout(() => {
            setIsLoaded(true);
          }, 1000);
      }}
    />
  );
};
