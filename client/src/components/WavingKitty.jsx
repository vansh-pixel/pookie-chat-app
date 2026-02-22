import { motion } from 'framer-motion';

const WavingKitty = () => {
  return (
    <div className="relative w-28 h-28 mx-auto transform hover:scale-105 transition-transform duration-300" style={{ width: '112px', height: '112px' }}>
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <defs>
          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F0F0" />
          </linearGradient>
          <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Head Shape - More aesthetic curve */}
        <ellipse cx="100" cy="120" rx="75" ry="55" fill="url(#faceGradient)" stroke="#333" strokeWidth="3" filter="url(#glow)" />
        
        {/* Ears - Integrated seamlessly */}
        <path d="M35 85 L25 45 L75 65 Z" fill="url(#faceGradient)" stroke="#333" strokeWidth="3" />
        <path d="M165 85 L175 45 L125 65 Z" fill="url(#faceGradient)" stroke="#333" strokeWidth="3" />
        {/* Cover ear strokes for seamless look */}
        <path d="M40 80 Q 50 90 60 85" fill="none" stroke="white" strokeWidth="5" />
        <path d="M140 85 Q 150 90 160 80" fill="none" stroke="white" strokeWidth="5" />


        {/* Eyes - Shiny */}
        <ellipse cx="65" cy="115" rx="6" ry="8" fill="#333" />
        <circle cx="67" cy="113" r="2" fill="white" />
        
        <ellipse cx="135" cy="115" rx="6" ry="8" fill="#333" />
        <circle cx="137" cy="113" r="2" fill="white" />

        {/* Nose */}
        <ellipse cx="100" cy="128" rx="8" ry="5" fill="#FFD700" stroke="#333" strokeWidth="1" />
        <circle cx="102" cy="126" r="2" fill="white" opacity="0.6" />

        {/* Whiskers - Clean strokes */}
        <g stroke="#333" strokeWidth="2.5" strokeLinecap="round">
            <line x1="30" y1="105" x2="10" y2="100" />
            <line x1="30" y1="120" x2="10" y2="120" />
            <line x1="30" y1="135" x2="10" y2="140" />

            <line x1="170" y1="105" x2="190" y2="100" />
            <line x1="170" y1="120" x2="190" y2="120" />
            <line x1="170" y1="135" x2="190" y2="140" />
        </g>

        {/* Bow - 3D effect */}
        <g transform="translate(145, 65) rotate(15)">
            <path d="M0 0 C10 -10, 30 -10, 40 0 C50 10, 30 30, 20 20 Z" fill="url(#bowGradient)" stroke="#333" strokeWidth="2" />
            <path d="M0 0 C-10 -10, -30 -10, -40 0 C-50 10, -30 30, -20 20 Z" fill="url(#bowGradient)" stroke="#333" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="url(#bowGradient)" stroke="#333" strokeWidth="2" />
            <circle cx="3" cy="-3" r="3" fill="white" opacity="0.4" />
        </g>

        {/* Waving Hand - Animated */}
        <motion.g
          animate={{ rotate: [0, 20, 0, 20, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.5, 
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1]
          }}
          style={{ originX: "150px", originY: "150px" }}
        >
             <circle cx="150" cy="150" r="18" fill="white" stroke="#333" strokeWidth="3" />
             <path d="M140 150 Q 150 160 160 150" fill="none" stroke="#ddd" strokeWidth="2" />
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default WavingKitty;
