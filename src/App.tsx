import Spline from "@splinetool/react-spline";
import useDarkMode from "./hooks/useDarkMode.ts";
import themeIcon from "./assets/theme.svg";
import { useMediaQuery } from "usehooks-ts";
import { useModal } from "./hooks/useModal.ts";
import { Home } from "./modals/Home.tsx";
import { Tarifs } from "./modals/Tarifs.tsx";
import { Contact } from "./modals/Contact.tsx";

export default function App() {
  const toggleDarkMode = useDarkMode();
  const matches = useMediaQuery("(width >= 768px) and (height >= 768px)");
  const modal = useModal((state) => state.modal);

  return (
    <>
      {matches && (
        <Spline scene="https://prod.spline.design/jotuSLcx9NOHdvVx/scene.splinecode" />
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
    </>
  );
}
