import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Heart, User } from 'lucide-react';

const EnvelopeMessage = ({ message, isOwn }) => {
  const [isOpen, setIsOpen] = useState(false);

  // If it's my own message, it's already "open" visually or just a bubble?
  // User requested "message/chat send should get in the envelop style"
  // Maybe received messages are envelopes? Sent messages are open?
  // Let's make received messages start as envelopes.

  const isMissYou = message.type === 'missYou';

  if (isOwn) {
    return (
      <div className="flex justify-end mb-4">
        <div className={`p-3 rounded-tr-none rounded-2xl max-w-xs ${isMissYou ? 'bg-red-100 border-2 border-red-300' : 'bg-pookie-blue/30'} backdrop-blur-sm shadow-sm`}>
          {isMissYou && <Heart className="inline-block w-4 h-4 text-red-500 mr-2 animate-pulse" />}
          <p className="text-gray-800 font-medium">{message.content}</p>
          <span className="text-xs text-gray-500 block text-right mt-1">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="relative">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="cursor-pointer group"
              onClick={() => setIsOpen(true)}
            >
              <div className="w-64 h-40 bg-pookie-pink rounded-lg shadow-md flex items-center justify-center border-b-4 border-l-2 border-pink-300 transform transition-transform group-hover:scale-105">
                 <div className="absolute top-0 left-0 w-full h-full border-t-[80px] border-r-[128px] border-b-[80px] border-l-[128px] border-transparent border-t-pink-200/50"></div>
                 <Heart className="text-pookie-heart w-12 h-12 fill-current z-10 animate-pulse" />
                 <div className="absolute bottom-2 right-4 text-white font-bold text-xs opacity-80">Tap to open</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isOpen && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`p-6 rounded-tl-none rounded-3xl max-w-xs relative ${isMissYou ? 'bg-red-50 border-2 border-red-200' : 'bg-white'} shadow-lg border border-pookie-pink`}
          >
           {isMissYou && (
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ repeat: Infinity, duration: 0.8 }}
                 className="absolute -top-4 -right-4"
               >
                   <Heart className="w-10 h-10 text-red-500 fill-current" />
               </motion.div>
           )}
            <p className="text-gray-800 text-lg font-cute leading-relaxed text-center">
              {message.content}
            </p>
             {message.type === 'audio' && (
                 <audio controls src={message.content} className="mt-2 w-full" />
             )}
            <span className="text-xs text-gray-400 block text-right mt-4">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnvelopeMessage;
