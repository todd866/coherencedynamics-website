/**
 * Vector Run: Touch Controls
 *
 * Maps on-screen virtual buttons to the game Input interface.
 * Currently just color cycling - will expand as mechanics are added.
 */
export class TouchControls {
    constructor(inputObject) {
        this.container = null;
        this.input = inputObject;
    }
    attach() {
        this.container = document.getElementById('touch-controls');
        if (!this.container)
            return;
        // COLOR BUTTON (cycles color forward)
        const colorBtn = document.getElementById('color-btn');
        if (colorBtn) {
            colorBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input.cycleNext = true;
            }, { passive: false });
            colorBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.cycleNext = false;
            }, { passive: false });
        }
        // Color cycle left button
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
    }
    /**
     * Update UI visibility based on current dimension
     * Currently no-op since we only have color buttons
     */
    updateLayout(dim) {
        // Will add dimension-specific controls as mechanics are implemented
    }
}
//# sourceMappingURL=touch.js.map