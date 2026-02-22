"use client";

import { useState, useRef } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
    onSend: (audioData: string) => void;
}

const VoiceRecorder = ({ onSend }: VoiceRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please allow permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    onSend(reader.result); // sending base64
                    setAudioUrl(null);
                    setAudioBlob(null);
                }
            };
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!audioUrl ? (
                <button
                    suppressHydrationWarning
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-hk-pink hover:bg-pink-400'}`}
                >
                    {isRecording ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </button>
            ) : (
                <div className="flex items-center gap-2 bg-white p-1 rounded-full px-2 shadow-sm border border-gray-100">
                    <audio controls src={audioUrl} className="h-8 w-40" />
                    <button onClick={handleSend} className="p-2 bg-green-400 rounded-full text-white hover:bg-green-500">
                        <Send className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="p-2 bg-red-400 rounded-full text-white hover:bg-red-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
