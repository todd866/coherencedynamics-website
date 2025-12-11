/**
 * Vector Run: Core Game Logic
 *
 * State machine and main game loop.
 */
import { createInitialState, createEmptyInput, checkMatch, DIMENSION_CONFIGS, } from './lib/types.js';
// =============================================================================
// CONSTANTS
// =============================================================================
const SATURATION_DRAIN_RATE = 0.1; // Per second during mismatch
const SATURATION_RESTORE_RATE = 0.2; // Per second during match
const ENERGY_DECAY_RATE = 0.05; // Per second
const ENERGY_GAIN_PER_ABSORB = 0.1;
const FLATTEN_THRESHOLD = 0.8;
const UNFLATTEN_THRESHOLD = 0.4;
const STILLNESS_REBIRTH_TIME = 7.0; // Seconds
const REDSHIFT_THRESHOLD = 0.7; // Red energy ratio
const BLACKHOLE_THRESHOLD = 0.7; // Blue energy ratio
// =============================================================================
// COLOR CYCLING
// =============================================================================
const COLOR_ORDER = ['red', 'green', 'blue'];
export function cycleColor(current, direction) {
    if (current === 'white' || current === 'black')
        return current;
    const idx = COLOR_ORDER.indexOf(current);
    const newIdx = (idx + direction + COLOR_ORDER.length) % COLOR_ORDER.length;
    return COLOR_ORDER[newIdx];
}
// =============================================================================
// DIMENSION TRANSITIONS
// =============================================================================
export function ascend(state, emit) {
    const from = state.dimension;
    let to;
    if (from === 'infinite')
        return; // Can't ascend from infinite
    if (from === 5) {
        to = 'infinite';
    }
    else {
        to = (from + 1);
    }
    emit({ type: 'ascend', from, to });
    state.dimension = to;
    state.streak = 0;
    // Reset position arrays for new dimension
    const axes = DIMENSION_CONFIGS[to].inputAxes;
    state.position = new Array(axes).fill(0);
    state.velocity = new Array(axes).fill(0);
    state.rotation = [];
    state.entities = [];
}
export function dropDimension(state, emit) {
    const from = state.dimension;
    let to;
    if (from === 0) {
        // At 0D, dropping triggers stillness check
        return;
    }
    if (from === 'infinite') {
        to = 0;
    }
    else {
        to = (from - 1);
    }
    emit({ type: 'drop', from, to });
    state.dimension = to;
    state.saturation = 1.0; // Reset health
    state.streak = 0;
    state.excessState = 'balanced';
    // Reset position arrays
    const axes = DIMENSION_CONFIGS[to].inputAxes;
    state.position = new Array(axes).fill(0);
    state.velocity = new Array(axes).fill(0);
    state.rotation = [];
    state.entities = [];
}
// =============================================================================
// RENDER MODE
// =============================================================================
export function updateRenderMode(state, emit) {
    if (state.energy > FLATTEN_THRESHOLD && state.renderMode === 'geometric') {
        state.renderMode = 'flat';
        emit({ type: 'flatten' });
    }
    if (state.energy < UNFLATTEN_THRESHOLD && state.renderMode === 'flat') {
        state.renderMode = 'geometric';
        emit({ type: 'unflatten' });
    }
}
const energyAccumulator = { red: 0, blue: 0 };
export function updateExcessState(state, emit) {
    const total = energyAccumulator.red + energyAccumulator.blue;
    if (total < 0.5) {
        state.excessState = 'balanced';
        return;
    }
    const redRatio = energyAccumulator.red / total;
    const blueRatio = energyAccumulator.blue / total;
    if (redRatio > REDSHIFT_THRESHOLD && state.excessState !== 'redshift') {
        state.excessState = 'redshift';
        emit({ type: 'redshift' });
    }
    else if (blueRatio > BLACKHOLE_THRESHOLD && state.excessState !== 'blackhole') {
        state.excessState = 'blackhole';
        emit({ type: 'blackhole' });
    }
    else if (redRatio < 0.5 && blueRatio < 0.5) {
        state.excessState = 'balanced';
    }
}
export function absorbEnergy(state, color) {
    state.energy = Math.min(1, state.energy + ENERGY_GAIN_PER_ABSORB);
    if (color === 'red')
        energyAccumulator.red += 0.1;
    if (color === 'blue')
        energyAccumulator.blue += 0.1;
    // Decay accumulator over time (called elsewhere)
}
export function decayEnergy(state, dt) {
    state.energy = Math.max(0, state.energy - ENERGY_DECAY_RATE * dt);
    energyAccumulator.red = Math.max(0, energyAccumulator.red - 0.02 * dt);
    energyAccumulator.blue = Math.max(0, energyAccumulator.blue - 0.02 * dt);
}
// =============================================================================
// COLLISION & MATCHING
// =============================================================================
export function handleCollision(state, entity, emit) {
    const result = checkMatch(state.color, entity.color);
    emit({ type: 'match', result, color: entity.color });
    switch (result) {
        case 'perfect':
            state.saturation = Math.min(1, state.saturation + SATURATION_RESTORE_RATE * 0.5);
            state.streak++;
            state.score += calculateScore(state);
            absorbEnergy(state, entity.color);
            break;
        case 'white':
            state.saturation = Math.min(1, state.saturation + SATURATION_RESTORE_RATE);
            state.streak++;
            state.score += calculateScore(state);
            // White doesn't add to excess
            break;
        case 'mismatch':
            // Blackhole makes mismatches more punishing despite slow-mo
            const drainMult = state.excessState === 'blackhole' ? 1.8 : 1.0;
            state.saturation = Math.max(0, state.saturation - SATURATION_DRAIN_RATE * 2 * drainMult);
            state.streak = 0;
            break;
        case 'void':
            // Black = instant dimensional drop
            dropDimension(state, emit);
            break;
    }
}
// =============================================================================
// SCORING
// =============================================================================
function getDimensionMultiplier(dim) {
    if (dim === 'infinite')
        return 64;
    return Math.pow(2, dim);
}
function calculateScore(state) {
    const base = 100;
    const dimMult = getDimensionMultiplier(state.dimension);
    const streakMult = 1 + state.streak * 0.1;
    return Math.floor(base * dimMult * streakMult);
}
// =============================================================================
// STILLNESS (Rebirth Mechanic)
// =============================================================================
export function updateStillness(state, input, dt, emit) {
    // Only active in 0D
    if (state.dimension !== 0) {
        state.stillnessTimer = 0;
        return;
    }
    // Check if any input is pressed
    const anyInput = Object.values(input).some(v => v);
    if (anyInput) {
        state.stillnessTimer = 0;
    }
    else {
        state.stillnessTimer += dt;
        if (state.stillnessTimer >= STILLNESS_REBIRTH_TIME) {
            // REBIRTH
            emit({ type: 'rebirth' });
            state.dimension = 3; // Respawn at 3D
            state.saturation = 1.0;
            state.energy = 0.5;
            state.excessState = 'balanced';
            state.color = 'white';
            state.stillnessTimer = 0;
            energyAccumulator.red = 0;
            energyAccumulator.blue = 0;
        }
    }
}
// =============================================================================
// MAIN UPDATE
// =============================================================================
export function update(state, input, dt, dimension, emit) {
    // Decay energy
    decayEnergy(state, dt);
    // Update render mode
    updateRenderMode(state, emit);
    // Update excess state
    updateExcessState(state, emit);
    // Check for saturation death
    if (state.saturation <= 0) {
        dropDimension(state, emit);
        return;
    }
    // Update stillness (rebirth mechanic)
    updateStillness(state, input, dt, emit);
    // Dimension-specific update
    dimension.update(state, input, dt);
    // Check ascension
    if (dimension.checkAscension(state)) {
        ascend(state, emit);
    }
    // Check death
    if (dimension.checkDeath(state)) {
        dropDimension(state, emit);
    }
}
// =============================================================================
// INPUT HANDLING
// =============================================================================
const keyMap = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'KeyQ': 'cyclePrev',
    'KeyE': 'cycleNext',
    'KeyA': 'rotateLeft',
    'KeyD': 'rotateRight',
    'KeyW': 'expand',
    'KeyS': 'contract',
    'Space': 'phase',
    'ShiftLeft': 'densityUp',
    'ShiftRight': 'densityDown',
};
export function createInputHandler(existingInput) {
    // Use existing input object (shared with touch controls) or create new
    const input = existingInput || createEmptyInput();
    const onKeyDown = (e) => {
        const key = keyMap[e.code];
        if (key) {
            input[key] = true;
            e.preventDefault();
        }
    };
    const onKeyUp = (e) => {
        const key = keyMap[e.code];
        if (key) {
            input[key] = false;
        }
    };
    return {
        input,
        attach: (el) => {
            // Use window for keyboard to prevent focus issues on mobile
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
        },
        detach: (el) => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        },
    };
}
// =============================================================================
// BEAT SYNC
// =============================================================================
export function updateBeat(state, audioTime, bpm) {
    const beatDuration = 60 / bpm;
    state.beatPhase = (audioTime % beatDuration) / beatDuration;
    // Detect beat crossing
    const currentBeat = Math.floor(audioTime / beatDuration);
    const lastBeat = Math.floor(state.lastBeatTime / beatDuration);
    if (currentBeat > lastBeat) {
        // Beat just hit - this is where we'd emit beat event
    }
    state.lastBeatTime = audioTime;
}
export function createGame(canvas, externalInput) {
    const ctx = canvas.getContext('2d');
    const state = createInitialState();
    const dimensions = new Map();
    const events = [];
    const eventCallbacks = [];
    const emit = (e) => {
        events.push(e);
        eventCallbacks.forEach(cb => cb(e));
    };
    // Pass external input (shared with touch controls) if provided
    const inputHandler = createInputHandler(externalInput);
    inputHandler.attach(canvas);
    let running = false;
    let lastTime = 0;
    let lastDimension = state.dimension;
    const loop = (time) => {
        if (!running)
            return;
        const rawDt = (time - lastTime) / 1000;
        lastTime = time;
        // Apply time dilation based on excess state
        let timeScale = 1.0;
        if (state.excessState === 'redshift') {
            timeScale = 1.5; // Everything moves 50% faster
        }
        else if (state.excessState === 'blackhole') {
            timeScale = 0.6; // Everything moves in slow motion
        }
        const dt = Math.min(rawDt, 0.1) * timeScale;
        // Get current dimension handler
        const dim = dimensions.get(state.dimension);
        if (dim) {
            // Check for dimension change and initialize new dimension
            if (state.dimension !== lastDimension) {
                dim.init(state);
                lastDimension = state.dimension;
            }
            update(state, inputHandler.input, dt, dim, emit);
            // Render
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            dim.render(ctx, state);
        }
        requestAnimationFrame(loop);
    };
    return {
        state,
        canvas,
        ctx,
        dimensions,
        events,
        running,
        start() {
            running = true;
            lastTime = performance.now();
            requestAnimationFrame(loop);
        },
        stop() {
            running = false;
            inputHandler.detach(canvas);
        },
        onEvent(callback) {
            eventCallbacks.push(callback);
        },
    };
}
// =============================================================================
// EXPORTS FOR DIMENSION IMPLEMENTATIONS
// =============================================================================
export { SATURATION_DRAIN_RATE, SATURATION_RESTORE_RATE, FLATTEN_THRESHOLD, STILLNESS_REBIRTH_TIME, };
//# sourceMappingURL=game.js.map