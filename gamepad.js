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
            keyboard: {}
        };

        this._keyMapping = {
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

        document.addEventListener('keydown', this._handleEventListener.bind(this));
        document.addEventListener('keyup', this._handleEventListener.bind(this));

    }

    Gamepad.prototype._handleEventListener = function (e) {

        var key = findKeyMapping(e.keyCode, this._keyMapping.keyboard);

        if (key) {

            if (e.type === 'keydown' && !this._events.keyboard[key]) {

                this._events.keyboard[key] = {
                    pressed: true,
                    hold: false,
                    released: false
                };

            } else if (e.type === 'keyup') {

                this._events.keyboard[key].released = true;
                this._events.keyboard[key].hold = false;

            }

        }

    };

    Gamepad.prototype._handleKeyEvent = function (key) {

        if (this._events.keyboard[key].pressed) {

            this.trigger('press', key);

            this._events.keyboard[key].pressed = false;
            this._events.keyboard[key].hold = true;

        } else if (this._events.keyboard[key].hold) {

            this.trigger('hold', key);

        } else if (this._events.keyboard[key].released) {

            this.trigger('release', key);

            delete this._events.keyboard[key];

        }

    };

    Gamepad.prototype._loop = function () {

        Object.keys(this._events.keyboard).map(this._handleKeyEvent.bind(this));

        this._requestAnimation = _requestAnimationFrame(this._loop.bind(this));

    };

    Gamepad.prototype.on = function (type, button, callback, options) {

        this._listeners.push({
            type: type,
            button: button,
            callback: callback,
            options: options
        });

    };

    Gamepad.prototype.trigger = function (type, button) {

        this._listeners.forEach(function (listener) {

            if (listener.type === type && listener.button === button) {

                listener.callback(listener);

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
