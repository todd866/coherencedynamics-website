/**
 * Vector Run: Main Entry Point
 *
 * Bootstraps the game engine and wires up DOM + audio.
 */
import { createGame, cycleColor } from './game.js';
import { AudioEngine } from './audio.js';
import { createDimension } from './dimensions.js';
import { telemetry } from './telemetry.js';
// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
    const canvas = document.getElementById('game');
    const overlay = document.getElementById('start-overlay');
    const startBtn = overlay?.querySelector('.start-btn');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    // Create game instance
    const game = createGame(canvas);
    // Register dimension handlers using factory
    const levels = [0, 1, 2, 3, 4, 5, 'infinite'];
    levels.forEach(level => {
        game.dimensions.set(level, createDimension(level));
    });
    // Initialize first dimension
    const initialDim = game.dimensions.get(0);
    if (initialDim) {
        initialDim.init(game.state);
    }
    // Create audio engine
    const audio = new AudioEngine();
    // Connect telemetry (optional - silently fails if server not running)
    telemetry.connect();
    // Wire audio and telemetry to game events
    game.onEvent((event) => {
        audio.handleEvent(event);
        telemetry.sendEvent(event);
        // Start/update drone on dimension change
        if (event.type === 'ascend' || event.type === 'drop') {
            const dim = typeof event.to === 'number' ? event.to : 5;
            audio.startDrone(dim);
        }
    });
    // HUD update function
    function updateHUD() {
        const dimEl = document.getElementById('dimension');
        const scoreEl = document.getElementById('score');
        const streakEl = document.getElementById('streak');
        const satEl = document.getElementById('saturation');
        if (dimEl) {
            dimEl.textContent = game.state.dimension === 'infinite'
                ? '∞D'
                : `${game.state.dimension}D`;
        }
        if (scoreEl) {
            scoreEl.textContent = game.state.score.toLocaleString();
        }
        if (streakEl) {
            streakEl.textContent = String(game.state.streak);
        }
        if (satEl) {
            const satPct = Math.floor(game.state.saturation * 100);
            satEl.textContent = `${satPct}%`;
            satEl.className = 'hud-value' + (satPct < 30 ? ' warning' : '');
        }
    }
    // Color cycling with audio feedback
    function handleColorCycle(direction) {
        const oldColor = game.state.color;
        game.state.color = cycleColor(game.state.color, direction);
        if (game.state.color !== oldColor) {
            audio.handleEvent({ type: 'colorCycle', color: game.state.color });
        }
    }
    // Additional keyboard handling for color cycling
    const keyDownOnce = {};
    document.addEventListener('keydown', (e) => {
        telemetry.sendInput(e.code, 'down');
        if (e.code === 'KeyE' && !keyDownOnce.KeyE) {
            handleColorCycle(1);
            keyDownOnce.KeyE = true;
        }
        if (e.code === 'KeyQ' && !keyDownOnce.KeyQ) {
            handleColorCycle(-1);
            keyDownOnce.KeyQ = true;
        }
    });
    document.addEventListener('keyup', (e) => {
        telemetry.sendInput(e.code, 'up');
        if (e.code === 'KeyE')
            keyDownOnce.KeyE = false;
        if (e.code === 'KeyQ')
            keyDownOnce.KeyQ = false;
    });
    // Start button handler
    function startGame() {
        audio.init();
        audio.startDrone(0);
        if (overlay) {
            overlay.style.display = 'none';
        }
        canvas.focus();
        game.start();
        // Start HUD update loop
        function hudLoop() {
            updateHUD();
            telemetry.sendState(game.state);
            requestAnimationFrame(hudLoop);
        }
        hudLoop();
    }
    // Wire start button
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                startGame();
            }
        });
    }
    // Allow spacebar to start
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && overlay && overlay.style.display !== 'none') {
            e.preventDefault();
            startGame();
        }
    });
}
// =============================================================================
// BOOTSTRAP
// =============================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
//# sourceMappingURL=main.js.map