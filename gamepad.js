/*!
 * gamepad.js v0.0.4-alpha
 * https://github.com/neogeek/gamepad.js
 *
 * Copyright (c) 2014 Scott Doxey
 * Released under the MIT license.
 */

(function () {

    'use strict';

    var _requestAnimationFrame,
        _cancelAnimationFrame;

    if (String(typeof window) !== 'undefined') {

        ['webkit', 'moz'].forEach(function (key) {
            _requestAnimationFrame = _requestAnimationFrame || window.requestAnimationFrame || window[key + 'RequestAnimationFrame'] || null;
            _cancelAnimationFrame = _cancelAnimationFrame || window.cancelAnimationFrame || window[key + 'CancelAnimationFrame'] || null;
        });

    }

    function findKeyMapping(index, mapping) {

        var result;

        Object.keys(mapping).forEach(function (key) {

            if (mapping[key] === index) {

                result = key;

            } else if (Array.isArray(mapping[key]) && mapping[key].indexOf(index) !== -1) {

                result = key;

            }

        });

        return result;

    }

    function Gamepad() {

        this._events = {
            gamepad: [],
            keyboard: {}
        };

        this._handlers = {
            gamepad: {
                connect: null,
                disconnect: null
            }
        };

        this._keyMapping = {
            gamepad: {
                'button_1': 0,
                'button_2': 1,
                'button_3': 2,
                'button_4': 3,
                'shoulder_top_left': 4,
                'shoulder_top_right': 5,
                'shoulder_bottom_left': 6,
                'shoulder_bottom_right': 7,
                'select': 8,
                'start': 9,
                'stick_button_left': 10,
                'stick_button_right': 11,
                'd_pad_up': 12,
                'd_pad_down': 13,
                'd_pad_left': 14,
                'd_pad_right': 15,
                'vendor': 16
            },
            keyboard: {
                'button_1': 32,
                'start': 27,
                'd_pad_up': [38, 87],
                'd_pad_down': [40, 83],
                'd_pad_left': [37, 65],
                'd_pad_right': [39, 68]
            }
        };

        this._listeners = [];

        this._handleKeyboardEventListener = this._handleKeyboardEventListener.bind(this);

        this.resume();

    }

    Gamepad.prototype._handleGamepadConnected = function (index) {

        if (this._handlers.gamepad.connect) {

            this._handlers.gamepad.connect({ index: index });

        }

    };

    Gamepad.prototype._handleGamepadDisconnected = function (index) {

        if (this._handlers.gamepad.disconnect) {

            this._handlers.gamepad.disconnect({ index: index });

        }

    };

    Gamepad.prototype._handleGamepadEventListener = function (controller) {

        var self = this;

        if (controller && controller.connected) {

            controller.buttons.forEach(function (button, index) {

                var key = findKeyMapping(index, self._keyMapping.gamepad);

                if (key) {

                    if (button.pressed) {

                        if (!self._events.gamepad[controller.index][key]) {

                            self._events.gamepad[controller.index][key] = {
                                pressed: true,
                                hold: false,
                                released: false,
                                player: controller.index
                            };

                        }

                        self._events.gamepad[controller.index][key].value = button.value;

                    } else if (!button.pressed && self._events.gamepad[controller.index][key]) {

                        self._events.gamepad[controller.index][key].released = true;
                        self._events.gamepad[controller.index][key].hold = false;

                    }

                }

            });

        }

    };

    Gamepad.prototype._handleKeyboardEventListener = function (e) {

        var key = findKeyMapping(e.keyCode, this._keyMapping.keyboard);

        if (key) {

            if (e.type === 'keydown' && !this._events.keyboard[key]) {

                this._events.keyboard[key] = {
                    pressed: true,
                    hold: false,
                    released: false
                };

            } else if (e.type === 'keyup' && this._events.keyboard[key]) {

                this._events.keyboard[key].released = true;
                this._events.keyboard[key].hold = false;

            }

        }

    };

    Gamepad.prototype._handleEvent = function (key, events, player) {

        if (events[key].pressed) {

            this.trigger('press', key, events[key].value, player);

            events[key].pressed = false;
            events[key].hold = true;

        } else if (events[key].hold) {

            this.trigger('hold', key, events[key].value, player);

        } else if (events[key].released) {

            this.trigger('release', key, events[key].value, player);

            delete events[key];

        }

    };

    Gamepad.prototype._loop = function () {

        var self = this,
            gamepads = window.navigator.getGamepads(),
            length = 4, // length = gamepads.length;
            i;

        for (i = 0; i < length; i = i + 1) {

            if (gamepads[i]) {

                if (!self._events.gamepad[i]) {

                    self._handleGamepadConnected(i);

                    self._events.gamepad[i] = {};

                }

                self._handleGamepadEventListener(gamepads[i]);

            } else if (self._events.gamepad[i]) {

                self._handleGamepadDisconnected(i);

                self._events.gamepad[i] = null;

            }

        }

        Object.keys(self._events.keyboard).forEach(function (key) {

            self._handleEvent(key, self._events.keyboard, 'keyboard');

        });

        self._events.gamepad.forEach(function (gamepad, player) {

            if (gamepad) {

                Object.keys(gamepad).forEach(function (key) {

                    self._handleEvent(key, gamepad, player);

                });

            }

        });

        if (self._requestAnimation) {

            self._requestAnimation = _requestAnimationFrame(self._loop.bind(self));

        }

    };

    Gamepad.prototype.on = function (type, button, callback, options) {

        if (Object.keys(this._handlers.gamepad).indexOf(type) !== -1 && typeof button === 'function') {

            this._handlers.gamepad[type] = button;

            this._events.gamepad = [];

        } else {

            this._listeners.push({
                type: type,
                button: button,
                callback: callback,
                options: options
            });

        }

    };

    Gamepad.prototype.setCustomMapping = function (device, config) {

        if (this._keyMapping[device] !== undefined) {

            this._keyMapping[device] = config;

        } else {

            throw new Error('The device "' + device + '" is not supported through gamepad.js');

        }

    };

    Gamepad.prototype.trigger = function (type, button, value, player) {

        if (this._listeners) {

            this._listeners.forEach(function (listener) {

                if (listener.type === type && listener.button === button) {

                    listener.callback({
                        type: listener.type,
                        button: listener.button,
                        value: value,
                        player: player,
                        event: listener
                    });

                }

            });

        }

    };

    Gamepad.prototype.pause = function () {

        _cancelAnimationFrame(this._requestAnimation);

        this._requestAnimation = null;

        document.removeEventListener('keydown', this._handleKeyboardEventListener);
        document.removeEventListener('keyup', this._handleKeyboardEventListener);

    };

    Gamepad.prototype.resume = function () {

        this._requestAnimation = _requestAnimationFrame(this._loop.bind(this));

        document.addEventListener('keydown', this._handleKeyboardEventListener);
        document.addEventListener('keyup', this._handleKeyboardEventListener);

    };

    Gamepad.prototype.destroy = function () {

        this.pause();

        delete this._listeners;

    };

    if (typeof define === 'function' && define.amd !== undefined) {

        define([], function () { return Gamepad; });

    } else if (typeof module === 'object' && module.exports !== undefined) {

        module.exports = Gamepad;

    } else {

        window.Gamepad = Gamepad;

    }

}());
