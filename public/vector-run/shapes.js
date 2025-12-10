/**
 * Vector Run: Shape Geometry System
 *
 * Defines 2D shapes as polygons for the shape-fitting mechanic.
 * Handles shape morphing, rotation, and collision detection.
 */
// Shape order for morphing (cycle through)
export const SHAPE_ORDER = ['circle', 'square', 'triangle'];
// =============================================================================
// SHAPE VERTICES (unit size, centered at origin)
// =============================================================================
/**
 * Get vertices for a shape type at unit scale.
 * Circle is approximated as 16-gon for collision.
 */
export function getShapeVertices(type, scale = 1) {
    const s = scale;
    switch (type) {
        case 'circle':
            // Approximate circle with 16 vertices
            const circleVerts = [];
            for (let i = 0; i < 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                circleVerts.push({
                    x: Math.cos(angle) * s,
                    y: Math.sin(angle) * s
                });
            }
            return circleVerts;
        case 'square':
            return [
                { x: -s, y: -s },
                { x: s, y: -s },
                { x: s, y: s },
                { x: -s, y: s }
            ];
        case 'triangle':
            // Equilateral triangle pointing up
            const h = s * Math.sqrt(3) / 2;
            return [
                { x: 0, y: -s }, // top
                { x: s * 0.866, y: s * 0.5 }, // bottom right
                { x: -s * 0.866, y: s * 0.5 } // bottom left
            ];
        case 'diamond':
            return [
                { x: 0, y: -s * 1.2 }, // top
                { x: s, y: 0 }, // right
                { x: 0, y: s * 1.2 }, // bottom
                { x: -s, y: 0 } // left
            ];
        case 'star':
            // 5-pointed star
            const starVerts = [];
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                const r = i % 2 === 0 ? s : s * 0.4;
                starVerts.push({
                    x: Math.cos(angle) * r,
                    y: Math.sin(angle) * r
                });
            }
            return starVerts;
        default:
            return getShapeVertices('circle', scale);
    }
}
/**
 * Get rotated and translated vertices
 */
export function getTransformedVertices(type, x, y, scale, rotation) {
    const verts = getShapeVertices(type, scale);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return verts.map(v => ({
        x: x + v.x * cos - v.y * sin,
        y: y + v.x * sin + v.y * cos
    }));
}
// =============================================================================
// SHAPE MORPHING
// =============================================================================
export function cycleShape(current, direction) {
    const idx = SHAPE_ORDER.indexOf(current);
    if (idx === -1)
        return 'circle';
    const newIdx = (idx + direction + SHAPE_ORDER.length) % SHAPE_ORDER.length;
    return SHAPE_ORDER[newIdx];
}
// =============================================================================
// COLLISION DETECTION
// =============================================================================
/**
 * Check if a point is inside a convex polygon
 */
function pointInPolygon(px, py, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}
/**
 * Check if two convex polygons overlap using Separating Axis Theorem
 */
function polygonsOverlap(poly1, poly2) {
    const polygons = [poly1, poly2];
    for (const polygon of polygons) {
        for (let i = 0; i < polygon.length; i++) {
            const j = (i + 1) % polygon.length;
            // Get edge normal (perpendicular)
            const nx = polygon[j].y - polygon[i].y;
            const ny = polygon[i].x - polygon[j].x;
            const len = Math.sqrt(nx * nx + ny * ny);
            const ax = nx / len;
            const ay = ny / len;
            // Project both polygons onto axis
            let min1 = Infinity, max1 = -Infinity;
            let min2 = Infinity, max2 = -Infinity;
            for (const p of poly1) {
                const proj = p.x * ax + p.y * ay;
                min1 = Math.min(min1, proj);
                max1 = Math.max(max1, proj);
            }
            for (const p of poly2) {
                const proj = p.x * ax + p.y * ay;
                min2 = Math.min(min2, proj);
                max2 = Math.max(max2, proj);
            }
            // Check for gap
            if (max1 < min2 || max2 < min1) {
                return false; // Separating axis found
            }
        }
    }
    return true; // No separating axis, polygons overlap
}
/**
 * Check if player shape fits through hole.
 * Returns true if shape fits (good), false if collision (bad).
 *
 * The "wall" is a rectangle with a hole cut out.
 * We check if the player shape collides with the wall (not the hole).
 */
