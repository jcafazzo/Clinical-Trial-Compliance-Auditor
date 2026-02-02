import { TrialData } from './types';
import { subDays, subWeeks, format } from 'date-fns';

// Helper to generate mock data that statistically mirrors the paper's findings:
// ~71% TRN Reporting
// ~41% Prospective Registration
// Higher compliance in ICMJE journals

const generateMockData = (): TrialData[] => {
  const data: TrialData[] = [];
  const total = 200; // Smaller sample size for demo performance

  for (let i = 0; i < total; i++) {
    const isICMJE = Math.random() > 0.6; // 40% are ICMJE journals
    
    // TRN Reporting Probability: ICMJE (95%), Non-ICMJE (60%) -> weighted avg approx 74%
    const hasTRN = isICMJE ? Math.random() < 0.955 : Math.random() < 0.60;

    // Prospective Probability: ICMJE (61%), Non-ICMJE (30%)
    const isProspective = isICMJE ? Math.random() < 0.61 : Math.random() < 0.30;

    const pubDate = new Date('2018-06-15');
    // Random publication date in 2018
    pubDate.setDate(pubDate.getDate() + Math.floor(Math.random() * 180));

    let enrollmentDate: Date | undefined;
    let registrationDate: Date | undefined;

    if (hasTRN) {
       // Enrollment date approx 2-3 years before pub
       enrollmentDate = subDays(pubDate, 700 + Math.floor(Math.random() * 300));
       
       if (isProspective) {
         // Registered 0-60 days BEFORE enrollment
         registrationDate = subDays(enrollmentDate, Math.floor(Math.random() * 60));
       } else {
         // Retrospective
         // Paper finding: High bias in first 3-8 weeks after enrollment
         const biasType = Math.random();
         let delayWeeks = 0;
         if (biasType < 0.4) {
            // First 3 weeks (high frequency)
            delayWeeks = Math.floor(Math.random() * 3); 
         } else if (biasType < 0.6) {
            // 3-8 weeks
            delayWeeks = 3 + Math.floor(Math.random() * 5);
         } else {
            // Long tail up to 1 year
            delayWeeks = 8 + Math.floor(Math.random() * 44);
         }
         // Add days to enrollment date
         const delayDays = delayWeeks * 7 + Math.floor(Math.random() * 7);
         const reg = new Date(enrollmentDate);
         reg.setDate(reg.getDate() + delayDays);
         registrationDate = reg;
       }
    }

    data.push({
      id: `PMID-${10000 + i}`,
      journalName: isICMJE ? "JAMA" : "General Medical Journal",
      isICMJEMember: isICMJE,
      hasTRN,
      trn: hasTRN ? `NCT0${Math.floor(Math.random() * 10000000)}` : undefined,
      publicationDate: format(pubDate, 'yyyy-MM-dd'),
      enrollmentDate: enrollmentDate ? format(enrollmentDate, 'yyyy-MM-dd') : undefined,
      registrationDate: registrationDate ? format(registrationDate, 'yyyy-MM-dd') : undefined,
      impactFactorQuartile: Math.random() > 0.7 ? 1 : 3,
    });
  }
  return data;
};

export const SAMPLE_DATA = generateMockData();
