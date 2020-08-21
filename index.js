const Bowser = require('bowser');

const mappings = require('./mappings.json');

const _requestAnimation = new Set('_requestAnimation');
const _previousGamepadsState = new Set('_previousGamepadsState');

const browser = Bowser.getParser(window.navigator.userAgent);

const AXES_THRESHOLD = 0.3;

class Gamepad {
    [_requestAnimation] = null;

    [_previousGamepadsState] = null;

    listeners = [];

    start = () => {
        this._requestAnimation = window.requestAnimationFrame(this.tick);
    };

    stop = () => {
        window.cancelAnimationFrame(this._requestAnimation);
    };

    on = (type, id, callback) => {
        this.listeners[this.listeners.length] = { type, id, callback };
    };

    off = (type, id) => {
        this.listeners[this.listeners.length].splice(
            this.listeners.findIndex(
                listener => listener.type === type && listener.id === id
            ),
            1
        );
    };

    tick = () => {
        const gamepads = [].slice
            .call(window.navigator.getGamepads())
            .filter(gamepad => gamepad)
            .map(({ id, index, buttons, axes }) => {
                const mapping = mappings.find(
                    mapping =>
                        mapping.id === id &&
                        mapping.browser === browser.getBrowserName() &&
                        mapping.os === browser.getOSName()
                );

                if (!mapping) {
                    throw new Error(`${id} not supported by gamepad.js`);
                }

                return {
                    id,
                    index,
                    buttons: Object.keys(mapping.buttons).reduce((all, key) => {
                        return {
                            ...all,
                            [key]: buttons[mapping.buttons[key]]
                        };
                    }, {}),
                    axes,
                    mapping
                };
            });

        gamepads.map(gamepad => {
            const previousGamepadState = this._previousGamepadsState.find(
                ({ index }) => gamepad.index === index
            );

            this.listeners
                .filter(({ id }) => gamepad.buttons[id])
                .filter(({ type, id }) => {
                    switch (type) {
                        case 'pressed':
                            return (
                                gamepad.buttons[id].pressed &&
                                (!previousGamepadState ||
                                    !previousGamepadState.buttons[id].pressed)
                            );
                        case 'held':
                            return gamepad.buttons[id].pressed;
                        case 'released':
                            return (
                                !gamepad.buttons[id].pressed &&
                                previousGamepadState &&
                                previousGamepadState.buttons[id].pressed
                            );

                        default:
                            return false;
                    }
                })
                .map(({ callback, id }) =>
                    callback({
                        id,
                        gamepadIndex: gamepad.index,
                        value: gamepad.buttons[id].value
                    })
                );
        });

        gamepads.map(gamepad => {
            this.listeners
                .filter(({ type }) => type === 'axes')
                .filter(({ id }) => Math.abs(gamepad.axes[id]) > AXES_THRESHOLD)
                .map(({ callback, id }) =>
                    callback({
                        id,
                        gamepadIndex: gamepad.index,
                        value: gamepad.axes[id]
                    })
                );
        });

        this._previousGamepadsState = gamepads;

        this._requestAnimation = window.requestAnimationFrame(this.tick);
    };
}

module.exports = Gamepad;
