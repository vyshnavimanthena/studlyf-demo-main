import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import LeaderPhoto, { curly, tileNumber } from './LeaderPhoto';
import { leaders } from './leaders';

interface LeaderQuoteDialogProps {
    index: number | null;
    onClose: () => void;
    /** The tile that opened the dialog; focus goes back to it on close. */
    returnFocusTo: React.RefObject<HTMLElement | null>;
}

/** Centred quote card. Radix handles the focus trap and Esc. */
const LeaderQuoteDialog: React.FC<LeaderQuoteDialogProps> = ({ index, onClose, returnFocusTo }) => {
    // Keep the last leader rendered while the dialog animates closed.
    const [shown, setShown] = React.useState(index);
    React.useEffect(() => {
        if (index !== null) setShown(index);
    }, [index]);
    const current = index ?? shown;
    const leader = current === null ? null : leaders[current];

    return (
        <Dialog open={index !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                onCloseAutoFocus={(e) => {
                    // There is no Radix Trigger here, so return focus to the tile ourselves.
                    const opener = returnFocusTo.current;
                    if (opener?.isConnected) {
                        e.preventDefault();
                        opener.focus({ preventScroll: true });
                    }
                }}
                className="max-w-[760px] gap-0 overflow-hidden p-0 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                {leader && current !== null && (
                    <>
                        <div className="relative aspect-[4/3] bg-ds-muted sm:aspect-auto sm:min-h-[400px]">
                            <LeaderPhoto leader={leader} eager className="absolute inset-0 object-[50%_22%]" />
                        </div>
                        <div className="flex flex-col p-7 sm:p-10">
                            <p className="text-[12px] font-semibold tracking-[0.14em] text-ds-primary tabular-nums">
                                {tileNumber(current)}
                            </p>
                            <DialogTitle asChild>
                                <blockquote className="mt-5 text-[22px] font-medium leading-[1.4] tracking-[-0.01em] text-ds-foreground sm:text-[26px]">
                                    <span aria-hidden className="mr-0.5 text-ds-primary">&ldquo;</span>
                                    {curly(leader.quote)}
                                    <span aria-hidden className="ml-0.5 text-ds-primary">&rdquo;</span>
                                </blockquote>
                            </DialogTitle>
                            <div className="mt-auto pt-8">
                                <div className="mb-5 h-px w-10 bg-ds-border" />
                                <p className="text-[16px] font-semibold text-ds-foreground">{leader.name}</p>
                                <DialogDescription className="mt-0.5 text-[14px]">
                                    {leader.role}
                                </DialogDescription>
                                <p className="mt-4 text-[12px] text-ds-subtle-foreground">
                                    Public quote. Not a STUDLYF mentor.
                                </p>
                            </div>
                        </div>
                    </>
                )}
                {/* Own close control: it sits over the photo on small screens, so it needs its own surface. */}
                <DialogClose className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full bg-ds-background/90 text-ds-muted-foreground shadow-ds-sm ring-1 ring-ds-border backdrop-blur transition-colors outline-none hover:bg-ds-lavender hover:text-ds-foreground focus-visible:ring-[3px] focus-visible:ring-ds-ring/40">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default LeaderQuoteDialog;
