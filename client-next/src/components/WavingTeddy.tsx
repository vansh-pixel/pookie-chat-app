
"use client";

import { motion } from 'framer-motion';

const WavingTeddy = () => {
    return (
        <div className="relative w-28 h-28 mx-auto transform hover:scale-105 transition-transform duration-300" style={{ width: '112px', height: '112px' }}>
            <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <defs>
                    <linearGradient id="bearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D2691E" /> {/* Chocolate Brown */}
                        <stop offset="100%" stopColor="#8B4513" /> {/* Saddle Brown */}
                    </linearGradient>
                    <linearGradient id="snoutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE4C4" /> {/* Bisque */}
                        <stop offset="100%" stopColor="#FFDAB9" /> {/* Peach Puff */}
                    </linearGradient>
                    <filter id="bearGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Ears */}
                <circle cx="40" cy="50" r="25" fill="url(#bearGradient)" stroke="#5D4037" strokeWidth="3" />
                <circle cx="40" cy="50" r="12" fill="#FFE4C4" opacity="0.8" />

                <circle cx="160" cy="50" r="25" fill="url(#bearGradient)" stroke="#5D4037" strokeWidth="3" />
                <circle cx="160" cy="50" r="12" fill="#FFE4C4" opacity="0.8" />

                {/* Head Shape */}
                <ellipse cx="100" cy="100" rx="80" ry="70" fill="url(#bearGradient)" stroke="#5D4037" strokeWidth="3" filter="url(#bearGlow)" />

                {/* Snout Area */}
                <ellipse cx="100" cy="115" rx="35" ry="28" fill="url(#snoutGradient)" />

                {/* Eyes */}
                <circle cx="70" cy="90" r="8" fill="#333" />
                <circle cx="72" cy="88" r="2" fill="white" />

                <circle cx="130" cy="90" r="8" fill="#333" />
                <circle cx="132" cy="88" r="2" fill="white" />

                {/* Nose */}
                <path d="M90 110 Q 100 120 110 110 Q 100 105 90 110 Z" fill="#3E2723" />

                {/* Mouth */}
                <path d="M100 120 L100 130" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
                <path d="M90 130 Q 100 140 110 130" fill="none" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />

                {/* Blush */}
                <ellipse cx="50" cy="110" rx="10" ry="6" fill="#FFB6C1" opacity="0.4" />
                <ellipse cx="150" cy="110" rx="10" ry="6" fill="#FFB6C1" opacity="0.4" />

                {/* Bow Tie (Blue for Teddy) */}
                <g transform="translate(100, 160)">
                    <path d="M0 0 L-15 -10 L-15 10 Z" fill="#87CEEB" stroke="#4682B4" />
                    <path d="M0 0 L15 -10 L15 10 Z" fill="#87CEEB" stroke="#4682B4" />
                    <circle cx="0" cy="0" r="5" fill="#4682B4" />
                </g>

                {/* Waving Hand */}
                <motion.g
                    animate={{ rotate: [0, 20, 0, 20, 0] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.5, 0.8, 1]
                    }}
                    style={{ originX: "160px", originY: "140px" }}
                >
                    <circle cx="160" cy="140" r="20" fill="url(#bearGradient)" stroke="#5D4037" strokeWidth="3" />
                    <circle cx="160" cy="140" r="12" fill="#FFE4C4" opacity="0.6" />
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default WavingTeddy;
