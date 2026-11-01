import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Documented radius exception: 6px. On the 12px control radius a 20px box renders as a circle and reads as a radio button.
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      'peer size-5 shrink-0 rounded-[6px] border border-ds-input bg-ds-background shadow-ds-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ds-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-ds-primary data-[state=checked]:bg-ds-primary data-[state=checked]:text-ds-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="size-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };
