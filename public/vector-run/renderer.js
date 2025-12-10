/**
 * Vector Run: Renderer Utilities
 *
 * Graphics abstraction layer handling "The Flattening" mechanic.
 * Automatically swaps between neon shapes (geometric) and ASCII code (flat)
 * based on renderMode state.
 */
import { COLORS } from './types.js';
// =============================================================================
// CONFIGURATION
// =============================================================================
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const CENTER_X = CANVAS_WIDTH / 2;
export const CENTER_Y = CANVAS_HEIGHT / 2;
const FOV = 300;
// Symbol mapping for flat mode
export const SHAPE_SYMBOLS = {
    circle: 'O',
    square: '[]',
    triangle: 'Δ',
    diamond: '◊',
    tesseract: '#',
    star: '*',
    point: '·',
    void: 'NULL',
    white: '∞',
};
/**
 * Projects a 3D point onto the 2D screen with perspective.
 */
export function project3D(x, y, z) {
    const depth = Math.max(1, FOV + z);
    const scale = FOV / depth;
    return {
        x: x * scale + CENTER_X,
        y: y * scale + CENTER_Y,
        scale,
        visible: depth > 1,
    };
}
/**
 * Projects a 4D point to 3D, then to 2D.
 * Uses stereographic projection for the 4th dimension.
 */
export function project4D(x, y, z, w) {
    // First project 4D → 3D (stereographic)
    const w_distance = 2; // Distance from 4D "eye"
    const scale4D = 1 / (w_distance - w);
    const x3 = x * scale4D;
    const y3 = y * scale4D;
    const z3 = z * scale4D;
    // Then project 3D → 2D
    return project3D(x3 * 100, y3 * 100, z3 * 100);
}
/**
 * Draws an entity handling both Geometric (Neon) and Flat (Code) modes.
 */
export function drawEntity(ctx, state, x, y, size, colorName, shape, customSymbol) {
    const colorHex = COLORS[colorName].hex;
    const symbol = customSymbol || SHAPE_SYMBOLS[shape] || '?';
    // FLAT MODE (High Energy / Code)
    if (state.renderMode === 'flat') {
        drawFlat(ctx, x, y, size, colorHex, symbol, state.saturation);
        return;
    }
    // GEOMETRIC MODE (Low Energy / Neon)
    drawGeometric(ctx, x, y, size, colorHex, shape, state.saturation);
}
/**
 * Flat/ASCII rendering mode
 */
