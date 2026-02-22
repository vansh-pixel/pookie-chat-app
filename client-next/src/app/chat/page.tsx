"use client";

import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { Send, Heart, LogOut, Search, Phone, Video, MoreVertical, Smile, Paperclip, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import MessageItem from '../../components/MessageItem';
import VoiceRecorder from '../../components/VoiceRecorder';
import Notification from '../../components/Notification';
import StoryViewer from '../../components/StoryViewer';
import StoryEditor from '../../components/StoryEditor';

import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config/api';

let socket: Socket;

export default function Chat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [userId, setUserId] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [partnerUsername, setPartnerUsername] = useState('');
    const [notification, setNotification] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { theme, darkMode, toggleDarkMode } = useTheme();

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Stories State
    const [stories, setStories] = useState<any[]>([]);
    const [showStoryEditor, setShowStoryEditor] = useState(false);
    const [showStoryViewer, setShowStoryViewer] = useState(false);
    const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

    // Personalization State
    const [chatBgUrl, setChatBgUrl] = useState<string | null>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const isTeddy = theme === 'teddy';
    const isSpidey = theme === 'spiderman';
    const isSpiderGwen = theme === 'spiderwoman';

    const getThemeStyles = () => {
        if (isTeddy) return {
            bg: darkMode ? 'bg-amber-950' : 'bg-amber-50',
            sidebar: darkMode ? 'bg-amber-900/50 border-amber-800' : 'bg-amber-50/50 border-amber-200',
            header: darkMode ? 'bg-amber-900/80 border-amber-800' : 'bg-amber-100/50 border-amber-200',
            avatar: 'bg-amber-500',
            logoutHover: 'hover:text-amber-600',
            searchBorder: darkMode ? 'border-amber-800' : 'border-amber-100',
            searchBg: darkMode ? 'bg-amber-900' : 'bg-amber-100',
            chatListActive: darkMode ? 'hover:bg-amber-800 border-amber-800 bg-amber-900/50 border-l-amber-500' : 'hover:bg-amber-100 border-amber-100 bg-amber-50 border-l-amber-500',
            chatAvatar: darkMode ? 'bg-amber-800 border-amber-600' : 'bg-amber-100 border-amber-300',
            chatIcon: 'text-amber-500',
            configBox: darkMode ? 'bg-amber-900 border-amber-800' : 'bg-amber-50 border-amber-200',
            inputFocus: 'border-amber-200 focus:ring-2 focus:ring-amber-400',
            button: 'bg-amber-500',
            chatArea: darkMode ? 'bg-amber-950/80' : 'bg-amber-100/30',
            headerRight: 'text-amber-500',
            fab: darkMode ? 'bg-amber-900 border-amber-500 text-amber-500 hover:bg-amber-800' : 'bg-white border-amber-400 text-amber-500 hover:bg-amber-50',
            inputArea: darkMode ? 'bg-amber-900 border-amber-800' : 'bg-amber-50 border-amber-200',
            sendButton: 'bg-amber-500 hover:bg-amber-600',
            text: darkMode ? 'text-amber-100' : 'text-gray-800',
            subtext: darkMode ? 'text-amber-300/60' : 'text-gray-500'
        };
        if (isSpidey) return {
            bg: darkMode ? 'bg-slate-900' : 'bg-slate-100',
            sidebar: darkMode ? 'bg-slate-800 border-red-900' : 'bg-slate-50 border-red-200',
            header: darkMode ? 'bg-red-950/80 border-red-900' : 'bg-red-50 border-red-200',
            avatar: 'bg-red-600',
            logoutHover: 'hover:text-blue-400',
            searchBorder: darkMode ? 'border-blue-900' : 'border-blue-100',
            searchBg: darkMode ? 'bg-blue-950' : 'bg-blue-50',
            chatListActive: darkMode ? 'hover:bg-red-900/50 border-red-900 bg-blue-900/30 border-l-red-600' : 'hover:bg-red-50 border-red-100 bg-blue-50/50 border-l-red-600',
            chatAvatar: darkMode ? 'bg-red-900 border-blue-900' : 'bg-red-100 border-blue-400',
            chatIcon: 'text-red-600',
            configBox: darkMode ? 'bg-blue-950 border-blue-900' : 'bg-blue-50 border-blue-200',
            inputFocus: 'border-red-500 focus:ring-2 focus:ring-blue-600',
            button: 'bg-red-600',
            chatArea: darkMode ? 'bg-slate-950' : 'bg-slate-200',
            headerRight: 'text-blue-500',
            fab: 'bg-red-600 border-blue-600 text-white hover:bg-red-700',
            inputArea: darkMode ? 'bg-slate-900 border-blue-900' : 'bg-slate-100 border-blue-200',
            sendButton: 'bg-blue-600 hover:bg-blue-700',
            text: darkMode ? 'text-slate-100' : 'text-gray-800',
            subtext: darkMode ? 'text-slate-400' : 'text-gray-500'
        };
        if (isSpiderGwen) return {
            bg: darkMode ? 'bg-gray-950' : 'bg-gray-50',
            sidebar: darkMode ? 'bg-gray-900 border-pink-900/50' : 'bg-white border-pink-200',
            header: darkMode ? 'bg-purple-950/80 border-pink-900' : 'bg-purple-50 border-pink-200',
            avatar: 'bg-pink-500',
            logoutHover: 'hover:text-cyan-400',
            searchBorder: darkMode ? 'border-cyan-900' : 'border-cyan-100',
            searchBg: darkMode ? 'bg-cyan-950' : 'bg-cyan-50',
            chatListActive: darkMode ? 'hover:bg-pink-900/30 border-pink-900 bg-purple-900/30 border-l-cyan-400' : 'hover:bg-pink-50 border-pink-100 bg-purple-50/50 border-l-cyan-400',
            chatAvatar: darkMode ? 'bg-gray-800 border-pink-900' : 'bg-white border-pink-400',
            chatIcon: 'text-cyan-500',
            configBox: darkMode ? 'bg-purple-950 border-purple-900' : 'bg-purple-50 border-purple-200',
            inputFocus: 'border-pink-500 focus:ring-2 focus:ring-cyan-500',
            button: 'bg-pink-500',
            chatArea: darkMode ? 'bg-gray-900' : 'bg-gray-100',
            headerRight: 'text-pink-500',
            fab: darkMode ? 'bg-gray-800 border-cyan-500 text-pink-500 hover:bg-gray-700' : 'bg-white border-cyan-400 text-pink-500 hover:bg-pink-50',
            inputArea: darkMode ? 'bg-gray-900 border-purple-900/50' : 'bg-white border-purple-100',
            sendButton: 'bg-cyan-500 hover:bg-cyan-600',
            text: darkMode ? 'text-pink-50' : 'text-gray-800',
            subtext: darkMode ? 'text-pink-200/50' : 'text-gray-500'
        };
        // Kitty Default
        return {
            bg: darkMode ? 'bg-gray-900' : 'bg-gray-100',
            sidebar: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300',
            header: darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-gray-100 border-gray-200',
            avatar: 'bg-hk-pink',
            logoutHover: 'hover:text-hk-red',
            searchBorder: darkMode ? 'border-gray-700' : 'border-gray-100',
            searchBg: darkMode ? 'bg-gray-700' : 'bg-gray-100',
            chatListActive: darkMode ? 'hover:bg-gray-700 border-gray-700 bg-pink-900/20 border-l-hk-pink' : 'hover:bg-gray-100 border-gray-100 bg-pink-50/50 border-l-hk-pink',
            chatAvatar: darkMode ? 'bg-gray-700 border-hk-pink' : 'bg-hk-cream border-hk-pink',
            chatIcon: 'text-hk-pink',
            configBox: darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200',
            inputFocus: 'border-gray-700 focus:ring-2 focus:ring-hk-pink',
            button: 'bg-hk-pink',
            chatArea: darkMode ? 'bg-[#111b21]' : 'bg-[#e5ddd5]',
            headerRight: 'text-hk-pink',
            fab: darkMode ? 'bg-gray-800 border-hk-pink text-hk-pink hover:bg-gray-700' : 'bg-white border-hk-pink text-hk-red hover:bg-pink-50',
            inputArea: darkMode ? 'bg-[#202c33] border-gray-700' : 'bg-[#f0f2f5] border-gray-200',
            sendButton: 'bg-hk-pink hover:bg-pink-600',
            text: darkMode ? 'text-gray-100' : 'text-gray-800',
            subtext: darkMode ? 'text-gray-400' : 'text-gray-500'
        };
    };

    const [showMobileChat, setShowMobileChat] = useState(false);

    const s = getThemeStyles();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    const fetchStories = async (uid: string, pid: string | null) => {
        try {
            const isValidPid = pid && typeof pid === 'string' && pid.trim().length > 0 && pid !== 'null';
            const endpoint = isValidPid
                ? `${API_URL}/api/stories/${uid}/${pid}`
                : `${API_URL}/api/stories/${uid}`;

            const res = await axios.get(endpoint);
            setStories(res.data);
        } catch (err) {
            console.error("Failed to fetch stories", err);
        }
    };

    const handleDeleteStory = async (storyId: string) => {
        try {
            await axios.delete(`${API_URL}/api/stories/${storyId}`);
            // Force close viewer directly if user deletes their currently open story
            setShowStoryViewer(false);

            // Re-fetch stories
            if (receiverId) {
                fetchStories(userId, receiverId);
            } else {
                fetchStories(userId, null);
            }
        } catch (err) {
            console.error("Failed to delete story", err);
        }
    };

    // 1. Initial Load & Partner Check
    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/auth/user/${userId}`);
                if (res.data.partnerId) {
                    setReceiverId(res.data.partnerId);
                    fetchPartnerDetails(res.data.partnerId);
                    fetchStories(userId, res.data.partnerId);
                } else {
                    fetchStories(userId, null);
                }
            } catch (err) {
                console.error("Failed to fetch user details", err);
            }
        };
        fetchUser();
    }, [userId]);

    const fetchPartnerDetails = async (pid: string) => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/user/${pid}`);
            setPartnerUsername(res.data.username);
        } catch (err) {
            console.error("Failed to fetch partner details", err);
            setPartnerUsername("My Pookie");
        }
    };

    const savePartner = async () => {
        if (!receiverId) return;
        try {
            await axios.post(`${API_URL}/api/auth/set-partner`, {
                userId,
                partnerId: receiverId
            });
            fetchPartnerDetails(receiverId);
            setShowMobileChat(true);
            alert("Partner saved successfully! 💖");
        } catch (err) {
            console.error("Failed to save partner", err);
        }
    };

    // Fetch Chat History
    useEffect(() => {
        if (!receiverId || !userId) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/messages/${userId}/${receiverId}`);
                setMessages(res.data);
                if (socket) {
                    socket.emit('mark_read', { sender: receiverId, receiver: userId });
                }
            } catch (err) {
                console.error("Failed to load chats", err);
            }
        };
        fetchMessages();
    }, [receiverId, userId]);

    useEffect(() => {
        // Client-side initialization
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');

        if (!storedToken || !storedUserId) {
            router.push('/');
            return;
        }

        const savedBg = localStorage.getItem(`chatBg_${storedUserId}`);
        if (savedBg) setChatBgUrl(savedBg);

        setToken(storedToken);
        setUserId(storedUserId);

        // Initialize socket connection
        socket = io(API_URL);

        socket.emit('join_room', storedUserId);

        socket.on('receive_message', (message) => {
            const senderName = message.senderUsername || "Pookie";

            if (message.sender === receiverId) {
                socket.emit('mark_read', { sender: message.sender, receiver: storedUserId });
                // @ts-ignore
                message.read = true;
                setMessages((prev) => [...prev, message]);
            }

            setNotification({ message, senderName });
        });

        socket.on('message_sent', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('messages_read', ({ reader }) => {
            setMessages(prev => prev.map(msg =>
                (msg.receiver === reader) ? { ...msg, read: true } : msg
            ));
        });

        return () => {
            socket.off('receive_message');
            socket.off('message_sent');
            socket.off('messages_read');
            socket.disconnect();
        };
    }, [router, receiverId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (content: string, type = 'text') => {
        if (!receiverId) return alert("Please enter a Partner ID in the sidebar!");

        socket.emit('send_message', {
            sender: userId,
            receiver: receiverId,
            content,
            type
        });
        if (type === 'text') setInputText('');
    };

    const sendMissYou = () => {
        if (!receiverId) return alert("Please enter a Partner ID first!");
        socket.emit('send_miss_you', { sender: userId, receiver: receiverId });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/');
    };

    const onEmojiClick = (emojiData: any) => {
        setInputText(prev => prev + emojiData.emoji);
    };

    // Chat Background Upload
    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setChatBgUrl(base64);
                if (userId) {
                    localStorage.setItem(`chatBg_${userId}`, base64);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeBg = () => {
        setChatBgUrl(null);
        if (userId) localStorage.removeItem(`chatBg_${userId}`);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = res.data.url;
            sendMessage(fileUrl, 'file');
        } catch (err) {
            console.error("Upload failed", err);
            alert("File upload failed!");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden font-cute relative transition-colors duration-500 ${s.bg}`}>
            <AnimatePresence>
                {notification && (
                    <Notification
                        message={notification.message}
                        senderName={notification.senderName}
                        onClose={() => setNotification(null)}
                        theme={theme}
                    />
                )}
                {showStoryEditor && (
                    <StoryEditor
                        userId={userId}
                        partnerId={receiverId}
                        darkMode={darkMode}
                        onClose={() => setShowStoryEditor(false)}
                        onPublish={() => {
                            setShowStoryEditor(false);
                            fetchStories(userId, receiverId);
                        }}
                    />
                )}
                {showStoryViewer && stories.length > 0 && (
                    <StoryViewer
                        groups={stories}
                        initialGroupIndex={viewerGroupIndex}
                        currentUserId={userId}
                        onClose={() => setShowStoryViewer(false)}
                        onDelete={handleDeleteStory}
                    />
                )}
            </AnimatePresence>

            {/* ================= LEFT SIDEBAR ================= */}
            <div className={`
                ${showMobileChat ? 'hidden' : 'flex'} 
                w-full md:flex md:w-[400px] border-r flex-col transition-colors duration-500 ${s.sidebar}
            `}>
                {/* Profile Header */}
                <div className={`h-16 flex items-center justify-between px-4 border-b ${s.header}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white cursor-pointer relative shadow-sm ${s.avatar}`}>
                        {isTeddy ? 'TB' : isSpidey ? 'SM' : isSpiderGwen ? 'SG' : 'HK'}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            suppressHydrationWarning
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-full transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button suppressHydrationWarning onClick={handleLogout} title="Logout" className={`transition-colors ${s.logoutHover} text-gray-600`}><LogOut size={20} /></button>
                    </div>
                </div>

                <div className={`px-3 py-2 border-b ${s.searchBorder}`}>
                    {/* Story Tray */}
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar px-1">
                        {/* My Story Node */}
                        <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => setShowStoryEditor(true)}>
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-400 p-0.5 flex items-center justify-center relative">
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-white ${s.avatar}`}>
                                    +
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold truncate w-16 text-center">Your Story</span>
                        </div>

                        {/* Existing Stories */}
                        {stories.map((group, idx) => (
                            <div key={group.userId} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => {
                                setViewerGroupIndex(idx);
                                setShowStoryViewer(true);
                            }}>
                                <div className={`w-14 h-14 rounded-full border-[3px] p-0.5 ${group.userId === userId ? 'border-pink-500' : 'border-blue-500'}`}>
                                    <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                                        <img src={group.stories[0].mediaUrl} alt="Story" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold truncate w-16 text-center ${s.text}`}>
                                    {group.userId === userId ? 'You' : group.username}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={`rounded-lg flex items-center px-3 py-1.5 gap-2 mt-1 ${s.searchBg}`}>
                        <Search size={18} className="text-gray-400" />
                        <input
                            suppressHydrationWarning
                            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 font-cute"
                            placeholder="Search or start new chat"
                        />
                    </div>
                </div>

                {/* Chat List (Hardcoded Active Chat) */}
                <div className="flex-1 overflow-y-auto">
                    <div
                        onClick={() => setShowMobileChat(true)}
                        className={`px-4 py-3 cursor-pointer border-b border-l-4 transition-colors ${s.chatListActive}`}
                    >
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <div className={`w-12 h-12 rounded-full border flex items-center justify-center relative ${s.chatAvatar}`}>
                                    <Heart size={20} className={`${s.chatIcon} fill-current`} />
                                </div>
                                <div>
                                    <h4 className={`font-bold font-cute text-lg ${s.text}`}>{partnerUsername || "My Sakhi 💖"}</h4>
                                    <p className={`text-sm truncate w-40 ${s.subtext}`}>Tap to chat...</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 font-bold">Now</div>
                        </div>
                    </div>
                    {/* Configuration Area */}
                    <div className={`p-4 mt-4 mx-4 rounded-xl border shadow-sm transition-colors ${s.configBox}`}>
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Connection Setup</p>
                        <div className="flex gap-2">
                            <input
                                suppressHydrationWarning
                                className={`w-full p-2 text-sm border rounded mb-2 font-mono outline-none transition-all ${s.inputFocus}`}
                                placeholder="Enter Partner ID here"
                                value={receiverId}
                                onChange={(e) => setReceiverId(e.target.value)}
                            />
                            <button suppressHydrationWarning onClick={savePartner} className={`text-white px-3 py-1 rounded text-xs h-9 font-bold shadow-sm whitespace-nowrap ${s.button}`}>
                                Save
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200 break-all">
                            Your ID: <span className="select-all font-mono text-gray-800 font-bold bg-yellow-100 px-1 rounded">{userId}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= RIGHT CHAT AREA ================= */}
            <div
                className={`
                    ${showMobileChat ? 'flex' : 'hidden'} 
                    md:flex flex-1 flex-col relative transition-colors duration-500 bg-cover bg-center ${!chatBgUrl ? s.chatArea : ''}
                `}
                style={chatBgUrl ? { backgroundImage: `url(${chatBgUrl})` } : {}}
            >
                {/* Chat Background Pattern (Fallback if no custom bg) */}
                {!chatBgUrl && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm0 0c0-5.5-4.5-10-10-10S10 14.5 10 20s4.5 10 10 10 10-4.5 10-10zm0 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z' fill='${isTeddy ? '%23F59E0B' : isSpidey ? 'black' : isSpiderGwen ? 'cyan' : '%23FF69B4'}' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
                    }}></div>
                )}
                {/* Dark Overlay for better text readability on custom backgrounds */}
                {chatBgUrl && <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>}

                {/* Chat Header */}
                <div className={`h-16 px-4 flex items-center justify-between shadow-sm z-10 border-b transition-colors relative ${chatBgUrl ? 'bg-black/60 backdrop-blur-md border-b-white/10 text-white' : s.header}`}>
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Back Button for Mobile */}
                        <button
                            onClick={() => setShowMobileChat(false)}
                            className={`md:hidden p-1 -ml-1 ${chatBgUrl ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm ${s.avatar}`}>
                            <Heart size={20} fill="white" />
                        </div>
                        <div>
                            <h3 className={`font-bold font-cute text-lg ${s.text}`}>{partnerUsername || "My Sakhi 💖"}</h3>
                            <p className={`text-xs flex items-center gap-1 font-medium ${s.subtext}`}>
                                <span className="w-2 h-2 bg-green-500 rounded-full block animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <div className={`flex gap-3 md:gap-6 ${chatBgUrl ? 'text-white' : s.headerRight}`}>
                        <Search size={22} className="cursor-pointer hover:scale-110 transition-transform hidden md:block" />
                        <Phone size={22} className="cursor-pointer hover:scale-110 transition-transform" />
                        <Video size={22} className="cursor-pointer hover:scale-110 transition-transform" />

                        <div className="relative group">
                            <MoreVertical size={22} className={`cursor-pointer transition-colors ${chatBgUrl ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
                                <button onClick={() => bgInputRef.current?.click()} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-cute">
                                    🖼️ Change Wallpaper
                                </button>
                                {chatBgUrl && (
                                    <button onClick={removeBg} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-cute border-t dark:border-gray-700">
                                        🗑️ Remove Wallpaper
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-1 relative z-0">
                    <div className="flex justify-center mb-6">
                        <span className="bg-white/90 backdrop-blur px-4 py-1 rounded-lg text-xs text-gray-500 shadow-sm uppercase font-bold tracking-wider">
                            Today
                        </span>
                    </div>

                    {messages.map((msg, idx) => (
                        <MessageItem key={idx} message={msg} isOwn={msg.sender === userId} darkMode={darkMode} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Floating Miss You Button */}
                <motion.button
                    suppressHydrationWarning
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMissYou}
                    className={`absolute bottom-24 right-4 md:right-8 p-3 md:p-4 rounded-full shadow-xl border-4 z-20 transition-colors ${s.fab}`}
                    title="Send Miss You Envelope"
                >
                    <Heart className="w-6 h-6 md:w-8 md:h-8 fill-current animate-pulse" />
                </motion.button>

                {/* Input Area */}
                <div className={`min-h-[70px] px-2 md:px-4 py-2 flex items-center gap-2 z-10 border-t ${chatBgUrl ? 'bg-black/60 backdrop-blur-md border-t-white/10' : s.inputArea}`}>
                    <div className="relative">
                        <Smile
                            size={26}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`cursor-pointer hidden md:block transition-colors ${isTeddy ? 'text-amber-400 hover:text-amber-600' : isSpidey ? 'text-red-500 hover:text-blue-600' : isSpiderGwen ? 'text-pink-400 hover:text-cyan-600' : 'text-gray-500 hover:text-hk-pink'}`}
                        />
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <div className="absolute bottom-12 left-0 z-50">
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        theme={darkMode ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                                    />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <Paperclip
                            size={26}
                            onClick={() => fileInputRef.current?.click()}
                            className={`cursor-pointer transition-colors ${isTeddy ? 'text-amber-400 hover:text-amber-600' : 'text-gray-500 hover:text-hk-pink'} ${isUploading ? 'animate-bounce' : ''}`}
                        />
                    </div>

                    <div className="flex-1 relative">
                        <input
                            suppressHydrationWarning
                            type="text"
                            className={`w-full py-2 md:py-3 px-3 md:px-5 rounded-2xl border-none focus:outline-none font-cute text-sm md:text-base shadow-sm placeholder-gray-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                if (showEmojiPicker) setShowEmojiPicker(false);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        />
                    </div>

                    {inputText.trim() ? (
                        <motion.button
                            suppressHydrationWarning
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => sendMessage(inputText)}
                            className={`text-white p-2 md:p-3 rounded-full transition-colors shadow-md ${s.sendButton}`}
                        >
                            <Send size={20} className="ml-0.5" />
                        </motion.button>
                    ) : (
                        <VoiceRecorder onSend={(content) => sendMessage(content, 'audio')} />
                    )}
                </div>
            </div>
        </div>
    );
}
