'use client';

/**
 * StoryPlayer Component
 *
 * Renders a scrollytelling experience from a Story Bundle.
 * Left: Sticky telemetry/HUD display
 * Right: Scrolling narrative text
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { StoryBundle, TelemetryKeyframe, Scene } from '@/lib/types';
import { storyLogger } from '@/lib/logger';

interface Props {
  bundle: StoryBundle;
}

// Interpolate between two telemetry keyframes
function interpolateTelemetry(
  keyframes: TelemetryKeyframe[],
  scrollPct: number
): TelemetryKeyframe {
  if (keyframes.length === 0) {
    throw new Error('No telemetry keyframes');
  }

  // Find bracketing keyframes
  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].scroll > scrollPct) {
      next = keyframes[i];
      prev = keyframes[Math.max(0, i - 1)];
      break;
    }
    prev = keyframes[i];
  }

  // Linear interpolation factor
  const range = next.scroll - prev.scroll;
  const t = range > 0 ? (scrollPct - prev.scroll) / range : 0;

  const lerp = (a: number, b: number) => a + (b - a) * t;

  return {
    scroll: scrollPct,
    t: lerp(prev.t, next.t),
    pos: {
      alt_km: lerp(prev.pos.alt_km, next.pos.alt_km),
      dist_km: lerp(prev.pos.dist_km, next.pos.dist_km),
      lat: lerp(prev.pos.lat, next.pos.lat),
      lon: lerp(prev.pos.lon, next.pos.lon),
    },
    vel: {
      mach: lerp(prev.vel.mach, next.vel.mach),
      mps: lerp(prev.vel.mps, next.vel.mps),
      hdg: lerp(prev.vel.hdg, next.vel.hdg),
    },
    mass: {
      total_kg: lerp(prev.mass.total_kg, next.mass.total_kg),
      ch4_kg: lerp(prev.mass.ch4_kg, next.mass.ch4_kg),
      lox_kg: lerp(prev.mass.lox_kg, next.mass.lox_kg),
    },
    energy: {
      kinetic_tj: lerp(prev.energy.kinetic_tj, next.energy.kinetic_tj),
      chemical_tj: lerp(prev.energy.chemical_tj, next.energy.chemical_tj),
      total_tj: lerp(prev.energy.total_tj, next.energy.total_tj),
    },
    thermal: {
      skin_k: lerp(prev.thermal.skin_k, next.thermal.skin_k),
      skin_pct: lerp(prev.thermal.skin_pct, next.thermal.skin_pct),
    },
    prop: {
      mode: t < 0.5 ? prev.prop.mode : next.prop.mode,
      thrust_kn: lerp(prev.prop.thrust_kn, next.prop.thrust_kn),
    },
    dv: {
      remaining_mps: lerp(prev.dv.remaining_mps, next.dv.remaining_mps),
      max_turn_deg: lerp(prev.dv.max_turn_deg, next.dv.max_turn_deg),
    },
  };
}

// Find active scene for scroll position
function findActiveScene(scenes: Scene[], scrollPct: number): Scene | null {
  for (const scene of scenes) {
    if (scrollPct >= scene.scroll_range[0] && scrollPct <= scene.scroll_range[1]) {
      return scene;
    }
  }
  return scenes[scenes.length - 1] || null;
}

// HUD Display Component
function HUD({ telemetry, scene }: { telemetry: TelemetryKeyframe; scene: Scene | null }) {
  const skinTempColor = telemetry.thermal.skin_pct > 0.8
    ? 'text-red-500'
    : telemetry.thermal.skin_pct > 0.5
    ? 'text-amber-500'
    : 'text-green-500';

  const dvWarning = telemetry.dv.max_turn_deg < 5;

  return (
    <div className="font-mono text-sm space-y-4">
      {/* Phase indicator */}
      <div className="text-2xl font-bold text-amber-400">
        {scene?.title || 'Loading...'}
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">
        {telemetry.prop.mode}
      </div>

      {/* Primary flight data */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-black/60 p-4 border border-amber-500/30">
        <div>
          <span className="text-gray-500">MACH</span>
          <div className="text-xl text-amber-400">{telemetry.vel.mach.toFixed(1)}</div>
        </div>
        <div>
          <span className="text-gray-500">ALT</span>
          <div className="text-xl text-amber-400">{telemetry.pos.alt_km.toFixed(1)} km</div>
        </div>
        <div>
          <span className="text-gray-500">T+</span>
          <div className="text-lg">{Math.floor(telemetry.t / 60)}:{String(Math.floor(telemetry.t % 60)).padStart(2, '0')}</div>
        </div>
        <div>
          <span className="text-gray-500">DIST</span>
          <div className="text-lg">{telemetry.pos.dist_km.toFixed(0)} km</div>
        </div>
      </div>

      {/* Energy/thermal */}
      <div className="bg-black/60 p-4 border border-amber-500/30 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">SKIN TEMP</span>
          <span className={skinTempColor}>{telemetry.thermal.skin_k.toFixed(0)} K</span>
        </div>
        <div className="w-full bg-gray-800 h-2">
          <div
            className={`h-2 transition-all ${telemetry.thermal.skin_pct > 0.8 ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${telemetry.thermal.skin_pct * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-gray-500">ENERGY</span>
          <span>{telemetry.energy.total_tj.toFixed(1)} TJ</span>
        </div>
      </div>

      {/* Delta-V warning */}
      {dvWarning && (
        <div className="bg-red-900/50 border border-red-500 p-3 text-red-400 animate-pulse">
          ⚠ INSUFFICIENT Δv - MAX TURN: {telemetry.dv.max_turn_deg.toFixed(1)}°
        </div>
      )}

      {/* Propellant */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>CH₄: {(telemetry.mass.ch4_kg / 1000).toFixed(0)}t</div>
        <div>LOX: {(telemetry.mass.lox_kg / 1000).toFixed(0)}t</div>
      </div>
    </div>
  );
}

export default function StoryPlayer({ bundle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const [scrollPct, setScrollPct] = useState(0);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryKeyframe | null>(null);
  const prevSceneRef = useRef<string | null>(null);

  // Handle scroll updates
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScrollPct(latest);

      // Update telemetry
      try {
        const newTelemetry = interpolateTelemetry(bundle.telemetry.keyframes, latest);
        setTelemetry(newTelemetry);

        // Find active scene
        const scene = findActiveScene(bundle.scenes, latest);
        setActiveScene(scene);

        // Log scene change
        if (scene && scene.id !== prevSceneRef.current) {
          storyLogger.sceneChange(prevSceneRef.current, scene.id);
          prevSceneRef.current = scene.id;
        }

        // Periodic telemetry log (every 5%)
        if (Math.floor(latest * 20) !== Math.floor((latest - 0.05) * 20)) {
          storyLogger.telemetryUpdate(
            newTelemetry.vel.mach,
            newTelemetry.pos.alt_km,
            newTelemetry.prop.mode
          );
        }
      } catch (e) {
        storyLogger.error('Telemetry interpolation failed', e);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, bundle]);

  // Initial telemetry
  useEffect(() => {
    if (bundle.telemetry.keyframes.length > 0) {
      setTelemetry(bundle.telemetry.keyframes[0]);
      setActiveScene(bundle.scenes[0] || null);
    }
  }, [bundle]);

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll container - 500vh for long scroll */}
      <div className="min-h-[500vh]">
        {/* Fixed HUD on left */}
        <div className="fixed left-0 top-0 w-1/3 h-screen bg-black/90 p-8 flex flex-col justify-center z-10">
          {telemetry && <HUD telemetry={telemetry} scene={activeScene} />}

          {/* Progress bar */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="text-xs text-gray-500 mb-1">
              {(scrollPct * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-gray-800 h-1">
              <motion.div
                className="h-1 bg-amber-500"
                style={{ width: `${scrollPct * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrolling narrative on right */}
        <div className="ml-[35%] pt-[20vh] pb-[50vh] px-8 max-w-2xl">
          <header className="mb-16">
            <h1 className="text-4xl font-bold mb-2">{bundle.meta.title}</h1>
            <p className="text-gray-400">{bundle.meta.subtitle}</p>
            <p className="text-sm text-gray-500 mt-2">
              {bundle.meta.route.origin.name} → {bundle.meta.route.destination.name}
            </p>
          </header>

          {bundle.scenes.map((scene, sceneIndex) => (
            <section
              key={scene.id}
              id={scene.id}
              className="mb-32"
              style={{
                // Position scenes based on their scroll range
                marginTop: sceneIndex === 0 ? 0 : '20vh',
              }}
            >
              <h2 className="text-xl font-semibold text-amber-400 mb-8">
                {scene.title}
              </h2>

              {scene.beats.map((beat, beatIndex) => (
                <motion.div
                  key={`${scene.id}-${beatIndex}`}
                  className="mb-6"
                  initial={{ opacity: 0.3 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, margin: '-20%' }}
                  onViewportEnter={() => {
                    storyLogger.beatChange(scene.id, beatIndex, beat.text);
                  }}
                >
                  {beat.speaker ? (
                    <p className="text-lg leading-relaxed">
                      <span className="text-amber-400">{beat.speaker}: </span>
                      {beat.text}
                    </p>
                  ) : (
                    <p className="text-lg leading-relaxed text-gray-300 italic">
                      {beat.text}
                    </p>
                  )}
                </motion.div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
