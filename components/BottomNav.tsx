import React from 'react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const isActive = (screen: AppScreen) => currentScreen === screen;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[360px] z-50">
      <div className="nav-capsule rounded-full px-8 py-4 flex justify-between items-center shadow-lg border border-white/40 h-[72px]">
        <button 
          onClick={() => onNavigate(AppScreen.DASHBOARD)}
          className={`flex flex-col items-center gap-0.5 transition-colors duration-200 ${isActive(AppScreen.DASHBOARD) ? 'text-primary' : 'text-gray-400 hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined font-semibold text-[24px]">home</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        
        <button 
          onClick={() => onNavigate(AppScreen.GALLERY)}
          className={`flex flex-col items-center gap-0.5 transition-colors duration-200 ${isActive(AppScreen.GALLERY) ? 'text-primary' : 'text-gray-400 hover:text-primary/70'}`}
        >
          <div className="relative flex flex-col items-center">
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
            {isActive(AppScreen.GALLERY) && <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -top-1 -right-0.5"></div>}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Gallery</span>
        </button>
        
        <button 
          onClick={() => onNavigate(AppScreen.CHAT)}
          className={`flex flex-col items-center gap-0.5 transition-colors duration-200 ${isActive(AppScreen.CHAT) ? 'text-primary' : 'text-gray-400 hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
        </button>
      </div>
    </div>
  );
};