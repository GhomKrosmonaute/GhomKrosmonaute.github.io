import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    barColor?: `bg-${string}`;
    increaseOnly?: boolean;
  }
>(({ barColor, className, value, ...props }, ref) => {
  const [previousValue, setPreviousValue] = React.useState<number | null>(0);

  React.useEffect(() => {
    if (value !== previousValue && value) {
      setPreviousValue(value);
    }
  }, [value]);

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
        className={cn("h-full w-full flex-1", barColor, {
          "bg-primary": !barColor,
          "transition-all": props.increaseOnly
            ? value && previousValue && value > previousValue
            : true,
        })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
