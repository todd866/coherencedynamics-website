/**
 * Vector Run: Audio Engine
 *
 * Web Audio API-based sound system that responds to game events.
 * Provides procedural audio for matches, ascensions, and transitions.
 */
export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        // Beat tracking for rhythm sync
        this.bpm = 120;
        this.lastBeatTime = 0;
        // Continuous ambient drone based on dimension
        this.droneOsc = null;
        this.droneGain = null;
    }
    init() {
        if (this.initialized)
            return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
    }
    setBPM(bpm) {
        this.bpm = bpm;
    }
    playTone(freq, duration, type = 'sine', vol = 1) {
        if (!this.ctx || !this.masterGain)
            return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        // Envelope to prevent clicking
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol * 0.3, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    // Color-based frequency mapping (chromatic resonance)
    colorToFreq(color) {
        const freqs = {
            red: 261.63, // C4
            green: 329.63, // E4
            blue: 392.00, // G4
            white: 523.25, // C5
            black: 130.81, // C3 (low, ominous)
        };
        return freqs[color] || 440;
    }
    // --- FX PRESETS ---
    handleEvent(event) {
        if (!this.initialized)
            return;
        switch (event.type) {
            case 'match':
                if (event.result === 'perfect') {
                    // Major triad arpeggio (Success) - color-tuned
                    const baseFreq = event.color ? this.colorToFreq(event.color) : 440;
                    this.playTone(baseFreq, 0.1, 'sine', 0.8);
                    setTimeout(() => this.playTone(baseFreq * 1.25, 0.1, 'sine', 0.6), 50);
                    setTimeout(() => this.playTone(baseFreq * 1.5, 0.2, 'sine', 0.4), 100);
                }
                else if (event.result === 'white') {
                    // Bright shimmer (White match - universal)
                    this.playTone(523, 0.15, 'sine', 0.6);
                    this.playTone(659, 0.15, 'sine', 0.5);
                    this.playTone(784, 0.2, 'sine', 0.4);
                }
                else if (event.result === 'mismatch') {
                    // Dissonant sawtooth (Error)
                    this.playTone(150, 0.2, 'sawtooth', 0.4);
                    this.playTone(142, 0.2, 'sawtooth', 0.4); // Tritone rub
                }
                else if (event.result === 'void') {
                    // Low impact (Death by black)
                    this.playTone(50, 0.5, 'square', 0.6);
                    this.playTone(100, 0.3, 'sawtooth', 0.5);
                }
                break;
            case 'ascend':
                // Ascending scale - triumphant
                [261, 329, 392, 523, 659, 784, 1047].forEach((freq, i) => {
                    setTimeout(() => this.playTone(freq, 0.4, 'triangle', 0.25), i * 80);
                });
                break;
            case 'drop':
                // Descending slide - falling through dimensions
                if (!this.ctx || !this.masterGain)
                    break;
                const dropOsc = this.ctx.createOscillator();
                const dropGain = this.ctx.createGain();
                dropOsc.type = 'sawtooth';
                dropOsc.frequency.setValueAtTime(400, this.ctx.currentTime);
                dropOsc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);
                dropGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
                dropGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
                dropOsc.connect(dropGain);
                dropGain.connect(this.masterGain);
                dropOsc.start();
                dropOsc.stop(this.ctx.currentTime + 0.5);
                break;
            case 'flatten':
                // Glitch / Bitcrush sound - entering code mode
                this.playTone(1000, 0.03, 'square', 0.15);
                setTimeout(() => this.playTone(2000, 0.03, 'sawtooth', 0.15), 30);
                setTimeout(() => this.playTone(500, 0.05, 'square', 0.1), 60);
                break;
            case 'unflatten':
                // Reverse glitch - returning to geometry
                this.playTone(500, 0.03, 'square', 0.1);
                setTimeout(() => this.playTone(1000, 0.03, 'sine', 0.15), 30);
                setTimeout(() => this.playTone(2000, 0.05, 'triangle', 0.15), 60);
                break;
            case 'beat':
                // Metronome kick - subtle pulse
                this.playTone(80, 0.05, 'triangle', 0.3);
                break;
            case 'rebirth':
                // Stillness complete - cosmic chord
                if (!this.ctx || !this.masterGain)
                    break;
                // Build a shimmering pad
                [261, 329, 392, 523].forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0, this.ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
                    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start(this.ctx.currentTime + i * 0.1);
                    osc.stop(this.ctx.currentTime + 2);
                });
                break;
            case 'redshift':
                // Speed overdrive warning
                this.playTone(880, 0.1, 'sawtooth', 0.3);
                setTimeout(() => this.playTone(1760, 0.1, 'sawtooth', 0.2), 100);
                break;
            case 'blackhole':
                // Mass overdrive warning
                this.playTone(55, 0.3, 'sine', 0.5);
                this.playTone(110, 0.2, 'triangle', 0.3);
                break;
            case 'colorCycle':
                // Color change click
                const cycleFreq = event.color ? this.colorToFreq(event.color) : 440;
                this.playTone(cycleFreq, 0.05, 'sine', 0.2);
                break;
        }
    }
    startDrone(dimension) {
        if (!this.ctx || !this.masterGain)
            return;
        this.stopDrone();
        // Base frequency gets higher with dimension
        const baseFreq = 55 * Math.pow(2, dimension / 3);
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = baseFreq;
        this.droneGain.gain.value = 0.05;
        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);
        this.droneOsc.start();
    }
    stopDrone() {
        if (this.droneOsc) {
            this.droneOsc.stop();
            this.droneOsc.disconnect();
            this.droneOsc = null;
        }
        if (this.droneGain) {
            this.droneGain.disconnect();
            this.droneGain = null;
        }
    }
}
//# sourceMappingURL=audio.js.map