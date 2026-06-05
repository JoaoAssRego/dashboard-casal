import { create } from 'zustand'

interface AppState {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark', // O app sempre inicia no tema Premium (Dark)
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}))
