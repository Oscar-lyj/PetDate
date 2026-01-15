export enum AppScreen {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  MEMORY = 'MEMORY',
  CHAT = 'CHAT',
  GALLERY = 'GALLERY'
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Couple {
  id: string;
  created_by: string;
  partner_1_id: string | null;
  partner_2_id: string | null;
  code: string;
  anniversary_date: string | null; // returning as string from Supabase usually unless cast
}

export interface Pet {
  id: string;
  name: string;
  image: string;
  quote: string;
  bg: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  caption: string;
  date: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'partner';
  timestamp: number;
}

export interface PetStats {
  hunger: number; // 0-100
  affection: number; // 0-100
  feedCountToday: number;
  playCountToday: number;
  lastInteraction: number; // timestamp
}

export const PETS: Pet[] = [
  {
    id: 'dog',
    name: 'Energetic Puppy',
    quote: '"Always ready for an adventure!"',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEVGN4KOUCfSiKdrLSjLrLlhX0Cj-j2HyWMuivYyFJVvRKCN3l0k4S9skDToSzryL3G4qGt8m4r5lbvlTlS1VlDDdpM0RJqEYADmE4111y6AIEiuiyke8ZxgsAp7PogbeH0c7nWHq_HOKEpGmKm8nYqSz3onC3bn9dsgwC_JOCaQbAUd2f4cXt-G7yE0JGlDdc5lOyLWA8S2hJLnTI6CN4orQZ1F4aZnolu-PcrniDyEvyy9SKeWSf_gpdxzQHwiwOfYgYO21g3V0',
    bg: '#fef2f0'
  },
  {
    id: 'cat',
    name: 'Gentle Kitten',
    quote: '"Loves cozy nap times."',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFgVTEl8-XAkFnHfrbNNfiAVIrV11UEn_d9bMWucvZPX4HL0t1nwVI_DR4vYxTE6it4asz-qBluqOqG70xt1eZZ9g0OybCVn0TRD8LQzrmItCt1SiVe9N0YM0R9yeMuCJoBPFhnV7E84XOhbdoQlwcnty6R2OUVwmNw3meMeHksJ1kZouinWxtg_UXucAJNZ8Zqf5FPeTUHbogSlUvwEJGOU9fEk34_f8DtdoKxkMJ-ovqJgEAb1DdhTRWA4og-5CPTp3jVH0dxSw',
    bg: '#f4f4f5'
  }
];