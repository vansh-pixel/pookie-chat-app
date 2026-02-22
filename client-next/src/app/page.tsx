"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import WavingKitty from '../components/WavingKitty';
import WavingTeddy from '../components/WavingTeddy';
import HangingSpider from '../components/HangingSpider';
import WebTransition from '../components/WebTransition';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWeb, setShowWeb] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isTeddy = theme === 'teddy';
  const isSpidey = theme === 'spiderman';
  const isSpiderGwen = theme === 'spiderwoman';
  const isSpiderTheme = isSpidey || isSpiderGwen;

  // Handle theme toggle with animation for spider themes
  const handleThemeSwitch = () => {
    // If switching TO a spider theme or switching *between* spider themes, show web?
    // Actually toggleTheme cycles. If next is spidey, show web.
    const current = theme;
    toggleTheme();

    // We need to know what the next theme *will* be, or react to the change.
    // But toggleTheme updates state. Let's use useEffect to trigger animation?
    // Or just simpler: clicking it triggers web if new theme is spider.
    setShowWeb(true);
    setTimeout(() => setShowWeb(false), 2000);
  };

  const getThemeColors = () => {
    if (isTeddy) return {
      bg: 'bg-amber-50',
      blob1: 'bg-orange-100/40',
      blob2: 'bg-amber-100/50',
      blob3: 'bg-yellow-100/60',
      text: 'text-amber-900',
      buttonText: 'text-amber-800',
      buttonBorder: 'border-amber-200',
      buttonHover: 'hover:bg-amber-50',
      card: 'bg-white/90 shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] border-amber-100',
      inputFocus: 'focus:border-amber-300 focus:ring-amber-100',
      submitGradient: 'from-amber-600 to-orange-500 shadow-orange-200 hover:shadow-orange-300',
      linkText: 'text-amber-600'
    };
    if (isSpidey) return {
      bg: 'bg-slate-50',
      blob1: 'bg-red-100/40', // Red for spidey
      blob2: 'bg-blue-100/50', // Blue for spidey
      blob3: 'bg-red-50/60',
      text: 'text-red-900',
      buttonText: 'text-red-700',
      buttonBorder: 'border-red-200',
      buttonHover: 'hover:bg-red-50',
      card: 'bg-white/90 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.3)] border-red-100',
      inputFocus: 'focus:border-red-500 focus:ring-blue-100',
      submitGradient: 'from-red-600 to-blue-600 shadow-red-200 hover:shadow-blue-300', // Spidey gradient
      linkText: 'text-red-600'
    };
    if (isSpiderGwen) return {
      bg: 'bg-slate-50',
      blob1: 'bg-pink-100/40',
      blob2: 'bg-cyan-100/50', // Gwen has cyan/teal/white/pink
      blob3: 'bg-purple-100/60',
      text: 'text-pink-900',
      buttonText: 'text-pink-600',
      buttonBorder: 'border-pink-200',
      buttonHover: 'hover:bg-pink-50',
      card: 'bg-white/90 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.3)] border-pink-100',
      inputFocus: 'focus:border-pink-400 focus:ring-cyan-100',
      submitGradient: 'from-pink-500 to-cyan-400 shadow-pink-200 hover:shadow-cyan-300', // Gwen gradient
      linkText: 'text-cyan-600'
    };
    // Default Kitty
    return {
      bg: 'bg-pink-50',
      blob1: 'bg-hk-pink/20',
      blob2: 'bg-purple-200/30',
      blob3: 'bg-yellow-100/40',
      text: 'text-gray-800',
      buttonText: 'text-gray-600',
      buttonBorder: 'border-pink-100',
      buttonHover: 'hover:bg-white',
      card: 'bg-white/80 shadow-[0_20px_60px_-15px_rgba(255,105,180,0.3)] border-white',
      inputFocus: 'focus:border-hk-pink focus:ring-pink-100',
      submitGradient: 'from-hk-pink to-pink-400 shadow-pink-200 hover:shadow-pink-300',
      linkText: 'text-hk-pink'
    };
  };

  const colors = getThemeColors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, { username, password });
      if (isLogin) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userId', res.data.userId);
        }
        router.push('/chat');
      } else {
        setIsLogin(true);
        alert(`Hello ${theme.toUpperCase()} fan says: You are registered! Please login! 🎀`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Oopsie! Something went wrong :(');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden font-cute transition-colors duration-700 ${colors.bg}`}>

      {/* Spider Web Transition Overlay */}
      <AnimatePresence>
        {showWeb && <WebTransition onComplete={() => setShowWeb(false)} />}
      </AnimatePresence>

      {/* Background Decor */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-3xl animate-blob transition-colors duration-700 ${colors.blob1}`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-2000 transition-colors duration-700 ${colors.blob2}`}></div>
      <div className={`absolute -bottom-32 left-20 w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-4000 transition-colors duration-700 ${colors.blob3}`}></div>

      {/* Spider Background Pattern */}
      {isSpiderTheme && (
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm0 0c0-5.5-4.5-10-10-10S10 14.5 10 20s4.5 10 10 10 10-4.5 10-10zm0 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z' fill='black' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
      )}

      {/* Hanging Character Animation */}
      <AnimatePresence mode="wait">
        {isSpidey && !showWeb && <HangingSpider key="spidey" type="spiderman" />}
        {isSpiderGwen && !showWeb && <HangingSpider key="gwen" type="spiderwoman" />}
      </AnimatePresence>

      {/* Theme Toggle Button */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={handleThemeSwitch}
          suppressHydrationWarning
          className={`flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-bold transition-all cursor-pointer border ${colors.buttonText} ${colors.buttonBorder} ${colors.buttonHover}`}
        >
          {theme === 'kitty' && '🐱 Kitty Mode'}
          {theme === 'teddy' && '🧸 Teddy Mode'}
          {theme === 'spiderman' && '🕷️ Spidey Mode'}
          {theme === 'spiderwoman' && '🕸️ Gwen Mode'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`backdrop-blur-md p-8 rounded-[2.5rem] w-full max-w-sm relative z-10 mx-4 border-4 ring-4 ring-white/50 transition-all duration-500 ${colors.card}`}
        >
          <div className="mb-6 flex justify-center -mt-16 cursor-pointer" onClick={handleThemeSwitch}>
            {isTeddy && <WavingTeddy />}
            {!isTeddy && !isSpiderTheme && <WavingKitty />}
            {/* For Spider themes, show simplified Icon/Head if desired, or nothing as hanging spider is above */}
            {isSpidey && <div className="w-20 h-20 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl animate-bounce">🕷️</div>}
            {isSpiderGwen && <div className="w-20 h-20 bg-pink-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl animate-bounce">🕸️</div>}
          </div>

          <h2 className={`text-3xl font-bold text-center mb-2 tracking-tight font-cute ${colors.text}`}>
            {isLogin ? 'Welcome Back!' : 'New Here?'}
          </h2>
          <p className="text-center text-gray-400 mb-8 font-medium text-sm">
            {isLogin ? 'Ready to chat with your Pookie?' : 'Join the cutest chat app ever!'}
          </p>

          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-red-50 text-red-500 text-xs font-bold text-center mb-6 p-3 rounded-xl border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                suppressHydrationWarning
                className={`w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm ${colors.inputFocus}`}
                placeholder="e.g. cutiepie123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                suppressHydrationWarning
                className={`w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm ${colors.inputFocus}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              suppressHydrationWarning
              className={`w-full bg-linear-to-r text-white p-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-2 cursor-pointer ${colors.submitGradient}`}
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                suppressHydrationWarning
                className={`font-bold hover:underline transition-all cursor-pointer ${colors.linkText}`}
              >
                {isLogin ? 'Create one' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
