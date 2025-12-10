/**
 * Vector Run: Touch Controls
 *
 * Maps on-screen virtual buttons to the game Input interface.
 * Controls visibility based on current dimension level.
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
        // JOYSTICK (Movement for 2D+)
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
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.stickTouchId) {
                        const touch = e.changedTouches[i];
                        const dx = touch.clientX - this.stickOrigin.x;
                        const dy = touch.clientY - this.stickOrigin.y;
                        // 20px deadzone
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
                        stick.style.borderColor = 'rgba(0, 255, 249, 0.3)';
                    }
                }
            };
            stick.addEventListener('touchend', endStick, { passive: false });
            stick.addEventListener('touchcancel', endStick, { passive: false });
        }
        // COLOR BUTTONS
        this.bindBtn('color-btn', 'cycleNext');
        this.bindBtn('color-left-btn', 'cyclePrev');
        // ROTATION BUTTONS (3D+)
        this.bindBtn('rot-l', 'rotateLeft');
        this.bindBtn('rot-r', 'rotateRight');
        // EXPANSION BUTTONS (4D+)
        this.bindBtn('exp-btn', 'expand');
        this.bindBtn('con-btn', 'contract');
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
        const stick = document.getElementById('stick-zone');
        const rotL = document.getElementById('rot-l');
        const rotR = document.getElementById('rot-r');
        const expBtn = document.getElementById('exp-btn');
        const conBtn = document.getElementById('con-btn');
        // Hide all advanced controls by default
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
        // Show expansion buttons for 4D+
        if (typeof dim === 'number' && dim >= 4) {
            if (expBtn)
                expBtn.style.display = 'flex';
            if (conBtn)
                conBtn.style.display = 'flex';
        }
    }
}
//# sourceMappingURL=touch.js.map