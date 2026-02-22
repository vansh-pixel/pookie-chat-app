/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hk-pink': '#FF69B4',   // Hot Pink
        'hk-soft': '#FFB7C5',   // Soft Pink
        'hk-white': '#FFFFFF',
        'hk-red': '#FF0000',    // Ribbon Red
        'hk-cream': '#FFFDD0',
      },
      fontFamily: {
        'cute': ['"Fredoka"', 'sans-serif'],
        'pacific': ['"Pacifico"', 'cursive'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'blob': 'blob 7s infinite',
      },
      backgroundImage: {
         'polka-dots': "radial-gradient(#FF69B4 2px, transparent 2px)",
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
            '0%': { transform: 'translate(0px, 0px) scale(1)' },
            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
