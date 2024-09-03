import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/utils";
import { usePrevious } from "@/hooks/usePrevious.ts";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    barColor?: `bg-${string}`;
    increaseOnly?: boolean;
  }
>(({ barColor, className, value, increaseOnly, ...props }, ref) => {
  const previous = usePrevious(value);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1", barColor ?? "bg-primary", {
          [cn("transition-transform duration-200 ease-out", {
            "duration-500":
              typeof value === "number" && previous === 0 && value > 90,
          })]:
            !increaseOnly ||
            typeof value !== "number" ||
            typeof previous !== "number" ||
            value > previous,
        })}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
