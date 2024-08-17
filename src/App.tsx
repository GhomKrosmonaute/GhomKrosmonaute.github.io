import React from "react";

import { Button } from "@/components/ui/button.tsx";

import { useMediaQuery } from "usehooks-ts";
import { useDarkMode } from "@/hooks/useDarkMode.ts";
import { useModal } from "@/hooks/useModal.ts";

import { Home } from "./modals/Home.tsx";
import { Tarifs } from "./modals/Tarifs.tsx";
import { Contact } from "./modals/Contact.tsx";

import themeIcon from "./assets/theme.svg";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

export default function App() {
  const toggleDarkMode = useDarkMode();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const largeWidth = useMediaQuery("(width >= 768px)");
  const veryLargeWidth = useMediaQuery("(width >= 2000px)");
  const { modal, setModal } = useModal();

  return (
    <>
      {largeWidth && (
        <React.Suspense>
          <Spline
            scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
            style={{
              top: "50vh",
              left: veryLargeWidth ? "30vw" : "50vw",
              position: "fixed",
              transform: "translate(-50%, -50%)",
            }}
          />
        </React.Suspense>
      )}

      <button
        onClick={toggleDarkMode}
        className="button icon reverse"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          margin: "1rem",
        }}
      >
        <img src={themeIcon} alt="theme icon" />
        <div className="light" />
      </button>

      {!modal && <Home />}
      {modal === "contact" && <Contact />}
      {modal === "tarifs" && <Tarifs />}

      {modal && !largeScreen && (
        <Button
          variant="opaque"
          className="fixed m-4 right-0 bottom-0"
          onClick={() => setModal(false)}
        >
          {/*<img src={cross} alt="back" />*/}
          Retour
          <div className="light" />
        </Button>
      )}
    </>
  );
}
