import React, { useState, useRef, useEffect, CSSProperties } from "react";

type Rect = Pick<DOMRect, "width" | "height" | "left" | "top">;

interface TiltProps {
  style?: CSSProperties;
  className?: string;
  options?: Partial<typeof defaultSettings>;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

const defaultSettings = {
  reverse: false,
  max: 20,
  perspective: 1000,
  easing: "cubic-bezier(.03,.98,.52,.99)",
  scale: "1",
  speed: 1000,
  transition: true,
  axis: null as "x" | "y" | null,
  reset: true,
};

const Tilt: React.FC<TiltProps> = ({
  style,
  className,
  options = {},
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [currentStyle, setCurrentStyle] = useState<CSSProperties>({});
  const settings = { ...defaultSettings, ...options };
  const reverse = settings.reverse ? -1 : 1;

  const updateElementPosition = (): Rect => {
    const element = ref.current!;
    const rect = element.getBoundingClientRect();
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
      left: rect.left,
      top: rect.top,
    };
  };

  const getValues = (e: React.MouseEvent, position: Rect) => {
    const x = (e.clientX - position.left) / position.width;
    const y = (e.clientY - position.top) / position.height;
    const _x = Math.min(Math.max(x, 0), 1);
    const _y = Math.min(Math.max(y, 0), 1);
    const tiltX = (reverse * (settings.max / 2 - _x * settings.max)).toFixed(2);
    const tiltY = (reverse * (_y * settings.max - settings.max / 2)).toFixed(2);
    return {
      tiltX,
      tiltY,
    };
  };

  const setTransition = () => {
    setCurrentStyle((prevStyle) => ({
      ...prevStyle,
      transition: `${settings.speed}ms ${settings.easing}`,
    }));
    setTimeout(() => {
      setCurrentStyle((prevStyle) => ({
        ...prevStyle,
        transition: "",
      }));
    }, settings.speed);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    setCurrentStyle((prevStyle) => ({
      ...prevStyle,
      willChange: "transform",
    }));
    setTransition();
    onMouseEnter?.(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const position = updateElementPosition();
    const values = getValues(e, position);
    setCurrentStyle((prevStyle) => ({
      ...prevStyle,
      transform: `perspective(${settings.perspective}px) rotateX(${
        settings.axis === "x" ? 0 : values.tiltY
      }deg) rotateY(${settings.axis === "y" ? 0 : values.tiltX}deg) scale3d(${settings.scale}, ${settings.scale}, ${settings.scale})`,
    }));
    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setTransition();
    if (settings.reset) {
      setCurrentStyle((prevStyle) => ({
        ...prevStyle,
        transform: `perspective(${settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      }));
    }
    onMouseLeave?.(e);
  };

  useEffect(() => {
    const element = ref.current;
    if (element?.parentElement?.querySelector(":hover") === element) {
      handleMouseEnter(
        new MouseEvent("mouseenter") as unknown as React.MouseEvent,
      );
    }
  }, [handleMouseEnter]);

  return (
    <div
      style={{ ...style, ...currentStyle }}
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export { Tilt };
