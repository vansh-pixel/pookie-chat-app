import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, Heart, LogOut, Search, Phone, Video, MoreVertical, Smile, Mic, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageItem from '../components/MessageItem';
import VoiceRecorder from '../components/VoiceRecorder';
import Notification from '../components/Notification';
import API_BASE_URL from '../config';


const socket = io('http://localhost:8000');

const Chat = ({ token, userId, setToken, theme = 'kitty' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [partnerUsername, setPartnerUsername] = useState(''); 
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);

  const isTeddy = theme === 'teddy';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // 1. Initial Load: Check if user has a saved partner
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/user/${userId}`);
            if (res.data.partnerId) {
                setReceiverId(res.data.partnerId);
                // Fetch partner details immediately
                fetchPartnerDetails(res.data.partnerId);
            }
        } catch (err) {
            console.error("Failed to fetch user details", err);
        }
    };
    if (userId) fetchUser();
  }, [userId]);

  const fetchPartnerDetails = async (pid) => {
      try {
          const res = await axios.get(`${API_BASE_URL}/auth/user/${pid}`);
          setPartnerUsername(res.data.username);
      } catch (err) {
          console.error("Failed to fetch partner details", err);
          setPartnerUsername("My Pookie");
      }
  };

  const savePartner = async () => {
      if (!receiverId) return;
      try {
          await axios.post(`${API_BASE_URL}/auth/set-partner`, {
              userId,
              partnerId: receiverId
          });
          fetchPartnerDetails(receiverId);
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
             const res = await axios.get(`${API_BASE_URL}/messages/${userId}/${receiverId}`);
             setMessages(res.data);
             // Mark as read immediately if fetching
             socket.emit('mark_read', { sender: receiverId, receiver: userId });
         } catch (err) {
             console.error("Failed to load chats", err);
         }
     };
     fetchMessages();
  }, [receiverId, userId]);

  useEffect(() => {
    if(!token) return;
    
    socket.emit('join_room', userId);

    socket.on('receive_message', (message) => {
      // Determine sender name for notification
      const senderName = message.senderUsername || "Pookie";

      // If we are currently chatting with this sender
      if (message.sender === receiverId) {
          socket.emit('mark_read', { sender: message.sender, receiver: userId });
          message.read = true; // Optimistic update
          setMessages((prev) => [...prev, message]);
      }
      
      // Always show notification popup when a message arrives
      setNotification({ message, senderName });
    });
    
    socket.on('message_sent', (message) => {
        setMessages((prev) => [...prev, message]);
    });

    socket.on('messages_read', ({ reader }) => {
        if (reader === receiverId) {
            setMessages(prev => prev.map(msg => 
                (msg.receiver === reader) ? { ...msg, read: true } : msg
            ));
        }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('messages_read');
    };
  }, [userId, token, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (content, type = 'text') => {
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
      setToken(null);
  };

  return (
    <div className={`flex h-screen overflow-hidden relative ${isTeddy ? 'bg-amber-50' : 'bg-gray-100'}`}>
        <AnimatePresence>
            {notification && (
                <Notification 
                    message={notification.message} 
                    senderName={notification.senderName} 
                    onClose={() => setNotification(null)}
                    theme={theme}
                />
            )}
        </AnimatePresence>

        {/* ================= LEFT SIDEBAR ================= */}
        <div className={`w-full md:w-[400px] border-r flex flex-col ${isTeddy ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-300'}`}>
            {/* Profile Header */}
            <div className={`h-16 flex items-center justify-between px-4 border-b ${isTeddy ? 'bg-amber-100/50 border-amber-200' : 'bg-gray-100 border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white cursor-pointer relative shadow-sm ${isTeddy ? 'bg-amber-500' : 'bg-hk-pink'}`}>
                    {isTeddy ? 'TB' : 'HK'}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex gap-4 text-gray-600">
                    <button onClick={handleLogout} title="Logout" className={`transition-colors ${isTeddy ? 'hover:text-amber-600' : 'hover:text-hk-red'}`}><LogOut size={20} /></button>
                </div>
            </div>
            
            {/* Search Bar */}
            <div className={`px-3 py-2 border-b ${isTeddy ? 'border-amber-100' : 'border-gray-100'}`}>
                <div className={`rounded-lg flex items-center px-3 py-1.5 gap-2 ${isTeddy ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    <Search size={18} className="text-gray-400" />
                    <input 
                        className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 font-cute" 
                        placeholder="Search or start new chat"
                    />
                </div>
            </div>

            {/* Chat List (Hardcoded Active Chat) */}
            <div className="flex-1 overflow-y-auto">
                <div className={`px-4 py-3 cursor-pointer border-b border-l-4 transition-colors ${isTeddy ? 'hover:bg-amber-100 border-amber-100 bg-amber-50 border-l-amber-500' : 'hover:bg-gray-100 border-gray-100 bg-hk-soft/10 border-l-hk-pink'}`}>
                    <div className="flex justify-between">
                        <div className="flex gap-3">
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center relative ${isTeddy ? 'bg-amber-100 border-amber-300' : 'bg-hk-cream border-hk-pink'}`}>
                                <Heart size={20} className={`${isTeddy ? 'text-amber-500' : 'text-hk-pink'} fill-current`} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 font-cute">{partnerUsername || "My Sakhi 💖"}</h4>
                                <p className="text-sm text-gray-500 truncate w-40">Tap to chat...</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">Now</div>
                    </div>
                </div>
                {/* Configuration Area */}
                <div className={`p-4 mt-4 mx-4 rounded-xl border ${isTeddy ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Connection Setup</p>
                    <div className="flex gap-2">
                        <input 
                            className={`w-full p-2 text-sm border rounded mb-2 font-mono outline-none transition-all ${isTeddy ? 'border-amber-200 focus:ring-2 focus:ring-amber-400' : 'border-gray-300 focus:ring-2 focus:ring-hk-pink'}`}
                            placeholder="Enter Partner ID here"
                            value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                        />
                        <button onClick={savePartner} className={`text-white px-3 py-1 rounded text-xs h-9 font-bold shadow-sm whitespace-nowrap ${isTeddy ? 'bg-amber-500' : 'bg-hk-pink'}`}>
                            Save
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 bg-white p-2 rounded border break-all">
                        Your ID: <span className="select-all font-mono text-gray-800 font-bold">{userId}</span>
                    </div>
                </div>
            </div>
        </div>

      {/* ================= RIGHT CHAT AREA ================= */}
      <div className={`hidden md:flex flex-1 flex-col relative ${isTeddy ? 'bg-amber-100/30' : 'bg-[#e5ddd5]'}`}>
        {/* Chat Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm0 0c0-5.5-4.5-10-10-10S10 14.5 10 20s4.5 10 10 10 10-4.5 10-10zm0 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z' fill='${isTeddy ? '%23F59E0B' : '%23FF69B4'}' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>

        {/* Chat Header */}
        <div className={`h-16 px-4 flex items-center justify-between shadow-sm z-10 border-b ${isTeddy ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-white ${isTeddy ? 'bg-amber-400' : 'bg-hk-pink'}`}>
                    <Heart size={20} fill="white" />
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-800 font-cute">{partnerUsername || "My Sakhi 💖"}</h3>
                     <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full block"></span> Online
                     </p>
                 </div>
            </div>
            <div className={`flex gap-6 ${isTeddy ? 'text-amber-500' : 'text-hk-pink'}`}>
                <Search size={22} className="cursor-pointer" />
                <Phone size={22} className="cursor-pointer"/>
                <Video size={22} className="cursor-pointer"/>
                <MoreVertical size={22} className="cursor-pointer text-gray-400"/>
            </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-1 relative z-0">
          <div className="flex justify-center mb-6">
              <span className="bg-white/80 backdrop-blur px-4 py-1 rounded-lg text-xs text-gray-500 shadow-sm uppercase font-bold tracking-wider">
                  Today
              </span>
          </div>
          
          {messages.map((msg, idx) => (
            <MessageItem key={idx} message={msg} isOwn={msg.sender === userId} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Miss You Button */}
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={sendMissYou}
            className={`absolute bottom-20 right-6 p-3 rounded-full shadow-lg border-2 z-20 transition-colors ${isTeddy ? 'bg-white border-amber-400 text-amber-500 hover:bg-amber-50' : 'bg-hk-white border-hk-red text-hk-red hover:bg-red-50'}`}
            title="Send Miss You Envelope"
        >
            <Heart className="w-6 h-6 fill-current" />
        </motion.button>

        {/* Input Area */}
        <div className={`min-h-[64px] px-4 py-2 flex items-center gap-2 z-10 border-t ${isTeddy ? 'bg-amber-50 border-amber-200' : 'bg-[#F0F2F5] border-gray-200'}`}>
            <Smile size={24} className={`cursor-pointer transition-colors ${isTeddy ? 'text-amber-400 hover:text-amber-600' : 'text-gray-500 hover:text-hk-pink'}`} />
            <Paperclip size={24} className={`cursor-pointer transition-colors ${isTeddy ? 'text-amber-400 hover:text-amber-600' : 'text-gray-500 hover:text-hk-pink'}`} />
            
            <div className="flex-1 relative">
                <input
                    type="text"
                    className="w-full py-2.5 px-4 rounded-lg border-none focus:outline-none bg-white font-cute text-base shadow-sm placeholder-gray-400"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                />
            </div>

            {inputText.trim() ? (
                <button 
                  onClick={() => sendMessage(inputText)}
                  className={`text-white p-2.5 rounded-full transition-colors shadow-sm ${isTeddy ? 'bg-amber-500 hover:bg-amber-600' : 'bg-hk-pink hover:bg-pink-600'}`}
                >
                  <Send size={20} className="ml-0.5" />
                </button>
            ) : (
                <VoiceRecorder onSend={(content) => sendMessage(content, 'audio')} />
            )}
        </div>
      </div>
    </div>
  );
};

export default Chat;


