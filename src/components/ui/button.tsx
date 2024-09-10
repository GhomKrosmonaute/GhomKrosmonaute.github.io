import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";
import { BorderLight } from "@/components/ui/border-light.tsx";
import { useSettings } from "@/hooks/useSettings.ts";

const buttonVariants = cva(
  cn(
    "button group/button",
    "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-sans font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "relative overflow-hidden xs:px-4 xs:py-2 xs:max-w-fit",
    "text-center leading-6 text-secondary-foreground whitespace-nowrap",
    "transition-all duration-200",
    "hover:shadow-glow-20 shadow-secondary/50",
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
        default: "h-10 px-4 py-2 xs:min-w-24",
        cta: "h-10 px-4 py-2 xs:min-w-48",
        sm: "h-6 w-6 rounded-md p-2 *:w-5",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-0 *:w-8",
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
    const shadows = useSettings((state) => state.quality.shadows);
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        {...props}
        type={props.type || "button"}
        className={cn(
          buttonVariants({ variant, size }),
          {
            "shadow-none hover:shadow-none": !shadows,
          },
          className,
        )}
        ref={ref}
      >
        {props.children}

        <BorderLight
          opposed={variant === "cta"}
          groupName="button"
          appearOnHover
          fast
        />
      </Comp>
    );
  },
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
