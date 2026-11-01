
import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface InteractiveCreatureProps {
    targetButtonText?: string;
    className?: string;
    isCursor?: boolean;
    variant?: 'purple' | 'indigo' | 'emerald' | 'amber';
}

const InteractiveCreature: React.FC<InteractiveCreatureProps> = ({
    targetButtonText = 'Try now',
    className = "",
    isCursor = false,
    variant = 'purple'
}) => {
    const variants = {
        purple: {
            body: "bg-[radial-gradient(circle_at_30%_30%,_#C4B5FD_0%,_#7C3AED_60%,_#5B21B6_100%)] shadow-purple-500/40",
            arm: "bg-[#7C3AED]"
        },
        indigo: {
            body: "bg-[radial-gradient(circle_at_30%_30%,_#818CF8_0%,_#4F46E5_60%,_#3730A3_100%)] shadow-indigo-500/40",
            arm: "bg-[#4F46E5]"
        },
        emerald: {
            body: "bg-[radial-gradient(circle_at_30%_30%,_#6EE7B7_0%,_#10B981_60%,_#047857_100%)] shadow-emerald-500/40",
            arm: "bg-[#10B981]"
        },
        amber: {
            body: "bg-[radial-gradient(circle_at_30%_30%,_#FCD34D_0%,_#F59E0B_60%,_#B45309_100%)] shadow-amber-500/40",
            arm: "bg-[#F59E0B]"
        }
    };

    const [isNearButton, setIsNearButton] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [eyeDirection, setEyeDirection] = useState({ x: 0, y: 0 });
    const creatureRef = useRef<HTMLDivElement>(null);
    const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Spring physics for smooth movement
    const x = useMotionValue(0);
    const y = useMotionValue(isCursor ? 0 : 30);

    const springConfig = isCursor
        ? { damping: 25, stiffness: 200, mass: 0.5 }
        : { damping: 20, stiffness: 100, mass: 0.8 };

    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    // Blinking logic
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            if (Math.random() > 0.8) {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }
        }, 3000);
        return () => clearInterval(blinkInterval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setIsActive(true);
            if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
            activityTimeoutRef.current = setTimeout(() => setIsActive(false), 2000);

            if (!creatureRef.current) return;

            // Follow mouse coordinates directly for cursor mode
            if (isCursor) {
                x.set(e.clientX);
                y.set(e.clientY);
            }

            // Always track cursor with eyes
            const creatureRect = creatureRef.current.getBoundingClientRect();
            const creatureCenterX = creatureRect.left + creatureRect.width / 2;
            const creatureCenterY = creatureRect.top + creatureRect.height / 2;

            const deltaX = e.clientX - creatureCenterX;
            const deltaY = e.clientY - creatureCenterY;
            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 100, 1);

            setEyeDirection({
                x: Math.cos(angle) * distance * 8, // High fidelity look range
                y: Math.sin(angle) * distance * 8
            });

            // Button interaction logic
            const buttons = Array.from(document.querySelectorAll('button'));
            const hoveredButton = buttons.find(btn => {
                const rect = btn.getBoundingClientRect();
                return e.clientX > rect.left && e.clientX < rect.right &&
                    e.clientY > rect.top && e.clientY < rect.bottom;
            });

            // Enhanced check for specific target buttons if none is hovered directly
            const targetButton = hoveredButton || buttons.find(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                return text.includes('log in') ||
                    text.includes('sign up') ||
                    text.includes('create account') ||
                    text.includes('google') ||
                    text.includes('github') ||
                    text.includes(targetButtonText.toLowerCase());
            });

            let localIsNear = false;
            if (targetButton) {
                const buttonRect = targetButton.getBoundingClientRect();
                const buttonCenterX = buttonRect.left + buttonRect.width / 2;
                const buttonCenterY = buttonRect.top + buttonRect.height / 2;

                const mouseToButtonDist = Math.sqrt(
                    Math.pow(e.clientX - buttonCenterX, 2) + Math.pow(e.clientY - buttonCenterY, 2)
                );

                const triggerDistance = isCursor ? 100 : 250; // Reduced trigger distance for more precision
                localIsNear = mouseToButtonDist < triggerDistance || !!hoveredButton;
            }

            setIsNearButton(localIsNear);

            if (!isCursor) {
                x.set(0);
                // Move up when near button, otherwise return to base 30px position
                y.set(localIsNear ? -60 : 30);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
        };
    }, [x, y, isActive, targetButtonText, isCursor]);

    return (
        <motion.div
            ref={creatureRef}
            style={{
                x: xSpring,
                y: ySpring,
                position: isCursor ? 'fixed' : 'relative',
                left: isCursor ? 0 : 'auto',
                top: isCursor ? 0 : 'auto',
                zIndex: isCursor ? 9999 : 'auto',
                pointerEvents: 'none',
                transform: isCursor ? 'translate(-50%, -50%)' : 'none'
            }}
            className={className}
        >
            <motion.div
                animate={{
                    scale: isNearButton ? 1.05 : 1,
                    rotate: isNearButton ? [0, -1, 1, 0] : 0
                }}
                transition={{
                    rotate: { repeat: isNearButton ? Infinity : 0, duration: 2, ease: "easeInOut" }
                }}
            >
                {/* Main Body - 3D Look */}
                <div className={`w-24 h-24 rounded-full shadow-2xl relative border-[3px] border-white/90 transition-all duration-300 ${variants[variant].body}`}>

                    {/* Eyes Container */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
                                <motion.div
                                    animate={{
                                        x: eyeDirection.x,
                                        y: eyeDirection.y,
                                        scaleY: isBlinking ? 0.1 : 1
                                    }}
                                    transition={{
                                        x: { type: "spring", stiffness: 400, damping: 25 },
                                        y: { type: "spring", stiffness: 400, damping: 25 },
                                        scaleY: { duration: 0.1 }
                                    }}
                                    className="w-4 h-4 bg-[#4C1D95] rounded-full flex items-center justify-center"
                                >
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* Mouth */}
                    <motion.div
                        animate={{
                            height: isNearButton ? 14 : 10,
                            width: 24,
                            borderRadius: "0 0 20px 20px"
                        }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#4C1D95] opacity-80"
                    />

                    {/* Cheeks */}
                    <div className="absolute top-12 left-2 w-4 h-2.5 bg-purple-300 rounded-full blur-[3px] opacity-40" />
                    <div className="absolute top-12 right-2 w-4 h-2.5 bg-purple-300 rounded-full blur-[3px] opacity-40" />

                    {/* Arms - Fixed */}
                    <div
                        className={`absolute -left-2 top-10 w-5 h-10 rounded-full border-2 border-white/80 origin-top-right shadow-lg -rotate-[15deg] transition-colors duration-300 ${variants[variant].arm}`}
                    />
                    <div
                        className={`absolute -right-2 top-10 w-5 h-10 rounded-full border-2 border-white/80 origin-top-left shadow-lg rotate-[15deg] transition-colors duration-300 ${variants[variant].arm}`}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InteractiveCreature;

