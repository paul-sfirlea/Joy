export interface VenueRequest {
  name: string;
  city: string;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  data: string | null;
  error: string | null;
}

export enum AnalysisStep {
  Audit = 'AUDIT',
  Competition = 'COMPETITION',
  DeepDive = 'DEEP_DIVE',
  Benchmarking = 'BENCHMARKING',
  SWOT = 'SWOT',
  Recommendations = 'RECOMMENDATIONS'
}

export const STEPS_ORDER = [
  AnalysisStep.Audit,
  AnalysisStep.Competition,
  AnalysisStep.DeepDive,
  AnalysisStep.Benchmarking,
  AnalysisStep.SWOT,
  AnalysisStep.Recommendations
];

export const STEP_LABELS: Record<AnalysisStep, string> = {
  [AnalysisStep.Audit]: '1. Verificare Locație & Reputație',
  [AnalysisStep.Competition]: '2. Concurența Reală (Zonă Verificată)',
  [AnalysisStep.DeepDive]: '3. Analiză Deep Dive',
  [AnalysisStep.Benchmarking]: '4. Global Benchmarking',
  [AnalysisStep.SWOT]: '5. Sinteză Strategică & SWOT',
  [AnalysisStep.Recommendations]: '6. Strategie de Atac & Promovare',
};