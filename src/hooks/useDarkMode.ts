import { useEffect, useCallback } from "react"

export const useDarkMode = () => {
  const toggleDarkMode = useCallback((auto?: boolean) => {
    const html = document.querySelector("html")
    if (html) {
      const theme = html.classList.toggle("dark") ? "dark" : "light"

      html.classList.toggle("light")

      localStorage.setItem("theme", theme)

      if (!auto && theme === "dark")
        localStorage.setItem(
          "Jour, nuit, jour, nuit...",
          String(+(localStorage.getItem("Jour, nuit, jour, nuit...") ?? 0) + 1),
        )
    }
  }, [])

  useEffect(() => {
    const theme = localStorage.getItem("theme")

    if (
      theme === "dark" &&
      !document.querySelector("html")?.classList.contains("dark")
    ) {
      toggleDarkMode(true)
    } else if (!theme) {
      const prefersDarkScheme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      )
      if (prefersDarkScheme.matches) {
        toggleDarkMode(true)
      }
    }
  }, [toggleDarkMode])

  return toggleDarkMode
}
