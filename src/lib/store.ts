import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CertificateState, CertificateUser, CertificateData } from '@/types/certificate';

const defaultData: CertificateData = {
  users: [],
  globalIssueDate: new Date().toISOString().split('T')[0],
  templateId: 'default',
};

const defaultState: Omit<CertificateState, keyof typeof defaultData> = {
  currentStep: 1,
  selectedTemplate: 'default',
  hasHydrated: false,
  isGenerating: false,
  generatedCount: 0,
};

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      ...defaultData,
      ...defaultState,

      updateUsers: (users) => set({ data: { ...get().data, users } }),

      addUser: (user) =>
        set({
          data: {
            ...get().data,
            users: [...get().data.users, user],
          },
        }),

      removeUser: (userId) =>
        set({
          data: {
            ...get().data,
            users: get().data.users.filter((u) => u.id !== userId),
          },
        }),

      updateUser: (userId, updates) =>
        set({
          data: {
            ...get().data,
            users: get().data.users.map((u) =>
              u.id === userId ? { ...u, ...updates } : u
            ),
          },
        }),

      setGlobalIssueDate: (date) =>
        set({
          data: {
            ...get().data,
            globalIssueDate: date,
          },
        }),

      setStep: (step) => set({ currentStep: step }),

      setTemplate: (template) => set({ selectedTemplate: template }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setGeneratedCount: (count) => set({ generatedCount: count }),

      reset: () =>
        set({
          ...defaultData,
          ...defaultState,
        }),
    }),
    {
      name: 'certificate-generator-storage',
      partialize: (state) => ({
        data: state.data,
        selectedTemplate: state.selectedTemplate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
