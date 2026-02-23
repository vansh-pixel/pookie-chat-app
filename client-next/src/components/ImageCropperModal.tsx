"use client";

import { useState, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperModalProps {
    imageUrl: string;
    onApply: (settings: { bgSize: string; bgPosition: string }) => void;
    onClose: () => void;
}

export default function ImageCropperModal({ imageUrl, onApply, onClose }: ImageCropperModalProps) {
    const [zoom, setZoom] = useState(100); // 100% = cover
    const [posX, setPosX] = useState(50); // 0-100%
    const [posY, setPosY] = useState(50); // 0-100%
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const previewRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setPosX(prev => Math.max(0, Math.min(100, prev - dx * 0.2)));
        setPosY(prev => Math.max(0, Math.min(100, prev - dy * 0.2)));
        setLastPos({ x: e.clientX, y: e.clientY });
    }, [isDragging, lastPos]);

    const handleMouseUp = () => setIsDragging(false);

    const bgSize = zoom === 100 ? 'cover' : `${zoom}%`;
    const bgPosition = `${posX}% ${posY}%`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white font-cute">🖼️ Set Chat Wallpaper</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                {/* Preview */}
                <div
                    ref={previewRef}
                    className="w-full h-56 cursor-grab active:cursor-grabbing select-none"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: bgSize,
                        backgroundPosition: bgPosition,
                        backgroundRepeat: 'no-repeat',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className="w-full h-full flex items-center justify-center bg-black/20">
                        <div className="bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-700 flex items-center gap-1">
                            <Move size={12} /> Drag to reposition
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="px-5 py-4 space-y-4">
                    {/* Zoom Slider */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                            <ZoomIn size={16} /> Zoom
                        </label>
                        <div className="flex items-center gap-3">
                            <ZoomOut size={16} className="text-gray-400" />
                            <input
                                type="range"
                                min={50}
                                max={200}
                                value={zoom}
                                onChange={e => setZoom(Number(e.target.value))}
                                className="flex-1 accent-pink-500"
                            />
                            <ZoomIn size={16} className="text-gray-400" />
                            <span className="text-xs text-gray-500 w-10">{zoom}%</span>
                        </div>
                    </div>

                    {/* X Position Slider */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 block">⬅️ Horizontal Position</label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={posX}
                            onChange={e => setPosX(Number(e.target.value))}
                            className="w-full accent-pink-500"
                        />
                    </div>

                    {/* Y Position Slider */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 block">⬆️ Vertical Position</label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={posY}
                            onChange={e => setPosY(Number(e.target.value))}
                            className="w-full accent-pink-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-5 py-4 border-t dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-cute hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onApply({ bgSize, bgPosition })}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold font-cute hover:opacity-90 transition-opacity"
                    >
                        ✅ Apply Wallpaper
                    </button>
                </div>
            </div>
        </div>
    );
}
