/**
 * Vector Run: Dimension Implementations
 *
 * Each dimension as a self-contained module.
 * Uses renderer.ts for "The Flattening" mechanic - automatic visual mode switching.
 */
import { COLORS, DIMENSION_CONFIGS, checkMatch, } from './lib/types.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CENTER_X, CENTER_Y, drawEntity, drawGlow, drawGlowText, drawTunnel, drawScanlines, drawVignette, applyRedShift, applyBlackHole, drawFlattenTransition, project3D, project4D, } from './lib/renderer.js';
import { cycleShape, shapeMatches, drawShape, } from './shapes.js';
// =============================================================================
// HELPERS
// =============================================================================
function randomColor() {
    const colors = ['red', 'green', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
}
// =============================================================================
// DIMENSION 0: THE PULSE
// =============================================================================
export class Dim0Pulse {
    constructor() {
        this.config = DIMENSION_CONFIGS[0];
        this.borderColor = 'red';
        this.beatTimer = 0;
        this.perfectMatches = 0;
        this.beatInterval = 0.8; // fast beats - keep up!
    }
    init(state) {
        state.position = [];
        state.velocity = [];
        state.color = 'red';
        this.borderColor = 'red';
        this.beatTimer = 0;
        this.perfectMatches = 0;
    }
    update(state, input, dt) {
        // Color cycling handled by main.ts (single-press detection)
        // Beat timing
        this.beatTimer += dt;
        if (this.beatTimer >= this.beatInterval) {
            this.beatTimer -= this.beatInterval;
            // Check match on beat
            const result = checkMatch(state.color, this.borderColor);
            if (result === 'perfect' || result === 'white') {
                this.perfectMatches++;
                state.saturation = Math.min(1, state.saturation + 0.1);
                state.streak++;
                state.score += 100 * state.streak;
            }
            else {
                this.perfectMatches = 0;
                state.streak = 0;
                state.saturation = Math.max(0, state.saturation - 0.15);
            }
            // Change border color for next beat
            if (Math.random() < 0.3) {
                this.borderColor = 'white';
            }
            else {
                this.borderColor = randomColor();
            }
        }
    }
    render(ctx, state) {
        const beatProgress = this.beatTimer / this.beatInterval;
        const pulse = Math.sin(beatProgress * Math.PI) * 0.3 + 0.7;
        // Apply screen effects based on state
        drawVignette(ctx, 0.3);
        // Border (the universe) - uses drawEntity for Flattening
        const borderSize = 80 * pulse;
        drawEntity(ctx, state, CENTER_X, CENTER_Y * 0.1, borderSize, this.borderColor, 'square');
        drawEntity(ctx, state, CENTER_X, CANVAS_HEIGHT - CENTER_Y * 0.1, borderSize, this.borderColor, 'square');
        drawEntity(ctx, state, CENTER_X * 0.1, CENTER_Y, borderSize, this.borderColor, 'square');
        drawEntity(ctx, state, CANVAS_WIDTH - CENTER_X * 0.1, CENTER_Y, borderSize, this.borderColor, 'square');
        // Center (you) - main player entity with Flattening support
        const centerSize = 150 * state.saturation;
        drawGlow(ctx, CENTER_X, CENTER_Y, centerSize, COLORS[state.color].hex, state.saturation);
        drawEntity(ctx, state, CENTER_X, CENTER_Y, centerSize * 2, state.color, 'circle');
        // Beat indicator
        drawGlowText(ctx, `STREAK: ${state.streak}`, CENTER_X, 50, '#fff', 24, 5);
        // Timing bar
        const barWidth = 200;
        const barHeight = 10;
        ctx.fillStyle = '#333';
        ctx.fillRect(CENTER_X - barWidth / 2, CANVAS_HEIGHT - 50, barWidth, barHeight);
        ctx.fillStyle = COLORS[state.color].hex;
        ctx.shadowColor = COLORS[state.color].hex;
        ctx.shadowBlur = 10;
        ctx.fillRect(CENTER_X - barWidth / 2, CANVAS_HEIGHT - 50, barWidth * beatProgress, barHeight);
        ctx.shadowBlur = 0;
        // CRT scanlines for atmosphere
        drawScanlines(ctx, 0.05);
        // Excess state effects
        if (state.excessState === 'redshift') {
            applyRedShift(ctx, 0.5);
        }
        else if (state.excessState === 'blackhole') {
            applyBlackHole(ctx, 0.5);
        }
    }
    checkAscension(state) {
        return this.perfectMatches >= 8;
    }
    checkDeath(state) {
        return state.saturation <= 0;
    }
    spawnEntities() {
        return []; // No entities in 0D
    }
}
// =============================================================================
// DIMENSION 1: THE COLLISION
// =============================================================================
export class Dim1Collision {
    constructor() {
        this.config = DIMENSION_CONFIGS[1];
        this.lineLength = 100;
        this.spawnTimer = 0;
        this.spawnInterval = 1.0; // Fast spawn rate
    }
    init(state) {
        state.position = [];
        state.velocity = [];
        state.entities = [];
        this.lineLength = 100;
    }
    update(state, input, dt) {
        // Color cycling handled by main.ts (single-press detection)
        // Spawn entities
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer -= this.spawnInterval;
            const newEntities = this.spawnEntities(state, 0);
            state.entities.push(...newEntities);
        }
        // Update entities
        for (const entity of state.entities) {
            entity.position[0] += entity.velocity[0] * dt;
        }
        // Check collisions
        const playerX = CENTER_X;
        state.entities = state.entities.filter(entity => {
            const dist = Math.abs(entity.position[0] - playerX);
            if (dist < 20) {
                // Collision!
                if (entity.color === 'black') {
                    if (input.phase) {
                        // Dodged black
                        return false;
                    }
                    else {
                        // Hit by black
                        state.saturation = 0;
                        return false;
                    }
                }
                const result = checkMatch(state.color, entity.color);
                if (result === 'perfect' || result === 'white') {
                    this.lineLength += 10;
                    state.saturation = Math.min(1, state.saturation + 0.1);
                    state.streak++;
                    state.score += 200 * state.streak;
                }
                else {
                    this.lineLength = Math.max(50, this.lineLength - 20);
                    state.saturation = Math.max(0, state.saturation - 0.2);
                    state.streak = 0;
                }
                return false;
            }
            // Remove if off screen
            return entity.position[0] > 0 && entity.position[0] < CANVAS_WIDTH;
        });
    }
    render(ctx, state) {
        // Background effects
        drawVignette(ctx, 0.3);
        const y = CENTER_Y;
        // The line (you) - Flattening-aware
        drawGlow(ctx, CENTER_X, y, 30, COLORS[state.color].hex, state.saturation);
        if (state.renderMode === 'flat') {
            // Flat mode: ASCII line representation
            const lineChars = Math.floor(this.lineLength / 10);
            const lineStr = '─'.repeat(lineChars);
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = COLORS[state.color].hex;
            ctx.shadowColor = COLORS[state.color].hex;
            ctx.shadowBlur = 10;
            ctx.fillText(lineStr, CENTER_X, y);
            ctx.shadowBlur = 0;
        }
        else {
            // Geometric mode: neon line
            ctx.strokeStyle = COLORS[state.color].hex;
            ctx.lineWidth = 4;
            ctx.shadowColor = COLORS[state.color].hex;
            ctx.shadowBlur = 15 * state.saturation;
            ctx.beginPath();
            ctx.moveTo(CENTER_X - this.lineLength / 2, y);
            ctx.lineTo(CENTER_X + this.lineLength / 2, y);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Entities (incoming dots) - use drawEntity for Flattening
        for (const entity of state.entities) {
            const symbol = entity.color === 'black' ? '■' : entity.color === 'white' ? '∞' : 'O';
            drawGlow(ctx, entity.position[0], y, 15, COLORS[entity.color].hex, state.saturation);
            drawEntity(ctx, state, entity.position[0], y, 20, entity.color, 'circle', symbol);
        }
        // UI
        drawGlowText(ctx, `LENGTH: ${Math.floor(this.lineLength)}`, CENTER_X, 50, '#fff', 20, 5);
        drawGlowText(ctx, `[Q/E] to cycle color`, CENTER_X, CANVAS_HEIGHT - 30, '#888', 16, 3);
        // Screen effects
        drawScanlines(ctx, 0.05);
        // Excess state effects
        if (state.excessState === 'redshift') {
            applyRedShift(ctx, 0.5);
        }
        else if (state.excessState === 'blackhole') {
            applyBlackHole(ctx, 0.5);
        }
    }
    checkAscension(state) {
        return this.lineLength >= 300;
    }
    checkDeath(state) {
        return state.saturation <= 0;
    }
    spawnEntities(state, beatPhase) {
        const fromLeft = Math.random() > 0.5;
        const isBlack = Math.random() < 0.1;
        const isWhite = !isBlack && Math.random() < 0.15;
        const color = isBlack ? 'black' : isWhite ? 'white' : randomColor();
        return [{
                id: Math.random().toString(36),
                color,
                position: [fromLeft ? 0 : CANVAS_WIDTH],
                velocity: [fromLeft ? 220 : -220], // Fast entities
                size: 10,
            }];
    }
}
export class Dim2Weaver {
    constructor() {
        this.config = DIMENSION_CONFIGS[2];
        this.walls = [];
        this.spawnTimer = 0;
        this.successfulPasses = 0;
        this.playerShape = 'circle';
        this.playerRotation = 0;
        this.playerScale = 40;
        this.shapeJustCycled = false;
    }
    init(state) {
        state.position = [CENTER_X, CANVAS_HEIGHT - 120];
        state.velocity = [0, 0];
        state.entities = [];
        this.walls = [];
        this.spawnTimer = 0;
        this.successfulPasses = 0;
        this.playerShape = 'circle';
        this.playerRotation = 0;
    }
    update(state, input, dt) {
        // Movement (left/right only in 2D)
        const speed = 400;
        if (input.left)
            state.position[0] -= speed * dt;
        if (input.right)
            state.position[0] += speed * dt;
        state.position[0] = Math.max(80, Math.min(CANVAS_WIDTH - 80, state.position[0]));
        // Shape morphing: Q/E cycles shape type
        if (input.cyclePrev && !this.shapeJustCycled) {
            this.playerShape = cycleShape(this.playerShape, -1);
            this.shapeJustCycled = true;
        }
        else if (input.cycleNext && !this.shapeJustCycled) {
            this.playerShape = cycleShape(this.playerShape, 1);
            this.shapeJustCycled = true;
        }
        else if (!input.cyclePrev && !input.cycleNext) {
            this.shapeJustCycled = false;
        }
        // Rotation (A/D in 2D - preparing for 3D)
        const rotSpeed = 3;
        if (input.rotateLeft)
            this.playerRotation -= rotSpeed * dt;
        if (input.rotateRight)
            this.playerRotation += rotSpeed * dt;
        // Spawn walls
        this.spawnTimer += dt;
        if (this.spawnTimer >= 2.5) {
            this.spawnTimer = 0;
            this.walls.push(this.spawnWall());
        }
        // Update walls (move down)
        const wallSpeed = 150;
        const playerY = state.position[1];
        this.walls = this.walls.filter(wall => {
            wall.y += wallSpeed * dt;
            // Check if wall is at player position
            if (!wall.passed && wall.y > playerY - 30 && wall.y < playerY + 30) {
                wall.passed = true;
                // Check shape match
                const match = shapeMatches(this.playerShape, this.playerRotation, wall.holeType, wall.holeRotation, 0.4 // ~23 degree tolerance
                );
                // Check position (is player centered in hole?)
                const dx = state.position[0] - CENTER_X;
                const positionOk = Math.abs(dx) < wall.holeScale * 0.5;
                if (match.typeMatch && match.rotationMatch && positionOk) {
                    // Perfect fit!
                    state.saturation = Math.min(1, state.saturation + 0.15);
                    state.streak++;
                    state.score += 300 * state.streak;
                    this.successfulPasses++;
                }
                else if (match.typeMatch && positionOk) {
                    // Right shape, wrong rotation
                    state.saturation = Math.max(0, state.saturation - 0.1);
                    state.streak = 0;
                }
                else if (match.typeMatch) {
                    // Right shape, wrong position
                    state.saturation = Math.max(0, state.saturation - 0.15);
                    state.streak = 0;
                }
                else {
                    // Wrong shape - collision!
                    state.saturation = Math.max(0, state.saturation - 0.25);
                    state.streak = 0;
                }
            }
            // Remove if off screen
            return wall.y < CANVAS_HEIGHT + 100;
        });
    }
    render(ctx, state) {
        // Background
        drawVignette(ctx, 0.3);
        // Draw grid lines for depth perception
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const y = (i / 10) * CANVAS_HEIGHT;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
        // Draw walls (approaching from top)
        for (const wall of this.walls) {
            const wallHeight = 60;
            const alpha = Math.min(1, (CANVAS_HEIGHT - wall.y) / CANVAS_HEIGHT);
            // Wall background (solid)
            ctx.fillStyle = `rgba(30, 30, 50, ${alpha * 0.9})`;
            ctx.fillRect(0, wall.y - wallHeight / 2, CANVAS_WIDTH, wallHeight);
            // Wall borders
            ctx.strokeStyle = `rgba(0, 255, 249, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(0, wall.y - wallHeight / 2, CANVAS_WIDTH, wallHeight);
            // Draw hole outline (what shape player needs to be)
            ctx.save();
            ctx.globalAlpha = alpha;
            // Hole glow
            ctx.shadowColor = '#00fff9';
            ctx.shadowBlur = 20;
            drawShape(ctx, wall.holeType, CENTER_X, wall.y, wall.holeScale, wall.holeRotation, '#00fff9', false, 3);
            // Inner glow
            ctx.shadowBlur = 0;
            ctx.globalAlpha = alpha * 0.3;
            drawShape(ctx, wall.holeType, CENTER_X, wall.y, wall.holeScale * 0.8, wall.holeRotation, '#00fff9', true);
            ctx.restore();
            // Shape hint text
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(0, 255, 249, ${alpha * 0.7})`;
            ctx.fillText(wall.holeType.toUpperCase(), CENTER_X, wall.y - wall.holeScale - 15);
        }
        // Draw player shape
        const playerY = state.position[1];
        // Player glow
        drawGlow(ctx, state.position[0], playerY, this.playerScale * 1.5, COLORS[state.color].hex, state.saturation);
        // Player shape
        ctx.shadowColor = COLORS[state.color].hex;
        ctx.shadowBlur = 15 * state.saturation;
        drawShape(ctx, this.playerShape, state.position[0], playerY, this.playerScale, this.playerRotation, COLORS[state.color].hex, true, 3);
        ctx.shadowBlur = 0;
        // Shape outline (thicker)
        drawShape(ctx, this.playerShape, state.position[0], playerY, this.playerScale, this.playerRotation, '#fff', false, 2);
        // UI - Current shape indicator
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillText(`SHAPE: ${this.playerShape.toUpperCase()}`, 20, 30);
        // Progress
        drawGlowText(ctx, `PASSES: ${this.successfulPasses}/10`, CENTER_X, 30, '#fff', 20, 5);
        // Controls hint
        drawGlowText(ctx, `[←→] move  [Q/E] morph  [A/D] rotate`, CENTER_X, CANVAS_HEIGHT - 15, '#888', 12, 3);
        // Screen effects
        drawScanlines(ctx, 0.03);
        // Excess state effects
        if (state.excessState === 'redshift') {
            applyRedShift(ctx, 0.5);
        }
        else if (state.excessState === 'blackhole') {
            applyBlackHole(ctx, 0.5);
        }
    }
    checkAscension(state) {
        return this.successfulPasses >= 10;
    }
    checkDeath(state) {
        return state.saturation <= 0;
    }
    spawnWall() {
        const shapes = ['circle', 'square', 'triangle'];
        const holeType = shapes[Math.floor(Math.random() * shapes.length)];
        // Random rotation (snapped to symmetry points for fairness)
        let holeRotation = 0;
        switch (holeType) {
            case 'square':
                holeRotation = (Math.floor(Math.random() * 4) * Math.PI) / 2;
                break;
            case 'triangle':
                holeRotation = (Math.floor(Math.random() * 3) * Math.PI * 2) / 3;
                break;
            case 'circle':
                holeRotation = 0; // Circle doesn't need rotation
                break;
        }
        return {
            id: Math.random().toString(36),
            y: -50,
            holeType,
            holeRotation,
            holeScale: 50 + Math.random() * 20, // Slightly variable hole sizes
            passed: false,
        };
    }
    spawnEntities() {
        return []; // Using walls array instead
    }
}
// =============================================================================
// DIMENSION 3: THE TUMBLE - With Input Smoothing
// =============================================================================
export class Dim3Tumble {
    constructor() {
        this.config = DIMENSION_CONFIGS[3];
        this.distance = 0;
        this.spawnTimer = 0;
        this.successfulPasses = 0;
        // Input smoothing state
        this.targetVelX = 0;
        this.targetVelY = 0;
        this.targetRotVel = 0;
    }
    init(state) {
        state.position = [CENTER_X, CENTER_Y];
        state.velocity = [0, 0];
        state.rotation = [0];
        state.entities = [];
        this.distance = 0;
        this.spawnTimer = 0;
        this.successfulPasses = 0;
        this.targetVelX = 0;
        this.targetVelY = 0;
        this.targetRotVel = 0;
    }
    update(state, input, dt) {
        // Movement with momentum (LERP smoothing)
        const maxSpeed = 350;
        const accel = 12; // Higher = snappier response
        const friction = 8; // Deceleration when no input
        // Calculate target velocities from input
        this.targetVelX = 0;
        this.targetVelY = 0;
        if (input.left)
            this.targetVelX = -maxSpeed;
        if (input.right)
            this.targetVelX = maxSpeed;
        if (input.up)
            this.targetVelY = -maxSpeed;
        if (input.down)
            this.targetVelY = maxSpeed;
        // LERP current velocity towards target
        const lerpFactor = 1 - Math.exp(-accel * dt);
        const frictionFactor = 1 - Math.exp(-friction * dt);
        if (this.targetVelX !== 0) {
            state.velocity[0] += (this.targetVelX - state.velocity[0]) * lerpFactor;
        }
        else {
            state.velocity[0] *= (1 - frictionFactor);
        }
        if (this.targetVelY !== 0) {
            state.velocity[1] += (this.targetVelY - state.velocity[1]) * lerpFactor;
        }
        else {
            state.velocity[1] *= (1 - frictionFactor);
        }
        // Apply velocity to position
        state.position[0] += state.velocity[0] * dt;
        state.position[1] += state.velocity[1] * dt;
        // Rotation with momentum
        const maxRotSpeed = 5;
        const rotAccel = 10;
        const rotFriction = 6;
        this.targetRotVel = 0;
        if (input.rotateLeft)
            this.targetRotVel = -maxRotSpeed;
        if (input.rotateRight)
            this.targetRotVel = maxRotSpeed;
        const rotLerp = 1 - Math.exp(-rotAccel * dt);
        const rotFric = 1 - Math.exp(-rotFriction * dt);
        if (this.targetRotVel !== 0) {
            // Smooth acceleration towards target rotation speed
            const currentRotVel = state.velocity[2] || 0;
            state.velocity[2] = currentRotVel + (this.targetRotVel - currentRotVel) * rotLerp;
        }
        else {
            // Friction when no input
            state.velocity[2] = (state.velocity[2] || 0) * (1 - rotFric);
        }
        state.rotation[0] += (state.velocity[2] || 0) * dt;
        // Color cycling handled by main.ts (single-press detection)
        // Clamp
        state.position[0] = Math.max(50, Math.min(CANVAS_WIDTH - 50, state.position[0]));
        state.position[1] = Math.max(50, Math.min(CANVAS_HEIGHT - 50, state.position[1]));
        this.distance += 200 * dt;
        // Spawn obstacles
        this.spawnTimer += dt;
        if (this.spawnTimer >= 1.2) {
            this.spawnTimer = 0;
            state.entities.push(...this.spawnEntities());
        }
        // Update and check collisions
        state.entities = state.entities.filter(entity => {
            // Move towards player (Z depth simulation)
            entity.position[2] -= 350 * dt;
            // Behind camera - remove
            if (entity.position[2] < -100)
                return false;
            // Collision check when passing player Z-plane
            if (entity.position[2] < 60 && entity.position[2] > -60) {
                const dx = entity.position[0] - state.position[0];
                const dy = entity.position[1] - state.position[1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 70) {
                    // Black = death
                    if (entity.color === 'black') {
                        state.saturation = 0;
                        return false;
                    }
                    // Check rotation alignment (within ~30 degrees)
                    const playerRot = ((state.rotation[0] % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                    const entityRot = entity.rotation?.[0] || 0;
                    const rotDiff = Math.abs(playerRot - entityRot);
                    const rotAligned = rotDiff < 0.5 || rotDiff > (Math.PI * 2 - 0.5);
                    // Check color match
                    const colorResult = checkMatch(state.color, entity.color);
                    if (rotAligned && (colorResult === 'perfect' || colorResult === 'white')) {
                        // Perfect pass
                        state.saturation = Math.min(1, state.saturation + 0.08);
                        state.streak++;
                        state.score += 300 * state.streak;
                        this.successfulPasses++;
                    }
                    else if (colorResult === 'perfect' || colorResult === 'white') {
                        // Right color, wrong rotation
                        state.saturation = Math.max(0, state.saturation - 0.1);
                        state.streak = 0;
                    }
                    else {
                        // Wrong color
                        state.saturation = Math.max(0, state.saturation - 0.15);
                        state.streak = 0;
                    }
                    return false;
                }
            }
            return true;
        });
    }
    render(ctx, state) {
        // 3D tunnel effect using renderer
        drawTunnel(ctx, this.distance, '#1a1a2e');
        drawVignette(ctx, 0.4);
        // Draw entities (sorted by depth - far first)
        const sortedEntities = [...state.entities].sort((a, b) => b.position[2] - a.position[2]);
        for (const entity of sortedEntities) {
            const proj = project3D(entity.position[0] - CENTER_X, entity.position[1] - CENTER_Y, entity.position[2]);
            if (proj.visible) {
                ctx.save();
                ctx.translate(proj.x, proj.y);
                ctx.rotate(entity.rotation?.[0] || 0);
                const size = 40 * proj.scale;
                if (state.renderMode === 'flat') {
                    const symbol = entity.color === 'black' ? '■' : '▲';
                    ctx.font = `bold ${Math.max(12, size)}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = COLORS[entity.color].hex;
                    ctx.shadowColor = COLORS[entity.color].hex;
                    ctx.shadowBlur = 8;
                    ctx.fillText(symbol, 0, 0);
                }
                else {
                    // Draw rotated triangle obstacle
                    ctx.strokeStyle = COLORS[entity.color].hex;
                    ctx.fillStyle = COLORS[entity.color].hex + '40';
                    ctx.lineWidth = 3 * proj.scale;
                    ctx.shadowColor = COLORS[entity.color].hex;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(0, -size);
                    ctx.lineTo(size * 0.866, size * 0.5);
                    ctx.lineTo(-size * 0.866, size * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        }
        // Player (rotated triangle) with Flattening support
        ctx.save();
        ctx.translate(state.position[0], state.position[1]);
        ctx.rotate(state.rotation[0]);
        if (state.renderMode === 'flat') {
            // Flat mode: ASCII triangle
            ctx.font = 'bold 40px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = COLORS[state.color].hex;
            ctx.shadowColor = COLORS[state.color].hex;
            ctx.shadowBlur = 10;
            ctx.fillText('Δ', 0, 0);
            ctx.shadowBlur = 0;
        }
        else {
            // Geometric mode: neon triangle
            ctx.fillStyle = COLORS[state.color].hex;
            ctx.shadowColor = COLORS[state.color].hex;
            ctx.shadowBlur = 15 * state.saturation;
            ctx.beginPath();
            ctx.moveTo(0, -25);
            ctx.lineTo(20, 20);
            ctx.lineTo(-20, 20);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        // Glow around player
        drawGlow(ctx, state.position[0], state.position[1], 35, COLORS[state.color].hex, state.saturation);
        // UI
        drawGlowText(ctx, `PASSES: ${this.successfulPasses}/15`, CENTER_X, 30, '#fff', 20, 5);
        drawGlowText(ctx, `[←→↑↓] move  [A/D] rotate  [Q/E] color`, CENTER_X, CANVAS_HEIGHT - 10, '#888', 14, 3);
        // Screen effects
        drawScanlines(ctx, 0.05);
        // Excess state effects
        if (state.excessState === 'redshift') {
            applyRedShift(ctx, 0.6);
        }
        else if (state.excessState === 'blackhole') {
            applyBlackHole(ctx, 0.6);
        }
    }
    checkAscension(state) {
        return this.successfulPasses >= 15;
    }
    checkDeath(state) {
        return state.saturation <= 0;
    }
    spawnEntities() {
        const isBlack = Math.random() < 0.1;
        const isWhite = !isBlack && Math.random() < 0.15;
        // Random rotation (0, 90, 180, 270 degrees)
        const targetRot = Math.floor(Math.random() * 4) * (Math.PI / 2);
        return [{
                id: Math.random().toString(36),
                color: isBlack ? 'black' : isWhite ? 'white' : randomColor(),
                position: [
                    CENTER_X + (Math.random() - 0.5) * 300,
                    CENTER_Y + (Math.random() - 0.5) * 200,
                    1200 // Start far in tunnel
                ],
                velocity: [0, 0, -350],
                rotation: [targetRot],
                size: 40,
            }];
    }
}
// =============================================================================
// DIMENSION 4: THE HYPER-TUNNEL (Skeleton)
// =============================================================================
export class Dim4HyperTunnel {
    constructor() {
        this.config = DIMENSION_CONFIGS[4];
        this.spawnTimer = 0;
        this.successfulPhases = 0;
    }
    init(state) {
        state.position = [CENTER_X, CENTER_Y, 0];
        state.velocity = [0, 0, 0];
        state.rotation = [0, 0, 0];
        state.scale = 1.0;
        state.entities = [];
        this.spawnTimer = 0;
        this.successfulPhases = 0;
    }
    update(state, input, dt) {
        // Expansion (left hand) - faster response
        if (input.expand)
            state.scale = Math.min(2.5, state.scale + 1.5 * dt);
        if (input.contract)
            state.scale = Math.max(0.2, state.scale - 1.5 * dt);
        // Rotation (right hand)
        const rotSpeed = 2;
        if (input.left)
            state.rotation[0] -= rotSpeed * dt;
        if (input.right)
            state.rotation[0] += rotSpeed * dt;
        if (input.up)
            state.rotation[1] -= rotSpeed * dt;
        if (input.down)
            state.rotation[1] += rotSpeed * dt;
        // Color cycling handled by main.ts (single-press detection)
        // Spawn rings
        this.spawnTimer += dt;
        if (this.spawnTimer >= 1.8) {
            this.spawnTimer = 0;
            state.entities.push(...this.spawnEntities());
        }
        // Update rings and check collisions
        state.entities = state.entities.filter(entity => {
            // Move towards player
            entity.position[2] -= 280 * dt;
            // Ring expands/contracts as it approaches (stored in velocity[0])
            entity.size += entity.velocity[0] * dt;
            // Behind player - remove
            if (entity.position[2] < -50)
                return false;
            // Collision at Z-plane crossing
            if (entity.position[2] < 40 && entity.position[2] > -40) {
                // Black ring = death
                if (entity.color === 'black') {
                    state.saturation = 0;
                    return false;
                }
                // Check scale matching (player size vs ring size)
                const playerSize = 80 * state.scale;
                const sizeDiff = Math.abs(entity.size - playerSize);
                // Check color
                const colorResult = checkMatch(state.color, entity.color);
                // Allow ~25px margin
                if (sizeDiff < 35 && (colorResult === 'perfect' || colorResult === 'white')) {
                    // Perfect phase through
                    state.saturation = Math.min(1, state.saturation + 0.1);
                    state.streak++;
                    state.score += 400 * state.streak;
                    this.successfulPhases++;
                }
                else if (sizeDiff < 35) {
                    // Right size, wrong color
                    state.saturation = Math.max(0, state.saturation - 0.1);
                    state.streak = 0;
                }
                else {
                    // Wrong size
                    state.saturation = Math.max(0, state.saturation - 0.15);
                    state.streak = 0;
                }
                return false;
            }
            return true;
        });
    }
    render(ctx, state) {
        // Background
        drawTunnel(ctx, 0, '#1a1a2e');
        drawVignette(ctx, 0.5);
        // Draw incoming rings (sorted by depth)
        const sortedEntities = [...state.entities].sort((a, b) => b.position[2] - a.position[2]);
        for (const entity of sortedEntities) {
            const proj = project3D(0, 0, entity.position[2]);
            if (proj.visible) {
                const ringSize = entity.size * proj.scale;
                // Draw ring
                ctx.beginPath();
                ctx.strokeStyle = COLORS[entity.color].hex;
                ctx.lineWidth = 6 * proj.scale;
                ctx.shadowColor = COLORS[entity.color].hex;
                ctx.shadowBlur = 15;
                ctx.arc(CENTER_X, CENTER_Y, ringSize, 0, Math.PI * 2);
                ctx.stroke();
                // Inner glow
                ctx.beginPath();
                ctx.strokeStyle = COLORS[entity.color].hex + '40';
                ctx.lineWidth = 12 * proj.scale;
                ctx.arc(CENTER_X, CENTER_Y, ringSize, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        const size = 80 * state.scale;
        if (state.renderMode === 'flat') {
            // FLAT MODE: ASCII tesseract representation
            ctx.font = `bold ${size / 2}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = COLORS[state.color].hex;
            ctx.shadowColor = COLORS[state.color].hex;
            ctx.shadowBlur = 10;
            // Nested ASCII boxes
            ctx.save();
            ctx.translate(CENTER_X, CENTER_Y);
            ctx.rotate(state.rotation[0]);
            ctx.fillText('#', 0, 0);
            ctx.font = `bold ${size / 4}px monospace`;
            ctx.rotate(state.rotation[1]);
            ctx.fillText('[ ]', 0, 0);
            ctx.restore();
            ctx.shadowBlur = 0;
        }
        else {
            // GEOMETRIC MODE: Proper 4D tesseract with projection
            ctx.save();
            ctx.translate(CENTER_X, CENTER_Y);
            // Define 4D tesseract vertices
            const vertices4D = [];
            for (let i = 0; i < 16; i++) {
                const x = (i & 1) ? 1 : -1;
                const y = (i & 2) ? 1 : -1;
                const z = (i & 4) ? 1 : -1;
                const w = (i & 8) ? 1 : -1;
                vertices4D.push([x, y, z, w]);
            }
            // Apply rotations
            const cos0 = Math.cos(state.rotation[0]);
            const sin0 = Math.sin(state.rotation[0]);
            const cos1 = Math.cos(state.rotation[1]);
            const sin1 = Math.sin(state.rotation[1]);
            // Project to 2D
            const projected = [];
            for (const [x, y, z, w] of vertices4D) {
                // Rotate in XW plane
                const x1 = x * cos0 - w * sin0;
                const w1 = x * sin0 + w * cos0;
                // Rotate in YZ plane
                const y1 = y * cos1 - z * sin1;
                const z1 = y * sin1 + z * cos1;
                const proj = project4D(x1 * state.scale, y1 * state.scale, z1 * state.scale, w1 * state.scale);
                projected.push({ x: proj.x - CENTER_X, y: proj.y - CENTER_Y, scale: proj.scale });
            }
            // Draw edges with glow
            ctx.strokeStyle = COLORS[state.color].hex;
            ctx.shadowColor = COLORS[state.color].hex;
            ctx.shadowBlur = 15 * state.saturation;
            ctx.lineWidth = 2;
            // Edges of tesseract (inner and outer cubes + connections)
            const edges = [
                [0, 1], [1, 3], [3, 2], [2, 0], // bottom face of inner cube
                [4, 5], [5, 7], [7, 6], [6, 4], // top face of inner cube
                [0, 4], [1, 5], [2, 6], [3, 7], // vertical edges of inner cube
                [8, 9], [9, 11], [11, 10], [10, 8], // bottom face of outer cube
                [12, 13], [13, 15], [15, 14], [14, 12], // top face of outer cube
                [8, 12], [9, 13], [10, 14], [11, 15], // vertical edges of outer cube
                [0, 8], [1, 9], [2, 10], [3, 11], // connections between cubes
                [4, 12], [5, 13], [6, 14], [7, 15],
            ];
            ctx.beginPath();
            for (const [a, b] of edges) {
                ctx.moveTo(projected[a].x, projected[a].y);
                ctx.lineTo(projected[b].x, projected[b].y);
            }
            ctx.stroke();
            // Draw vertices
            for (const p of projected) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        // Center glow
        drawGlow(ctx, CENTER_X, CENTER_Y, size, COLORS[state.color].hex, state.saturation);
        // UI - show target scale indicator
        drawGlowText(ctx, `PHASES: ${this.successfulPhases}/12`, CENTER_X, 30, '#fff', 16, 5);
        drawGlowText(ctx, `Scale: ${state.scale.toFixed(2)}`, CENTER_X, 55, '#aaa', 14, 3);
        drawGlowText(ctx, `[W/S] expand/contract  [Q/E] color`, CENTER_X, CANVAS_HEIGHT - 10, '#888', 14, 3);
        // Screen effects
        drawScanlines(ctx, 0.05);
        // Excess state effects
        if (state.excessState === 'redshift') {
            applyRedShift(ctx, 0.7);
        }
        else if (state.excessState === 'blackhole') {
            applyBlackHole(ctx, 0.7);
        }
    }
    checkAscension(state) {
        return this.successfulPhases >= 12;
    }
    checkDeath(state) {
        return state.saturation <= 0;
    }
    spawnEntities() {
        const isBlack = Math.random() < 0.08;
        const isWhite = !isBlack && Math.random() < 0.15;
        // Target size when it reaches player (random between small, medium, large)
        const targetSize = 40 + Math.random() * 140; // 40-180
        const travelTime = 1200 / 280; // distance / speed
        // Growth rate: some rings grow, some shrink
        const growthRate = (Math.random() - 0.5) * 50;
        const startSize = targetSize - (growthRate * travelTime);
        return [{
                id: Math.random().toString(36),
                color: isBlack ? 'black' : isWhite ? 'white' : randomColor(),
                position: [CENTER_X, CENTER_Y, 1200],
                velocity: [growthRate, 0, -280], // velocity[0] = growth rate
                rotation: [0],
                size: Math.max(20, startSize),
            }];
    }
}
export class Dim5Cloud {
    constructor() {
        this.config = DIMENSION_CONFIGS[5];
        this.clouds = [];
        this.spawnTimer = 0;
        this.successfulMerges = 0;
    }
    init(state) {
        state.position = [CENTER_X, CENTER_Y, 0];
        state.velocity = [0, 0, 0];
        state.rotation = [0, 0, 0];
        state.scale = 1.0;
        state.density = 0.5;
        state.symbol = 'point';
        state.entities = [];
        this.clouds = [];
        this.spawnTimer = 0;
        this.successfulMerges = 0;
    }
    update(state, input, dt) {
        // Density control (Shift keys)
        const densitySpeed = 1.2;
        if (input.densityUp)
            state.density = Math.min(1, state.density + densitySpeed * dt);
        if (input.densityDown)
            state.density = Math.max(0, state.density - densitySpeed * dt);
        // Scale control (W/S)
        if (input.expand)
            state.scale = Math.min(2, state.scale + dt);
        if (input.contract)
            state.scale = Math.max(0.3, state.scale - dt);
        // Rotation (aesthetic, helps visualize)
        if (input.left)
            state.rotation[0] -= 2 * dt;
        if (input.right)
            state.rotation[0] += 2 * dt;
        // Spawn clouds
        this.spawnTimer += dt;
        if (this.spawnTimer >= 2.0) {
            this.spawnTimer = 0;
            this.clouds.push(this.spawnCloud());
        }
        // Update clouds (approach player)
        const cloudSpeed = 250;
        this.clouds = this.clouds.filter(cloud => {
            cloud.z -= cloudSpeed * dt;
            // Check collision when cloud reaches player plane
            if (cloud.z < 50 && cloud.z > -50) {
                // Check density match (within 0.15 tolerance)
                const densityMatch = Math.abs(state.density - cloud.targetDensity) < 0.15;
                // Check color match
                const colorResult = checkMatch(state.color, cloud.color);
                const colorMatch = colorResult === 'perfect' || colorResult === 'white';
                // Black clouds = death
                if (cloud.color === 'black') {
                    state.saturation = 0;
                    return false;
                }
                if (densityMatch && colorMatch) {
                    // Perfect merge!
                    state.saturation = Math.min(1, state.saturation + 0.12);
                    state.streak++;
                    state.score += 500 * state.streak;
                    this.successfulMerges++;
                }
                else if (densityMatch) {
                    // Right density, wrong color
                    state.saturation = Math.max(0, state.saturation - 0.08);
                    state.streak = 0;
                }
                else if (colorMatch) {
                    // Right color, wrong density
                    state.saturation = Math.max(0, state.saturation - 0.1);
                    state.streak = 0;
                }
                else {
                    // Both wrong
                    state.saturation = Math.max(0, state.saturation - 0.18);
                    state.streak = 0;
                }
                return false;
            }
            // Remove if behind player
            return cloud.z > -100;
        });
    }
    render(ctx, state) {
        // Background
        drawVignette(ctx, 0.6);
        // Draw incoming clouds (sorted by depth - far first)
        const sortedClouds = [...this.clouds].sort((a, b) => b.z - a.z);
        for (const cloud of sortedClouds) {
            const proj = project3D(cloud.x - CENTER_X, cloud.y - CENTER_Y, cloud.z);
            if (!proj.visible)
                continue;
            const cloudSize = cloud.size * proj.scale;
            const numPoints = Math.floor(15 + cloud.targetDensity * 40);
            ctx.save();
            ctx.translate(proj.x, proj.y);
            // Draw cloud particles
            ctx.fillStyle = COLORS[cloud.color].hex;
            ctx.shadowColor = COLORS[cloud.color].hex;
            ctx.shadowBlur = 8;
            ctx.globalAlpha = 0.4 + cloud.targetDensity * 0.5;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const r = cloudSize * (0.3 + Math.sin(i * 1.3 + Date.now() * 0.001) * 0.3);
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                const psize = 2 + cloud.targetDensity * 3;
                ctx.beginPath();
                ctx.arc(px, py, psize * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            }
            // Density indicator ring
            ctx.strokeStyle = COLORS[cloud.color].hex;
            ctx.lineWidth = 2 * proj.scale;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, cloudSize * cloud.targetDensity, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // Draw player cloud
        const playerSpread = 100 * state.scale;
        const playerPoints = Math.floor(20 + state.density * 60);
        ctx.save();
        ctx.translate(CENTER_X, CENTER_Y);
        ctx.rotate(state.rotation[0]);
        ctx.fillStyle = COLORS[state.color].hex;
        ctx.shadowColor = COLORS[state.color].hex;
        ctx.shadowBlur = 15 * state.saturation;
        for (let i = 0; i < playerPoints; i++) {
            const angle = (i / playerPoints) * Math.PI * 2 + state.rotation[0] * 0.5;
            const phase = Math.sin(i * 0.7 + Date.now() * 0.002);
            const r = playerSpread * (0.3 + (phase * 0.5 + 0.5) * 0.7);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const size = 3 + state.density * 5 + phase * 2;
            ctx.globalAlpha = 0.4 + state.density * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // Player density ring
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, playerSpread * state.density, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        // Center glow
        drawGlow(ctx, CENTER_X, CENTER_Y, playerSpread * 0.5, COLORS[state.color].hex, state.saturation * state.density);
        // UI
        drawGlowText(ctx, `MERGES: ${this.successfulMerges}/10`, CENTER_X, 30, '#fff', 20, 5);
        // Density bar
        const barWidth = 150;
        const barHeight = 12;
        const barX = CENTER_X - barWidth / 2;
        const barY = 55;
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = COLORS[state.color].hex;
        ctx.shadowColor = COLORS[state.color].hex;
        ctx.shadowBlur = 8;
        ctx.fillRect(barX, barY, barWidth * state.density, barHeight);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.fillText(`DENSITY: ${(state.density * 100).toFixed(0)}%`, CENTER_X, barY + barHeight + 12);
        drawGlowText(ctx, `[Shift L/R] density  [Q/E] color  [W/S] scale`, CENTER_X, CANVAS_HEIGHT - 10, '#888', 12, 3);
        // Screen effects
        drawScanlines(ctx, 0.05);
        // Excess state effects
        if (state.excessState === 'redshift') {
            applyRedShift(ctx, 0.8);
        }
        else if (state.excessState === 'blackhole') {
            applyBlackHole(ctx, 0.8);
        }
    }
    checkAscension(state) {
        return this.successfulMerges >= 10;
    }
    checkDeath(state) {
        return state.saturation <= 0;
    }
    spawnCloud() {
        const isBlack = Math.random() < 0.08;
        const isWhite = !isBlack && Math.random() < 0.12;
        return {
            id: Math.random().toString(36),
            x: CENTER_X + (Math.random() - 0.5) * 200,
            y: CENTER_Y + (Math.random() - 0.5) * 150,
            z: 1000,
            color: isBlack ? 'black' : isWhite ? 'white' : randomColor(),
            targetDensity: 0.2 + Math.random() * 0.6, // 0.2 - 0.8
            size: 60 + Math.random() * 40,
        };
    }
    spawnEntities() {
        return [];
    }
}
// =============================================================================
// DIMENSION INFINITE: THE STILLNESS
// =============================================================================
export class DimInfinite {
    constructor() {
        this.config = DIMENSION_CONFIGS['infinite'];
    }
    init(state) {
        state.position = [];
        state.velocity = [];
        state.rotation = [];
        state.entities = [];
    }
    update(state, input, dt) {
        // Stillness handled by main game loop
    }
    render(ctx, state) {
        // Pure white expanding from center based on stillness timer
        const progress = Math.min(1, state.stillnessTimer / 7);
        const radius = progress * Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
        // Heavy vignette fading to light
        drawVignette(ctx, Math.max(0, 0.8 - progress * 0.8));
        // Flattening transition effect - world collapsing to code then rebuilding
        if (progress > 0.3 && progress < 0.7) {
            drawFlattenTransition(ctx, (progress - 0.3) / 0.4, 'flatten');
        }
        else if (progress >= 0.7) {
            drawFlattenTransition(ctx, 1 - (progress - 0.7) / 0.3, 'unflatten');
        }
        // White light expanding from center
        const gradient = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${progress})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${progress * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Message - fades as progress increases
        if (progress < 0.5) {
            const alpha = 1 - progress * 2;
            ctx.font = '24px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20 * alpha;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText('let go', CENTER_X, CENTER_Y);
            ctx.shadowBlur = 0;
        }
        // At the end - show rebirth message
        if (progress > 0.9) {
            const alpha = (progress - 0.9) * 10;
            ctx.font = '16px monospace';
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillText('0D', CENTER_X, CENTER_Y + 40);
        }
    }
    checkAscension(state) {
        return false; // Rebirth handled elsewhere
    }
    checkDeath(state) {
        return false;
    }
    spawnEntities() {
        return [];
    }
}
// =============================================================================
// FACTORY
// =============================================================================
export function createDimension(level) {
    switch (level) {
        case 0: return new Dim0Pulse();
        case 1: return new Dim1Collision();
        case 2: return new Dim2Weaver();
        case 3: return new Dim3Tumble();
        case 4: return new Dim4HyperTunnel();
        case 5: return new Dim5Cloud();
        case 'infinite': return new DimInfinite();
        default: return new Dim0Pulse();
    }
}
//# sourceMappingURL=dimensions.js.map