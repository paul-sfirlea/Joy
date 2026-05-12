import { VenueInput } from '../types';

export type ModuleCategory = 'reputation' | 'market' | 'strategy';

export interface ModuleDefinition {
  id: string;
  label: string;
  tagline: string;
  category: ModuleCategory;
  icon: string;
  priority: number;
  model?: string;
  thinkingBudget?: number;
  buildSystemInstruction: (input: VenueInput) => string;
  buildPrompt: (input: VenueInput) => string;
}

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  reputation: 'Prezență Online & Reputație',
  market: 'Piață, Context & Oportunități',
  strategy: 'Sinteză Strategică & Acțiune',
};

export const CATEGORY_TAGLINES: Record<ModuleCategory, string> = {
  reputation: 'Ce spune internetul. Date reale, în timp real.',
  market: 'Realitatea pieței locale și forțele care îți influențează business-ul.',
  strategy: 'De la insight la plan de bătaie executabil.',
};
