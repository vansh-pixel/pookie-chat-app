
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const Notification = ({ message, senderName, onClose, theme }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isMissYou = message.type === 'missYou';
  const isTeddy = theme === 'teddy';

  return (
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -50, opacity: 0, scale: 0.8 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
        ${isTeddy ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-pink-50 border-pink-200 text-pink-900'}
        border-2 rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4 min-w-[300px] max-w-md pointer-events-none`}
    >
      <div className={`p-3 rounded-full ${isTeddy ? 'bg-amber-100' : 'bg-pink-100'}`}>
        {isMissYou ? (
             <Heart className={`${isTeddy ? 'text-amber-500' : 'text-pink-500'} animate-pulse`} size={24} fill="currentColor" />
        ) : (
             <MessageCircle className={`${isTeddy ? 'text-amber-500' : 'text-pink-500'}`} size={24} />
        )}
      </div>
      
      <div>
        <h4 className={`font-bold text-sm ${isTeddy ? 'text-amber-600' : 'text-pink-600'} uppercase tracking-wide`}>
            {isMissYou ? 'Love from' : 'Hey Pookie!'}
        </h4>
        <p className="font-bold text-lg leading-tight">
            {isMissYou ? senderName : `Message from ${senderName}`}
        </p>
        {!isMissYou && (
            <p className="text-xs opacity-70 mt-1 truncate max-w-[200px]">{message.content}</p>
        )}
      </div>
    </motion.div>
  );
};

export default Notification;
