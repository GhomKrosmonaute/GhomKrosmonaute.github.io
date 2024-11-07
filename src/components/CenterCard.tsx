import Cross from "@/assets/icons/cross.svg"
import React from "react"

import { Card } from "@/components/Card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { useSettings } from "@/hooks/useSettings.ts"
import { cn } from "@/utils.ts"
import { useMediaQuery } from "usehooks-ts"

export const CenterCard = (
  props: React.PropsWithChildren<{
    onClose?: () => unknown
    className?: string
    style?: React.CSSProperties
    big?: boolean
  }>,
) => {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const matches = useMediaQuery("(width >= 768px) and (height >= 768px)")
  const quality = useSettings((state) => ({
    blur: state.quality.blur,
    shadows: state.quality.shadows,
    animations: state.quality.animations,
  }))

  React.useEffect(() => {
    const currentModalRef = modalRef.current

    if (currentModalRef) {
      const focusableElements = currentModalRef.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      const trapFocus = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Si Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault()
              lastElement.focus() // Boucle vers le dernier élément
            }
          } else {
            // Si juste Tab
            if (document.activeElement === lastElement) {
              event.preventDefault()
              firstElement.focus() // Boucle vers le premier élément
            }
          }
        }
      }

      currentModalRef.addEventListener("keydown", trapFocus)

      // Focus sur le premier élément focusable à l'ouverture de la modal
      //firstElement?.focus();

      return () => {
        currentModalRef?.removeEventListener("keydown", trapFocus)
      }
    }
  }, [modalRef])

  return (
    <>
      <div
        className={cn(
          "group/card absolute",
          "left-0 top-0 w-full h-full md:w-auto md:h-auto",
          "md:left-1/2 mdh:md:top-1/2 md:-translate-x-1/2 mdh:md:-translate-y-1/2",
          "md:w-max md:min-w-min md:max-w-[100vw] md:max-h-[100svh]",
          "2xl:left-[70vw]",
          "mdh:flex justify-center items-center",
          props.className,
        )}
        style={props.style}
      >
        <Card
          ref={modalRef}
          className={cn(
            "rounded-none overflow-scroll border-none",
            "md:h-auto md:rounded-md md:border-2 md:overflow-hidden",
            {
              "md:transition md:ease-in-out md:duration-500":
                quality.animations,
              "md:shadow-spotlight md:hover:shadow-glow-150 md:hover:shadow-primary md:focus-within:shadow-primary md:active:shadow-primary":
                quality.shadows,
            },
            "md:hover:border-b-primary",
            // set inclination
            {
              "md:hover:backdrop-blur-md": quality.blur,
              "rotate-2 scale-95 hover:rotate-0 hover:scale-100 focus-within:rotate-0 focus-within:scale-100 active:rotate-0 active:scale-100":
                matches && quality.animations,
            },
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          borderLightAppearOnHover
        >
          {props.onClose && matches && (
            <Button
              className="reverse absolute top-0 right-0 m-4"
              variant="icon"
              size="sm"
              autoFocus
              onKeyDown={(e) => e.key === "Escape" && props.onClose?.()}
              onClick={props.onClose}
            >
              <Cross />
            </Button>
          )}

          {props.children}
        </Card>
      </div>
    </>
  )
}
