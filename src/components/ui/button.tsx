import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs sm:text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-100",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5 hover:border-foreground/50",
        secondary: "bg-card border border-border text-foreground hover:bg-muted hover:scale-105 active:scale-100",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        donate: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 font-bold active:scale-100",
        hero: "bg-background text-primary border border-border hover:bg-muted hover:scale-105 active:scale-100",
        "hero-outline": "border border-white/30 text-white hover:bg-white/10",
      },
      size: {
        default: "h-9 px-4 py-1.5",
        sm: "h-7 px-3 text-xs",
        lg: "h-9 px-5 text-sm font-semibold",
        xl: "h-10 px-6 text-sm font-bold",
        icon: "h-8 w-8 min-h-[32px] min-w-[32px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
