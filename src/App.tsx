import React from "react"
import DeviceDetector from "device-detector-js"
import { RouterProvider, createBrowserRouter } from "react-router-dom"

import "./App.css"

import { Button } from "@/components/ui/button.tsx"

import { useMediaQuery } from "usehooks-ts"
import { useDarkMode } from "@/hooks/useDarkMode.ts"

import { Home } from "./modals/Home.tsx"
import { Tarifs } from "./modals/Tarifs.tsx"
import { Contact } from "./modals/Contact.tsx"

import { cn } from "@/utils.ts"

import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import Theme from "@/assets/icons/theme.svg"

import themes from "@/data/themes.json"
import { Macbook } from "@/components/ui/macbook.tsx"

const SplineMacbook = React.lazy(() =>
  import("@/components/ui/macbook-animated.tsx").then((mod) => ({
    default: mod.SplineMacbook,
  })),
)

const Game = React.lazy(() =>
  import("@/modals/Game.tsx").then((mod) => ({ default: mod.Game })),
)

export default function App() {
  const toggleDarkMode = useDarkMode()

  const { godRays, animation, theme } = useSettings((state) => ({
    theme: state.theme,
    godRays: state.quality.godRays,
    animation: state.quality.animations,
  }))

  const [isCardGameVisible, setCardGameVisibility] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.setCardGameVisibility,
  ])

  // const isSplineLoaded = useGlobalState((state) => state.splineLoaded);
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)")
  const largeWidth = useMediaQuery("(width >= 768px)")
  const [desktop, setDesktop] = React.useState(false)

  React.useEffect(() => {
    const deviceDetector = new DeviceDetector()
    const userAgent = navigator.userAgent
    const device = deviceDetector.parse(userAgent)

    if (device.device) {
      switch (device.device.type) {
        case "desktop":
        case "television":
        case "smart display":
          setDesktop(true)
          break
      }
    }
  }, [])

  React.useEffect(() => {
    if (!largeScreen && process.env.NODE_ENV !== "development") {
      setCardGameVisibility(false)
    }
  }, [largeScreen])

  const router = React.useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/pricing",
          element: <Tarifs />,
        },
      ]),
    [],
  )

  return (
    <div className="font-zain text-xl leading-5">
      {largeWidth && (
        <>
          {godRays && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="jumbo absolute -inset-[10px]"></div>
            </div>
          )}

          <img
            src="images/background.svg"
            alt="background"
            className="fixed top-0 left-0 w-screen h-screen object-cover pointer-events-none bg-primary opacity-70"
            style={{
              filter: `hue-rotate(${themes.find((t) => t[0] === theme)?.[1] ?? 0}deg)`,
            }}
          />
        </>
      )}

      {largeWidth && (
        <div
          className={cn(
            { "transition-[top] duration-1000 ease-in-out": animation },
            "fixed top-[50svh] left-[50vw] 2xl:left-[30vw]",
            "-translate-x-1/2 -translate-y-1/2 w-full h-full",
            {
              "top-[-50svh]": isCardGameVisible,
            },
          )}
        >
          {desktop && animation ? (
            <>
              <React.Suspense>
                <SplineMacbook />
              </React.Suspense>
              <Macbook />
            </>
          ) : (
            <Macbook force />
          )}
        </div>
      )}

      <Button
        onClick={() => toggleDarkMode()}
        variant="icon"
        size="icon"
        className="fixed m-4 right-0 top-0 z-50"
        title="Changer de thème (dark/light)"
      >
        <Theme />
      </Button>

      <RouterProvider router={router} />

      {(process.env.NODE_ENV === "development" || largeScreen) && (
        <React.Suspense>
          <Game />
        </React.Suspense>
      )}
    </div>
  )
}
