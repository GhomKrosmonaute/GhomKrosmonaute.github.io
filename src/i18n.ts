import React from "react"
import { useSettings } from "./hooks/useSettings"

export function t<
  T1 extends string | React.ReactNode,
  T2 extends string | React.ReactNode,
>(fr: T1, en: T2): T1 | T2 {
  const settings = useSettings.getState()
  return settings.language.startsWith("fr") ? fr : en
}
