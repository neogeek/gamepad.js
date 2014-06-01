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

    ['webkit', 'moz'].forEach(function (key) {
        _requestAnimationFrame = _requestAnimationFrame || window.requestAnimationFrame || window[key + 'RequestAnimationFrame'] || null;
        _cancelAnimationFrame = _cancelAnimationFrame || window.cancelAnimationFrame || window[key + 'CancelAnimationFrame'] || null;
    });

    function isArray(obj) {

        return Object.prototype.toString.call(obj) === '[object Array]' ? true : false;

    }

    function findKeyMapping(index, mapping) {

        var result;

        Object.keys(mapping).forEach(function (key) {

            if (mapping[key] === index) {

                result = key;

            } else if (isArray(mapping[key]) && mapping[key].indexOf(index) !== -1) {

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

        this._requestAnimation = _requestAnimationFrame(this._loop.bind(this));

        document.addEventListener('keydown', this._handleKeyboardEventListener.bind(this));
        document.addEventListener('keyup', this._handleKeyboardEventListener.bind(this));

    }

    Gamepad.prototype._handleGamepadEventListener = function (controller) {

        var self = this;

        if (controller.connected) {

            if (!self._events.gamepad[controller.index]) {

                self._events.gamepad[controller.index] = {};

            }

            controller.buttons.forEach(function (button, index) {

                var key = findKeyMapping(index, self._keyMapping.gamepad);

                if (key) {

                    if (button.pressed && !self._events.gamepad[controller.index][key]) {

                        self._events.gamepad[controller.index][key] = {
                            pressed: true,
                            hold: false,
                            released: false,
                            player: controller.index
                        };

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

            this.trigger('press', key, player);

            events[key].pressed = false;
            events[key].hold = true;

        } else if (events[key].hold) {

            this.trigger('hold', key, player);

        } else if (events[key].released) {

            this.trigger('release', key, player);

            delete events[key];

        }

    };

    Gamepad.prototype._loop = function () {

        var self = this;

        Array.prototype.slice.call(window.navigator.getGamepads()).forEach(self._handleGamepadEventListener.bind(self));

        Object.keys(self._events.keyboard).forEach(function (key) {

            self._handleEvent(key, self._events.keyboard, 'keyboard');

        });

        self._events.gamepad.forEach(function (gamepad, player) {

            Object.keys(gamepad).forEach(function (key) {

                self._handleEvent(key, gamepad, player);

            });

        });

        self._requestAnimation = _requestAnimationFrame(self._loop.bind(self));

    };

    Gamepad.prototype.on = function (type, button, callback, options) {

        this._listeners.push({
            type: type,
            button: button,
            callback: callback,
            options: options
        });

    };

    Gamepad.prototype.trigger = function (type, button, player) {

        this._listeners.forEach(function (listener) {

            if (listener.type === type && listener.button === button) {

                listener.callback({
                    type: listener.type,
                    button: listener.button,
                    player: player,
                    event: listener
                });

            }

        });

    };

    if (typeof define === 'function' && define.amd !== undefined) {

        define([], Gamepad);

    } else if (typeof module === 'object' && module.exports !== undefined) {

        module.exports = Gamepad;

    } else {

        window.Gamepad = Gamepad;

    }

}());
