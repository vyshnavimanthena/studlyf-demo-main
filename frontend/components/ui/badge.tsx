import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-ds-lavender-strong text-ds-primary',
        solid: 'border-transparent bg-ds-primary text-ds-primary-foreground',
        ink: 'border-transparent bg-ds-ink text-ds-ink-foreground',
        outline: 'border-ds-border bg-transparent text-ds-foreground',
        muted: 'border-transparent bg-ds-muted text-ds-muted-foreground',
        success: 'border-transparent bg-[#e7f6ef] text-ds-success',
        warning: 'border-transparent bg-[#fdf1e6] text-ds-warning',
        destructive: 'border-transparent bg-[#fdecea] text-ds-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
