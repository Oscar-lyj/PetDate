import React, { useState } from 'react';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface LandingProps {
  onNavigate: (screen: AppScreen) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      // App.tsx auth listener will handle navigation
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-between overflow-x-hidden p-6 pb-12 bg-background-light dark:bg-background-dark transition-colors duration-300">
      <div className="flex w-full flex-col items-center justify-center pt-16 @container">
        <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-48 h-48 rounded-full bg-primary/10 blur-3xl"></div>
          </div>
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined !text-[80px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              pets
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 px-4 w-full max-w-md mb-8">
        <h1 className="text-[#1c100d] dark:text-[#f8f6f5] tracking-tight text-[36px] font-extrabold leading-tight">
          PetDate
        </h1>
        <p className="text-[#1c100d]/70 dark:text-[#f8f6f5]/70 text-base font-medium leading-relaxed">
          {isLogin ? "Welcome Back!" : "Start your journey together."}
        </p>
      </div>

      <div className="flex flex-col w-full max-w-[340px] space-y-4 mb-12">
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full h-12 px-5 rounded-xl border border-zinc-200 bg-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full h-12 px-5 rounded-xl border border-zinc-200 bg-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="group relative flex min-w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-primary text-white text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <span>{isLogin ? "Log In" : "Create Account"}</span>
          )}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-primary/80 font-semibold hover:text-primary transition-colors"
        >
          {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
        </button>
      </div>

      <div className="fixed inset-0 -z-10 bg-center bg-cover opacity-10 paper-texture pointer-events-none"></div>
    </div>
  );
};