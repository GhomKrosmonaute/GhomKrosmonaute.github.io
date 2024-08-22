import React, { useMemo } from "react";
import DeviceDetector from "device-detector-js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";

import { useMediaQuery } from "usehooks-ts";
import { useDarkMode } from "@/hooks/useDarkMode.ts";

import { Home } from "./modals/Home.tsx";
import { Tarifs } from "./modals/Tarifs.tsx";
import { Contact } from "./modals/Contact.tsx";

import Theme from "@/assets/icons/theme.svg";
import { cn } from "@/utils.ts";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

const SplineMacbook = React.lazy(() =>
  import("@/components/ui/spline-macbook.tsx").then((mod) => ({
    default: mod.SplineMacbook,
  })),
);

const Game = React.lazy(() =>
  import("./modals/Game.tsx").then((mod) => ({ default: mod.Game })),
);

const Music = React.lazy(() =>
  import("@/components/game/Music.tsx").then((mod) => ({ default: mod.Music })),
);

export default function App() {
  const toggleDarkMode = useDarkMode();
  const isCardGameVisible = useGlobalState((state) => state.isCardGameVisible);
  // const isSplineLoaded = useGlobalState((state) => state.splineLoaded);
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const largeWidth = useMediaQuery("(width >= 768px)");
  const [desktop, setDesktop] = React.useState(false);

  React.useEffect(() => {
    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);

    if (device.device) {
      switch (device.device.type) {
        case "desktop":
        case "television":
        case "smart display":
          setDesktop(true);
          break;
      }
    }
  }, []);

  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            path: "/",
            element: (
              <>
                <Home />
                {largeScreen && (
                  <React.Suspense fallback="Loading...">
                    <Game show={false} />
                  </React.Suspense>
                )}
              </>
            ),
          },
          {
            path: "/contact",
            element: <Contact />,
          },
          {
            path: "/pricing",
            element: <Tarifs />,
          },
          largeScreen
            ? {
                path: "/card-game",
                element: (
                  <>
                    <Home inGame />
                    {largeScreen && (
                      <React.Suspense fallback="Loading...">
                        <Game show={true} />
                        <Music />
                      </React.Suspense>
                    )}
                  </>
                ),
              }
            : null,
        ].filter((route) => !!route),
      ),
    [largeScreen],
  );

  return (
    <>
      {largeWidth && (
        <div
          className={cn(
            "fixed transition-[top] duration-1000 ease-in-out top-[50svh] left-[50vw] 2xl:left-[30vw]",
            "-translate-x-1/2 -translate-y-1/2 w-full h-full",
            {
              "top-[-50svh]": isCardGameVisible,
            },
          )}
        >
          {desktop ? (
            <React.Suspense>
              <SplineMacbook />
            </React.Suspense>
          ) : (
            <img
              src="images/spline-placeholder.png"
              alt="Image stylisée d'un Mac book pro"
              className="absolute"
            />
          )}
        </div>
      )}

      <Button
        onClick={toggleDarkMode}
        variant="icon"
        size="icon"
        className="fixed m-4 right-0 top-0 z-50"
      >
        <Theme />
      </Button>

      <RouterProvider router={router} />
    </>
  );
}
