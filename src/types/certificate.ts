export interface CertificateUser {
  id: string;
  fullName: string;
  issueDateOverride?: string; // Individual override date (YYYY-MM-DD)
}

export interface CertificateData {
  users: CertificateUser[];
  globalIssueDate: string; // YYYY-MM-DD
  templateId: string;
}

export interface CertificateState {
  data: CertificateData;
  currentStep: number; // 1-4
  selectedTemplate: string;
  hasHydrated: boolean;
  isGenerating: boolean;
  generatedCount: number;

  updateUsers: (users: CertificateUser[]) => void;
  addUser: (user: CertificateUser) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<CertificateUser>) => void;
  setGlobalIssueDate: (date: string) => void;
  setStep: (step: number) => void;
  setTemplate: (template: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedCount: (count: number) => void;
  reset: () => void;
}

export interface CertificateGenerated {
  certificateNumber: string;
  userName: string;
  issueDate: string;
  qrCodeUrl: string;
  pdfUrl: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  userName: string;
  issueDate: string;
  createdAt: Date;
  updatedAt: Date;
  qrCodeUrl: string;
}
