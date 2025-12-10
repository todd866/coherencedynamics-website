/**
 * Telemetry client - sends game state to local server
 */
const TELEMETRY_URL = 'ws://localhost:9999';
const STATE_INTERVAL = 500; // Send state every 500ms
class Telemetry {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.lastStateSent = 0;
    }
    connect() {
        try {
            this.ws = new WebSocket(TELEMETRY_URL);
            this.ws.onopen = () => {
                this.connected = true;
                console.log('[Telemetry] Connected');
            };
            this.ws.onclose = () => {
                this.connected = false;
                console.log('[Telemetry] Disconnected');
                // Retry in 2 seconds
                setTimeout(() => this.connect(), 2000);
            };
            this.ws.onerror = () => {
                // Silent fail - telemetry is optional
            };
        }
        catch (e) {
            // Silent fail
        }
    }
    sendState(state) {
        if (!this.connected || !this.ws)
            return;
        const now = Date.now();
        if (now - this.lastStateSent < STATE_INTERVAL)
            return;
        this.lastStateSent = now;
        try {
            this.ws.send(JSON.stringify({
                type: 'state',
                state: {
                    dimension: state.dimension,
                    color: state.color,
                    saturation: state.saturation,
                    energy: state.energy,
                    score: state.score,
                    streak: state.streak,
                    excessState: state.excessState,
                    renderMode: state.renderMode,
                    position: state.position,
                    entityCount: state.entities.length,
                }
            }));
        }
        catch (e) { }
    }
    sendInput(key, action) {
        if (!this.connected || !this.ws)
            return;
        try {
            this.ws.send(JSON.stringify({
                type: 'input',
                key,
                action
            }));
        }
        catch (e) { }
    }
    sendEvent(event) {
        if (!this.connected || !this.ws)
            return;
        try {
            this.ws.send(JSON.stringify({
                type: 'event',
                event
            }));
        }
        catch (e) { }
    }
    sendError(message, stack) {
        if (!this.connected || !this.ws)
            return;
        try {
            this.ws.send(JSON.stringify({
                type: 'error',
                message,
                stack
            }));
        }
        catch (e) { }
    }
}
export const telemetry = new Telemetry();
//# sourceMappingURL=telemetry.js.map