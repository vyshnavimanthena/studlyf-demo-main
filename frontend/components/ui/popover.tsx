import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

/** Portalled popover in the same z-layer as Select/HoverCard; fades in (rises 12px unless reduced motion). */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'studlyf-ds z-[100002] w-72 rounded-ds-card border border-ds-border bg-ds-background p-4 text-ds-foreground shadow-ds-lg outline-none',
        'data-[state=open]:animate-ds-fade-in data-[state=closed]:animate-ds-fade-out',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent };
