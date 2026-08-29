import { create } from 'zustand';

export type Theme = 'dark' | 'light';

export type AgentId = 'prism' | 'lucent' | 'refract' | 'spectrum' | 'facet' | 'echo';

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
  preview: string;
}

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  activeAgent: AgentId;
  setActiveAgent: (agent: AgentId) => void;
  
  activeModel: string;
  setActiveModel: (model: string) => void;
  
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;

  chatSessions: ChatSession[];
  setChatSessions: (sessions: ChatSession[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  
  activeAgent: 'prism',
  setActiveAgent: (activeAgent) => set({ activeAgent }),
  
  activeModel: 'openrouter/auto',
  setActiveModel: (activeModel) => set({ activeModel }),
  
  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  chatSessions: [],
  setChatSessions: (chatSessions) => set({ chatSessions }),
}));