function drawFlat(ctx, x, y, size, color, symbol, saturation) {
    ctx.font = `bold ${Math.max(12, size)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    // Glitch effect
    const glitchX = (Math.random() - 0.5) * 4;
    const glitchY = (Math.random() - 0.5) * 4;
    // CRT scanline flicker
    ctx.globalAlpha = 0.7 + Math.random() * 0.3;
    // Chromatic aberration (RGB split)
    if (Math.random() > 0.9) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(symbol, x + glitchX - 2, y + glitchY);
        ctx.fillStyle = '#00ff00';
        ctx.fillText(symbol, x + glitchX, y + glitchY);
        ctx.fillStyle = '#0000ff';
        ctx.fillText(symbol, x + glitchX + 2, y + glitchY);
    }
    else {
        ctx.fillText(symbol, x + glitchX, y + glitchY);
    }
    ctx.globalAlpha = 1.0;
}
/**
 * Geometric/Neon rendering mode
 */
function drawGeometric(ctx, x, y, size, color, shape, saturation) {
    // Bloom effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 * saturation;
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0.3, saturation);
    ctx.beginPath();
    switch (shape) {
        case 'circle':
        case 'point':
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            break;
        case 'triangle': {
            const r = size / 2;
            ctx.moveTo(x, y - r);
            ctx.lineTo(x + r, y + r);
            ctx.lineTo(x - r, y + r);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'diamond': {
            const r = size / 2;
            ctx.moveTo(x, y - r);
            ctx.lineTo(x + r, y);
            ctx.lineTo(x, y + r);
            ctx.lineTo(x - r, y);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'tesseract':
            // Nested squares
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            const outer = size / 2;
            const inner = size / 4;
            ctx.strokeRect(x - outer, y - outer, outer * 2, outer * 2);
            ctx.strokeRect(x - inner, y - inner, inner * 2, inner * 2);
            // Connecting lines
            ctx.beginPath();
            ctx.moveTo(x - outer, y - outer);
            ctx.lineTo(x - inner, y - inner);
            ctx.moveTo(x + outer, y - outer);
            ctx.lineTo(x + inner, y - inner);
            ctx.moveTo(x - outer, y + outer);
            ctx.lineTo(x - inner, y + inner);
            ctx.moveTo(x + outer, y + outer);
            ctx.lineTo(x + inner, y + inner);
            ctx.stroke();
            break;
        case 'star': {
            const spikes = 5;
            const outerR = size / 2;
            const innerR = size / 4;
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
}
// =============================================================================
// GLOW EFFECTS
// =============================================================================
/**
 * Draws a soft radial glow
 */
export function drawGlow(ctx, x, y, radius, color, intensity = 1) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color + Math.floor(128 * intensity).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
}
// =============================================================================
// GRID RENDERING
// =============================================================================
/**
 * Draws the synthwave perspective grid floor
 */
export function drawSynthwaveGrid(ctx, offsetZ, color = '#1a1a2e') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const gridSize = 100;
    const horizonY = CENTER_Y * 0.6;
    const floorY = CANVAS_HEIGHT;
    // Vertical lines (converging to horizon)
    for (let i = -10; i <= 10; i++) {
        const x = CENTER_X + i * gridSize;
        const vanishX = CENTER_X + i * 10; // Converge towards center
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(vanishX, horizonY);
        ctx.stroke();
    }
    // Horizontal lines (with perspective spacing)
    const move = offsetZ % gridSize;
    for (let i = 0; i < 20; i++) {
        const t = (i * gridSize - move) / 2000;
        if (t < 0)
            continue;
        const y = floorY - (floorY - horizonY) * (1 - Math.pow(1 - t, 2));
        const width = CANVAS_WIDTH * (1 - t * 0.8);
        const x1 = CENTER_X - width / 2;
        const x2 = CENTER_X + width / 2;
        ctx.globalAlpha = 1 - t;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
}
/**
 * Draws a 3D tunnel effect
 */
export function drawTunnel(ctx, depth, color = '#1a1a2e') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    // Concentric rectangles receding into distance
    for (let i = 0; i < 15; i++) {
        const z = (i * 100 + depth) % 1500;
        const proj = project3D(0, 0, z);
        if (!proj.visible)
            continue;
        const size = 400 * proj.scale;
        ctx.globalAlpha = 1 - z / 1500;
        ctx.strokeRect(CENTER_X - size, CENTER_Y - size * 0.6, size * 2, size * 1.2);
    }
    ctx.globalAlpha = 1.0;
}
// =============================================================================
// SCREEN EFFECTS
// =============================================================================
/**
 * Applies screen-wide CRT scanline effect
 */
export function drawScanlines(ctx, intensity = 0.1) {
    ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 2);
    }
}
/**
 * Applies vignette (darkened edges)
 */
export function drawVignette(ctx, intensity = 0.5) {
    const gradient = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, CANVAS_WIDTH * 0.7);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, 'transparent');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
/**
 * Chromatic aberration effect (RGB split)
 */
export function drawChromaticAberration(ctx, sourceCanvas, intensity = 3) {
    // This requires a temp canvas - simplified version just shifts colors
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.3;
    // Red channel offset
    ctx.drawImage(sourceCanvas, -intensity, 0);
    // Blue channel offset
    ctx.drawImage(sourceCanvas, intensity, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
}
// =============================================================================
// EXCESS STATE VISUALS
// =============================================================================
/**
 * Applies Red Shift visual effects (speed overdrive)
 */
export function applyRedShift(ctx, intensity) {
    // Red tint overlay
    ctx.fillStyle = `rgba(255, 0, 68, ${intensity * 0.2})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Motion blur lines
    ctx.strokeStyle = `rgba(255, 100, 50, ${intensity * 0.3})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        const y = Math.random() * CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}
/**
 * Applies Black Hole visual effects (mass overdrive)
 */
export function applyBlackHole(ctx, intensity) {
    // Heavy vignette
    drawVignette(ctx, 0.5 + intensity * 0.4);
    // Dark overlay
    ctx.fillStyle = `rgba(0, 0, 20, ${intensity * 0.3})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Gravity distortion (subtle)
    ctx.save();
    ctx.translate(CENTER_X, CENTER_Y);
    ctx.scale(1 + intensity * 0.05, 1 - intensity * 0.03);
    ctx.translate(-CENTER_X, -CENTER_Y);
    ctx.restore();
}
// =============================================================================
// FLATTENING TRANSITION
// =============================================================================
/**
 * Renders the "flattening" transition effect
 */
export function drawFlattenTransition(ctx, progress, // 0 = geometric, 1 = flat
direction) {
    if (direction === 'flatten') {
        // Glitch bars
        const numBars = Math.floor(progress * 20);
        for (let i = 0; i < numBars; i++) {
            const y = Math.random() * CANVAS_HEIGHT;
            const h = 2 + Math.random() * 10;
            ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.5})`;
            ctx.fillRect(0, y, CANVAS_WIDTH, h);
        }
        // Static noise overlay
        if (progress > 0.5) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '10px monospace';
            for (let i = 0; i < progress * 50; i++) {
                const x = Math.random() * CANVAS_WIDTH;
                const y = Math.random() * CANVAS_HEIGHT;
                const char = String.fromCharCode(33 + Math.random() * 93);
                ctx.globalAlpha = Math.random() * 0.3;
                ctx.fillText(char, x, y);
            }
            ctx.globalAlpha = 1;
        }
    }
    else {
        // Unflatten: reconstruct geometry
        const gradient = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, CANVAS_WIDTH * (1 - progress));
        gradient.addColorStop(0, 'rgba(0, 255, 249, 0.3)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}
// =============================================================================
// TEXT RENDERING
// =============================================================================
/**
 * Draws text with neon glow
 */
export function drawGlowText(ctx, text, x, y, color, fontSize = 16, blur = 10) {
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}
/**
 * Draws scrolling code/matrix effect
 */
export function drawCodeRain(ctx, columns, color = '#00ff88') {
    ctx.font = '14px monospace';
    ctx.fillStyle = color;
    for (let i = 0; i < columns.length; i++) {
        const x = i * 20;
        const y = columns[i];
        // Random character
        const char = String.fromCharCode(33 + Math.random() * 93);
        ctx.globalAlpha = 0.8;
        ctx.fillText(char, x, y);
        // Trail
        ctx.globalAlpha = 0.1;
        for (let j = 1; j < 10; j++) {
            const trailChar = String.fromCharCode(33 + Math.random() * 93);
            ctx.fillText(trailChar, x, y - j * 20);
        }
        // Update column position
        columns[i] = y > CANVAS_HEIGHT + 100 ? 0 : y + 20;
    }
    ctx.globalAlpha = 1;
}
//# sourceMappingURL=renderer.js.map