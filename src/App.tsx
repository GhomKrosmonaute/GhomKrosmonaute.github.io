import React from "react";
import useDarkMode from "./hooks/useDarkMode.ts";
import themeIcon from "./assets/theme.svg";
import { useMediaQuery } from "usehooks-ts";
import { useModal } from "./hooks/useModal.ts";
import { Home } from "./modals/Home.tsx";
import { Tarifs } from "./modals/Tarifs.tsx";
import { Contact } from "./modals/Contact.tsx";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

export default function App() {
  const toggleDarkMode = useDarkMode();
  const largeScreen = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const largeWidth = useMediaQuery("(width >= 768px)");
  const { modal, setModal } = useModal();

  return (
    <>
      {largeWidth && (
        <React.Suspense>
          <Spline
            scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode"
            style={{
              top: "50vh",
              left: "50vw",
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
        <button
          className="button fill"
          onClick={() => setModal(false)}
          style={{
            position: "fixed",
            margin: "1rem",
            right: 0,
            bottom: 0,
          }}
        >
          {/*<img src={cross} alt="back" />*/}
          Retour
          <div className="light" />
        </button>
      )}
    </>
  );
}
