import { useSettings } from "./hooks/useSettings"

export function t(fr: string, en: string) {
  const settings = useSettings.getState()
  return settings.language.startsWith("fr") ? fr : en
}
