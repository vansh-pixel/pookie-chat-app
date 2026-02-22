"use client";
import React from 'react';
import { motion } from 'framer-motion';

const WebTransition = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Creates a radial web explosion effect */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 30], opacity: [1, 1, 0] }}
                transition={{ duration: 1.5, ease: "easeInOut", times: [0, 0.4, 1] }}
                onAnimationComplete={onComplete}
                className="relative"
            >
                <svg width="400" height="400" viewBox="0 0 200 200" className="drop-shadow-2xl">
                    <path
                        d="M100 100 L100 0 M100 100 L170 30 M100 100 L200 100 M100 100 L170 170 M100 100 L100 200 M100 100 L30 170 M100 100 L0 100 M100 100 L30 30"
                        stroke="white"
                        strokeWidth="2"
                    />
                    <circle cx="100" cy="100" r="20" fill="none" stroke="white" strokeWidth="2" />
                    <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="2" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="2" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" />

                    {/* Web texture background fill simulation */}
                    <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.9)" />
                </svg>
            </motion.div>
        </motion.div>
    );
};

export default WebTransition;
