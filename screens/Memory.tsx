import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';

interface MemoryProps {
  onNavigate: (screen: AppScreen) => void;
  anniversaryDate: Date;
  petName: string;
  selectedPetId: string;
}

export const Memory: React.FC<MemoryProps> = ({ onNavigate, anniversaryDate, petName, selectedPetId }) => {
  const [daysCount, setDaysCount] = useState(0);
  const [randomMemo, setRandomMemo] = useState('');
  const [randomPoseImage, setRandomPoseImage] = useState('');

  useEffect(() => {
    const diffTime = Math.abs(Date.now() - anniversaryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDaysCount(diffDays);

    // Randomize Content
    const memos = [
      "Mochi's hat looks so cute today! ✨",
      "Look at that sleepy face! 😴",
      "Ready for another adventure! 🚀",
      "Thinking about treats... 🦴",
      "Sending you both lots of love! ❤️"
    ];
    setRandomMemo(memos[Math.floor(Math.random() * memos.length)].replace("Mochi", petName));

    // Simple randomization for demo images based on pet type
    const dogImages = [
       "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
       "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
       "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ];
    const catImages = [
       "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
       "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
       "https://images.unsplash.com/photo-1495360019602-e05980bf549a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ];

    const images = selectedPetId === 'dog' ? dogImages : catImages;
    setRandomPoseImage(images[Math.floor(Math.random() * images.length)]);

  }, [anniversaryDate, petName, selectedPetId]);

  const handleShare = async () => {
    try {
      // Use html2canvas if available globally (script added in index.html)
      const element = document.getElementById('memory-capture');
      // @ts-ignore
      if (window.html2canvas && element) {
         // @ts-ignore
        const canvas = await window.html2canvas(element, { scale: 2 });
        canvas.toBlob(async (blob: any) => {
          if (blob && navigator.share) {
            const file = new File([blob], 'our-memory.jpg', { type: 'image/jpeg' });
            await navigator.share({
              files: [file],
              title: 'Our Memory',
              text: `Celebrating ${daysCount} days together!`
            });
          } else {
             alert("Sharing not supported on this device/browser, or html2canvas failed.");
          }
        }, 'image/jpeg');
      } else {
        alert("Preparing image... (Sharing requires context support)");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div id="memory-capture" className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-paper-texture">
      <div className="flex items-center p-4 pt-12 pb-0 justify-between z-20 shrink-0">
        <div className="flex size-10 items-center justify-start">
          <button 
            onClick={() => onNavigate(AppScreen.DASHBOARD)}
            className="material-symbols-outlined cursor-pointer hover:bg-black/5 p-2 rounded-full transition-colors"
          >
            close
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-primary/10 px-4 py-1 rounded-full border border-primary/20 rotate-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-marker">Memory Journal</span>
          </div>
        </div>
        <div className="flex size-10 items-center justify-end">
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
        <div className="absolute top-20 right-4 w-24 h-24 border-2 border-dashed border-primary/30 rounded-full rotate-12"></div>
        <div className="absolute top-1/2 -left-10 w-40 h-40 bg-sky/10 rounded-xl -rotate-12 border border-sky/20"></div>
        <div className="absolute bottom-40 right-10 font-handwriting text-primary/40 text-4xl -rotate-6">Forever & Always</div>
        <div className="absolute top-1/4 left-6 font-note text-black/20 text-xl rotate-12 underline decoration-sky/30 underline-offset-4">Our First Day</div>
        
        <div className="absolute w-[10px] h-[10px] rounded-[2px] opacity-40 bg-primary" style={{top: '15%', left: '85%', transform: 'rotate(15deg)'}}></div>
        <div className="absolute w-[10px] h-[10px] rounded-[2px] opacity-40 bg-sky" style={{top: '75%', left: '10%', transform: 'rotate(-25deg)'}}></div>
        <div className="absolute w-[10px] h-[10px] rounded-[2px] opacity-40 bg-mint" style={{top: '45%', left: '90%', transform: 'rotate(45deg)'}}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-10">
        <div className="text-center mb-8 relative pt-6">
          <div className="absolute top-2 -left-2 w-10 h-5 tape -rotate-45"></div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#1c100d] dark:text-white mb-1">
            Happy <span className="text-primary italic font-marker text-4xl inline-block px-1 transform -rotate-2">{daysCount}</span> Days!
          </h1>
          <p className="font-handwriting text-xl text-primary/80">Since {anniversaryDate.toLocaleDateString()}</p>
        </div>

        <div className="relative w-full max-w-[300px] aspect-[4/5] flex items-center justify-center mb-4">
          <div className="absolute w-56 h-72 bg-white polaroid-shadow -rotate-6 translate-x-10 translate-y-4 border border-gray-100 flex items-center justify-center">
            <div className="w-48 h-48 bg-gray-50 mb-10"></div>
          </div>
          <div className="relative w-64 h-80 bg-white p-4 pb-14 polaroid-shadow rotate-3 -translate-x-4 border border-gray-100">
            <div className="absolute -top-3 left-1/2 -translate-x-10 w-20 h-6 bg-primary/40 tape rotate-3 z-10 border border-white/20"></div>
            <div className="w-full h-full rounded-2xl overflow-hidden relative bg-gray-50 border border-gray-100/50">
              <img 
                alt="Pet Pose" 
                className="w-full h-full object-cover" 
                src={randomPoseImage} 
              />
              <div className="absolute top-2 right-2">
                <span className="material-symbols-outlined text-white text-2xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
              </div>
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="font-handwriting text-xl text-gray-700">Celebrating with {petName}!</span>
            </div>
          </div>

          <div className="absolute bottom-6 -right-6 w-32 h-24 bg-mint p-2 shadow-lg -rotate-12 transform hover:rotate-0 transition-transform cursor-pointer z-20">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-white/50 shadow-sm"></div>
            <p className="font-note text-[11px] text-green-900 leading-tight">{randomMemo}</p>
          </div>
          <div className="absolute top-2 left-0 z-20">
            <span className="material-symbols-outlined text-primary text-3xl transform -rotate-12 filter drop-shadow-sm" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
          </div>
        </div>

        <div className="text-center max-w-xs relative mb-2 mt-4">
          <div className="absolute -top-2 right-0 w-8 h-8 bg-sky/30 rounded-full blur-xl"></div>
          <p className="text-[#1c100d] dark:text-[#f8f6f5]/80 text-lg leading-snug font-handwriting">
            You've grown so much together. <br />
            <span className="text-primary font-bold text-xl">{petName}</span> is so proud of you both!
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-3 flex items-end justify-center gap-4 opacity-20">
        <div className="w-10 h-1 bg-primary/40 rounded-t-full"></div>
        <div className="w-10 h-1 bg-primary/40 rounded-t-full"></div>
        <div className="w-10 h-1 bg-primary/40 rounded-t-full"></div>
      </div>
    </div>
  );
};