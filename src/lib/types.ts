/**
 * Story Bundle Types
 *
 * These types define the contract between Python story generation
 * and the React Story Player component.
 */

export interface TelemetryKeyframe {
  scroll: number;
  t: number;
  pos: {
    alt_km: number;
    dist_km: number;
    lat: number;
    lon: number;
  };
  vel: {
    mach: number;
    mps: number;
    hdg: number;
  };
  mass: {
    total_kg: number;
    ch4_kg: number;
    lox_kg: number;
  };
  energy: {
    kinetic_tj: number;
    chemical_tj: number;
    total_tj: number;
  };
  thermal: {
    skin_k: number;
    skin_pct: number;
  };
  prop: {
    mode: string;
    thrust_kn: number;
  };
  dv: {
    remaining_mps: number;
    max_turn_deg: number;
  };
}

export interface NarrativeBeat {
  text: string;
  mood: string;
  duration_weight: number;
  speaker?: string;
  highlight?: string;
  camera?: string;
}

export interface Scene {
  id: string;
  title: string;
  flight_phase: string;
  scroll_range: [number, number];
  initial_state: {
    time_s: number;
    mach: number;
    altitude_km: number;
    mass_kg: number;
  };
  beats: NarrativeBeat[];
}

export interface StoryBundle {
  meta: {
    title: string;
    subtitle: string;
    vehicle: string;
    route: {
      origin: { name: string; lat: number; lon: number };
      destination: { name: string; lat: number; lon: number };
      distance_km: number;
    };
  };
  scenes: Scene[];
  telemetry: {
    keyframes: TelemetryKeyframe[];
    interpolation: string;
  };
  hud_elements: Record<string, {
    id: string;
    label: string;
    description: string;
  }>;
  route: {
    waypoints: Array<{ progress: number; lat: number; lon: number }>;
  };
}

// Logging types for QA
export interface StoryEvent {
  timestamp: string;
  type: 'scroll' | 'scene_change' | 'beat_change' | 'telemetry_update' | 'error';
  data: Record<string, unknown>;
}
