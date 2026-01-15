import React, { useState, useEffect, useRef } from 'react';
import { AppScreen, ChatMessage } from '../types';

interface ChatProps {
  onNavigate: (screen: AppScreen) => void;
  onInteraction?: (type: 'nudge' | 'pulse') => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  myMood: string;
  setMyMood: (mood: string) => void;
  partnerName: string | null;
}

const MOODS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Sleepy', emoji: '😴' },
  { label: 'Hungry', emoji: '🍔' },
  { label: 'Love', emoji: '❤️' },
  { label: 'Angry', emoji: '😠' },
  { label: 'Excited', emoji: '🤩' },
  { label: 'Working', emoji: '💻' }
];

export const Chat: React.FC<ChatProps> = ({ 
  onNavigate, 
  onInteraction, 
  messages, 
  onSendMessage,
  myMood,
  setMyMood,
  partnerName
}) => {
  const [inputText, setInputText] = useState('');
  // Simulating partner's mood for the demo
  const [partnerMood] = useState<string>('Love'); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Helper to format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPartnerMoodEmoji = () => {
    return MOODS.find(m => m.label === partnerMood)?.emoji || '😊';
  };

  const displayPartnerName = partnerName || "Partner";

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
      <header className="bg-white/70 dark:bg-background-dark/70 backdrop-blur-lg border-b border-gray-100 dark:border-white/5 pt-4 shrink-0 z-20">
        <div className="flex items-center px-4 py-3 justify-between">
          <button 
            onClick={() => onNavigate(AppScreen.DASHBOARD)}
            className="text-[#c9a6d9] flex size-8 items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[#161118] dark:text-white text-[15px] font-bold tracking-tight">{displayPartnerName}</h2>
              <div className="w-2 h-2 rounded-full bg-green-400 ring-2 ring-green-400/20"></div>
            </div>
            {/* Partner's Status represented by Emoji */}
            <p className="text-[12px] text-[#796085] dark:text-[#a187b0] font-medium flex items-center gap-1 mt-0.5">
              Currently: <span className="text-lg leading-none">{getPartnerMoodEmoji()}</span>
            </p>
          </div>
          <div className="size-8"></div>
        </div>
        <div className="px-4 pb-3 flex items-center justify-center gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => onInteraction?.('nudge')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px] text-pink-400">pets</span>
              <span className="text-[10px] font-bold text-[#796085] dark:text-[#a187b0] uppercase tracking-wider">Nudge</span>
            </button>
            <button 
              onClick={() => onInteraction?.('pulse')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px] text-red-400">favorite</span>
              <span className="text-[10px] font-bold text-[#796085] dark:text-[#a187b0] uppercase tracking-wider">Pulse</span>
            </button>
          </div>
        </div>
      </header>

      <div className="py-2 flex justify-center shrink-0">
        <div className="bg-gray-100/50 dark:bg-white/5 rounded-full py-1 px-3 border border-gray-200/20">
          <p className="text-[#796085] dark:text-[#c9a6d9] text-[10px] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">history</span> Messages fade in 24h
          </p>
        </div>
      </div>

      {/* Main chat area with padding at bottom to clear input bar */}
      <main className="flex-1 overflow-y-auto px-4 space-y-4 pb-[160px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'me' ? 'ml-auto justify-end' : ''}`}
          >
            <div className={`flex flex-col gap-0.5 ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-[13px] leading-snug px-3.5 py-2.5 text-slate-800 ${
                  msg.sender === 'me' 
                    ? 'bg-bubble-pink rounded-2xl rounded-br-none' 
                    : 'bg-bubble-blue rounded-2xl rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              <p className={`text-[9px] text-gray-400 ${msg.sender === 'me' ? 'mr-1' : 'ml-1'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area - Positioned above the Bottom Nav (approx 80px) */}
      <div className="absolute bottom-[80px] left-0 right-0 bg-white dark:bg-background-dark/90 border-t border-gray-100 dark:border-white/5 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-40 p-3">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {/* Mood Selector - Sets MY mood */}
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pb-1 px-1">
            {MOODS.map((mood) => (
              <button 
                key={mood.label}
                onClick={() => setMyMood(mood.label)}
                className={`flex flex-col items-center gap-1 min-w-[3rem] transition-all ${myMood === mood.label ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-100'}`}
              >
                <span className="text-2xl filter drop-shadow-sm">{mood.emoji}</span>
                <span className="text-[9px] font-medium text-[#796085]">{mood.label}</span>
              </button>
            ))}
          </div>
          
          {/* Text Input */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-gray-50 dark:bg-white/5 rounded-full px-4 py-2 border border-gray-100 dark:border-white/5">
              <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] text-[#161118] dark:text-white placeholder-[#796085]/40 dark:placeholder-[#a187b0]/40 py-0" 
                placeholder="Whisper..." 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="material-symbols-outlined text-[20px] text-gray-300 dark:text-gray-600">mood</span>
            </div>
            <button 
              onClick={handleSend}
              className="flex size-9 items-center justify-center bg-[#c9a6d9] text-white rounded-full shadow-md shadow-[#c9a6d9]/20 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};