import * as React from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

/** Rises 12px with a fade on open (fade only under reduced motion); same portal z-layer as Select. */
const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 8, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      data-slot="hover-card-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'studlyf-ds z-[100002] w-72 rounded-ds-card border border-ds-border bg-ds-background p-4 text-ds-foreground shadow-ds-lg outline-none',
        'data-[state=open]:animate-ds-rise data-[state=closed]:animate-ds-fade-out motion-reduce:data-[state=open]:animate-ds-fade-in',
        className,
      )}
      {...props}
    />
  </HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = 'HoverCardContent';

export { HoverCard, HoverCardTrigger, HoverCardContent };
