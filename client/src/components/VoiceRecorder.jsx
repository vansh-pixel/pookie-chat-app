import { useState, useRef } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
       // Convert blob to base64 to send via socket/http for simplicity in this demo
       // In prod, stick to FormData/Upload
       const reader = new FileReader();
       reader.readAsDataURL(audioBlob);
       reader.onloadend = () => {
           onSend(reader.result, 'audio'); // sending base64
           setAudioUrl(null);
           setAudioBlob(null);
       };
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!audioUrl ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-pookie-blue hover:bg-blue-300'}`}
          >
            {isRecording ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
      ) : (
          <div className="flex items-center gap-2 bg-white p-1 rounded-full px-2 shadow-sm">
              <audio controls src={audioUrl} className="h-8 w-40" />
              <button onClick={handleSend} className="p-2 bg-green-400 rounded-full text-white hover:bg-green-500">
                  <Send className="w-4 h-4" />
              </button>
              <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="p-2 bg-red-400 rounded-full text-white hover:bg-red-500 text-xs">
                  X
              </button>
          </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
