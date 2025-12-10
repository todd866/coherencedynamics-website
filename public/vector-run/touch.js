/**
 * Vector Run: Touch Controls
 *
 * Maps on-screen virtual buttons to the game Input interface.
 */
export class TouchControls {
    constructor(inputObject) {
        this.container = null;
        // Joystick state
        this.stickOrigin = null;
        this.stickTouchId = null;
        this.input = inputObject;
    }
    attach() {
        this.container = document.getElementById('touch-controls');
        if (!this.container)
            return;
        // 1. LEFT STICK (Movement)
        const stick = document.getElementById('stick-zone');
        if (stick) {
            stick.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                this.stickTouchId = touch.identifier;
                this.stickOrigin = { x: touch.clientX, y: touch.clientY };
                stick.style.borderColor = '#00fff9';
            }, { passive: false });
            stick.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (this.stickTouchId === null || !this.stickOrigin)
                    return;
                // Find our touch
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.stickTouchId) {
                        const touch = e.changedTouches[i];
                        const dx = touch.clientX - this.stickOrigin.x;
                        const dy = touch.clientY - this.stickOrigin.y;
                        // Threshold for direction (20px deadzone)
                        this.input.right = dx > 20;
                        this.input.left = dx < -20;
                        this.input.down = dy > 20;
                        this.input.up = dy < -20;
                        break;
                    }
                }
            }, { passive: false });
            const endStick = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.stickTouchId) {
                        this.stickTouchId = null;
                        this.stickOrigin = null;
                        this.input.left = false;
                        this.input.right = false;
                        this.input.up = false;
                        this.input.down = false;
                        stick.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                }
            };
            stick.addEventListener('touchend', endStick, { passive: false });
            stick.addEventListener('touchcancel', endStick, { passive: false });
        }
        // 2. COLOR BUTTON (Primary Action - cycles color, also acts as phase/start)
        const colorBtn = document.getElementById('color-btn');
        if (colorBtn) {
            colorBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input.cycleNext = true;
                this.input.phase = true;
            }, { passive: false });
            colorBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.cycleNext = false;
                this.input.phase = false;
            }, { passive: false });
        }
        // 3. Color cycle left button
        const colorLeftBtn = document.getElementById('color-left-btn');
        if (colorLeftBtn) {
            colorLeftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input.cyclePrev = true;
            }, { passive: false });
            colorLeftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.cyclePrev = false;
            }, { passive: false });
        }
        // 4. CONTEXT BUTTONS
        this.bindBtn('rot-l', 'rotateLeft');
        this.bindBtn('rot-r', 'rotateRight');
        // Expand button
        const expBtn = document.getElementById('exp-btn');
        if (expBtn) {
            expBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input.expand = true;
            }, { passive: false });
            expBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.expand = false;
            }, { passive: false });
        }
        // Contract button
        const conBtn = document.getElementById('con-btn');
        if (conBtn) {
            conBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input.contract = true;
            }, { passive: false });
            conBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.contract = false;
            }, { passive: false });
        }
    }
    bindBtn(id, key) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input[key] = true;
            }, { passive: false });
            el.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input[key] = false;
            }, { passive: false });
        }
    }
    /**
     * Update UI visibility based on current dimension
     */
    updateLayout(dim) {
        if (!this.container)
            return;
        const rotL = document.getElementById('rot-l');
        const rotR = document.getElementById('rot-r');
        const expBtn = document.getElementById('exp-btn');
        const conBtn = document.getElementById('con-btn');
        const stick = document.getElementById('stick-zone');
        const colorLeftBtn = document.getElementById('color-left-btn');
        // Defaults - hide everything except color button
        if (stick)
            stick.style.display = 'none';
        if (rotL)
            rotL.style.display = 'none';
        if (rotR)
            rotR.style.display = 'none';
        if (expBtn)
            expBtn.style.display = 'none';
        if (conBtn)
            conBtn.style.display = 'none';
        if (colorLeftBtn)
            colorLeftBtn.style.display = 'flex';
        // Show movement joystick for 2D+
        if (typeof dim === 'number' && dim >= 2) {
            if (stick)
                stick.style.display = 'flex';
        }
        // Show rotation buttons for 3D+
        if (typeof dim === 'number' && dim >= 3) {
            if (rotL)
                rotL.style.display = 'flex';
            if (rotR)
                rotR.style.display = 'flex';
        }
        // Show expansion/contraction for 4D+
        if (typeof dim === 'number' && dim >= 4) {
            if (expBtn)
                expBtn.style.display = 'flex';
            if (conBtn)
                conBtn.style.display = 'flex';
        }
        // Hide everything for infinite dimension (stillness)
        if (dim === 'infinite') {
            if (stick)
                stick.style.display = 'none';
            if (rotL)
                rotL.style.display = 'none';
            if (rotR)
                rotR.style.display = 'none';
            if (expBtn)
                expBtn.style.display = 'none';
            if (conBtn)
                conBtn.style.display = 'none';
            if (colorLeftBtn)
                colorLeftBtn.style.display = 'none';
        }
    }
}
//# sourceMappingURL=touch.js.map