export type VenueType =
  | 'bar'
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'club'
  | 'bistro'
  | 'patisserie'
  | 'fast-food';

export interface VenueInput {
  name: string;
  city: string;
  venueType: VenueType;
}

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  bar: 'Bar / Pub',
  restaurant: 'Restaurant',
  cafe: 'Cafenea / Coffee Shop',
  hotel: 'Hotel',
  club: 'Club / Lounge',
  bistro: 'Bistro',
  patisserie: 'Cofetărie / Patiserie',
  'fast-food': 'Fast-Food / QSR',
};

export type ModuleStatus = 'idle' | 'streaming' | 'complete' | 'error';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ModuleState {
  status: ModuleStatus;
  text: string;
  sources: GroundingSource[];
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
}