export function shapeFitsHole(playerType, playerX, playerY, playerScale, playerRotation, holeType, holeX, holeY, holeScale, holeRotation, tolerance = 0.2 // How much margin for error (0-1)
) {
    // Get player vertices
    const playerVerts = getTransformedVertices(playerType, playerX, playerY, playerScale, playerRotation);
    // Get hole vertices (slightly larger than player should be for tolerance)
    const effectiveHoleScale = holeScale * (1 + tolerance);
    const holeVerts = getTransformedVertices(holeType, holeX, holeY, effectiveHoleScale, holeRotation);
    // For circle vs circle, use simple distance check
    if (playerType === 'circle' && holeType === 'circle') {
        const dx = playerX - holeX;
        const dy = playerY - holeY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const fits = dist + playerScale <= effectiveHoleScale;
        const overlap = fits ? 0 : (dist + playerScale - effectiveHoleScale) / playerScale;
        return { fits, overlap: Math.max(0, overlap) };
    }
    // Check if player is fully inside hole
    // For shape matching: player must fit inside hole outline
    let allInside = true;
    let maxDist = 0;
    for (const pv of playerVerts) {
        if (!pointInPolygon(pv.x, pv.y, holeVerts)) {
            allInside = false;
            // Calculate how far outside
            const centerDx = pv.x - holeX;
            const centerDy = pv.y - holeY;
            const distFromCenter = Math.sqrt(centerDx * centerDx + centerDy * centerDy);
            maxDist = Math.max(maxDist, distFromCenter - effectiveHoleScale);
        }
    }
    // Shape type matching bonus/penalty
    const typeMatch = playerType === holeType;
    if (allInside && typeMatch) {
        return { fits: true, overlap: 0 };
    }
    else if (allInside && !typeMatch) {
        // Inside but wrong shape - partial fit
        return { fits: false, overlap: 0.5 };
    }
    else {
        // Outside - collision
        return { fits: false, overlap: Math.min(1, maxDist / playerScale) };
    }
}
/**
 * Simplified check: does shape type and rotation approximately match?
 */
export function shapeMatches(playerType, playerRotation, holeType, holeRotation, rotationTolerance = 0.3 // ~17 degrees
) {
    const typeMatch = playerType === holeType;
    // Normalize rotations to 0-2PI
    const normalizeAngle = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let p = normalizeAngle(playerRotation);
    let h = normalizeAngle(holeRotation);
    // Account for shape symmetry
    let symmetry = 1;
    switch (playerType) {
        case 'circle':
            symmetry = 16;
            break; // Effectively any rotation
        case 'square':
            symmetry = 4;
            break; // 90 degree symmetry
        case 'triangle':
            symmetry = 3;
            break; // 120 degree symmetry
        case 'diamond':
            symmetry = 2;
            break; // 180 degree symmetry
        case 'star':
            symmetry = 5;
            break; // 72 degree symmetry
    }
    const symmetryAngle = (Math.PI * 2) / symmetry;
    // Find closest matching rotation considering symmetry
    let minDiff = Math.PI;
    for (let i = 0; i < symmetry; i++) {
        const rotatedPlayer = normalizeAngle(p + i * symmetryAngle);
        let diff = Math.abs(rotatedPlayer - h);
        if (diff > Math.PI)
            diff = Math.PI * 2 - diff;
        minDiff = Math.min(minDiff, diff);
    }
    const rotationMatch = minDiff < rotationTolerance;
    return { typeMatch, rotationMatch, rotationDiff: minDiff };
}
// =============================================================================
// RENDERING HELPERS
// =============================================================================
/**
 * Draw a shape outline
 */
export function drawShape(ctx, type, x, y, scale, rotation, color, fill = false, lineWidth = 3) {
    const verts = getTransformedVertices(type, x, y, scale, rotation);
    ctx.beginPath();
    if (type === 'circle') {
        ctx.arc(x, y, scale, 0, Math.PI * 2);
    }
    else {
        ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) {
            ctx.lineTo(verts[i].x, verts[i].y);
        }
        ctx.closePath();
    }
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}
/**
 * Draw a wall with a shape cutout (hole)
 */
export function drawWallWithHole(ctx, wallX, wallY, wallWidth, wallHeight, holeType, holeX, holeY, holeScale, holeRotation, wallColor, holeColor) {
    // Draw wall as rectangle with hole cut out using composite operations
    ctx.save();
    // Draw wall
    ctx.fillStyle = wallColor;
    ctx.fillRect(wallX - wallWidth / 2, wallY - wallHeight / 2, wallWidth, wallHeight);
    // Cut out hole using destination-out
    ctx.globalCompositeOperation = 'destination-out';
    drawShape(ctx, holeType, holeX, holeY, holeScale, holeRotation, '#fff', true);
    ctx.restore();
    // Draw hole outline
    ctx.shadowColor = holeColor;
    ctx.shadowBlur = 15;
    drawShape(ctx, holeType, holeX, holeY, holeScale, holeRotation, holeColor, false, 4);
    ctx.shadowBlur = 0;
}
//# sourceMappingURL=shapes.js.map