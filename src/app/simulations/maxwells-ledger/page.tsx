'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// Two-part simulation:
// Part 1: Detecting fractions of a bit (hearing test)
// Part 2: Maxwell's Demon - bit erasure vs sub-Landauer

export default function MaxwellsLedger() {
  const [part, setPart] = useState<1 | 2>(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-4 inline-block text-sm">
        ← Back to Simulations
      </Link>

      <h1 className="text-3xl font-bold mb-2 text-white">Maxwell&apos;s Ledger</h1>
      <p className="text-gray-500 mb-6">Two ways to beat Landauer&apos;s limit—and why neither is free</p>

      {/* Part selector */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setPart(1)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            part === 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <div className="text-sm opacity-70">Part 1</div>
          <div>Detecting Fractions of a Bit</div>
        </button>
        <button
          onClick={() => setPart(2)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            part === 2
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <div className="text-sm opacity-70">Part 2</div>
          <div>The Two Demons</div>
        </button>
      </div>

      {part === 1 ? <Part1 /> : <Part2 onBack={() => setPart(1)} />}
    </div>
  );
}

// Standard audiometry frequencies (Hz) - OSHA standard
const AUDIOMETRY_FREQUENCIES = [500, 1000, 2000, 3000, 4000, 6000];

// ============================================
// PART 1: DETECTING FRACTIONS OF A BIT
// Hearing test visualization with conveyor belt
// Direct canvas interaction - no external buttons
// ============================================
function Part1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const tinnitusNodesRef = useRef<{ noise: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null>(null);
  const animationRef = useRef<number>();

  const [noiseLevel, setNoiseLevel] = useState(0.1); // 0 = sharp threshold, 1 = very fuzzy (damaged ears need more)
  const [signalStrength, setSignalStrength] = useState(0.4); // amplitude of tone
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFreq, setSelectedFreq] = useState(1000);
  const [time, setTime] = useState(0);

  // Interaction state
  const [isDragging, setIsDragging] = useState<'gain' | 'volume' | null>(null);
  const [hoverZone, setHoverZone] = useState<'gain' | 'volume' | 'freq' | null>(null);

  // Conveyor belt of detection blobs - now with falling animation
  const [blobs, setBlobs] = useState<Array<{
    id: number;
    x: number; // position on conveyor (horizontal movement)
    y: number; // vertical position for falling animation
    freq: number;
    detectedAt: number; // when it was detected
    actualTime: number; // when signal actually started
    timingError: number; // uncertainty in ms
    color: string;
    falling: boolean; // still falling or landed on belt
  }>>([]);

  // Signal timing
  const [signalActive, setSignalActive] = useState(false);
  const [signalStartTime, setSignalStartTime] = useState<number | null>(null);
  const blobIdRef = useRef(0);

  // Layout constants for interaction zones
  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 400;
  const GAIN_ZONE_WIDTH = 50;
  const VOLUME_ZONE_WIDTH = 50;
  const SPECTRUM_LEFT = GAIN_ZONE_WIDTH;
  const SPECTRUM_RIGHT = CANVAS_WIDTH - VOLUME_ZONE_WIDTH;

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Start tinnitus noise - high-pitched filtered noise
  const startTinnitus = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    // Stop existing tinnitus
    if (tinnitusNodesRef.current) {
      tinnitusNodesRef.current.noise.stop();
      tinnitusNodesRef.current.noise.disconnect();
      tinnitusNodesRef.current.filter.disconnect();
      tinnitusNodesRef.current.gain.disconnect();
    }

    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Create noise source
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // High-pass filter to make it sound like tinnitus (high-pitched ringing)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000; // Typical tinnitus frequency
    filter.Q.value = 5; // Narrow band for ringing quality

    // Gain control
    const gain = ctx.createGain();
    gain.gain.value = noiseLevel * 0.15; // Scale with noise level

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    tinnitusNodesRef.current = { noise, filter, gain };
  }, [initAudio, noiseLevel]);

  const stopTinnitus = useCallback(() => {
    if (tinnitusNodesRef.current) {
      tinnitusNodesRef.current.noise.stop();
      tinnitusNodesRef.current.noise.disconnect();
      tinnitusNodesRef.current.filter.disconnect();
      tinnitusNodesRef.current.gain.disconnect();
      tinnitusNodesRef.current = null;
    }
  }, []);

  // Tinnitus automatically scales with noise level - no toggle needed
  // It's just what happens when you boost internal gain
  useEffect(() => {
    // Only start tinnitus if noise level is significant
    if (noiseLevel > 0.2) {
      if (!tinnitusNodesRef.current) {
        startTinnitus();
      } else {
        // Update volume based on noise level
        tinnitusNodesRef.current.gain.gain.value = (noiseLevel - 0.2) * 0.2;
      }
    } else {
      stopTinnitus();
    }
    return () => stopTinnitus();
  }, [noiseLevel, startTinnitus, stopTinnitus]);

  // Play tone
  const playTone = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    // Stop any existing oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = selectedFreq;
    gain.gain.value = signalStrength * 0.3; // Scale down for comfort

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    oscillatorRef.current = osc;
    gainNodeRef.current = gain;

    setIsPlaying(true);
    setSignalActive(true);
    setSignalStartTime(time);

    // Auto-stop after 3 seconds
    setTimeout(() => {
      stopTone();
    }, 3000);
  }, [initAudio, selectedFreq, signalStrength, time]);

  const stopTone = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
    setSignalActive(false);
    setSignalStartTime(null);
  }, []);

  // Get canvas-relative coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  // Handle canvas mouse down - start drag or play tone
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // Left zone: gain control
    if (x < GAIN_ZONE_WIDTH) {
      setIsDragging('gain');
      const newGain = 1 - Math.max(0, Math.min(1, y / CANVAS_HEIGHT));
      setNoiseLevel(0.05 + newGain * 0.95);
      return;
    }

    // Right zone: volume control
    if (x > CANVAS_WIDTH - VOLUME_ZONE_WIDTH) {
      setIsDragging('volume');
      const newVol = 1 - Math.max(0, Math.min(1, y / CANVAS_HEIGHT));
      setSignalStrength(0.1 + newVol * 0.9);
      return;
    }

    // Middle zone: frequency selection and play
    const spectrumTop = 50;
    const spectrumBottom = 250;

    if (y >= spectrumTop && y <= spectrumBottom) {
      // Check which frequency bar was clicked
      const spectrumWidth = SPECTRUM_RIGHT - SPECTRUM_LEFT;
      const relX = x - SPECTRUM_LEFT;
      const freqIndex = Math.round((relX / spectrumWidth) * (AUDIOMETRY_FREQUENCIES.length - 1));
      const clampedIndex = Math.max(0, Math.min(AUDIOMETRY_FREQUENCIES.length - 1, freqIndex));
      const clickedFreq = AUDIOMETRY_FREQUENCIES[clampedIndex];

      setSelectedFreq(clickedFreq);

      // If clicking on already selected freq, toggle play
      if (clickedFreq === selectedFreq) {
        if (isPlaying) {
          stopTone();
        } else {
          playTone();
        }
      } else {
        // New freq selected, start playing
        if (isPlaying) stopTone();
        // Small delay to let state update
        setTimeout(() => playTone(), 50);
      }
    }

    // Conveyor belt area - click to clear
    if (y > 300) {
      setBlobs([]);
    }
  }, [getCanvasCoords, selectedFreq, isPlaying, stopTone, playTone, GAIN_ZONE_WIDTH, VOLUME_ZONE_WIDTH, SPECTRUM_LEFT, SPECTRUM_RIGHT, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // Update hover zone for cursor styling
    if (x < GAIN_ZONE_WIDTH) {
      setHoverZone('gain');
    } else if (x > CANVAS_WIDTH - VOLUME_ZONE_WIDTH) {
      setHoverZone('volume');
    } else if (y >= 50 && y <= 250) {
      setHoverZone('freq');
    } else {
      setHoverZone(null);
    }

    // Handle dragging
    if (isDragging === 'gain') {
      const newGain = 1 - Math.max(0, Math.min(1, y / CANVAS_HEIGHT));
      setNoiseLevel(0.05 + newGain * 0.95);
    } else if (isDragging === 'volume') {
      const newVol = 1 - Math.max(0, Math.min(1, y / CANVAS_HEIGHT));
      setSignalStrength(0.1 + newVol * 0.9);
    }
  }, [getCanvasCoords, isDragging, GAIN_ZONE_WIDTH, VOLUME_ZONE_WIDTH, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Animation loop
  useEffect(() => {
    let last = performance.now();
    const beltY = 280; // Where blobs land on the belt

    const loop = (ts: number) => {
      const dt = (ts - last) / 1000;
      last = ts;
      setTime(t => t + dt);

      // Move and animate blobs
      setBlobs(prev => prev
        .map(b => {
          if (b.falling) {
            // Falling animation - accelerate downward
            const newY = b.y + dt * 300;
            if (newY >= beltY) {
              return { ...b, y: beltY, falling: false };
            }
            return { ...b, y: newY };
          } else {
            // On belt - move left (conveyor moves blobs to the left)
            return { ...b, x: b.x + dt * 60 };
          }
        })
        .filter(b => b.x < 700) // Remove off-screen
      );

      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Detection logic - stochastic resonance
  useEffect(() => {
    if (!signalActive || signalStartTime === null) return;

    const checkInterval = setInterval(() => {
      // Detection probability depends on signal strength and noise level
      // With more noise, weaker signals can be detected (stochastic resonance)
      // But timing becomes uncertain

      const effectiveThreshold = 0.5 - noiseLevel * 0.4; // Noise lowers threshold
      const noiseBoost = (Math.random() - 0.5) * noiseLevel * 0.6;
      const effectiveSignal = signalStrength + noiseBoost;

      if (effectiveSignal > effectiveThreshold) {
        // Detected! But when did it happen?
        const timingUncertainty = noiseLevel * 500; // ms of uncertainty
        const timingError = (Math.random() - 0.5) * timingUncertainty * 2;

        // Color based on frequency (low=red, high=violet)
        const freqIndex = AUDIOMETRY_FREQUENCIES.indexOf(selectedFreq);
        const hue = (freqIndex / (AUDIOMETRY_FREQUENCIES.length - 1)) * 280;

        // Spawn blob at the frequency bar's x position, starting from threshold line
        const freqX = 60 + (freqIndex / (AUDIOMETRY_FREQUENCIES.length - 1)) * (700 - 120);

        setBlobs(prev => [...prev, {
          id: blobIdRef.current++,
          x: freqX, // Spawn at the frequency column
          y: 100, // Start near threshold line
          freq: selectedFreq,
          detectedAt: time,
          actualTime: signalStartTime,
          timingError: Math.abs(timingError),
          color: `hsl(${hue}, 70%, 50%)`,
          falling: true // Start falling
        }]);
      }
    }, 200); // Check 5x per second

    return () => clearInterval(checkInterval);
  }, [signalActive, signalStartTime, signalStrength, noiseLevel, selectedFreq, time]);

  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const spectrumTop = 50;
    const spectrumHeight = 200;
    const spectrumBottom = spectrumTop + spectrumHeight;
    const conveyorTop = spectrumBottom + 50;
    const conveyorHeight = 80;

    // === LEFT CONTROL ZONE: NEURAL GAIN ===
    const gainZoneW = GAIN_ZONE_WIDTH;
    ctx.fillStyle = hoverZone === 'gain' || isDragging === 'gain' ? '#1a1a1a' : '#0a0a0a';
    ctx.fillRect(0, 0, gainZoneW, H);

    // Gain slider track
    const gainTrackX = gainZoneW / 2;
    const gainTrackTop = 60;
    const gainTrackBottom = H - 40;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gainTrackX, gainTrackTop);
    ctx.lineTo(gainTrackX, gainTrackBottom);
    ctx.stroke();

    // Gain slider handle
    const gainHandleY = gainTrackBottom - (noiseLevel - 0.05) / 0.95 * (gainTrackBottom - gainTrackTop);
    const gainColor = noiseLevel > 0.6 ? '#facc15' : noiseLevel > 0.3 ? '#f97316' : '#22c55e';
    ctx.fillStyle = gainColor;
    ctx.beginPath();
    ctx.arc(gainTrackX, gainHandleY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Gain label
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NEURAL GAIN', 0, 0);
    ctx.restore();

    // Gain value
    ctx.fillStyle = gainColor;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${(noiseLevel * 100).toFixed(0)}%`, gainTrackX, 30);
    if (noiseLevel > 0.3) {
      ctx.fillStyle = noiseLevel > 0.6 ? '#facc15' : '#f97316';
      ctx.font = '9px system-ui';
      ctx.fillText(noiseLevel > 0.6 ? 'TINNITUS' : 'warning', gainTrackX, 45);
    }

    // === RIGHT CONTROL ZONE: VOLUME ===
    const volZoneW = VOLUME_ZONE_WIDTH;
    ctx.fillStyle = hoverZone === 'volume' || isDragging === 'volume' ? '#1a1a1a' : '#0a0a0a';
    ctx.fillRect(W - volZoneW, 0, volZoneW, H);

    // Volume slider track
    const volTrackX = W - volZoneW / 2;
    const volTrackTop = 60;
    const volTrackBottom = H - 40;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(volTrackX, volTrackTop);
    ctx.lineTo(volTrackX, volTrackBottom);
    ctx.stroke();

    // Volume slider handle
    const volHandleY = volTrackBottom - (signalStrength - 0.1) / 0.9 * (volTrackBottom - volTrackTop);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(volTrackX, volHandleY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Volume label
    ctx.save();
    ctx.translate(W - 14, H / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TONE VOLUME', 0, 0);
    ctx.restore();

    // Volume value
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${(signalStrength * 100).toFixed(0)}dB`, volTrackX, 30);

    // === SPECTRUM DISPLAY (main area) ===
    const specLeft = SPECTRUM_LEFT;
    const specRight = SPECTRUM_RIGHT;
    const specWidth = specRight - specLeft;

    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(specLeft, spectrumTop, specWidth, spectrumHeight);

    // Title - click to play instructions
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK FREQUENCY BAR TO PLAY  •  DRAG SIDES TO ADJUST', W / 2, 25);

    // Frequency labels (x-axis)
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    AUDIOMETRY_FREQUENCIES.forEach((freq, i) => {
      const x = specLeft + 20 + (i / (AUDIOMETRY_FREQUENCIES.length - 1)) * (specWidth - 40);
      ctx.fillText(`${freq}Hz`, x, spectrumBottom + 20);

      // Vertical grid line
      ctx.strokeStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(x, spectrumTop);
      ctx.lineTo(x, spectrumBottom);
      ctx.stroke();
    });

    // Threshold line - gets FATTER with more noise
    const thresholdY = spectrumTop + spectrumHeight * 0.35;
    const thresholdThickness = 4 + noiseLevel * 40; // Fatter = fuzzier

    // Draw fuzzy threshold zone
    const gradient = ctx.createLinearGradient(0, thresholdY - thresholdThickness, 0, thresholdY + thresholdThickness);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
    gradient.addColorStop(0.3, `rgba(239, 68, 68, ${0.3 - noiseLevel * 0.2})`);
    gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.5 - noiseLevel * 0.3})`);
    gradient.addColorStop(0.7, `rgba(239, 68, 68, ${0.3 - noiseLevel * 0.2})`);
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(specLeft, thresholdY - thresholdThickness, specWidth, thresholdThickness * 2);

    // Sharp threshold line in center
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 - noiseLevel * 0.5})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(specLeft, thresholdY);
    ctx.lineTo(specRight, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = '#ef4444';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('detection threshold', specLeft + 5, thresholdY - thresholdThickness - 5);

    // Draw waveform bars for each frequency
    AUDIOMETRY_FREQUENCIES.forEach((freq, i) => {
      const x = specLeft + 20 + (i / (AUDIOMETRY_FREQUENCIES.length - 1)) * (specWidth - 40);
      const isSelected = freq === selectedFreq;

      // Base amplitude (noise floor)
      let amplitude = 20 + Math.random() * noiseLevel * 30;

      // If this frequency is playing, add signal
      if (isSelected && signalActive) {
        amplitude += signalStrength * 120;
      }

      // Add noise fluctuation
      amplitude += Math.sin(time * 10 + i) * noiseLevel * 20;
      amplitude += (Math.random() - 0.5) * noiseLevel * 40;

      // Draw bar
      const barWidth = 40;
      const barHeight = Math.min(amplitude, spectrumHeight - 10);
      const barY = spectrumBottom - barHeight;

      // Color based on whether it's crossing threshold
      const crossingThreshold = barY < thresholdY + thresholdThickness;
      const hue = (i / AUDIOMETRY_FREQUENCIES.length) * 280;

      if (isSelected && signalActive) {
        ctx.fillStyle = crossingThreshold ? `hsl(${hue}, 80%, 60%)` : `hsl(${hue}, 60%, 40%)`;
      } else {
        ctx.fillStyle = crossingThreshold && noiseLevel > 0.3 ? '#444' : '#333';
      }

      ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

      // Highlight selected frequency
      if (isSelected) {
        ctx.strokeStyle = isPlaying ? '#22c55e' : '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - barWidth / 2 - 3, spectrumTop, barWidth + 6, spectrumHeight);
        // Show "playing" indicator
        if (isPlaying) {
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 10px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('PLAYING', x, spectrumTop - 5);
        }
      }
    });

    // === CONVEYOR BELT ===
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, conveyorTop, W, conveyorHeight);

    // Conveyor lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = (time * 80) % 40; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, conveyorTop);
      ctx.lineTo(x, conveyorTop + conveyorHeight);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TIMING RECORD', 10, conveyorTop + 15);

    // Time markers
    ctx.textAlign = 'center';
    ctx.fillText('← earlier', 100, conveyorTop + conveyorHeight - 8);
    ctx.fillText('now →', W - 60, conveyorTop + conveyorHeight - 8);

    // Draw blobs - both falling and on belt
    blobs.forEach(blob => {
      let blobX: number;
      let blobY: number;

      if (blob.falling) {
        // Falling from frequency column
        blobX = blob.x;
        blobY = blob.y;
      } else {
        // On belt - x increases as it moves right
        blobX = blob.x;
        blobY = conveyorTop + conveyorHeight / 2;
      }

      // Size based on timing error - bigger error = fuzzier blob
      const baseSize = 12;
      const fuzziness = blob.timingError / 100;

      // Draw fuzzy halo for timing uncertainty (only when on belt)
      if (!blob.falling && fuzziness > 0.5) {
        ctx.fillStyle = blob.color.replace('50%)', '30%)');
        ctx.beginPath();
        ctx.arc(blobX, blobY, baseSize + fuzziness * 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core blob with slight glow
      ctx.shadowColor = blob.color;
      ctx.shadowBlur = blob.falling ? 10 : 5;
      ctx.fillStyle = blob.color;
      ctx.beginPath();
      ctx.arc(blobX, blobY, baseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Timing error indicator (only on belt, not while falling)
      if (!blob.falling && blob.timingError > 50) {
        ctx.fillStyle = '#fff';
        ctx.font = '8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`±${blob.timingError.toFixed(0)}ms`, blobX, blobY + baseSize + 10);
      }
    });

  }, [time, noiseLevel, signalStrength, selectedFreq, signalActive, blobs, hoverZone, isDragging, isPlaying, GAIN_ZONE_WIDTH, VOLUME_ZONE_WIDTH, SPECTRUM_LEFT, SPECTRUM_RIGHT]);

  // Average timing error
  const avgTimingError = blobs.length > 0
    ? blobs.reduce((sum, b) => sum + b.timingError, 0) / blobs.length
    : 0;

  // Cursor style based on hover zone
  const cursorStyle = isDragging ? 'cursor-grabbing' :
    hoverZone === 'gain' || hoverZone === 'volume' ? 'cursor-ns-resize' :
    hoverZone === 'freq' ? 'cursor-pointer' : 'cursor-default';

  return (
    <>
      {/* Interactive Canvas - all controls are on canvas */}
      <div className="border border-gray-800 rounded-xl overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`w-full ${cursorStyle}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Minimal stats overlay */}
      <div className="flex justify-between items-center text-sm mb-4 px-2">
        <div className="text-gray-500">
          <span className="text-white font-mono">{blobs.length}</span> detections
          {avgTimingError > 0 && (
            <span className={avgTimingError > 100 ? 'text-yellow-400' : 'text-green-400'}>
              {' '}· ±{avgTimingError.toFixed(0)}ms avg
            </span>
          )}
        </div>
        <button
          onClick={() => setBlobs([])}
          className="text-gray-600 hover:text-gray-400 transition-colors"
        >
          clear belt
        </button>
      </div>

      {/* Key insight */}
      <div className="border-t border-gray-800 pt-4 text-sm text-gray-500">
        <strong className="text-gray-400">The trade-off:</strong> Drag neural gain (left) up to detect quieter sounds.
        But as the threshold gets fuzzier, timing errors grow. The patient heard <em>something</em>,
        but can&apos;t tell you exactly <em>when</em>.
      </div>
    </>
  );
}

