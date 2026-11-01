import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge about the namespaced design-system tokens in ds.css so
// `rounded-ds-card` / `shadow-ds-md` merge correctly with other classes.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['ds-control', 'ds-card', 'ds-panel'],
      shadow: ['ds-sm', 'ds-md', 'ds-lg'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
