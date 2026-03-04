"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageCircle, Film } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { darkMode } = useTheme();

    // Do not show the navigation bar on the login/signup page
    if (pathname === '/') return null;

    const navItems = [
        { path: '/feed', icon: Home, label: 'Feed' },
        { path: '/chat', icon: MessageCircle, label: 'Chat' },
        { path: '/reels', icon: Film, label: 'Reels' },
    ];

    return (
        <div className={`fixed bottom-0 left-0 w-full z-[100] border-t backdrop-blur-md pb-safe transition-colors duration-300
            ${darkMode ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-gray-200'}`}
        >
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300
                                ${isActive
                                    ? (darkMode ? 'text-white' : 'text-black')
                                    : (darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600')
                                }`}
                        >
                            <Icon
                                size={26}
                                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {/* Optional: Add dot indicator for active tab like Instagram */}
                            {isActive && (
                                <span className={`w-1 h-1 rounded-full ${darkMode ? 'bg-pink-500' : 'bg-pink-500'}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
