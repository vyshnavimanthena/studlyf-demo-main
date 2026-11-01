import { motion } from "framer-motion";
import React from "react";

export function AuroraText({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    // Determine if the user has provided a custom gradient in the className
    const hasCustomGradient = className?.includes('bg-gradient');
    const gradientClass = hasCustomGradient ? "" : "from-[#7C3AED] via-[#3B82F6] via-[#EC4899] to-[#7C3AED]";

    return (
        <span className={`relative inline-flex ${hasCustomGradient ? "" : className}`}>
            <span
                className={`absolute inset-0 z-0 bg-gradient-to-r ${gradientClass} ${hasCustomGradient ? className : ""} bg-clip-text text-transparent`}
                style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    width: "max-content",
                    padding: "1rem 0"
                }}
            >
                {children}
            </span>
            <span className="invisible py-4">{children}</span>
        </span>
    );
}

