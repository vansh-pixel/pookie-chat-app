"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCheck, EyeOff, Download } from 'lucide-react';
import { TikTokEmbed, InstagramEmbed } from 'react-social-media-embed';

interface Message {
    content: string;
    type: 'text' | 'audio' | 'missYou' | 'file' | 'sticker' | 'reel';
    timestamp: string;
    sender: string;
    read?: boolean;
}

interface MessageItemProps {
    message: Message;
    isOwn: boolean;
    darkMode?: boolean;
}

const MessageItem = ({ message, isOwn, darkMode }: MessageItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Sticker context menu state
    const [showStickerMenu, setShowStickerMenu] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const pressTimer = useRef<NodeJS.Timeout | null>(null);

    const isMissYou = message.type === 'missYou';
    const isAudio = message.type === 'audio';
    const isFile = message.type === 'file';
    const isSticker = message.type === 'sticker';
    const isText = message.type === 'text';

    const getSocialMediaType = (content: string) => {
        try {
            const url = new URL(content);
            if (url.hostname.includes('tiktok.com')) return 'tiktok';
            if (url.hostname.includes('instagram.com')) return 'instagram';
            return null;
        } catch {
            return null;
        }
    };

    const socialMediaType = isText ? getSocialMediaType(message.content) : null;

    const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowStickerMenu(false);
        if (showStickerMenu) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showStickerMenu]);

    const handleStickerContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default browser context menu
        setShowStickerMenu(true);
    };

    const handleTouchStart = () => {
        pressTimer.current = setTimeout(() => {
            setShowStickerMenu(true);
        }, 500); // 500ms long press
    };

    const handleTouchEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const saveSticker = (e: React.MouseEvent) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = message.content;
        a.download = `sticker-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setShowStickerMenu(false);
    };

    const hideSticker = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHidden(true);
        setShowStickerMenu(false);
    };

    if (isHidden) return null;

    // 1. Special "Miss You" Envelope Style
    if (isMissYou) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6`}>
                <div className="relative">
                    <AnimatePresence>
                        {!isOpen && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="cursor-pointer group relative"
                                onClick={() => setIsOpen(true)}
                            >
                                {/* Envelope Graphic */}
                                <div className="w-56 h-36 bg-hk-pink rounded-lg shadow-lg flex items-center justify-center border-2 border-pink-400 relative overflow-hidden transform transition-transform group-hover:rotate-2">
                                    <div className="absolute top-0 w-0 h-0 border-l-[112px] border-r-[112px] border-t-[80px] border-l-transparent border-r-transparent border-t-pink-200 z-10"></div>
                                    <Heart className="text-white w-12 h-12 fill-current z-20 animate-bounce-slow" />
                                    <p className="absolute bottom-2 text-white text-xs font-bold z-20">For You 🎀</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isOpen && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-xl border-4 border-hk-pink relative max-w-xs text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block mb-2"
                            >
                                <Heart className="w-12 h-12 text-hk-red fill-current" />
                            </motion.div>
                            <p className="text-xl font-cute font-bold text-hk-pink">I Miss You! 💖</p>
                            <p className="text-sm text-gray-500 mt-2">Sent with lots of love</p>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // 2. Custom Sticker Style
    if (isSticker) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
            >
                <div className="relative group flex flex-col items-end">
                    <img
                        src={message.content}
                        alt="Sticker"
                        className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-lg cursor-pointer transition-transform hover:scale-105"
                        onContextMenu={handleStickerContextMenu}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                    />

                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} bg-black/10 px-2 py-0.5 rounded-full backdrop-blur-sm self-[${isOwn ? 'flex-end' : 'flex-start'}]`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {isOwn && <CheckCheck size={14} className={message.read ? "text-green-500 stroke-[3]" : ""} />}
                    </div>

                    {/* Context Menu Overlay */}
                    <AnimatePresence>
                        {showStickerMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute z-50 ${isOwn ? 'right-0 top-full' : 'left-0 top-full'} mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden w-36`}
                            >
                                <button
                                    onClick={saveSticker}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Download size={16} />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={hideSticker}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t dark:border-gray-700 transition-colors"
                                >
                                    <EyeOff size={16} />
                                    <span>Hide</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    // 3. Standard WhatsApp/Instagram Bubble Style
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
        >
            <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl shadow-sm relative text-sm md:text-base
            ${isOwn
                        ? 'bg-hk-pink text-white rounded-tr-none'
                        : `${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-gray-100'} rounded-tl-none border`
                    }`}
            >
                {isAudio ? (
                    <audio controls src={message.content} className="h-8 w-48 md:w-64" />
                ) : isFile ? (
                    <div className="flex flex-col gap-2 p-1">
                        {message.content.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={message.content} alt="Attachment" className="max-w-full rounded-lg shadow-sm" style={{ maxHeight: '300px', objectFit: 'contain' }} />
                        ) : (
                            <a href={message.content} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-pink-400' : 'bg-gray-100 dark:bg-gray-700'} underline`}>
                                📁 View Attachment
                            </a>
                        )}
                    </div>
                ) : socialMediaType === 'tiktok' ? (
                    <div className="flex justify-center w-full min-w-[300px] mt-1 mb-2">
                        <TikTokEmbed url={message.content} width="100%" />
                    </div>
                ) : socialMediaType === 'instagram' ? (
                    <div className="flex justify-center w-full min-w-[320px] mt-1 mb-2 bg-white rounded-lg overflow-hidden">
                        <InstagramEmbed url={message.content} width="100%" />
                    </div>
                ) : message.type === 'reel' ? (
                    <div className="flex flex-col gap-2 mt-1 mb-2 max-w-[260px]">
                        <div className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden relative shadow-inner">
                            <video
                                src={message.content}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                controls
                            />
                        </div>
                        <p className={`text-xs font-bold px-1 ${isOwn ? 'text-pink-100' : 'text-gray-500'}`}>Shared a Reel</p>
                    </div>
                ) : (
                    <p className="font-cute leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}

                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? 'text-pink-100' : 'text-gray-400'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isOwn && <CheckCheck size={14} className={message.read ? "text-green-300 stroke-[3]" : ""} />}
                </div>

                {/* Tiny triangle tail */}
                <div className={`absolute top-0 w-0 h-0 border-[8px] border-transparent 
                ${isOwn
                        ? 'right-[-8px] border-t-hk-pink border-r-0'
                        : `left-[-8px] ${darkMode ? 'border-t-gray-800' : 'border-t-white'} border-l-0`
                    }`}
                />
            </div>
        </motion.div>
    );
};

export default MessageItem;
