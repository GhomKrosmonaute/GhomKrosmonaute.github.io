import React from "react"
import { TutorialOpaque } from "./TutorialOpaque"
import { Progress } from "@/components/ui/progress.tsx"
import { Button } from "@/components/ui/button.tsx"
import Forward from "@/assets/icons/forward.svg"
import { bank } from "@/sound.ts"
import { useSettings } from "@/hooks/useSettings.ts"
import { useGlobalState } from "@/hooks/useGlobalState.ts"

export interface TutorialStep {
  id: string
  render: (renderProps: RenderProps) => React.ReactNode
}

export interface Position {
  x: number
  y: number
  top: number
  right: number
  left: number
  bottom: number
  width: number
  height: number
}

export interface RenderProps {
  position?: Position
  next: () => void
  back: () => void
  finish: () => void
  goTo: (id: string) => () => void
}

type TutorialContextType = {
  start: () => void
}

type TutorialPrivateContextType = {
  position: Position | null
  isLoading: boolean
  highlight: boolean
  setLoading: (value: boolean) => void
  setHighlight: (value: boolean) => void
}

type Props = {
  steps: TutorialStep[]
  children: React.ReactNode
  opaqueStyle?: React.CSSProperties
}

export const TutorialContext = React.createContext<TutorialContextType | null>(
  null,
)
export const TutorialPrivateContext =
  React.createContext<TutorialPrivateContextType | null>(null)

export const TutorialProvider = ({ steps, children, opaqueStyle }: Props) => {
  const isGameVisible = useGlobalState((state) => state.isCardGameVisible)
  const [isEnabled, enable] = useSettings((state) => [
    state.tutorial,
    state.updateTutorial,
  ])

  const [index, setIndex] = React.useState<number | null>(null)
  const [position, setPosition] = React.useState<Position | null>(null)
  const [currentStep, setCurrentStep] = React.useState<TutorialStep | null>(
    null,
  )

  const [isLoading, setLoading] = React.useState(false)
  const [highlight, setHighlight] = React.useState(false)

  const _getData = (newIndex: number) => {
    setLoading(true)
    _handleGetPositionFirstTime(newIndex)
    setCurrentStep(steps[newIndex] || null)
    setIndex(newIndex)
  }

  const start = () => {
    _getData(0)
  }

  const finish = () => {
    bank.bell.play()
    setIndex(null)
    setCurrentStep(null)
    setPosition(null)
    enable(false)
  }

  const next = () => {
    if (index === null) return
    if (index >= steps.length - 1) return finish()
    bank.gain.play()
    _getData(index + 1)
  }

  const back = () => {
    if (index === null) return
    if (index - 1 < 0) return finish()
    bank.play.play()
    _getData(index - 1)
  }

  const goTo = (id: string) => () => {
    let i = 0
    let newIndex = -1
    steps.forEach((step) => {
      if (step.id === id) newIndex = i
      i++
    })
    if (newIndex < 0) return
    _getData(newIndex)
  }

  const _handleGetPositionFirstTime = (index: number) => {
    if (index === null || steps[index]?.id.charAt(0) === "_") return

    const targetNode = document.body

    const observerElement = new MutationObserver((_, observer) => {
      const stepSelectedHTML = document.querySelector(steps[index]?.id || "")
      if (!stepSelectedHTML) return

      const props = stepSelectedHTML.getBoundingClientRect()
      if (!props) return

      setPosition({
        left: props.left,
        top: props.top,
        right: props.right,
        bottom: props.bottom,
        width: props.width,
        height: props.height,
        x: props.x,
        y: props.y,
      })
      observer.disconnect() // Stop observing once the modal is found
    })

    // Start observing the body for changes
    observerElement.observe(targetNode, { childList: true, subtree: true })
  }

  // USE EFFECT
  const _handleResize = () => {
    if (index === null || steps[index]?.id.charAt(0) === "_") return

    const stepSelectedHTML = document.querySelector(steps[index]?.id || "")
    if (!stepSelectedHTML) return

    const props = stepSelectedHTML.getBoundingClientRect()
    if (!props) return

    setPosition({
      left: props.left,
      top: props.top,
      right: props.right,
      bottom: props.bottom,
      width: props.width,
      height: props.height,
      x: props.x,
      y: props.y,
    })
  }

  React.useEffect(() => {
    if (!isGameVisible || !isEnabled) {
      setIndex(null)
      setCurrentStep(null)
      setPosition(null)
    } else {
      start()
    }
  }, [isEnabled, isGameVisible])

  React.useEffect(() => {
    window.addEventListener("resize", _handleResize)
    window.addEventListener("scroll", _handleResize, { capture: true })

    return () => {
      window.removeEventListener("resize", _handleResize)
      window.removeEventListener("scroll", _handleResize)
    }
  }, [index])

  let stepRendered = null

  if (currentStep && !position)
    stepRendered = <TutorialOpaque style={opaqueStyle}>{null}</TutorialOpaque>
  if (currentStep && position) {
    stepRendered = (
      <TutorialOpaque style={opaqueStyle}>
        {currentStep?.render({ position, next, back, finish, goTo }) || null}
      </TutorialOpaque>
    )
  }

  if (index !== null && steps[index]?.id.charAt(0) === "_") {
    stepRendered = (
      <TutorialOpaque style={opaqueStyle}>
        {currentStep?.render({
          position: undefined,
          next,
          back,
          finish,
          goTo,
        }) || null}
      </TutorialOpaque>
    )
  }

  return (
    <TutorialContext.Provider
      value={{
        start,
      }}
    >
      <TutorialPrivateContext.Provider
        value={{
          position,
          isLoading,
          highlight,
          setLoading,
          setHighlight,
        }}
      >
        {children}
        {stepRendered}
        {/* monitor */}
        {currentStep && (
          <div
            className="fixed w-fit right-2 bottom-2"
            style={{ zIndex: 999999 }}
          >
            {index !== null && (
              <div className="text-xl font-mono text-center text-white bg-black bg-opacity-50 p-1 rounded-md">
                {index + 1} / {steps.length}
              </div>
            )}
            <Button variant="cta" size="cta" className="my-2" onClick={finish}>
              Passer le didacticiel <Forward className="ml-2 h-5" />
            </Button>
            <Progress value={(((index ?? 0) + 1) / steps.length) * 100} />
          </div>
        )}
      </TutorialPrivateContext.Provider>
    </TutorialContext.Provider>
  )
}
