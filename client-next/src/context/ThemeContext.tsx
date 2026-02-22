"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'kitty' | 'teddy' | 'spiderman' | 'spiderwoman';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('kitty');
    const [darkMode, setDarkModeState] = useState<boolean>(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        }
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkModeState(savedDarkMode);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const nextThemeMap: Record<Theme, Theme> = {
            'kitty': 'teddy',
            'teddy': 'spiderman',
            'spiderman': 'spiderwoman',
            'spiderwoman': 'kitty'
        };
        const newTheme = nextThemeMap[theme] || 'kitty';
        setTheme(newTheme);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkModeState(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
