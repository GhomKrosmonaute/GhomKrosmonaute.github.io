import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import themes from "@/data/themes.json"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAbsoluteBoundingRect(element: HTMLElement): DOMRect {
  // Fonction pour obtenir le DOMRect total de l'élément et de tous ses enfants
  const calculateBoundingRect = (el: Element) => {
    const rect = el.getBoundingClientRect()

    const combinedRect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    }

    // Parcours des enfants de l'élément
    for (const child of el.children) {
      const childRect = calculateBoundingRect(child)

      // Ajuster les coordonnées du rectangle englobant
      combinedRect.top = Math.min(combinedRect.top, childRect.top)
      combinedRect.right = Math.max(combinedRect.right, childRect.right)
      combinedRect.bottom = Math.max(combinedRect.bottom, childRect.bottom)
      combinedRect.left = Math.min(combinedRect.left, childRect.left)
    }

    return combinedRect
  }

  // Appel de la fonction récursive
  const resultRect = calculateBoundingRect(element)

  // Retourner un objet DOMRect similaire à celui de getBoundingClientRect
  return new DOMRect(
    resultRect.left,
    resultRect.top,
    resultRect.right - resultRect.left,
    resultRect.bottom - resultRect.top,
  )
}

export function transferDOMRect(rect: DOMRect, to: HTMLElement) {
  // Fonction pour transférer les coordonnées d'un DOMRect à un élément
  to.style.top = `${rect.top}px`
  to.style.left = `${rect.left}px`
  to.style.width = `${rect.width}px`
  to.style.height = `${rect.height}px`
}

export function accordStyleToTheme(theme: string): React.CSSProperties {
  const existing = themes.find((t) => t[0] === theme)

  return existing
    ? {
        filter: `hue-rotate(${existing[1]}deg)`,
      }
    : {}
}
