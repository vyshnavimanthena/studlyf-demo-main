"use client";

import React, { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
    useAnimationFrame,
    useMotionValue,
} from "framer-motion";

interface ScrollVelocityContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function ScrollVelocityContainer({
    children,
    className,
}: ScrollVelocityContainerProps) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

interface ScrollVelocityRowProps {
    children: React.ReactNode;
    baseVelocity: number;
    direction?: number;
}

/**
 * @name wrap
 * @description Manual wrap function to handle the looping effect
 */
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function ScrollVelocityRow({
    children,
    baseVelocity = 100,
    direction = 1,
}: ScrollVelocityRowProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false,
    });

    /**
     * We need a large enough wrap range to ensure no gaps.
     */
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        // Multiply by the actual row direction prop (1 or -1)
        baseX.set(baseX.get() + moveBy * (direction || 1));
    });

    return (
        <div className="flex overflow-hidden whitespace-nowrap flex-nowrap">
            <motion.div style={{ x }} className="flex whitespace-nowrap flex-nowrap">
                {[...Array(6)].map((_, i) => (
                    <span key={i} className="block mr-12">
                        {children}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

