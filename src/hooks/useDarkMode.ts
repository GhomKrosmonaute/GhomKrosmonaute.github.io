import { useEffect, useCallback } from "react";

const useDarkMode = () => {
  const toggleDarkMode = useCallback(() => {
    const html = document.querySelector("html");
    if (html) {
      const theme = html.classList.toggle("dark") ? "dark" : "light";

      localStorage.setItem("theme", theme);
    }
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      toggleDarkMode();
    } else if (!theme) {
      const prefersDarkScheme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      );
      if (prefersDarkScheme.matches) {
        toggleDarkMode();
      }
    }
  }, [toggleDarkMode]);

  return toggleDarkMode;
};

export default useDarkMode;
