/*!
 * gamepad.js v0.0.3-alpha
 * https://github.com/neogeek/gamepad.js
 *
 * Copyright (c) 2014 Scott Doxey
 * Released under the MIT license
 */

(function () {

    'use strict';

    function Gamepad() {

        this._listeners = [];

        this._activeKeys = [];
        this._activeInputs = {
            gamepad: [],
            keyboard: []
        };

        this._keyMapping = {
            gamepad: {
                'standard': {
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
                }
            },
            keyboard: {
                'button_1': 32,
                'start': 27,
                'd_pad_up': 38,
                'd_pad_down': 40,
                'd_pad_left': 37,
                'd_pad_right': 39
            }
        };

        document.addEventListener('keydown', this._handleEventListener.bind(this));
        document.addEventListener('keyup', this._handleEventListener.bind(this));

        window.requestAnimationFrame(this._loop.bind(this));

    }

    Gamepad.prototype._handleGamepad = function (controller, player) {

        var self = this,
            keys = self._keyMapping.gamepad[controller.mapping];

        if (self._activeInputs.gamepad[player] === undefined) {

            self._activeInputs.gamepad[player] = {};

        }

        this._listeners.forEach(function (listener) {

            var button = controller.buttons[keys[listener.button]];

            if (!button.pressed || self._activeInputs.gamepad[player][keys[listener.button]] === undefined) {

                self._activeInputs.gamepad[player][keys[listener.button]] = {};

            } else {

                self._handleListener(listener, self._activeInputs.gamepad[player][keys[listener.button]], {
                    button: listener.button,
                    player: player,
                    event: button
                });

            }

        });

    };

    Gamepad.prototype._handleKeyboard = function () {

        var self = this,
            keys = self._keyMapping.keyboard;

        this._listeners.forEach(function (listener) {

            var button = keys[listener.button];

            if (self._activeKeys.indexOf(button) === -1 || self._activeInputs.keyboard[button] === undefined) {

                self._activeInputs.keyboard[button] = {};

            } else {

                self._handleListener(listener, self._activeInputs.keyboard[button], {
                    button: listener.button,
                    player: 'keyboard',
                    event: {
                        keyCode: button
                    }
                });

            }

        });

    };

    Gamepad.prototype._handleEventListener = function (e) {

        if (e.type === 'keydown' && this._activeKeys.indexOf(e.keyCode) === -1) {

            this._activeKeys.push(e.keyCode);

        } else if (e.type === 'keyup' && this._activeKeys.indexOf(e.keyCode) !== -1) {

            this._activeKeys.splice(this._activeKeys.indexOf(e.keyCode), 1);

        }

    };

    Gamepad.prototype._handleListener = function (listener, data, e) {

        if (data.delay) {

            data.delay = data.delay - 1;

            return false;

        } else if (listener.options.delay) {

            data.delay = listener.options.delay;

        }

        if (data.triggered && listener.options.once) {

            return false;

        }

        data.triggered = true;

        listener.callback.call(this, e);

    };

    Gamepad.prototype._loop = function () {

        Array.prototype.slice.call(window.navigator.getGamepads()).forEach(this._handleGamepad.bind(this));

        this._handleKeyboard();

        window.requestAnimationFrame(this._loop.bind(this));

    };

    Gamepad.prototype.on = function (button, options, callback) {

        if (typeof options === 'function' && callback === undefined) {

            callback = options;

            options = {};

        }

        this._listeners.push({
            button: button,
            options: options,
            callback: callback
        });

    };

    Gamepad.prototype.off = function (button) {

        var self = this;

        self._listeners.forEach(function (listener) {

            if (listener.button === button) {

                self._listeners.splice(self._listeners.indexOf(listener), 1);

            }

        });

    };

    Gamepad.prototype.setCustomMapping = function (device, config) {

        if (this._keyMapping[device] !== undefined) {

            this._keyMapping[device] = config;

        } else {

            throw new Error('The device "' + device + '" is not supported through gamepad.js');

        }

    };

    if (typeof define === 'function' && define.amd !== undefined) {

        define([], Gamepad);

    } else if (typeof module === 'object' && module.exports !== undefined) {

        module.exports = Gamepad;

    } else {

        window.Gamepad = Gamepad;

    }

}());
