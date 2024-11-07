import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useTutorial } from "@/hooks/useTutorial"
import React from "react"

export const GameTutorial = (props: { show: boolean }) => {
  const { start } = useTutorial()
  const tutorial = useGlobalState(({ tutorial }) => tutorial)

  React.useEffect(() => {
    if (props.show && tutorial) {
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show, tutorial])

  return null
}