// ============================================
// PART 2: THE TWO DEMONS
// ============================================
function Part2({ onBack }: { onBack: () => void }) {
  const [demonType, setDemonType] = useState<'classical' | 'sublandauer'>('classical');

  return (
    <>
      {/* Explanation */}
      <div className="bg-purple-900/20 border border-purple-800/50 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Two kinds of Maxwell&apos;s Demon</h2>
        <div className="text-gray-300 text-sm space-y-3">
          <p>
            <strong className="text-purple-300">The original problem:</strong> Maxwell imagined a demon
            sorting fast and slow molecules to create a temperature gradient—seemingly violating
            the second law. Landauer&apos;s resolution: the demon must <em>erase</em> its memory,
            and that costs <strong>kT ln 2 per bit</strong>.
          </p>
          <p>
            <strong className="text-green-300">The sub-Landauer demon:</strong> What if the demon uses
            stochastic resonance? It can detect molecules without recording precise measurements.
            No bits recorded = no erasure cost. Free energy?
          </p>
          <p>
            <strong className="text-yellow-300">The catch:</strong> The sub-Landauer demon can&apos;t
            coordinate. It doesn&apos;t know <em>when</em> molecules cross. It can sort, but it can&apos;t
            synchronize with anything else. The timing information it didn&apos;t record is the same
            timing information it can&apos;t use.
          </p>
        </div>
      </div>

      {/* Demon selector */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setDemonType('classical')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            demonType === 'classical'
              ? 'border-red-500 bg-red-900/20'
              : 'border-gray-700 bg-gray-900 hover:border-gray-600'
          }`}
        >
          <div className="font-semibold text-white mb-1">Classical Demon</div>
          <div className="text-sm text-gray-400">Records bits, pays for erasure</div>
          <div className="text-xs text-red-400 mt-2">Cost: kT ln 2 per molecule</div>
        </button>

        <button
          onClick={() => setDemonType('sublandauer')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            demonType === 'sublandauer'
              ? 'border-green-500 bg-green-900/20'
              : 'border-gray-700 bg-gray-900 hover:border-gray-600'
          }`}
        >
          <div className="font-semibold text-white mb-1">Sub-Landauer Demon</div>
          <div className="text-sm text-gray-400">Uses stochastic resonance</div>
          <div className="text-xs text-green-400 mt-2">Cost: Timing information</div>
        </button>
      </div>

      {/* Visualization */}
      {demonType === 'classical' ? <ClassicalDemon /> : <SubLandauerDemon />}

      {/* Continue to Part 1 */}
      <div className="border-t border-gray-800 pt-6 mt-6">
        <button
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          ← Back to Part 1: Detecting Fractions of a Bit
        </button>
      </div>
    </>
  );
}

