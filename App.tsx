import React, { useState, useEffect } from 'react';
import { AppScreen, GalleryItem, ChatMessage, PetStats, Profile, Couple } from './types';
import { BottomNav } from './components/BottomNav';
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Chat } from './screens/Chat';
import { Gallery } from './screens/Gallery';
import { Memory } from './screens/Memory';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // -- Global Data State --
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [petStats, setPetStats] = useState<PetStats | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partnerInteraction, setPartnerInteraction] = useState<'nudge' | 'pulse' | null>(null);

  // Local state for UI not yet in DB or derived
  const [myMood, setMyMood] = useState<string>('Happy');
  const [partnerName, setPartnerName] = useState<string | null>(null); // Derived from couple

  // 1. Auth & Initial Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
        setLoading(false);
        setCurrentScreen(AppScreen.LANDING);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
        setProfile(null);
        setCouple(null);
        setCurrentScreen(AppScreen.LANDING);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Data Fetching
  const fetchData = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile(profileData);

      // Fetch Couple
      if (profileData) {
        const { data: coupleData } = await supabase
          .from('couples')
          .select('*')
          .or(`partner_1_id.eq.${userId},partner_2_id.eq.${userId}`)
          .maybeSingle();

        setCouple(coupleData);

        if (coupleData) {
          // Fetch Pet Stats
          const { data: petData } = await supabase
            .from('pet_stats')
            .select('*')
            .eq('couple_id', coupleData.id)
            .maybeSingle();

          if (petData) setPetStats(petData);
          else {
            // Default stats if missing
            setPetStats({
              hunger: 60,
              affection: 80,
              feedCountToday: 0,
              playCountToday: 0,
              lastInteraction: Date.now()
            } as any);
          }

          // Fetch Messages (Last 50)
          const { data: msgData } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('couple_id', coupleData.id)
            .order('created_at', { ascending: true })
            .limit(50);

          if (msgData) {
            const mappedMessages = msgData.map((m: any) => ({
              id: m.id,
              text: m.text,
              sender: m.sender_id === userId ? 'me' : 'partner',
              timestamp: new Date(m.created_at).getTime()
            }));
            setMessages(mappedMessages);
          }

          // Fetch Gallery
          const { data: galleryData } = await supabase
            .from('gallery_items')
            .select('*')
            .eq('couple_id', coupleData.id)
            .order('created_at', { ascending: false });

          if (galleryData) {
            const mappedGallery = galleryData.map((g: any) => ({
              id: g.id,
              image: g.image_url,
              caption: g.caption,
              date: new Date(g.taken_date)
            }));
            setGalleryItems(mappedGallery);
          }

          // Determine Partner Name
          const partnerId = coupleData.partner_1_id === userId ? coupleData.partner_2_id : coupleData.partner_1_id;
          if (partnerId) {
            const { data: pData } = await supabase.from('profiles').select('full_name').eq('id', partnerId).single();
            if (pData) setPartnerName(pData.full_name);
          }

          setCurrentScreen(AppScreen.DASHBOARD);
        } else {
          // No couple found, go to onboarding
          setCurrentScreen(AppScreen.ONBOARDING);
        }
      } else {
        // No profile found (should rarely happen if trigger works), go to onboarding
        setCurrentScreen(AppScreen.ONBOARDING);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Realtime Subscription (Simplified for global updates)
  useEffect(() => {
    if (!couple) return;

    const channel = supabase
      .channel('couple_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          filter: `couple_id=eq.${couple.id}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Re-fetch data on any change (brute force for simplicity)
          // Ideally we merge state, but fetching is safer for MVP consistency
          if (session) fetchData(session.user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, session?.user.id]);


  // -- Handlers --

  const handleStatsAction = async (type: 'feed' | 'play') => {
    if (!petStats || !couple) return;

    const newStats = { ...petStats };
    if (type === 'feed') {
      if (newStats.feedCountToday >= 3) return alert("max feed");
      newStats.hunger = Math.min(100, newStats.hunger + 15);
      newStats.feedCountToday += 1;
    } else {
      if (newStats.playCountToday >= 3) return alert("max play");
      newStats.affection = Math.min(100, newStats.affection + 15);
      newStats.playCountToday += 1;
    }
    newStats.lastInteraction = Date.now();

    // Optimistic update
    setPetStats(newStats);

    // DB Update
    await supabase.from('pet_stats')
      .update({
        hunger: newStats.hunger,
        affection: newStats.affection,
        feed_count_today: newStats.feedCountToday,
        play_count_today: newStats.playCountToday,
        last_interaction: new Date().toISOString()
      })
      .eq('couple_id', couple.id);
  };

  const handleAddGalleryItem = async (image: string, caption: string) => {
    if (!couple || !session) return;

    // In a real app, 'image' would be a file upload. Here assume it's a URL string from the dummy mock.
    // If user uploads, we need storage. For MVP "generate backend", we'll just insert the row if it's a URL.

    await supabase.from('gallery_items').insert({
      couple_id: couple.id,
      uploader_id: session.user.id,
      image_url: image, // Assuming base64 or external URL for now
      caption: caption,
      taken_date: new Date().toISOString()
    });
    // Realtime will catch the update
  };

  const handleSendMessage = async (text: string) => {
    if (!couple || !session) return;

    await supabase.from('chat_messages').insert({
      couple_id: couple.id,
      sender_id: session.user.id,
      text: text
    });
  };

  const handleInteraction = (type: 'nudge' | 'pulse') => {
    // This would likely need a separate "events" table or ephemeral message
    // For MVP, valid use of "broadcast" channel in Supabase
    const channel = supabase.channel(`interaction:${couple?.id}`);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'interaction',
          payload: { type }
        });
      }
    });
    // Local feedback
    setPartnerInteraction(type);
    setTimeout(() => setPartnerInteraction(null), 5000);
  };

  // Listen for interaction broadcast
  useEffect(() => {
    if (!couple) return;
    const channel = supabase.channel(`interaction:${couple.id}`)
      .on('broadcast', { event: 'interaction' }, (payload) => {
        if (payload.payload.type) {
          setPartnerInteraction(payload.payload.type);
          setTimeout(() => setPartnerInteraction(null), 5000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [couple?.id]);


  const navigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentScreen(AppScreen.LANDING);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#fff0f3] dark:bg-background-dark text-primary">Loading...</div>;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.LANDING:
        return <Landing onNavigate={navigate} />;
      case AppScreen.ONBOARDING:
        return (
          <Onboarding
            onNavigate={navigate}
            session={session} // Pass session to attach data
            setAnniversary={() => { }} // Legacy
            setBirthdays={() => { }} // Legacy
            setPetName={() => { }} // Legacy
            setSelectedPetId={() => { }} // Legacy
            setUserName={() => { }} // Legacy
            setPartnerName={() => { }} // Legacy
          />
        );
      case AppScreen.DASHBOARD:
        return (
          <Dashboard
            onNavigate={navigate}
            interaction={partnerInteraction}
            stats={petStats || { hunger: 0, affection: 0, feedCountToday: 0, playCountToday: 0, lastInteraction: 0 }}
            onAction={handleStatsAction}
            anniversaryDate={couple?.anniversary_date ? new Date(couple.anniversary_date) : new Date()}
            selectedPetId={petStats?.pet_id || 'dog'} // or fetch from pet_stats
            nextMilestone={{ label: 'Milestone', days: 0 }} // TODO: Re-calculate based on couple data
            partnerName={partnerName}
          />
        );
      case AppScreen.CHAT:
        return (
          <Chat
            onNavigate={navigate}
            onInteraction={handleInteraction}
            messages={messages}
            onSendMessage={handleSendMessage}
            myMood={myMood}
            setMyMood={setMyMood}
            partnerName={partnerName}
          />
        );
      case AppScreen.GALLERY:
        return (
          <Gallery
            onNavigate={navigate}
            items={galleryItems}
            onAddItem={handleAddGalleryItem}
            petName={petStats?.name || 'Mochi'}
            anniversaryDate={couple?.anniversary_date ? new Date(couple.anniversary_date) : new Date()}
            birthdays={{ his: null, her: null }} // TODO: Store in profiles
          />
        );
      case AppScreen.MEMORY:
        return (
          <Memory
            onNavigate={navigate}
            anniversaryDate={couple?.anniversary_date ? new Date(couple.anniversary_date) : new Date()}
            petName={petStats?.name || 'Mochi'}
            selectedPetId={petStats?.pet_id || 'dog'}
          />
        );
      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  const showNav = [AppScreen.DASHBOARD, AppScreen.CHAT, AppScreen.GALLERY].includes(currentScreen);

  return (
    <div className="w-full h-full relative">
      {renderScreen()}
      {showNav && <BottomNav currentScreen={currentScreen} onNavigate={navigate} />}
    </div>
  );
};

export default App;