"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, X, Type, Smile, Music, Sticker, Trash2, Wand2 } from 'lucide-react';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import axios from 'axios';
import { API_URL } from '../config/api';

interface Overlay {
    id: string;
    type: 'text' | 'sticker' | 'gif' | 'lyrics';
    content: string;
    x: number; // percentage
    y: number; // percentage
    scale: number;
    rotation: number;
    color?: string;
    fontFamily?: string;
}

const FILTER_OPTIONS = [
    'none',
    'grayscale(100%)',
    'sepia(100%)',
    'blur(4px)',
    'brightness(1.5)',
    'contrast(1.5)',
    'hue-rotate(90deg)',
    'invert(100%)'
];

interface StoryEditorProps {
    userId: string;
    partnerId: string;
    darkMode: boolean;
    onClose: () => void;
    onPublish: () => void;
}

export default function StoryEditor({ userId, partnerId, darkMode, onClose, onPublish }: StoryEditorProps) {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [music, setMusic] = useState<{ url: string; title: string; artist: string; startTime?: number } | null>(null);

    // Tools State
    const [showTextTool, setShowTextTool] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textColor, setTextColor] = useState('#ffffff');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMusicSearch, setShowMusicSearch] = useState(false);
    const [showMusicTrimmer, setShowMusicTrimmer] = useState(false);
    const [musicQuery, setMusicQuery] = useState('');
    const [musicResults, setMusicResults] = useState<any[]>([]);

    const audioPreviewRef = useRef<HTMLAudioElement>(null);

    // GIF State
    const [showGifSearch, setShowGifSearch] = useState(false);
    const [gifQuery, setGifQuery] = useState('');
    const [gifResults, setGifResults] = useState<any[]>([]);

    const [isPublishing, setIsPublishing] = useState(false);
    // Advanced Editing State
    const [bgFilterIndex, setBgFilterIndex] = useState(0);
    const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);

    const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    // Handle initial file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaUrl(URL.createObjectURL(file));
        }
    };

    // Add Text Overlay
    const handleAddText = () => {
        if (!textInput.trim()) return;
        const newOverlay: Overlay = {
            id: Date.now().toString(),
            type: 'text',
            content: textInput,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0,
            color: textColor
        };
        setOverlays([...overlays, newOverlay]);
        setTextInput('');
        setShowTextTool(false);
    };

    // Add Sticker Overlay
    const handleAddSticker = (emojiData: any) => {
        const newOverlay: Overlay = {
            id: Date.now().toString(),
            type: 'sticker',
            content: emojiData.emoji,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0
        };
        setOverlays([...overlays, newOverlay]);
        setShowEmojiPicker(false);
    };

    // Search Music via iTunes API
    const handleSearchMusic = async () => {
        if (!musicQuery.trim()) return;
        try {
            const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(musicQuery)}&entity=song&limit=5`);
            setMusicResults(res.data.results);
        } catch (err) {
            console.error("Music search failed", err);
        }
    };

    // Select Music & Fetch Lyrics
    const handleSelectMusic = async (track: any) => {
        setMusic({
            url: track.previewUrl,
            title: track.trackName,
            artist: track.artistName,
            startTime: 0
        });
        setShowMusicSearch(false);
        setShowMusicTrimmer(true);
        setMusicQuery('');
        setMusicResults([]);

        // Attempt to fetch lyrics
        setIsFetchingLyrics(true);
        try {
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artistName)}/${encodeURIComponent(track.trackName)}`);
            if (res.data && res.data.lyrics) {
                // Take the first 4-8 non-empty lines for a nice story snippet
                const lines = res.data.lyrics.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 6);
                const snippet = lines.join('\n');
                if (snippet) {
                    const lyricOverlay: Overlay = {
                        id: Date.now().toString(),
                        type: 'lyrics',
                        content: snippet,
                        x: 50,
                        y: 50,
                        scale: 1,
                        rotation: 0,
                        fontFamily: 'serif' // Default style
                    };
                    setOverlays(prev => [...prev, lyricOverlay]);
                }
            }
        } catch (err) {
            console.log("No lyrics found for this track.");
        } finally {
            setIsFetchingLyrics(false);
        }
    };

    // Search GIFs via Tenor API
    const handleSearchGif = async () => {
        if (!gifQuery.trim()) return;
        try {
            // Using Tenor's public search endpoint layout
            // Added searchfilter=sticker to only return transparent stickers
            const res = await axios.get(`https://g.tenor.com/v1/search?q=${encodeURIComponent(gifQuery)}&key=LIVDSRZULELA&limit=12&searchfilter=sticker`);
            setGifResults(res.data.results);
        } catch (err) {
            console.error("GIF search failed", err);
        }
    };

    // Add GIF Overlay
    const handleSelectGif = (gifUrl: string) => {
        const newOverlay: Overlay = {
            id: Date.now().toString(),
            type: 'gif',
            content: gifUrl,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0
        };
        setOverlays([...overlays, newOverlay]);
        setShowGifSearch(false);
        setGifQuery('');
        setGifResults([]);
    };

    // Handle Dragging Overlays (Simplified, converting raw pixels to percentages)
    const handleDragStart = () => {
        setIsDraggingOverlay(true);
    };

    const handleDragEnd = (e: any, info: any, id: string) => {
        setIsDraggingOverlay(false);
        if (!editorRef.current) return;
        const rect = editorRef.current.getBoundingClientRect();

        // Approximate percentage calc based on pointer position relative to container
        const xPct = ((info.point.x - rect.left) / rect.width) * 100;
        const yPct = ((info.point.y - rect.top) / rect.height) * 100;

        // If dropped in the bottom 15% of the screen (trash zone)
        if (yPct > 85) {
            setOverlays(prev => prev.filter(o => o.id !== id));
            return;
        }

        setOverlays(prev => prev.map(o => {
            if (o.id === id) {
                return { ...o, x: Math.max(0, Math.min(100, xPct)), y: Math.max(0, Math.min(100, yPct)) };
            }
            return o;
        }));
    };

    const handlePublish = async () => {
        if (!mediaFile || isPublishing) return;
        setIsPublishing(true);
        try {
            // 1. Upload Media
            const formData = new FormData();
            formData.append('file', mediaFile);
            const uploadRes = await axios.post(`${API_URL}/api/upload`, formData);
            const uploadedUrl = uploadRes.data.url;

            // 2. Publish Story
            await axios.post(`${API_URL}/api/stories`, {
                userId,
                partnerId: partnerId || null,
                mediaUrl: uploadedUrl,
                music,
                filter: FILTER_OPTIONS[bgFilterIndex],
                overlays
            });

            onPublish();
        } catch (err) {
            console.error("Failed to publish story", err);
            alert("Failed to publish. Is the server running?");
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 left-4 z-40 p-2 bg-black/50 text-white rounded-full">
                <X size={24} />
            </button>

            {!mediaUrl ? (
                // Step 1: Media Selection
                <div className="flex flex-col items-center gap-6">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-full border-4 border-dashed border-pink-500 flex flex-col items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition"
                    >
                        <ImageIcon size={40} />
                        <span className="font-bold text-sm mt-2">Add Media</span>
                    </button>
                    <p className="text-white/60 text-sm">Upload a photo or video to start</p>
                </div>
            ) : (
                // Step 2: Full Screen Editor
                <div ref={editorRef} className="relative w-full h-full sm:h-[90vh] sm:aspect-[9/16] sm:rounded-3xl mx-auto bg-gray-900 overflow-hidden shadow-2xl">
                    {/* Background Media */}
                    {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                            src={mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ filter: FILTER_OPTIONS[bgFilterIndex] }}
                        />
                    ) : (
                        <img
                            src={mediaUrl}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ filter: FILTER_OPTIONS[bgFilterIndex] }}
                        />
                    )}

                    {/* Overlays Rendering */}
                    {overlays.map((overlay) => (
                        <motion.div
                            key={overlay.id}
                            drag
                            dragMomentum={false}
                            onDragStart={handleDragStart}
                            onDragEnd={(e, info) => handleDragEnd(e, info, overlay.id)}
                            className={`absolute cursor-move touch-none z-30 ${overlay.type === 'lyrics' ? 'active:opacity-80' : ''}`}
                            onClick={() => {
                                // Cycle lyrics styles on tap
                                if (overlay.type === 'lyrics') {
                                    const styles = ['serif', 'sans-serif', 'monospace', 'cursive'];
                                    const currentIdx = styles.indexOf(overlay.fontFamily || 'serif');
                                    const nextStyle = styles[(currentIdx + 1) % styles.length];
                                    setOverlays(prev => prev.map(o => o.id === overlay.id ? { ...o, fontFamily: nextStyle } : o));
                                }
                            }}
                            style={{
                                left: `${overlay.x}%`,
                                top: `${overlay.y}%`,
                            }}
                            initial={{ transform: 'translate(-50%, -50%) scale(0.5)' }}
                            animate={{ transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)` }}
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
                                    color: overlay.color,
                                    fontFamily: overlay.fontFamily,
                                    fontSize: overlay.type === 'text' ? '2rem' : '5rem',
                                    fontWeight: 'bold',
                                    textShadow: overlay.type === 'text' ? '0px 2px 4px rgba(0,0,0,0.8)' : 'none',
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'center'
                                }}>
                                    {overlay.content}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Toolbar (Right Side) */}
                    <div className="absolute top-20 right-4 flex flex-col gap-4 z-30">
                        <button
                            onClick={() => setBgFilterIndex((prev) => (prev + 1) % FILTER_OPTIONS.length)}
                            className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 shadow-lg relative group"
                        >
                            <Wand2 size={20} />
                            {bgFilterIndex > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />}
                        </button>
                        <button onClick={() => setShowTextTool(true)} className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 shadow-lg">
                            <Type size={20} />
                        </button>
                        <div className="relative">
                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 shadow-lg">
                                <Smile size={20} />
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute right-14 top-0">
                                    <EmojiPicker onEmojiClick={handleAddSticker} theme={darkMode ? EmojiTheme.DARK : EmojiTheme.LIGHT} />
                                </div>
                            )}
                        </div>
                        <button onClick={() => setShowGifSearch(true)} className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 shadow-lg">
                            <Sticker size={20} />
                        </button>
                        <button onClick={() => setShowMusicSearch(true)} className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 shadow-lg flex relative">
                            <Music size={20} />
                            {music && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                            )}
                        </button>
                    </div>

                    {/* Text Input Modal */}
                    <AnimatePresence>
                        {showTextTool && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center p-6"
                            >
                                <textarea
                                    className="w-full bg-transparent text-white text-3xl font-bold text-center outline-none border-none resize-none min-h-[150px]"
                                    placeholder="Type something..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    style={{ color: textColor }}
                                    autoFocus
                                />
                                <div className="flex gap-2 mb-8">
                                    {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map(c => (
                                        <button key={c} onClick={() => setTextColor(c)} className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                                <button onClick={handleAddText} className="px-6 py-2 bg-white text-black font-bold rounded-full">
                                    Done
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Music Search Modal */}
                    <AnimatePresence>
                        {showMusicSearch && (
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                className="absolute bottom-0 left-0 right-0 h-2/3 bg-gray-900 rounded-t-3xl z-40 p-4 flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold text-lg">Add Music 🎵</h3>
                                    <button onClick={() => setShowMusicSearch(false)} className="text-white"><X size={24} /></button>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={musicQuery}
                                        onChange={(e) => setMusicQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchMusic()}
                                        placeholder="Search for a song..."
                                        className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
                                    />
                                    <button onClick={handleSearchMusic} className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold">Search</button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {musicResults.map((track) => (
                                        <div key={track.trackId} onClick={() => handleSelectMusic(track)} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl cursor-pointer">
                                            <img src={track.artworkUrl60} alt="Cover" className="w-10 h-10 rounded-md" />
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-sm truncate">{track.trackName}</p>
                                                <p className="text-gray-400 text-xs truncate">{track.artistName}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {musicResults.length === 0 && musicQuery && <p className="text-gray-500 text-center mt-4">No results found.</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* GIF Search Modal */}
                    <AnimatePresence>
                        {showGifSearch && (
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                className="absolute bottom-0 left-0 right-0 h-2/3 bg-gray-900 rounded-t-3xl z-40 p-4 flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold text-lg">Web Stickers 🌟</h3>
                                    <button onClick={() => setShowGifSearch(false)} className="text-white"><X size={24} /></button>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={gifQuery}
                                        onChange={(e) => setGifQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchGif()}
                                        placeholder="Search GIPHY/Tenor..."
                                        className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
                                    />
                                    <button onClick={handleSearchGif} className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold">Search</button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-3 gap-2">
                                        {gifResults.map((gif) => {
                                            const url = gif.media?.[0]?.gif?.url || gif.media_formats?.gif?.url || gif.url;
                                            if (!url) return null;
                                            return (
                                                <div key={gif.id} onClick={() => handleSelectGif(url)} className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80">
                                                    <img src={url} alt="GIF" className="w-full h-full object-cover" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {gifResults.length === 0 && gifQuery && <p className="text-gray-500 text-center mt-4">No results found.</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Publish Bar / Trash Zone */}
                    <AnimatePresence>
                        {isDraggingOverlay ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-500/80 backdrop-blur-md text-white p-4 rounded-full shadow-2xl z-40 border-2 border-red-400"
                            >
                                <Trash2 size={32} />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-30"
                            >
                                <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                    {partnerId ? 'For Partner 💖' : 'My Story'}
                                </div>
                                <button
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className={`flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg ${isPublishing ? 'opacity-50' : 'hover:scale-105'} transition-transform`}
                                >
                                    {isPublishing ? 'Publishing...' : 'Share'} <Send size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Music Trimmer Modal */}
                    <AnimatePresence>
                        {showMusicTrimmer && music && (
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                className="absolute bottom-0 left-0 right-0 h-1/2 bg-gray-900 rounded-t-3xl z-50 p-6 flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold text-lg">Trim Music ✂️</h3>
                                    <button onClick={() => setShowMusicTrimmer(false)} className="text-white"><X size={24} /></button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <p className="text-white/80 text-sm text-center">Playing: {music.title}</p>

                                    <audio
                                        src={music.url}
                                        autoPlay
                                        className="hidden"
                                        ref={audioPreviewRef}
                                        onTimeUpdate={(e) => {
                                            const audio = e.target as HTMLAudioElement;
                                            const start = music.startTime || 0;
                                            if (audio.currentTime >= start + 15) {
                                                audio.currentTime = start;
                                            }
                                        }}
                                    />

                                    <div className="px-4 mt-4">
                                        <input
                                            type="range"
                                            min="0" max="15" step="1"
                                            value={music.startTime || 0}
                                            onChange={(e) => {
                                                const newTime = parseInt(e.target.value);
                                                setMusic({ ...music, startTime: newTime });
                                                if (audioPreviewRef.current) {
                                                    audioPreviewRef.current.currentTime = newTime;
                                                    audioPreviewRef.current.play();
                                                }
                                            }}
                                            className="w-full h-2 bg-pink-500 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-white/50 mt-2 font-mono">
                                            <span>0:{String(music.startTime || 0).padStart(2, '0')}</span>
                                            <span>0:{String((music.startTime || 0) + 15).padStart(2, '0')}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setMusic(null); setShowMusicTrimmer(false); }}
                                        className="mt-8 flex items-center justify-center gap-2 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-bold transition"
                                    >
                                        <Trash2 size={18} /> Remove Music
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Music Badge indicator attached to story */}
                    {music && !showMusicSearch && !showMusicTrimmer && (
                        <div
                            onClick={() => setShowMusicTrimmer(true)}
                            className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 text-black text-xs px-4 py-2 rounded-full flex items-center gap-2 z-20 cursor-pointer shadow-lg hover:scale-105 transition font-bold"
                            title="Click to edit/trim music"
                        >
                            <Music size={14} />
                            {music.title}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
