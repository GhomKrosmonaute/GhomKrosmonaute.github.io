import React from "react"
import { createPortal } from "react-dom"
import { useTutorialPrivate } from "@/hooks/useTutorial.ts"

export const PADDING = 5

const sharedStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 10010,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  overflow: "hidden",
}

const animationStyle: React.CSSProperties = {
  transition: "all 0.3s linear",
}

export const TutorialOpaque = ({
  children,
  style,
}: React.PropsWithChildren<{ style?: React.CSSProperties }>) => {
  const { position, highlight } = useTutorialPrivate()

  const client = window.document.documentElement.getBoundingClientRect()

  if (!position || !highlight)
    return (
      <div
        className="top-0 left-0 w-screen h-svh"
        style={{
          ...sharedStyle,
          ...style,
        }}
      >
        {children}
      </div>
    )

  return createPortal(
    <>
      <div
        className="top-0 left-0"
        style={{
          width: position.left - PADDING,
          height: position.bottom + PADDING,
          ...animationStyle,
          ...sharedStyle,
          ...style,
        }}
      />
      <div
        className="top-0"
        style={{
          left: position.left - PADDING,
          width: client.width - (position.left - PADDING),
          height: position.top - PADDING,
          ...animationStyle,
          ...sharedStyle,
          ...style,
        }}
      />
      <div
        style={{
          top: position.top - PADDING,
          left: position.right + PADDING,
          width: client.width - (position.right + PADDING),
          height: client.height - (position.top - PADDING),
          ...animationStyle,
          ...sharedStyle,
          ...style,
        }}
      />
      <div
        className="left-0"
        style={{
          top: position.bottom + PADDING,
          width: position.right + PADDING,
          height: client.height - (position.bottom + PADDING),
          ...animationStyle,
          ...sharedStyle,
          ...style,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: position.top - PADDING,
          left: position.left - PADDING,
          width: position.width + PADDING * 2,
          height: position.height + PADDING * 2,
          zIndex: 10015,
          backgroundColor: "transparent",
          // outside border
          outline: "2px solid hsl(var(--upgrade))",
          borderRadius: "0.2rem",
          ...animationStyle,
        }}
      />
      <div
        style={{
          position: "fixed",
          zIndex: 10020,
        }}
      >
        {children}
      </div>
    </>,
    document.body,
  )
}
