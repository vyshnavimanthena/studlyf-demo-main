import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full min-w-0 rounded-ds-control border border-ds-input bg-ds-background px-3.5 text-[15px] text-ds-foreground shadow-ds-sm transition-[border-color,box-shadow] outline-none placeholder:text-ds-subtle-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-ds-ring focus-visible:ring-[3px] focus-visible:ring-ds-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ds-destructive aria-invalid:ring-ds-destructive/20',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
