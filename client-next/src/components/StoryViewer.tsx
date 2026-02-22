"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Trash2 } from 'lucide-react';

interface Overlay {
    id: string;
    type: 'text' | 'sticker' | 'gif' | 'lyrics';
    content: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    color?: string;
    fontFamily?: string;
}

interface Story {
    _id: string;
    mediaUrl: string;
    music?: { url: string; title: string; artist: string };
    overlays: Overlay[];
    createdAt: string;
}

interface StoryGroup {
    userId: string;
    username: string;
    stories: Story[];
}

interface StoryViewerProps {
    groups: StoryGroup[];
    initialGroupIndex: number;
    currentUserId: string;
    onClose: () => void;
    onDelete?: (storyId: string) => void;
}

export default function StoryViewer({ groups, initialGroupIndex, currentUserId, onClose, onDelete }: StoryViewerProps) {
    const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Default strictly to muted to bypass autoplay block

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentGroup = groups[groupIndex];
    const currentStory = currentGroup?.stories[storyIndex];

    // Handle auto-advance and progress bar
    useEffect(() => {
        if (!currentStory || isPaused) return;

        const duration = 15000; // 15 seconds per story (Instagram standard)
        const intervalTime = 50;
        const step = (intervalTime / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [currentStory, isPaused, groupIndex, storyIndex]);

    // Handle advancing when progress reaches exactly 100
    useEffect(() => {
        if (progress >= 100 && !isPaused) {
            handleNext();
        }
    }, [progress, isPaused]);

    // Handle music playback with HTMLAudioElement behavior
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentStory?.music?.url) {
            audio.muted = isMuted;
            if (!isPaused && progress < 100) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Auto-play prevented by browser. User must unmute first.", error);
                        // Force mute state if browser blocks playback
                        setIsMuted(true);
                    });
                }
            } else {
                audio.pause();
            }
        } else {
            audio.pause();
        }
    }, [currentStory, isPaused, isMuted, progress]);

    const handleNext = () => {
        setProgress(0);
        if (storyIndex < currentGroup.stories.length - 1) {
            setStoryIndex(s => s + 1);
        } else if (groupIndex < groups.length - 1) {
            setGroupIndex(g => g + 1);
            setStoryIndex(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        setProgress(0);
        if (storyIndex > 0) {
            setStoryIndex(s => s - 1);
        } else if (groupIndex > 0) {
            setGroupIndex(g => g - 1);
            // Go to the last story of the previous group
            setStoryIndex(groups[groupIndex - 1].stories.length - 1);
        } else {
            // At the very beginning, just reset progress
            setProgress(0);
        }
    };

    if (!currentStory) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
            <div className="relative w-full h-full sm:h-[90vh] sm:aspect-[9/16] sm:rounded-3xl bg-black overflow-hidden shadow-2xl flex flex-col">

                {/* 
                  Gesture Layer:
                  We put the pause/resume interaction on a dedicated background layer 
                  so it doesn't swallow clicks meant for the z-50 header buttons.
                */}
                <div
                    className="absolute inset-0 z-10"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                />
                {/* Audio Element */}
                {currentStory.music?.url && (
                    <audio
                        ref={audioRef}
                        src={currentStory.music.url}
                        muted={isMuted}
                        loop
                        playsInline
                        crossOrigin="anonymous"
                        onLoadedMetadata={(e) => {
                            (e.target as HTMLAudioElement).currentTime = currentStory.music?.startTime || 0;
                        }}
                    />
                )}
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-4">
                    {currentGroup.stories.map((s, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-75 linear"
                                style={{
                                    width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header (Username & Close) */}
                <div className="absolute top-6 left-0 right-0 z-50 flex items-center justify-between px-4 pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white overflow-hidden">
                            <img src="/avatar-placeholder.png" alt="" className="w-full h-full object-cover opacity-0" />
                        </div>
                        <span className="text-white font-bold text-sm shadow-sm">{currentGroup.username}</span>
                        <span className="text-white/60 text-xs ml-2">
                            {Math.round((Date.now() - new Date(currentStory.createdAt).getTime()) / 3600000)}h
                        </span>
                    </div>

                    <div className="flex items-center gap-3 pointer-events-auto relative z-50">
                        {currentGroup.userId === currentUserId && onDelete && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(currentStory._id); }}
                                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-red-600 transition cursor-pointer"
                                title="Delete Story"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                            className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Media Background */}
                <div className="absolute inset-0 z-0">
                    {currentStory.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                            src={currentStory.mediaUrl}
                            autoPlay
                            loop
                            muted // Muted because we handle music separately
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Overlays (Text/Stickers) */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {currentStory.overlays?.map((overlay) => (
                        <div
                            key={overlay.id}
                            className="absolute"
                            style={{
                                left: `${overlay.x}%`,
                                top: `${overlay.y}%`,
                                transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
                            }}
                        >
                            {overlay.type === 'gif' ? (
                                <img src={overlay.content} alt="Sticker" className="w-32 h-32 object-contain pointer-events-none" />
                            ) : overlay.type === 'lyrics' ? (
                                <div style={{
                                    fontFamily: overlay.fontFamily,
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: overlay.fontFamily === 'monospace' ? 'rgba(0,0,0,0.5)' : 'transparent',
                                    padding: '10px 15px',
                                    borderRadius: '12px',
                                    textShadow: overlay.fontFamily !== 'monospace' ? '0px 2px 8px rgba(0,0,0,0.8)' : 'none',
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'center',
                                    lineHeight: '1.4'
                                }}>
                                    {overlay.content}
                                </div>
                            ) : (
                                <div style={{
                                    color: overlay.color || 'white',
                                    fontFamily: overlay.fontFamily || 'inherit',
                                    fontSize: overlay.type === 'text' ? '1.5rem' : '4rem',
                                    fontWeight: 'bold',
                                    textShadow: overlay.type === 'text' ? '0px 2px 4px rgba(0,0,0,0.8)' : 'none',
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'center'
                                }}>
                                    {overlay.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Music Badge */}
                {currentStory.music?.title && (
                    <div className="absolute top-16 left-4 z-20 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center animate-pulse">
                            <span className="w-1 h-1 bg-black rounded-full" />
                        </div>
                        <span className="text-xs text-white font-medium max-w-[150px] truncate">
                            {currentStory.music.title} • {currentStory.music.artist}
                        </span>
                    </div>
                )}

                {/* Tap Zones for Navigation */}
                <div className="absolute inset-0 z-30 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev} />
                    <div className="w-2/3 h-full" onClick={handleNext} />
                </div>
            </div>
        </motion.div >
    );
}
