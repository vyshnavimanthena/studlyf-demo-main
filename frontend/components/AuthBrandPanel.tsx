import React from 'react';
import { Check } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';

type Props = { heading: React.ReactNode; subline: string; points: string[] };

/** The side panel beside the sign-in and sign-up forms: mascot, one message, what the account gives you. */
const AuthBrandPanel: React.FC<Props> = ({ heading, subline, points }) => (
    <div className="studlyf-ds relative w-full max-w-sm">
        <div aria-hidden="true" className="mb-6 flex size-16 items-center justify-center">
            <div className="scale-[0.66]">
                <InteractiveCreature className="![transform:none]" />
            </div>
        </div>
        <h2 className="text-4xl leading-[1.1] font-bold tracking-tight text-ds-foreground">{heading}</h2>
        <p className="mt-3 text-base text-ds-muted-foreground">{subline}</p>
        <ul className="mt-8 flex flex-col gap-3">
            {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] font-medium text-ds-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ds-primary text-white">
                        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {p}
                </li>
            ))}
        </ul>
    </div>
);

export default AuthBrandPanel;
