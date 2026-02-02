export interface TrialData {
  id: string;
  journalName: string;
  isICMJEMember: boolean;
  hasTRN: boolean;
  trn?: string;
  enrollmentDate?: string; // ISO Date string YYYY-MM-DD
  registrationDate?: string; // ISO Date string YYYY-MM-DD
  publicationDate: string; // ISO Date string YYYY-MM-DD
  impactFactorQuartile?: 1 | 2 | 3 | 4;
}

export interface AnalysisMetrics {
  totalPapers: number;
  papersWithTRN: number;
  complianceRateTRN: number;
  prospectiveTrials: number;
  retrospectiveTrials: number;
  prospectiveRate: number;
  icmjeComplianceTRN: number;
  nonIcmjeComplianceTRN: number;
  delayedRegistrationWeeks: number[]; // Array of weeks delayed for histogram
}

export enum AnalysisTab {
  DASHBOARD = 'dashboard',
  DATA_UPLOAD = 'upload',
  ABSTRACT_ANALYZER = 'analyzer',
}
