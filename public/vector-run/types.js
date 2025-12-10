/**
 * Vector Run: Type Definitions
 *
 * Minimal, complete type system for the dimensional rhythm game.
 */
export const COLORS = {
    white: { name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255] },
    red: { name: 'red', hex: '#FF0044', rgb: [255, 0, 68] },
    green: { name: 'green', hex: '#00FF88', rgb: [0, 255, 136] },
    blue: { name: 'blue', hex: '#0088FF', rgb: [0, 136, 255] },
    black: { name: 'black', hex: '#000000', rgb: [0, 0, 0] },
};
export function checkMatch(a, b) {
    if (a === 'black' || b === 'black')
        return 'void';
    if (a === 'white' || b === 'white')
        return 'white';
    if (a === b)
        return 'perfect';
    return 'mismatch';
}
export const SYMBOLS = {
    point: { name: 'point', ascii: '.', glyph: '·' },
    circle: { name: 'circle', ascii: 'O', glyph: '○' },
    square: { name: 'square', ascii: '[]', glyph: '□' },
    triangle: { name: 'triangle', ascii: '/\\', glyph: '△' },
    tesseract: { name: 'tesseract', ascii: '#', glyph: '⧈' },
    star: { name: 'star', ascii: '*', glyph: '✦' },
};
export const DIMENSION_CONFIGS = {
    0: {
        level: 0,
        name: 'The Pulse',
        description: 'Sync your color to the universe',
        inputAxes: 0,
        colorCycling: true,
        rotation: false,
        expansion: false,
        symbolMatching: false,
    },
    1: {
        level: 1,
        name: 'The Collision',
        description: 'Match colors before impact',
        inputAxes: 0, // No movement yet
        colorCycling: true,
        rotation: false,
        expansion: false,
        symbolMatching: false,
    },
    2: {
        level: 2,
        name: 'The Weaver',
        description: 'Navigate the colored plane',
        inputAxes: 1, // Left/Right
        colorCycling: true,
        rotation: false,
        expansion: false,
        symbolMatching: false,
    },
    3: {
        level: 3,
        name: 'The Tumble',
        description: 'Rotate through the tunnel',
        inputAxes: 2, // Left/Right + Up/Down
        colorCycling: true,
        rotation: true,
        expansion: false,
        symbolMatching: false,
    },
    4: {
        level: 4,
        name: 'The Hyper-Tunnel',
        description: 'Expand into the fourth dimension',
        inputAxes: 3, // Full 3D movement
        colorCycling: true,
        rotation: true,
        expansion: true,
        symbolMatching: false,
    },
    5: {
        level: 5,
        name: 'The Cloud',
        description: 'Match color, shape, and density',
        inputAxes: 3,
        colorCycling: true,
        rotation: true,
        expansion: true,
        symbolMatching: true,
    },
    infinite: {
        level: 'infinite',
        name: 'The Stillness',
        description: 'Let go',
        inputAxes: 0,
        colorCycling: false,
        rotation: false,
        expansion: false,
        symbolMatching: false,
    },
};
export function createEmptyInput() {
    return {
        left: false, right: false, up: false, down: false,
        cycleNext: false, cyclePrev: false,
        rotateLeft: false, rotateRight: false, rotateUp: false, rotateDown: false,
        expand: false, contract: false,
        symbolNext: false, symbolPrev: false, densityUp: false, densityDown: false,
        phase: false,
    };
}
export function createInitialState() {
    return {
        dimension: 0,
        renderMode: 'geometric',
        excessState: 'balanced',
        color: 'white',
        symbol: 'point',
        saturation: 1.0,
        energy: 0.0,
        density: 0.5,
        position: [],
        velocity: [],
        rotation: [],
        scale: 1.0,
        score: 0,
        streak: 0,
        stillnessTimer: 0,
        entities: [],
        beatPhase: 0,
        lastBeatTime: 0,
    };
}
//# sourceMappingURL=types.js.map