function ClassicalDemon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [molecules, setMolecules] = useState<Array<{ x: number; y: number; vx: number; vy: number; fast: boolean }>>([]);
  const [memory, setMemory] = useState(0); // bits recorded
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sorted, setSorted] = useState({ left: 0, right: 0 });
  const animationRef = useRef<number>();

  // Initialize molecules
  useEffect(() => {
    const mols = [];
    for (let i = 0; i < 30; i++) {
      const fast = Math.random() > 0.5;
      mols.push({
        x: 150 + Math.random() * 200,
        y: 50 + Math.random() * 150,
        vx: (Math.random() - 0.5) * (fast ? 4 : 2),
        vy: (Math.random() - 0.5) * (fast ? 4 : 2),
        fast
      });
    }
    setMolecules(mols);
  }, []);

  // Animation
  useEffect(() => {
    let last = performance.now();
    const loop = (ts: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dt = (ts - last) / 1000;
      last = ts;

      setMolecules(mols => mols.map(m => {
        let { x, y, vx, vy } = m;
        x += vx;
        y += vy;

        // Bounce off walls
        if (x < 50 || x > 450) vx = -vx;
        if (y < 20 || y > 200) vy = -vy;

        // Demon at center - sorts based on speed
        if (x > 245 && x < 255 && m.x <= 245) {
          // Crossing left to right
          if (m.fast) {
            // Let fast ones through to right
            setMemory(mem => mem + 1);
            setSorted(s => ({ ...s, right: s.right + 1 }));
          } else {
            // Bounce slow ones back
            vx = -Math.abs(vx);
            setMemory(mem => mem + 1);
          }
        } else if (x < 255 && x > 245 && m.x >= 255) {
          // Crossing right to left
          if (!m.fast) {
            // Let slow ones through to left
            setMemory(mem => mem + 1);
            setSorted(s => ({ ...s, left: s.left + 1 }));
          } else {
            // Bounce fast ones back
            vx = Math.abs(vx);
            setMemory(mem => mem + 1);
          }
        }

        return { ...m, x: Math.max(50, Math.min(450, x)), y: Math.max(20, Math.min(200, y)), vx, vy };
      }));

      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 500, 250);

    // Container
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 20, 400, 180);

    // Divider with gate
    ctx.fillStyle = '#444';
    ctx.fillRect(248, 20, 4, 70);
    ctx.fillRect(248, 130, 4, 70);

    // Demon
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('👹', 250, 110);

    // Molecules
    molecules.forEach(m => {
      ctx.fillStyle = m.fast ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px system-ui';
    ctx.fillText('COLD', 150, 230);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('HOT', 350, 230);

  }, [molecules]);

  const energyCost = memory * 0.017; // kT ln 2 ≈ 0.017 eV at room temp

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} width={500} height={250} className="w-full" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Measurements</div>
          <div className="text-xl font-mono text-white">{memory} bits</div>
        </div>
        <div className="bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Erasure Cost</div>
          <div className="text-xl font-mono text-red-400">{energyCost.toFixed(2)} kT</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Timing</div>
          <div className="text-xl font-mono text-green-400">precise</div>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        The classical demon records whether each molecule is fast or slow—<strong>1 bit per molecule</strong>.
        Those bits must be erased, costing <strong>kT ln 2 each</strong>. No free lunch.
      </p>
    </div>
  );
}

