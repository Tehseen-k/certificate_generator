import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CertificateState, CertificateUser, CertificateData } from '@/types/certificate';

const defaultData: CertificateData = {
  users: [],
  globalIssueDate: new Date().toISOString().split('T')[0],
  globalCourseName: 'IOSH Managing Safely',
  templateId: 'default',
};

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      data: defaultData,
      currentStep: 1,
      selectedTemplate: 'default',
      hasHydrated: false,
      isGenerating: false,
      generatedCount: 0,

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

      setGlobalCourseName: (courseName) =>
        set({
          data: {
            ...get().data,
            globalCourseName: courseName,
          },
        }),

      setStep: (step) => set({ currentStep: step }),

      setTemplate: (template) => set({ selectedTemplate: template }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setGeneratedCount: (count) => set({ generatedCount: count }),

      reset: () =>
        set({
          data: defaultData,
          currentStep: 1,
          selectedTemplate: 'default',
          isGenerating: false,
          generatedCount: 0,
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
