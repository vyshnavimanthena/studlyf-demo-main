import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-ds-control font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ds-ring/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-ds-primary text-ds-primary-foreground shadow-ds-sm hover:bg-ds-primary-hover',
        ink: 'bg-ds-ink text-ds-ink-foreground shadow-ds-sm hover:bg-ds-ink-soft',
        outline: 'border border-ds-input bg-ds-background text-ds-foreground hover:border-ds-primary/50 hover:bg-ds-lavender',
        secondary: 'bg-ds-lavender-strong text-ds-primary hover:bg-ds-lavender-strong/70',
        ghost: 'text-ds-foreground hover:bg-ds-lavender',
        link: 'h-auto px-0 text-ds-primary underline-offset-4 hover:underline',
        white: 'bg-white text-ds-primary shadow-ds-sm hover:bg-ds-lavender focus-visible:ring-white/60',
        destructive: 'bg-ds-destructive text-ds-destructive-foreground shadow-ds-sm hover:bg-ds-destructive/90',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        default: 'h-11 px-5 text-[15px]',
        lg: 'h-13 px-7 text-base',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return <Comp ref={ref} data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
