import React from "react";
import DeviceDetector from "device-detector-js";

import { Button } from "@/components/ui/button.tsx";

import { useMediaQuery } from "usehooks-ts";
import { useDarkMode } from "@/hooks/useDarkMode.ts";
import { useModal } from "@/hooks/useModal.ts";

import { Home } from "./modals/Home.tsx";
import { Tarifs } from "./modals/Tarifs.tsx";
import { Contact } from "./modals/Contact.tsx";

import Theme from "@/assets/icons/theme.svg";

const SplineMacbook = React.lazy(() =>
  import("@/components/ui/spline-macbook.tsx").then((mod) => ({
    default: mod.SplineMacbook,
  })),
);

const Game = React.lazy(() =>
  import("./modals/Game.tsx").then((mod) => ({ default: mod.Game })),
);

export default function App() {
  const toggleDarkMode = useDarkMode();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const largeWidth = useMediaQuery("(width >= 768px)");
  const { modal, setModal } = useModal();
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

  React.useEffect(() => {
    if (modal === "game" && !largeScreen) {
      setModal(false);
    }
  }, [modal, largeScreen]);

  return (
    <>
      {largeWidth && desktop && (
        <React.Suspense
          fallback={
            <img
              src="images/spline-placeholder.png"
              alt="Image stylisée d'un Mac book pro"
              className="fixed top-[50svh] left-[50vw] 2xl:left-[30vw] -translate-x-1/2 -translate-y-1/2"
            />
          }
        >
          <SplineMacbook />
        </React.Suspense>
      )}

      <Button
        onClick={toggleDarkMode}
        variant="icon"
        size="icon"
        className="fixed m-4 right-0 top-0 z-50"
      >
        <Theme />
      </Button>

      {(!modal || modal === "game") && <Home />}
      {modal === "contact" && <Contact />}
      {modal === "tarifs" && <Tarifs />}
      {largeScreen && (
        <React.Suspense fallback="Loading...">
          <Game show={modal === "game"} />
        </React.Suspense>
      )}

      {modal && !largeScreen && (
        <Button
          variant="opaque"
          className="fixed m-4 right-0 bottom-0"
          onClick={() => setModal(false)}
        >
          {/*<img src={cross} alt="back" />*/}
          Retour
        </Button>
      )}
    </>
  );
}
