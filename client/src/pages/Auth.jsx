import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import WavingKitty from '../components/WavingKitty';
import WavingTeddy from '../components/WavingTeddy';
import API_BASE_URL from '../config';


const Auth = ({ setToken, setUserId, theme, setTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isTeddy = theme === 'teddy';

  const toggleTheme = () => {
      setTheme(isTeddy ? 'kitty' : 'teddy');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const res = await axios.post(`${API_BASE_URL}/auth${endpoint}`, { username, password });
      
      // If logging in, check if partnerId is returned (optional logic here if needed)
      // The Chat component handles fetching partner logic.

      if (isLogin) {
        setToken(res.data.token);
        setUserId(res.data.userId);
      } else {
        setIsLogin(true);
        alert(`Hello ${isTeddy ? 'Teddy' : 'Kitty'} says: You are registered! Please login! 🎀`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Oopsie! Something went wrong :(');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#fce7f3] relative overflow-hidden font-cute ${isTeddy ? 'bg-amber-50' : 'bg-pink-50'}`}>
      {/* Background Decor - Simple geometric shapes, less messy */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob ${isTeddy ? 'bg-orange-100' : 'bg-pink-100'}`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 ${isTeddy ? 'bg-amber-100' : 'bg-purple-100'}`}></div>
      <div className={`absolute -bottom-32 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 ${isTeddy ? 'bg-yellow-100' : 'bg-yellow-50'}`}></div>

      {/* Theme Toggle Button */}
      <div className="absolute top-5 right-5 z-20">
          <button 
            onClick={toggleTheme}
            className={`flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md text-sm font-bold transition-all border ${isTeddy ? 'text-amber-800 border-amber-200' : 'text-gray-600 border-pink-100'}`}
          >
            {isTeddy ? '🐱 Switch to Kitty' : '🧸 Switch to Teddy'}
          </button>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`bg-white p-8 rounded-[2.5rem] w-full max-w-sm relative z-10 mx-4 border-4 ring-4 ring-white/50 ${isTeddy ? 'shadow-[0_10px_40px_rgba(251,191,36,0.3)] border-amber-100' : 'shadow-[0_10px_40px_rgba(255,105,180,0.3)] border-pink-100'}`}
      >
        <div className="mb-6 flex justify-center -mt-16 cursor-pointer" onClick={toggleTheme}>
             {isTeddy ? <WavingTeddy /> : <WavingKitty />}
        </div>

        <h2 className={`text-3xl font-bold text-center mb-2 tracking-tight ${isTeddy ? 'text-amber-800' : 'text-gray-800'}`}>
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                className={`w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm ${isTeddy ? 'focus:border-amber-300 focus:ring-amber-100' : 'focus:border-pink-300 focus:ring-pink-100'}`}
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
                className={`w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm ${isTeddy ? 'focus:border-amber-300 focus:ring-amber-100' : 'focus:border-pink-300 focus:ring-pink-100'}`}
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
            className={`w-full bg-linear-to-r text-white p-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-2 ${
                isTeddy 
                ? 'from-amber-500 to-orange-400 shadow-orange-200 hover:shadow-orange-300' 
                : 'from-pink-400 to-rose-400 shadow-pink-200 hover:shadow-pink-300'
            }`}
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className={`font-bold hover:underline transition-all ${isTeddy ? 'text-amber-600' : 'text-pink-500'}`}
            >
                {isLogin ? 'Create one' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
