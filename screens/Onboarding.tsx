import React, { useState } from 'react';
import { AppScreen, PETS } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface OnboardingProps {
  onNavigate: (screen: AppScreen) => void;
  session: Session | null;
  // Legacy props kept to satisfy TS if not all files updated, 
  // but logically we use Supabase now.
  setAnniversary: any;
  setBirthdays: any;
  setPetName: any;
  setSelectedPetId: any;
  setUserName: any;
  setPartnerName: any;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  onNavigate,
  session
}) => {
  const [selectedPet, setSelectedPet] = useState<string>('dog');
  const [anniversaryStr, setAnniversaryStr] = useState<string>('');
  const [localPetName, setLocalPetName] = useState<string>('');
  const [localUserName, setLocalUserName] = useState<string>('');

  // Partner connection
  const [partnerCode, setPartnerCode] = useState<string>('');
  const [connectStatus, setConnectStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [isCreator, setIsCreator] = useState(true); // Default to creating new couple
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Helper to parse YYYY-MM-DD to Local Date (avoiding UTC shifts)
  const parseLocalDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const generateCode = () => {
    // Simple random 6 char code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    return code;
  };

  const handleJoinCouple = async () => {
    if (!partnerCode) return;
    setConnectStatus('checking');
    try {
      // Check if code exists
      const { data, error } = await supabase.from('couples').select('*').eq('code', partnerCode).single();
      if (error || !data) throw new Error('Invalid code');

      setConnectStatus('connected');
    } catch (e) {
      setConnectStatus('error');
      setTimeout(() => setConnectStatus('idle'), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!session || !localUserName) return alert("Please enter your name");

    try {
      // 1. Create/Update Profile
      await supabase.from('profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        full_name: localUserName,
        updated_at: new Date().toISOString()
      });

      // 2. Handle Couple
      let coupleId: string;

      if (isCreator) {
        const code = generatedCode || generateCode();
        const { data, error } = await supabase.from('couples').insert({
          created_by: session.user.id,
          partner_1_id: session.user.id,
          code: code,
          anniversary_date: anniversaryStr ? parseLocalDate(anniversaryStr)?.toISOString() : null
        }).select().single();

        if (error) throw error;
        coupleId = data.id;
      } else {
        // Joining
        const { data: couple, error: fetchError } = await supabase.from('couples').select('*').eq('code', partnerCode).single();
        if (fetchError || !couple) throw fetchError || new Error("Couple not found");

        // Update partner_2
        if (couple.partner_1_id !== session.user.id) {
          const { error: updateError } = await supabase.from('couples').update({
            partner_2_id: session.user.id
          }).eq('id', couple.id);
          if (updateError) throw updateError;
        }
        coupleId = couple.id;
      }

      // 3. Create Pet Stats (if making new couple or if missing)
      // Only creator basically initiates the pet, joiner adopts it
      if (isCreator) {
        await supabase.from('pet_stats').insert({
          couple_id: coupleId,
          pet_id: selectedPet,
          name: localPetName || 'Mochi',
          hunger: 60,
          affection: 80,
          last_interaction: new Date().toISOString()
        });
      }

      // Navigate via App logic (Auth listener will see the new data and trigger Dashboard)
      onNavigate(AppScreen.DASHBOARD);
      window.location.reload();

    } catch (e: any) {
      alert("Error setting up: " + e.message);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-40 bg-[#fff0f3] dark:bg-background-dark transition-colors duration-300">
      <div className="sticky top-0 z-10 flex items-center bg-[#fff0f3]/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
        <button
          onClick={() => onNavigate(AppScreen.LANDING)}
          className="text-[#1c100d] dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[#1c100d] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Prepare Your Journey</h2>
        <div className="size-10"></div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[#1c100d] dark:text-white text-xl font-bold">About You</h3>
        <p className="text-[#9c5749] dark:text-zinc-400 text-sm">Let's get to know you first.</p>
        <div className="mt-4">
          <input
            className="w-full h-12 px-5 rounded-full border-none bg-white dark:bg-zinc-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-sm focus:ring-2 focus:ring-primary/20 dark:text-white placeholder:text-[#9c5749]/50"
            placeholder="What's your name?"
            type="text"
            value={localUserName}
            onChange={(e) => setLocalUserName(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pt-6 pb-2">
        <h3 className="text-[#1c100d] dark:text-white text-xl font-bold">Connect Your Partner</h3>
        <div className="flex gap-4 mb-4 mt-2">
          <button
            onClick={() => setIsCreator(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border ${isCreator ? 'bg-primary text-white border-primary' : 'border-primary/30 text-primary'}`}
          >
            Start New Code
          </button>
          <button
            onClick={() => setIsCreator(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border ${!isCreator ? 'bg-primary text-white border-primary' : 'border-primary/30 text-primary'}`}
          >
            Join with Code
          </button>
        </div>

        {isCreator ? (
          <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl shadow-sm text-center">
            <p className="text-sm text-zinc-500 mb-2">You will generate a code after setup to share with your partner.</p>
            <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-mono">
              <span className="material-symbols-outlined text-sm">vpn_key</span>
              Code generates on save
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="flex-1 h-12 px-5 rounded-full border-none bg-white dark:bg-zinc-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-sm focus:ring-2 focus:ring-primary/20 dark:text-white placeholder:text-[#9c5749]/50 uppercase"
              placeholder="ENTER 6-DIGIT CODE"
              type="text"
              maxLength={6}
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
            />
            <button
              onClick={handleJoinCouple}
              disabled={connectStatus === 'connected'}
              className={`px-6 h-12 text-white text-sm font-bold rounded-full shadow-lg transition-all ${connectStatus === 'connected' ? 'bg-green-500' :
                  connectStatus === 'error' ? 'bg-red-500' : 'bg-primary'
                }`}
            >
              {connectStatus === 'checking' ? '...' :
                connectStatus === 'connected' ? 'Joined' :
                  connectStatus === 'error' ? 'Invalid' : 'Check'}
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pt-8 pb-4">
        <h2 className="text-[#1c100d] dark:text-white tracking-tight text-3xl font-extrabold leading-tight">When did your story begin?</h2>
        <p className="text-[#9c5749] dark:text-zinc-400 text-sm mt-1">We'll help you celebrate every milestone together.</p>
      </div>

      <div className="flex flex-col gap-4 px-4 py-2">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white dark:bg-zinc-900/50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-white dark:border-zinc-800">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-[#1c100d] dark:text-white text-base font-bold leading-tight">Our Anniversary</p>
            <div className="mt-3 relative">
              <input
                type="date"
                onChange={(e) => setAnniversaryStr(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-primary/10 text-primary text-sm font-bold border border-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-10 pb-4">
        <h3 className="text-[#1c100d] dark:text-white text-xl font-bold">Choose Your Pet</h3>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 pb-4 hide-scrollbar">
        {PETS.map((pet) => (
          <button
            key={pet.id}
            onClick={() => setSelectedPet(pet.id)}
            className={`flex-none w-48 rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all ${selectedPet === pet.id
                ? 'bg-white dark:bg-zinc-900/50 border-2 border-primary'
                : 'bg-white dark:bg-zinc-900/50 border border-transparent'
              }`}
          >
            <div
              className="w-full aspect-[4/5] bg-cover bg-center rounded-xl mb-3 relative overflow-hidden"
              style={{ backgroundImage: `url("${pet.image}")`, backgroundColor: pet.bg }}
            >
              {selectedPet === pet.id && (
                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
              )}
            </div>
            <p className="text-[#1c100d] dark:text-white text-sm font-bold text-center">{pet.name}</p>
          </button>
        ))}
      </div>

      <div className="px-4 pt-6 pb-2">
        <h3 className="text-[#1c100d] dark:text-white text-xl font-bold">Give Them a Name</h3>
        <div className="mt-4">
          <input
            className="w-full h-12 px-5 rounded-full border-none bg-white dark:bg-zinc-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-sm focus:ring-2 focus:ring-primary/20 dark:text-white placeholder:text-[#9c5749]/50"
            placeholder="Type pet name here..."
            type="text"
            onChange={(e) => setLocalPetName(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#fff0f3]/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-center z-50">
        <button
          onClick={handleSubmit}
          className="w-full max-w-md bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>Start Our Story</span>
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
      </div>
    </div>
  );
};