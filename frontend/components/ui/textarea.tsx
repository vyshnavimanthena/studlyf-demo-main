import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'flex min-h-24 w-full rounded-ds-control border border-ds-input bg-ds-background px-3.5 py-3 text-[15px] text-ds-foreground shadow-ds-sm transition-[border-color,box-shadow] outline-none placeholder:text-ds-subtle-foreground focus-visible:border-ds-ring focus-visible:ring-[3px] focus-visible:ring-ds-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ds-destructive aria-invalid:ring-ds-destructive/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
