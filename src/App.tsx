import React from "react";

import { Button } from "@/components/ui/button.tsx";

import { useMediaQuery } from "usehooks-ts";
import { useDarkMode } from "@/hooks/useDarkMode.ts";
import { useModal } from "@/hooks/useModal.ts";

import { Home } from "./modals/Home.tsx";
import { Tarifs } from "./modals/Tarifs.tsx";
import { Contact } from "./modals/Contact.tsx";
import { Game } from "./modals/Game.tsx";

import themeIcon from "./assets/theme.svg";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

export default function App() {
  const toggleDarkMode = useDarkMode();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const largeWidth = useMediaQuery("(width >= 768px)");
  const { modal, setModal } = useModal();

  React.useEffect(() => {
    if (modal === "game" && !largeScreen) {
      setModal(false);
    }
  }, [modal, largeScreen]);

  return (
    <>
      {largeWidth && (
        <React.Suspense>
          <Spline
            scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
            className="fixed top-[50svh] left-[50vw] 2xl:left-[30vw] -translate-x-1/2 -translate-y-1/2"
          />
        </React.Suspense>
      )}

      <Button
        onClick={toggleDarkMode}
        variant="icon"
        size="icon"
        className="reverse fixed m-4 right-0 top-0"
      >
        <img src={themeIcon} alt="theme icon" className="w-5 h-5" />
      </Button>

      {(!modal || modal === "game") && <Home />}
      {modal === "contact" && <Contact />}
      {modal === "tarifs" && <Tarifs />}
      {largeScreen && <Game show={modal === "game"} />}

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
