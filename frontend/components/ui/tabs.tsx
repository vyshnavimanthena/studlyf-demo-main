import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn('inline-flex w-fit items-center gap-1 rounded-ds-control bg-ds-muted p-1 text-ds-muted-foreground', className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      'inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-ds-control px-3.5 text-sm font-medium transition-[color,background-color,box-shadow] outline-none hover:text-ds-foreground focus-visible:ring-[3px] focus-visible:ring-ds-ring/30 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-ds-background data-[state=active]:text-ds-foreground data-[state=active]:shadow-ds-sm [&_svg]:size-4 [&_svg]:shrink-0',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} data-slot="tabs-content" className={cn('outline-none focus-visible:ring-[3px] focus-visible:ring-ds-ring/30', className)} {...props} />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
