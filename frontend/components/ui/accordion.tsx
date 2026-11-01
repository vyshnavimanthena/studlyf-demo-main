import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} data-slot="accordion-item" className={cn('border-b border-ds-border last:border-b-0', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

/** Trigger with a large +/− indicator (the plus rotates into a minus-like cross when open). */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & { icon?: React.ReactNode }
>(({ className, children, icon, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      data-slot="accordion-trigger"
      className={cn(
        'group flex flex-1 items-start justify-between gap-4 rounded-ds-control py-5 text-left text-base font-semibold text-ds-foreground transition-colors outline-none hover:text-ds-primary focus-visible:ring-[3px] focus-visible:ring-ds-ring/30 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      {icon ?? (
        <span
          aria-hidden="true"
          className="relative mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ds-lavender text-ds-primary transition-colors group-data-[state=open]:bg-ds-primary group-data-[state=open]:text-white"
        >
          <Plus className="size-5 transition-transform duration-200 group-data-[state=open]:rotate-45" strokeWidth={2.25} />
        </span>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot="accordion-content"
    className="overflow-hidden text-[15px] text-ds-muted-foreground data-[state=closed]:animate-ds-accordion-up data-[state=open]:animate-ds-accordion-down motion-reduce:animate-none"
    {...props}
  >
    <div className={cn('pb-5 leading-relaxed', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
