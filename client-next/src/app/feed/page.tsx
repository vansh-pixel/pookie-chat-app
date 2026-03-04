"use client";

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

interface Post {
    _id: string;
    userId: {
        _id: string;
        username: string;
        profilePic?: string;
    };
    mediaUrl: string;
    type: string;
    caption: string;
    likes: string[];
    commentsCount: number;
    createdAt: string;
    score?: number;
}

export default function FeedPage() {
    const router = useRouter();
    const { darkMode } = useTheme();
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const uid = localStorage.getItem('userId');
        if (!uid) {
            router.push('/');
            return;
        }
        setCurrentUserId(uid);
        fetchFeed(1, uid);
    }, []);

    const fetchFeed = async (pageNum: number, uid: string) => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/feed/posts/${uid}?page=${pageNum}&limit=5`);
            const newPosts = res.data;

            if (newPosts.length < 5) setHasMore(false);

            setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
        } catch (err) {
            console.error("Failed to fetch feed", err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore && currentUserId) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchFeed(nextPage, currentUserId);
        }
    };

    const lastPostElementRef = (node: HTMLDivElement | null) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observerRef.current.observe(node);
    };

    const handleInteract = async (postId: string, action: 'like' | 'unlike') => {
        if (!currentUserId) return;
        try {
            await axios.post(`${API_URL}/api/feed/${postId}/interact`, {
                action,
                userId: currentUserId
            });

            if (action === 'like') {
                setPosts(prev => prev.map(p =>
                    p._id === postId ? { ...p, likes: [...p.likes, currentUserId] } : p
                ));
            } else if (action === 'unlike') {
                setPosts(prev => prev.map(p =>
                    p._id === postId ? { ...p, likes: p.likes.filter(id => id !== currentUserId) } : p
                ));
            }
        } catch (err) {
            console.error("Interaction failed", err);
        }
    };

    return (
        <div className={`min-h-[100dvh] w-full font-cute relative pb-24 ${darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-50 p-4 flex items-center gap-4 border-b drop-shadow-sm ${darkMode ? 'bg-zinc-900/90 border-zinc-800 backdrop-blur-md' : 'bg-white/90 border-gray-200 backdrop-blur-md'}`}>
                <h1 className="text-xl font-bold tracking-wide">Pookie Feed</h1>
            </div>

            {/* Content Container */}
            <div className="max-w-xl mx-auto py-6 flex flex-col gap-8 pb-32">
                {posts.map((post, index) => {
                    const isLastElement = index === posts.length - 1;
                    return (
                        <div key={post._id} ref={isLastElement ? lastPostElementRef : null}>
                            <PostCard
                                post={post}
                                currentUserId={currentUserId}
                                onInteract={handleInteract}
                                darkMode={darkMode}
                            />
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <div className={`text-center p-6 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        You've caught up with everything! ✨
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-24 h-24 mb-4 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <Heart size={40} className="text-pink-400 dark:text-pink-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No Posts Yet</h2>
                        <p className={`max-w-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Share a moment from the chat to see it here!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PostCard({ post, currentUserId, onInteract, darkMode }: any) {
    const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

    const handleLike = () => {
        onInteract(post._id, isLiked ? 'unlike' : 'like');
    };

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`rounded-xl overflow-hidden border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            {/* Post Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-400 p-[2px]">
                        <img
                            src={post.userId?.profilePic || '/default-avatar.png'}
                            alt="User"
                            className={`w-full h-full rounded-full object-cover ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}
                            onError={(e: any) => e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='}
                        />
                    </div>
                    <div>
                        <span className={`font-bold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{post.userId?.username || 'User'}</span>
                        {/* {post.score && <span className="block text-[10px] text-gray-500">Score: {Math.round(post.score)}</span>} */}
                    </div>
                </div>
                <button className={`p-1 rounded-full ${darkMode ? 'hover:bg-zinc-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Post Media */}
            <div className="w-full bg-black flex items-center justify-center max-h-[600px] overflow-hidden">
                {post.type === 'video' || post.type === 'reel' ? (
                    <video
                        src={post.mediaUrl}
                        className="w-full max-h-[600px] object-contain"
                        controls
                        playsInline
                    />
                ) : (
                    <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-[600px] object-contain"
                    />
                )}
            </div>

            {/* Post Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-4">
                        <button onClick={handleLike} className="group">
                            <Heart size={26} className={`transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : darkMode ? 'text-gray-300 group-hover:text-gray-100' : 'text-gray-700 group-hover:text-black hover:scale-105'}`} />
                        </button>
                        <button className="group">
                            <MessageCircle size={26} className={`transition-all ${darkMode ? 'text-gray-300 group-hover:text-gray-100' : 'text-gray-700 group-hover:text-black hover:scale-105'}`} />
                        </button>
                        <button className="group">
                            <Share2 size={26} className={`transition-all ${darkMode ? 'text-gray-300 group-hover:text-gray-100' : 'text-gray-700 group-hover:text-black hover:scale-105'}`} />
                        </button>
                    </div>
                </div>

                <div className={`font-semibold text-sm mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {post.likes?.length || 0} likes
                </div>

                <div className="text-sm">
                    <span className={`font-bold mr-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{post.userId?.username || 'User'}</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>{post.caption}</span>
                </div>

                {post.commentsCount > 0 && (
                    <div className={`text-sm mt-1 cursor-pointer ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}>
                        View all {post.commentsCount} comments
                    </div>
                )}

                <div className={`text-[11px] mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400 uppercase tracking-wide'}`}>
                    {timeAgo(post.createdAt)}
                </div>
            </div>
        </div>
    );
}