function SubLandauerDemon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [molecules, setMolecules] = useState<Array<{ x: number; y: number; vx: number; vy: number; fast: boolean }>>([]);
  const [detections, setDetections] = useState(0);
  const [timingErrors, setTimingErrors] = useState<number[]>([]);
  const animationRef = useRef<number>();

  // Initialize molecules
  useEffect(() => {
    const mols = [];
    for (let i = 0; i < 30; i++) {
      const fast = Math.random() > 0.5;
      mols.push({
        x: 150 + Math.random() * 200,
        y: 50 + Math.random() * 150,
        vx: (Math.random() - 0.5) * (fast ? 4 : 2),
        vy: (Math.random() - 0.5) * (fast ? 4 : 2),
        fast
      });
    }
    setMolecules(mols);
  }, []);

  // Animation
  useEffect(() => {
    let last = performance.now();
    const loop = (ts: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dt = (ts - last) / 1000;
      last = ts;

      setMolecules(mols => mols.map(m => {
        let { x, y, vx, vy } = m;
        x += vx;
        y += vy;

        // Bounce off walls
        if (x < 50 || x > 450) vx = -vx;
        if (y < 20 || y > 200) vy = -vy;

        // Sub-Landauer demon - uses noise, uncertain detection
        const gateZone = x > 235 && x < 265;
        if (gateZone) {
          // Stochastic detection - sometimes sorts correctly, sometimes not
          // But NO timing information recorded
          const detectProb = m.fast ? 0.03 : 0.01; // Faster = slightly easier to detect
          if (Math.random() < detectProb) {
            setDetections(d => d + 1);
            // Record a random timing error (the demon doesn't know when this happened)
            setTimingErrors(e => [...e.slice(-9), Math.random() * 500]);

            // Try to sort, but unreliably
            if (Math.random() > 0.3) {
              // Sort correctly
              if (m.fast && x < 250) vx = Math.abs(vx);
              if (!m.fast && x > 250) vx = -Math.abs(vx);
            }
          }
        }

        return { ...m, x: Math.max(50, Math.min(450, x)), y: Math.max(20, Math.min(200, y)), vx, vy };
      }));

      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 500, 250);

    // Container
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 20, 400, 180);

    // Divider with wider, fuzzy gate
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.fillRect(235, 20, 30, 180); // Wider detection zone

    // Demon (different style)
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('👻', 250, 110);
    ctx.fillStyle = '#666';
    ctx.font = '10px system-ui';
    ctx.fillText('???', 250, 125);

    // Noise visualization
    for (let i = 0; i < 20; i++) {
      const x = 235 + Math.random() * 30;
      const y = 20 + Math.random() * 180;
      ctx.fillStyle = `rgba(34, 197, 94, ${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Molecules
    molecules.forEach(m => {
      ctx.fillStyle = m.fast ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui';
    ctx.fillText('(sorting is chaotic)', 250, 230);

  }, [molecules]);

  const avgTimingError = timingErrors.length > 0
    ? timingErrors.reduce((a, b) => a + b, 0) / timingErrors.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} width={500} height={250} className="w-full" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Detections</div>
          <div className="text-xl font-mono text-white">{detections}</div>
          <div className="text-xs text-green-400">0 bits recorded</div>
        </div>
        <div className="bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Erasure Cost</div>
          <div className="text-xl font-mono text-green-400">0 kT</div>
        </div>
        <div className="bg-yellow-900/20 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Timing</div>
          <div className="text-xl font-mono text-yellow-400">±{avgTimingError.toFixed(0)}ms</div>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        The sub-Landauer demon uses stochastic resonance—<strong>no bits recorded</strong>.
        No erasure cost! But it doesn&apos;t know <em>when</em> molecules cross, so it can&apos;t
        coordinate, can&apos;t build pressure, can&apos;t do useful work. <strong>The timing it
        didn&apos;t record is the timing it can&apos;t use.</strong>
      </p>
    </div>
  );
}
