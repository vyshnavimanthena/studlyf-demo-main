"use client";

import { motion } from "framer-motion";

export const TypewriterEffectSmooth = ({
    words,
    className,
    cursorClassName,
}: {
    words: {
        text: string;
        className?: string;
    }[];
    className?: string;
    cursorClassName?: string;
}) => {
    const wordsArray = words.map((word) => {
        return {
            ...word,
            text: word.text.split(""),
        };
    });

    const renderWords = () => {
        return (
            <div className="inline">
                {wordsArray.map((word, idx) => {
                    return (
                        <div key={`word-${idx}`} className="inline-block">
                            {word.text.map((char, index) => (
                                <span
                                    key={`char-${index}`}
                                    className={`text-[#111827] ${word.className || ""}`}
                                >
                                    {char}
                                </span>
                            ))}
                            &nbsp;
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`${className || ""}`}>
            <motion.div
                initial={{
                    width: "0%",
                }}
                animate={{
                    width: "100%",
                }}
                transition={{
                    duration: 2,
                    ease: "linear",
                    delay: 1,
                }}
                className="overflow-hidden pb-1"
            >
                <div
                    className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter"
                    style={{
                        whiteSpace: "nowrap",
                    }}
                >
                    {renderWords()}{" "}
                </div>{" "}
            </motion.div>
        </div>
    );
};

