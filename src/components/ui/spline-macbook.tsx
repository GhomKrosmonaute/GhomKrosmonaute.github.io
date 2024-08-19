import React from "react";

import Spline from "@splinetool/react-spline";
import { cn } from "@/utils.ts";

export const SplineMacbook = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  // set isLoaded to false when the component is mounted
  React.useEffect(() => {
    if (isLoaded) setIsLoaded(false);
  }, []);

  return (
    <>
      <img
        src="images/spline-placeholder.png"
        alt="Image stylisée d'un Mac book pro"
        className={cn(
          "fixed top-[50svh] left-[50vw] 2xl:left-[30vw] -translate-x-1/2 -translate-y-1/2",
          {
            "opacity-0": isLoaded,
          },
        )}
      />
      <Spline
        scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
        className={cn(
          "fixed top-[50svh] left-[50vw] 2xl:left-[30vw] -translate-x-1/2 -translate-y-1/2",
          {
            "opacity-0": !isLoaded,
          },
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
};
