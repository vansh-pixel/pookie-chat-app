import React, { useRef, useState, useEffect } from 'react';
import { X, Send, RotateCcw, Trash2, Pen, Paintbrush, Highlighter, Eraser } from 'lucide-react';

interface DrawingModalProps {
    onClose: () => void;
    onSend: (base64Data: string) => void;
    darkMode?: boolean;
}

type ToolType = 'pen' | 'brush' | 'highlighter' | 'eraser';

const SWATCHES = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ffb6c1'
];

export default function DrawingModal({ onClose, onSend, darkMode }: DrawingModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<ToolType>('pen');
    const [color, setColor] = useState('#ffb6c1');
    const [lineWidth, setLineWidth] = useState(3);
    const [paths, setPaths] = useState<ImageData[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Make canvas responsive
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            // Store current image data to restore after resize
            let tempData: ImageData | null = null;
            if (canvas.width > 0 && canvas.height > 0) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    tempData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                }
            }

            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Background must be transparent for sticker
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                if (tempData) {
                    ctx.putImageData(tempData, 0, 0);
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Save initial empty state
        saveState();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Also update context when tool or color changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (tool) {
            case 'pen':
                ctx.lineWidth = 3;
                ctx.globalCompositeOperation = 'source-over';
                break;
            case 'brush':
                ctx.lineWidth = 12;
                ctx.globalCompositeOperation = 'source-over';
                // A bit of opacity could simulate a brush, but we keep it simple for now
                break;
            case 'highlighter':
                ctx.lineWidth = 20;
                ctx.strokeStyle = color + '80'; // Add 50% opacity hex
                ctx.globalCompositeOperation = 'source-over';
                break;
            case 'eraser':
                ctx.lineWidth = 20;
                ctx.globalCompositeOperation = 'destination-out';
                break;
        }
    }, [tool, color]);


    const saveState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setPaths(prev => [...prev, data]);
    };

    const undo = () => {
        if (paths.length <= 1) return; // Need at least initial state + 1 stroke

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newPaths = [...paths];
        newPaths.pop(); // Remove last state

        const previousState = newPaths[newPaths.length - 1];
        ctx.putImageData(previousState, 0, 0);

        setPaths(newPaths);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    };

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
        // Important: capture pointer so it tracks outside canvas bounds smoothly
        canvas.setPointerCapture(e.pointerId);
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Only draw if we have pressure > 0 or it's a mouse
        if (e.pointerType !== 'mouse' && e.pressure === 0) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(false);
        canvas.releasePointerCapture(e.pointerId);
        saveState();
    };

    const handleSend = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Ensure there is actually something drawn before sending?
        if (paths.length <= 1) {
            onClose();
            return;
        }

        const dataUrl = canvas.toDataURL('image/png');
        onSend(dataUrl);
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={undo}
                        disabled={paths.length <= 1}
                        className={`p-2 rounded-full transition-colors ${paths.length <= 1 ? 'text-gray-600' : 'hover:bg-white/10'}`}
                        title="Undo"
                    >
                        <RotateCcw size={22} />
                    </button>
                    <button onClick={clear} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Clear All">
                        <Trash2 size={22} />
                    </button>
                    <button onClick={handleSend} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-full font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2 transition-all">
                        <span>Send</span>
                        <Send size={16} className="ml-1" />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative mx-4 lg:mx-20 my-4 bg-transparent border-2 border-dashed border-white/20 rounded-3xl" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerOut={stopDrawing}
                />
            </div>

            {/* Footer / Tools */}
            <div className="p-6 bg-black/50 border-t border-white/10">
                {/* Tools */}
                <div className="flex justify-center gap-6 mb-6">
                    <button onClick={() => setTool('pen')} className={`p-3 rounded-full transition-all ${tool === 'pen' ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}>
                        <Pen size={24} className={tool === 'pen' ? 'text-white' : 'text-gray-400'} />
                    </button>
                    <button onClick={() => setTool('brush')} className={`p-3 rounded-full transition-all ${tool === 'brush' ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}>
                        <Paintbrush size={24} className={tool === 'brush' ? 'text-white' : 'text-gray-400'} />
                    </button>
                    <button onClick={() => setTool('highlighter')} className={`p-3 rounded-full transition-all ${tool === 'highlighter' ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}>
                        <Highlighter size={24} className={tool === 'highlighter' ? 'text-white' : 'text-gray-400'} />
                    </button>
                    <button onClick={() => setTool('eraser')} className={`p-3 rounded-full transition-all ${tool === 'eraser' ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}>
                        <Eraser size={24} className={tool === 'eraser' ? 'text-white' : 'text-gray-400'} />
                    </button>
                </div>

                {/* Colors */}
                <div className={`flex justify-center gap-3 overflow-x-auto pb-2 px-4 no-scrollbar ${tool === 'eraser' ? 'opacity-30 pointer-events-none' : ''}`}>
                    {SWATCHES.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-10 h-10 shrink-0 rounded-full border-[3px] transition-transform ${color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
