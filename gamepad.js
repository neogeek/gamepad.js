/*!
 * gamepad.js v0.0.2-alpha
 * https://github.com/neogeek/gamepad.js
 *
 * Copyright (c) 2014 Scott Doxey
 * Released under the MIT license
 */

(function () {

    'use strict';

    var keyMapping = {
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
    };

    function Gamepad() {

        this.listeners = [];

        this.activeButtons = [];
        this.activeControllers = [];

        window.requestAnimationFrame(this._loop.bind(this));

    }

    Gamepad.prototype._handleController = function (controller, player) {

        var keys = keyMapping[controller.mapping];

        this.listeners.forEach((function (listener) {

            if (controller.buttons[keys[listener.button]].pressed && typeof listener.callback === 'function') {

                if (!this.activeButtons[player][listener.button]) {

                    this.activeButtons[player][listener.button] = {};

                }

                if (!this.activeButtons[player][listener.button].delay && listener.options.delay) {

                    this.activeButtons[player][listener.button].delay = listener.options.delay;

                } else if (this.activeButtons[player][listener.button].delay) {

                    this.activeButtons[player][listener.button].delay = this.activeButtons[player][listener.button].delay - 1;

                    return false;

                }

                if (listener.options.once && this.activeButtons[player][listener.button].triggered) {

                    return false;

                }

                this.activeButtons[player][listener.button].triggered = true;

                listener.callback({
                    button: listener.button,
                    value: controller.buttons[keys[listener.button]].value,
                    player: player
                });

            } else if (this.activeButtons[player][listener.button]) {

                this.activeButtons[player][listener.button] = null;

            }

        }).bind(this));

    };

    Gamepad.prototype._loop = function () {

        var controllers = window.navigator.getGamepads(),
            i,
            length;

        this.activeControllers = [];

        for (i = 0, length = controllers.length; i < length; i = i + 1) {

            if (controllers[i] && controllers[i].connected) {

                if (!this.activeButtons[i]) {

                    this.activeButtons[i] = {};

                }

                this.activeControllers.push(controllers[i]);

            }

        }

        this.activeControllers.forEach(this._handleController.bind(this));

        window.requestAnimationFrame(this._loop.bind(this));

    };

    Gamepad.prototype.on = function (button, options, callback) {

        if (typeof options === 'function' && callback === undefined) {

            callback = options;

            options = {};

        }

        this.listeners.push({
            button: button,
            options: options,
            callback: callback
        });

    };

    Gamepad.prototype.off = function (button) {

        this.listeners.forEach(function (listener) {

            if (listener.button === button) {

                this.listeners.splice(this.listeners.indexOf(listener), 1);

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
