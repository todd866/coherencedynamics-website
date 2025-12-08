/**
 * Story Player Logger
 *
 * Logs events for QA and debugging. Stores in localStorage
 * and can be exported as JSON.
 */

import { StoryEvent } from './types';

const LOG_KEY = 'coherence_story_log';
const MAX_EVENTS = 1000;

class StoryLogger {
  private events: StoryEvent[] = [];
  private enabled: boolean = true;

  constructor() {
    // Load existing events from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOG_KEY);
        if (stored) {
          this.events = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load story log:', e);
      }
    }
  }

  log(type: StoryEvent['type'], data: Record<string, unknown>) {
    if (!this.enabled) return;

    const event: StoryEvent = {
      timestamp: new Date().toISOString(),
      type,
      data,
    };

    this.events.push(event);

    // Trim to max events
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOG_KEY, JSON.stringify(this.events));
      } catch (e) {
        // localStorage full, clear old events
        this.events = this.events.slice(-100);
      }
    }

    // Also log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Story] ${type}:`, data);
    }
  }

  scroll(scrollPct: number, sceneId: string) {
    this.log('scroll', { scrollPct, sceneId });
  }

  sceneChange(fromScene: string | null, toScene: string) {
    this.log('scene_change', { from: fromScene, to: toScene });
  }

  beatChange(sceneId: string, beatIndex: number, text: string) {
    this.log('beat_change', { sceneId, beatIndex, textPreview: text.slice(0, 50) });
  }

  telemetryUpdate(mach: number, altitude: number, mode: string) {
    this.log('telemetry_update', { mach, altitude, mode });
  }

  error(message: string, details?: unknown) {
    this.log('error', { message, details });
  }

  getEvents(): StoryEvent[] {
    return [...this.events];
  }

  exportJSON(): string {
    return JSON.stringify(this.events, null, 2);
  }

  clear() {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOG_KEY);
    }
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}

// Singleton instance
export const storyLogger = new StoryLogger();
