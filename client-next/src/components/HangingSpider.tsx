"use client";
import React, { useState } from 'react';
import { motion, Transition } from 'framer-motion';

interface SpiderProps {
    type: 'spiderman' | 'spiderwoman';
}

const HangingSpider: React.FC<SpiderProps> = ({ type }) => {
    const isSpidey = type === 'spiderman';
    const [imageError, setImageError] = useState(false);
    const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

    // Image sources with local fallback to remote realistic ones
    const spideySources = [
        "/assets/spiderman.png",
        "/assets/spiderman.jpg",
        "/assets/spiderman.jpeg",
        "https://purepng.com/public/uploads/large/purepng.com-spider-man-hanging-spider-man-hanging-spider-mansuperherocomic-book-character-1701528654497t99g.png",
        "https://freepngimg.com/thumb/spiderman/2-2-spiderman-png-clipart.png"
    ];

    const gwenSources = [
        "/assets/spidergwen.png",
        "/assets/spidergwen.jpg",
        "/assets/spidergwen.jpeg",
        "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Spider-Gwen_scale.png/250px-Spider-Gwen_scale.png"
    ];

    const currentSources = isSpidey ? spideySources : gwenSources;

    const handleImageError = () => {
        if (currentSrcIndex < currentSources.length - 1) {
            setCurrentSrcIndex(prev => prev + 1);
        } else {
            setImageError(true);
        }
    };

    // Animation variants
    const swingTransition: { rotate: Transition; y: Transition } = {
        rotate: {
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
        },
        y: {
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
        }
    };

    return (
        <motion.div
            initial={{ y: -500 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            className="absolute top-0 right-10 md:right-32 z-30 pointer-events-none"
            style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.3))' }}
        >
            <motion.div
                className="origin-top" // Swing from the top where the web starts
                animate={{ rotate: [-2, 2] }} // Gentle realistic swing
                transition={swingTransition.rotate}
            >
                {/* The Web Line */}
                <div className="w-0.5 h-[calc(50vh)] bg-slate-300 mx-auto opacity-60"></div>

                {/* The Character Container */}
                <motion.div
                    className="-mt-1" // Connect to web
                    animate={{ y: [0, 8, 0] }} // Elastic bobbing
                    transition={swingTransition.y}
                >
                    {!imageError ? (
                        /* REALISTIC IMAGE MODE */
                        <img
                            src={currentSources[currentSrcIndex]}
                            alt={type}
                            className="w-48 h-auto object-contain"
                            onError={handleImageError}
                        />
                    ) : (
                        /* FALLBACK VECTOR MODE (Improved) */
                        <svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(100, 0)">
                                {/* Spiderman (Classic Red/Blue) */}
                                {isSpidey && (
                                    <g transform="scale(-0.8, -0.8) translate(0, -320)">
                                        {/* Body */}
                                        <motion.path
                                            d="M-40 20 C -60 50 -30 100 0 120 C 30 100 60 50 40 20 C 30 5 10 -10 0 -10 C -10 -10 -30 5 -40 20 Z"
                                            fill="#000099" stroke="#000055" strokeWidth="2"
                                        />
                                        <path d="M-30 20 L -20 60 L 20 60 L 30 20 Z" fill="#CC0000" /> {/* Chest */}
                                        <circle cx="0" cy="80" r="10" fill="black" opacity="0.8" /> {/* Logo */}

                                        {/* Legs (Crouched) */}
                                        <path d="M-40 20 Q -60 60 -50 90 L -30 100" fill="none" stroke="#000099" strokeWidth="20" strokeLinecap="round" />
                                        <path d="M40 20 Q 60 60 50 90 L 30 100" fill="none" stroke="#000099" strokeWidth="20" strokeLinecap="round" />

                                        {/* Boots */}
                                        <path d="M-50 90 L -50 120" fill="none" stroke="#CC0000" strokeWidth="22" strokeLinecap="round" />
                                        <path d="M50 90 L 50 120" fill="none" stroke="#CC0000" strokeWidth="22" strokeLinecap="round" />

                                        {/* Head */}
                                        <g transform="translate(0, 130)">
                                            <ellipse cx="0" cy="0" rx="30" ry="38" fill="#CC0000" />
                                            <path fill="white" stroke="black" strokeWidth="3" d="M-12 5 Q -25 -5 -15 -18 Q -5 -15 -2 -5 Z" />
                                            <path fill="white" stroke="black" strokeWidth="3" d="M12 5 Q 25 -5 15 -18 Q 5 -15 2 -5 Z" />
                                        </g>
                                    </g>
                                )}

                                {/* Spider-Gwen (White/Black/Pink) */}
                                {!isSpidey && (
                                    <g transform="scale(-0.8, -0.8) translate(0, -320)">
                                        {/* Hood Interior */}
                                        <circle cx="0" cy="110" r="40" fill="#E0115F" />

                                        {/* Body */}
                                        <path d="M-40 20 C -60 50 -30 100 0 120 C 30 100 60 50 40 20 C 30 5 10 -10 0 -10 C -10 -10 -30 5 -40 20 Z" fill="#111" />
                                        <path d="M-15 20 L -8 120 L 8 120 L 15 20 Z" fill="white" />

                                        {/* Legs */}
                                        <path d="M-40 20 Q -60 60 -50 90 L -30 100" fill="none" stroke="#111" strokeWidth="20" strokeLinecap="round" />
                                        <path d="M40 20 Q 60 60 50 90 L 30 100" fill="none" stroke="#111" strokeWidth="20" strokeLinecap="round" />

                                        {/* Shoes */}
                                        <path d="M-50 90 L -50 120" fill="none" stroke="#40E0D0" strokeWidth="22" strokeLinecap="round" />
                                        <path d="M50 90 L 50 120" fill="none" stroke="#40E0D0" strokeWidth="22" strokeLinecap="round" />

                                        {/* Head */}
                                        <g transform="translate(0, 130)">
                                            <path d="M-30 -10 Q 0 -50 30 -10 L 30 10 Q 0 50 -30 10 Z" fill="white" />
                                            <path fill="#E0115F" d="M-10 8 Q -25 -5 -15 -18 Q -5 -15 -2 -5 Z" />
                                            <path fill="#E0115F" d="M10 8 Q 25 -5 15 -18 Q 5 -15 2 -5 Z" />
                                        </g>
                                    </g>
                                )}
                            </g>
                            <path d="M100 0 L100 250" stroke="#ccc" strokeWidth="2" />
                        </svg>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default HangingSpider;
