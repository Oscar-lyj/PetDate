import React, { useRef, useState } from 'react';
import { AppScreen, GalleryItem } from '../types';

interface GalleryProps {
  onNavigate: (screen: AppScreen) => void;
  items: GalleryItem[];
  onAddItem: (image: string, caption: string) => void;
  petName: string;
  anniversaryDate: Date;
  birthdays: { his: Date | null, her: Date | null };
}

interface DateInfo {
  day: number;
  type: 'anniversary' | 'festival' | 'bday';
  icon: string;
  description: string;
}

export const Gallery: React.FC<GalleryProps> = ({ 
  onNavigate, 
  items, 
  onAddItem,
  petName,
  anniversaryDate,
  birthdays
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // States for modals
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<GalleryItem | null>(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState<DateInfo | null>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const caption = prompt(`What does ${petName} say about this moment?`, "A special memory!");
      if (caption !== null) {
        onAddItem(imageUrl, caption);
      }
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const latestItem = items[0]; 
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const isSpecialDate = (day: number): DateInfo | null => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    // Anniversary check
    if (checkDate.getDate() === anniversaryDate.getDate() && checkDate.getMonth() === anniversaryDate.getMonth()) {
      return { day, type: 'anniversary', icon: 'favorite', description: 'Our Anniversary: The start of us!' };
    }
    
    // 520 Festival
    if (checkDate.getMonth() === 4 && checkDate.getDate() === 20) {
       return { day, type: 'festival', icon: 'volunteer_activism', description: '520 Day: I love you!' };
    }
    // Valentine's
    if (checkDate.getMonth() === 1 && checkDate.getDate() === 14) {
       return { day, type: 'festival', icon: 'favorite_border', description: "Valentine's Day: Day of love." };
    }

    // Birthdays
    if (birthdays.his && checkDate.getDate() === birthdays.his.getDate() && checkDate.getMonth() === birthdays.his.getMonth()) {
        return { day, type: 'bday', icon: 'cake', description: "His Birthday: Celebrating him!" };
    }
    if (birthdays.her && checkDate.getDate() === birthdays.her.getDate() && checkDate.getMonth() === birthdays.her.getMonth()) {
        return { day, type: 'bday', icon: 'celebration', description: "Her Birthday: Celebrating her!" };
    }

    return null;
  };

  const getImageForDate = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return items.find(item => 
      item.date.getDate() === checkDate.getDate() && 
      item.date.getMonth() === checkDate.getMonth() && 
      item.date.getFullYear() === checkDate.getFullYear()
    );
  };

  return (
    <div className="bg-bg-pastel text-text-main overflow-hidden h-screen font-display relative">
      
      {/* --- MODALS --- */}
      
      {/* Image Preview Modal */}
      {selectedPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPreviewItem(null)}>
          <div className="bg-white p-2 rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
             <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
                <img src={selectedPreviewItem.image} alt="Memory" className="w-full h-full object-cover" />
             </div>
             <div className="p-4 text-center">
                <p className="text-lg font-bold text-text-main">"{selectedPreviewItem.caption}"</p>
                <p className="text-xs text-text-light mt-1">{selectedPreviewItem.date.toLocaleDateString()}</p>
             </div>
             <button 
                onClick={() => setSelectedPreviewItem(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 backdrop-blur-md transition-colors"
             >
                <span className="material-symbols-outlined text-lg">close</span>
             </button>
          </div>
        </div>
      )}

      {/* Date Info Modal */}
      {selectedDateInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDateInfo(null)}>
           <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center relative transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                 <span className="material-symbols-outlined text-2xl">{selectedDateInfo.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-text-main mb-1">
                 {selectedDateInfo.day} {monthNames[currentMonth.getMonth()]}
              </h3>
              <p className="text-sm text-text-main/80 font-medium">
                 {selectedDateInfo.description}
              </p>
              <button onClick={() => setSelectedDateInfo(null)} className="mt-5 w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl active:scale-95 transition-transform">
                 Close
              </button>
           </div>
        </div>
      )}


      <div className="relative flex h-full max-w-md mx-auto flex-col z-10 overflow-hidden">
        <header className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-soft border border-primary/10">
              <span className="material-symbols-outlined text-primary text-[24px] fill-current">potted_plant</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-text-main">Themed Journey</h1>
          </div>
          <button 
            onClick={handleAddClick}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-soft border border-primary/10 text-primary active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined font-bold">add</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </header>

        <main className="flex-1 flex flex-col px-6 gap-4 pb-32 overflow-y-auto">
          
          {/* Latest Preview Section */}
          <section className="flex-none -mt-2">
            <div 
              className="w-full aspect-[16/10] bg-center bg-no-repeat bg-cover rounded-3xl shadow-soft border-4 border-white relative overflow-hidden group" 
              style={{backgroundImage: `url("${latestItem?.image || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}")`}}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm border border-white/50">
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Latest Moment</p>
                  <p className="text-sm font-bold text-text-main truncate">{latestItem?.caption || "Start your journey..."}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex-none p-4 rounded-3xl bg-white border border-primary/10 shadow-soft flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-soft rounded-2xl flex items-center justify-center text-2xl flex-none border border-white">
              🐶
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wide">{petName} says...</p>
              <p className="text-xs text-text-main/80 italic font-medium leading-relaxed">"{latestItem?.caption || "Waiting for your first memory!"}"</p>
            </div>
          </section>

          <section className="flex-none min-h-0 flex flex-col gap-3 pb-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-light">Memory Calendar</h3>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
                <button onClick={() => handleMonthChange('prev')} className="material-symbols-outlined text-lg leading-none text-text-light hover:text-primary transition-colors cursor-pointer">chevron_left</button>
                <span className="text-xs font-bold text-text-main min-w-[60px] text-center">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button onClick={() => handleMonthChange('next')} className="material-symbols-outlined text-lg leading-none text-text-light hover:text-primary transition-colors cursor-pointer">chevron_right</button>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-4 flex flex-col mb-4 border border-primary/5 shadow-soft h-auto min-h-[300px]">
              <div className="grid grid-cols-7 mb-3">
                {['S','M','T','W','T','F','S'].map((day, i) => (
                   <div key={i} className="text-[10px] font-bold text-center text-text-light uppercase">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 content-start">
                {/* Empty slots for start of month */}
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} className="aspect-[4/5]" />)}

                {/* Days */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const d = i + 1;
                  const special = isSpecialDate(d);
                  const imgItem = getImageForDate(d);

                  // Image Item
                  if (imgItem) return (
                    <div 
                        key={d} 
                        className="flex flex-col items-center justify-start group cursor-pointer relative aspect-[3/4]" 
                        onClick={() => setSelectedPreviewItem(imgItem)}
                    >
                      {/* Image on Top */}
                      <div className="w-8 h-8 rounded-lg bg-cover bg-center border border-white shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform mb-0.5 z-10" style={{backgroundImage: `url("${imgItem.image}")`}}></div>
                      {/* Date Below */}
                      <span className="text-[9px] font-semibold text-text-main group-hover:text-primary transition-colors leading-none">{d}</span>
                    </div>
                  );

                  // Special Date Item
                  if (special) return (
                    <div 
                        key={d} 
                        className="flex flex-col items-center justify-start cursor-pointer aspect-[3/4]"
                        onClick={() => setSelectedDateInfo(special)}
                    >
                      {/* Icon on Top */}
                      <div className="w-8 h-8 flex items-center justify-center bg-primary/5 rounded-lg mb-0.5 group hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-primary text-[18px] fill-current">{special.icon}</span>
                      </div>
                      {/* Date Below */}
                      <span className="text-[9px] font-bold text-text-main leading-none">{d}</span>
                    </div>
                  );

                  // Regular Day
                  return (
                     <div key={d} className="flex flex-col items-center justify-start pt-1 aspect-[3/4] opacity-40">
                        <div className="w-8 h-8 mb-0.5"></div> {/* Spacer to align with images */}
                        <span className="text-[10px] font-medium text-text-main leading-none">{d}</span>
                     </div>
                  )
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};