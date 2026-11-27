import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/constants'

export const useUIStore = create(
  persist(
    (set, get) => ({
      darkMode: false,
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (val) => set({ darkMode: val }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      openModal: (modalName, data = null) =>
        set({ activeModal: modalName, modalData: data }),

      closeModal: () => set({ activeModal: null, modalData: null }),

      isModalOpen: (modalName) => {
        const { activeModal } = get()
        return activeModal === modalName
      },
    }),
    {
      name: STORAGE_KEYS.UI,
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
