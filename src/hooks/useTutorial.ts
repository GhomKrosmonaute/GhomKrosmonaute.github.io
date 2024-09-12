import React from "react"
import {
  TutorialContext,
  TutorialPrivateContext,
} from "@/components/game/TutorialProvider"

export const useTutorial = () => {
  const tutorialContext = React.useContext(TutorialContext)
  if (!tutorialContext)
    throw Error("useTutorial must be inside of TuturialProvider!")
  return tutorialContext
}

export const useTutorialPrivate = () => {
  const tutorialPrivateContext = React.useContext(TutorialPrivateContext)
  if (!tutorialPrivateContext)
    throw Error("useTutorial must be inside of TuturialProvider!")
  return tutorialPrivateContext
}
