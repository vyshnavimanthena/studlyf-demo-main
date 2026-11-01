import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-ds-control border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'border-ds-border bg-ds-card text-ds-card-foreground',
        info: 'border-ds-lavender-strong bg-ds-lavender text-ds-foreground [&>svg]:text-ds-primary',
        warning: 'border-[#f5d9bf] bg-[#fdf6ee] text-[#7a2e0e] [&>svg]:text-ds-warning',
        destructive: 'border-[#f6c9c4] bg-[#fdf0ee] text-ds-destructive [&>svg]:text-current',
        success: 'border-[#bfe5d4] bg-[#eef9f4] text-[#0b5c42] [&>svg]:text-ds-success',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Alert({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-title" className={cn('col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('col-start-2 grid justify-items-start gap-1 text-sm leading-relaxed opacity-90 [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
