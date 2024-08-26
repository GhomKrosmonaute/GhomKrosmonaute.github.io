import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { useQualitySettings } from "@/hooks/useQualitySettings.ts";

const buttonVariants = cva(
  cn(
    "button group/button",
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "block relative overflow-hidden px-4 py-2 max-w-fit",
    "text-center leading-6 text-secondary-foreground whitespace-nowrap",
    "transition-all duration-200",
    "hover:shadow-glow-20 shadow-secondary",
    "cursor-pointer hover:cursor-pointer",
  ),
  {
    variants: {
      variant: {
        default: "bg-secondary/50 text-secondary-foreground hover:bg-secondary",
        cta: "cta bg-primary/80 text-primary-foreground hover:bg-primary shadow-primary",
        opaque:
          "bg-secondary text-secondary-foreground hover:bg-secondary-foreground/20",
        icon: "icon bg-background text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-24",
        cta: "h-10 px-4 py-2 min-w-48",
        sm: "h-6 w-6 rounded-md p-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const shadows = useQualitySettings((state) => state.shadows);
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), {
          "shadow-none hover:shadow-none": !shadows,
        })}
        ref={ref}
        {...props}
      >
        {props.children}

        <BorderLight
          opposed={variant === "cta"}
          groupName="button"
          fast
          appearOnHover
        />
      </Comp>
    );
  },
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
