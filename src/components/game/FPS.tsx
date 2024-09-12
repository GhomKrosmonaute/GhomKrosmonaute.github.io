// const times = [];
// let fps;
//
// function refreshLoop() {
//   window.requestAnimationFrame(() => {
//     const now = performance.now();
//     while (times.length > 0 && times[0] <= now - 1000) {
//       times.shift();
//     }
//     times.push(now);
//     fps = times.length;
//     refreshLoop();
//   });
// }
//
// refreshLoop();

import React from "react"

export const FPS = (props: React.ComponentProps<"span">) => {
  const [fps, setFps] = React.useState(0)

  React.useEffect(() => {
    const times: number[] = []

    let continueLoop = true

    function refreshLoop() {
      window.requestAnimationFrame(() => {
        const now = performance.now()
        while (times.length > 0 && times[0] <= now - 1000) {
          times.shift()
        }
        times.push(now)
        setFps(times.length)
        if (continueLoop) refreshLoop()
      })
    }

    refreshLoop()

    return () => {
      continueLoop = false
    }
  }, [])

  return <span {...props}>{fps} FPS</span>
}
