import React, { useEffect, useRef, useState, ReactNode } from "react"

interface ScrollItemProps {
  scrollBox: React.RefObject<HTMLElement> // La scrollbox à observer
  child: ReactNode // L'élément enfant à afficher
  placeholder: ReactNode // L'élément à afficher quand l'élément enfant est caché
}

const ScrollItem: React.FC<ScrollItemProps> = ({
  scrollBox,
  child,
  placeholder,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!scrollBox.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsVisible(entry.isIntersecting)
      },
      {
        root: scrollBox.current,
        rootMargin: "0px",
        threshold: 0.1, // Pour déclencher quand 10% de l'élément est visible
      },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [scrollBox])

  return <div ref={elementRef}>{isVisible ? child : placeholder}</div>
}

export default ScrollItem
