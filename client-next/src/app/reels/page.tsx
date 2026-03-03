"use client";

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';

interface Reel {
    _id: string;
    userId: {
        _id: string;
        username: string;
        profilePic?: string;
    };
    mediaUrl: string;
    caption: string;
    likes: string[];
    commentsCount: number;
    views: number;
    score?: number;
}

export default function ReelsPage() {
    const router = useRouter();
    const { darkMode } = useTheme();
    const [reels, setReels] = useState<Reel[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [afterToken, setAfterToken] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Track which reel is currently visible
    const [activeReelId, setActiveReelId] = useState<string | null>(null);

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const uid = localStorage.getItem('userId');
        if (!uid) {
            router.push('/');
            return;
        }
        setCurrentUserId(uid);
        fetchReels(1, uid);
    }, []);

    const fetchReels = async (pageNum: number, uid: string) => {
        if (loading || (!hasMore && pageNum !== 1)) return;
        setLoading(true);
        try {
            // Fetching from a public subbreddit that posts TikToks (Zero Storage Option)
            const url = `https://www.reddit.com/r/TikTokCringe/hot.json?limit=10${afterToken ? `&after=${afterToken}` : ''}`;

            const res = await fetch(url);
            const data = await res.json();

            const posts = data.data.children;
            const newAfter = data.data.after;

            if (!newAfter || posts.length === 0) {
                setHasMore(false);
            } else {
                setAfterToken(newAfter);
            }

            // Parse and format reddit posts into our Reel format
            const formattedReels: Reel[] = posts
                .filter((p: any) => p.data.is_video && p.data.media?.reddit_video?.fallback_url)
                .map((p: any) => ({
                    _id: p.data.id,
                    userId: {
                        _id: p.data.author,
                        username: `u/${p.data.author}`,
                        profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.data.author}`
                    },
                    mediaUrl: p.data.media.reddit_video.fallback_url,
                    caption: p.data.title,
                    likes: Array.from({ length: 0 }), // Mock likes for local UI state
                    commentsCount: p.data.num_comments,
                    views: p.data.ups // using upvotes as mock views marker
                }));

            setReels(prev => pageNum === 1 ? formattedReels : [...prev, ...formattedReels]);

            if (pageNum === 1 && formattedReels.length > 0) {
                setActiveReelId(formattedReels[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch public reels", err);
            setHasMore(false); // Stop trying if API blocked us
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore && currentUserId) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReels(nextPage, currentUserId);
        }
    };

    // Callback ref for the last element to trigger infinite scroll
    const lastReelElementRef = (node: HTMLDivElement | null) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observerRef.current.observe(node);
    };

    const handleInteract = async (reelId: string, action: 'like' | 'unlike' | 'view') => {
        if (!currentUserId) return;

        // Zero Storage Option: Only update local state, NEVER hit our backend
        if (action === 'like') {
            setReels(prev => prev.map(r =>
                r._id === reelId ? { ...r, likes: [...r.likes, currentUserId] } : r
            ));
        } else if (action === 'unlike') {
            setReels(prev => prev.map(r =>
                r._id === reelId ? { ...r, likes: r.likes.filter(id => id !== currentUserId) } : r
            ));
        }
    };

    return (
        <div className={`h-screen w-full overflow-hidden bg-black font-cute relative`}>
            {/* Header Overlay */}
            <div className="absolute top-0 w-full z-50 p-4 flex items-center gap-4 bg-gradient-to-b from-black/60 to-transparent">
                <button
                    onClick={() => router.push('/chat')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-xl font-bold tracking-wide">Reels</h1>
            </div>

            {/* Scroll Container */}
            <div className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar">
                {reels.map((reel, index) => {
                    const isLastElement = index === reels.length - 1;
                    return (
                        <div
                            key={reel._id}
                            ref={isLastElement ? lastReelElementRef : null}
                            className="h-full w-full snap-start relative flex items-center justify-center bg-zinc-900"
                        >
                            <ReelPlayer
                                reel={reel}
                                isActive={activeReelId === reel._id}
                                currentUserId={currentUserId}
                                onInteract={handleInteract}
                                onVisible={() => setActiveReelId(reel._id)}
                            />
                        </div>
                    );
                })}

                {loading && (
                    <div className="h-full w-full snap-start flex items-center justify-center text-white bg-black">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                )}

                {!loading && reels.length === 0 && (
                    <div className="h-full w-full flex flex-col items-center justify-center text-white p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">No Reels Found</h2>
                        <p className="text-gray-400">Post a reel or check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Child component to handle individual video lifecycle and visibility
function ReelPlayer({ reel, isActive, currentUserId, onInteract, onVisible }: any) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [viewRegistered, setViewRegistered] = useState(false);

    useEffect(() => {
        if (currentUserId && reel.likes) {
            setIsLiked(reel.likes.includes(currentUserId));
        }
    }, [reel.likes, currentUserId]);

    // Handle Intersection to trigger play/pause and report active state
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onVisible();
                    // Register view if it's the first time seeing it
                    if (!viewRegistered && currentUserId) {
                        onInteract(reel._id, 'view');
                        setViewRegistered(true);
                    }
                }
            },
            { threshold: 0.7 } // Trigger when 70% visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [viewRegistered]);

    // Handle Play/Pause based on Active State
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        if (isActive) {
            vid.currentTime = 0;
            vid.play().catch(e => console.log("Auto-play prevented", e));
        } else {
            vid.pause();
        }
    }, [isActive]);

    const togglePlay = () => {
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.paused) vid.play();
        else vid.pause();
    };

    const handleLike = () => {
        if (isLiked) {
            onInteract(reel._id, 'unlike');
        } else {
            onInteract(reel._id, 'like');
        }
        setIsLiked(!isLiked);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full max-w-[500px] mx-auto bg-black border-x border-zinc-800/50">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={reel.mediaUrl}
                className="w-full h-full object-cover cursor-pointer"
                loop
                playsInline
                onClick={togglePlay}
                autoPlay={isActive}
                muted={false} // May require interaction policy bypass or UI toggle in reality
            />

            {/* Bottom Overlay: Caption & User */}
            <div className="absolute bottom-0 left-0 w-full p-4 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 p-[2px]">
                        <img
                            src={reel.userId?.profilePic || '/default-avatar.png'}
                            alt="User"
                            className="w-full h-full rounded-full object-cover bg-white"
                            onError={(e: any) => e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='}
                        />
                    </div>
                    <div>
                        <span className="text-white font-bold text-[15px] block leading-tight">{reel.userId?.username || 'User'}</span>
                        {reel.score && <span className="text-white/60 text-[10px]">Algorithm Score: {Math.round(reel.score)}</span>}
                    </div>
                    <button className="px-3 py-1 ml-2 rounded-full border border-white/50 text-white text-xs font-bold bg-black/20 backdrop-blur-sm">
                        Follow
                    </button>
                </div>
                <p className="text-white text-sm line-clamp-2 w-[80%] pointer-events-auto">{reel.caption}</p>
            </div>

            {/* Right Sidebar: Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover:bg-black/40 transition-all">
                        <Heart size={28} className={`transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">
                        {reel.views + (isLiked ? 1 : 0)} {/* Mocking likes based on reddit upvotes */}
                    </span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover:bg-black/40 transition-all">
                        <MessageCircle size={28} className="text-white fill-white/20" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">{reel.commentsCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover:bg-black/40 transition-all">
                        <Share2 size={28} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
                </button>

                <div className="w-10 h-10 mt-2 bg-zinc-800 border-2 border-white rounded-md overflow-hidden animate-spin-slow">
                    <img
                        src={reel.userId?.profilePic || '/default-avatar.png'}
                        alt="Audio Box"
                        className="w-full h-full object-cover opacity-80"
                        onError={(e: any) => e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+'}
                    />
                </div>
            </div>
        </div>
    );
}
