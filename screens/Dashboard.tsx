import React, { useState, useEffect } from 'react';
import { AppScreen, PetStats } from '../types';

interface DashboardProps {
  onNavigate: (screen: AppScreen) => void;
  interaction?: 'nudge' | 'pulse' | null;
  stats: PetStats;
  onAction: (type: 'feed' | 'play') => void;
  anniversaryDate: Date;
  selectedPetId: string;
  nextMilestone: { label: string, days: number };
  partnerName: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  interaction, 
  stats, 
  onAction, 
  anniversaryDate,
  selectedPetId,
  nextMilestone,
  partnerName
}) => {
  const [daysCount, setDaysCount] = useState(0);

  useEffect(() => {
    const diffTime = Math.abs(Date.now() - anniversaryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDaysCount(diffDays);
  }, [anniversaryDate]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `Together Since ${monthNames[anniversaryDate.getMonth()]} ${anniversaryDate.getDate()}`;

  // Logic for Pet Image based on Days (Growth) and Type
  const getPetImage = () => {
    const isDog = selectedPetId === 'dog';
    
    if (daysCount < 100) {
      // Baby
      return isDog 
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDKd5aV2GgS6oflgZIyGaAXv3CGaw0pY0xmAegpcPu3hZd8iYS49QQDLd53VYCJYGylI_YXbhdQ821vcLrzxMY4WjNouKZur0v6OODNkH1kQ_TggXBFAw28N6iszeDUtCcbT7OikZZgk1yoRH14NbfzmAHPBoF_tWRXfbfrG07HmsqUOw9r0JnIbPw0epN2-EjeFjkx_5s8DYnAeWXhwvcxrRq4NrkgcpnkA9MWAq96icoXt6NGNekLfHfvYAv-wEYc8iVs2wieEDk" 
        : "https://lh3.googleusercontent.com/aida-public/AB6AXuAFgVTEl8-XAkFnHfrbNNfiAVIrV11UEn_d9bMWucvZPX4HL0t1nwVI_DR4vYxTE6it4asz-qBluqOqG70xt1eZZ9g0OybCVn0TRD8LQzrmItCt1SiVe9N0YM0R9yeMuCJoBPFhnV7E84XOhbdoQlwcnty6R2OUVwmNw3meMeHksJ1kZouinWxtg_UXucAJNZ8Zqf5FPeTUHbogSlUvwEJGOU9fEk34_f8DtdoKxkMJ-ovqJgEAb1DdhTRWA4og-5CPTp3jVH0dxSw";
    } else {
      // Adult (simulated with different images for demo)
      return isDog 
        ? "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
    }
  };

  return (
    <div className="relative h-screen min-h-[800px] w-full flex flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center" 
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(248, 246, 245, 0.1), rgba(248, 246, 245, 0.8)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqicX3a1pW4NS-gapckdc4qdhKRj_Tp67wx5RyY8504vkuR_DslPpHXrqIiicjSaMQPndaI1hqwIQqnGyGfARrJSIFxUnzgCADKHsidIfZs_20laIBLvUe8GMdzxHFrNO7vkVephqnh4_XBqlC6ACGKeYUs_7gyKzz-bMUITbA_jKvyeO8wG9WEaHvbWRsA-ite9-slFOdDMwd_LvyU5IkFqaEOy87OBbS_7F8oErh_mRwewD_kXhJm2g8lXhenuHzqW6kcqqbgG4')"
          }}
        ></div>
      </div>

      <div className="relative z-10 flex items-center justify-between p-6 pt-14">
        <div className="flex items-center gap-3 glass-card p-2 px-3 rounded-full cursor-pointer" onClick={() => onNavigate(AppScreen.MEMORY)}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">favorite</span>
          </div>
          <span className="text-sm font-bold text-background-dark dark:text-white">Our Story</span>
        </div>
        
        {partnerName && (
            <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full animate-fade-in">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Connected to</span>
                <span className="text-sm font-bold text-primary">{partnerName}</span>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
        )}
      </div>

      <div className="relative z-10 px-6 pt-4 text-center">
        <h1 className="text-background-dark dark:text-white text-5xl font-extrabold tracking-tight">Day {daysCount}</h1>
        <p className="text-background-dark/60 dark:text-white/60 font-medium text-lg mt-1">{formattedDate}</p>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-6">
        <div className="relative drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)] transition-transform">
          <img 
            alt="Your Virtual Pet" 
            className="w-64 h-64 object-cover rounded-full border-4 border-white glass-card" 
            src={getPetImage()} 
          />
          
          {/* Interaction Feedback Overlay */}
          {interaction === 'nudge' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 animate-bounce">
              <div className="bg-white/90 p-4 rounded-full shadow-xl backdrop-blur-sm">
                <span className="material-symbols-outlined text-6xl text-primary">pets</span>
              </div>
            </div>
          )}
          {interaction === 'pulse' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 animate-pulse">
              <div className="bg-white/90 p-4 rounded-full shadow-xl backdrop-blur-sm">
                <span className="material-symbols-outlined text-6xl text-red-500">favorite</span>
              </div>
            </div>
          )}

          <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <div className="glass-card p-2 rounded-xl flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
              <div className="w-1 h-10 bg-gray-200/50 rounded-full mt-1 overflow-hidden relative">
                <div 
                  className="bg-primary w-full rounded-full absolute bottom-0 transition-all duration-500" 
                  style={{height: `${stats.affection}%`}}
                ></div>
              </div>
            </div>
            <div className="glass-card p-2 rounded-xl flex flex-col items-center">
              <span className="material-symbols-outlined text-blue-400 text-xl" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
              <div className="w-1 h-10 bg-gray-200/50 rounded-full mt-1 overflow-hidden relative">
                <div 
                  className="bg-blue-400 w-full rounded-full absolute bottom-0 transition-all duration-500"
                  style={{height: `${stats.hunger}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 px-4 w-full max-w-[280px]">
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Next Milestone</span>
              <span className="text-background-dark dark:text-white font-bold text-base">{nextMilestone.label}</span>
            </div>
            <div className="bg-primary/10 p-2 px-3 rounded-xl text-primary font-bold text-sm whitespace-nowrap">
              {nextMilestone.days} Days
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-10 pb-36">
        <div className="flex justify-between items-center gap-6">
          <button 
            onClick={() => onAction('play')}
            disabled={stats.playCountToday >= 3}
            className={`flex-1 glass-card flex flex-col items-center py-4 rounded-2xl active:scale-95 transition-all ${stats.playCountToday >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-primary mb-1 text-3xl">kitesurfing</span>
            <span className="text-[10px] font-bold text-background-dark dark:text-white uppercase tracking-wider">Play</span>
            <span className="text-[9px] text-gray-500">{stats.playCountToday}/3</span>
          </button>
          <button 
            onClick={() => onAction('feed')}
            disabled={stats.feedCountToday >= 3}
            className={`flex-1 glass-card flex flex-col items-center py-4 rounded-2xl active:scale-95 transition-all ${stats.feedCountToday >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-primary mb-1 text-3xl">cookie</span>
            <span className="text-[10px] font-bold text-background-dark dark:text-white uppercase tracking-wider">Feed</span>
            <span className="text-[9px] text-gray-500">{stats.feedCountToday}/3</span>
          </button>
        </div>
      </div>
    </div>
  );
};