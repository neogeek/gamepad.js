/*!
 * gamepad.js v0.0.5-alpha
 * https://github.com/neogeek/gamepad.js
 *
 * Copyright (c) 2017 Scott Doxey
 * Released under the MIT license.
 */
 /*!
  * This version of gamepad.js is modified by lazerbeak12345 for further compatibility. https://github.com/lazerbeak12345
  * It should now work on **all** PS3 and X-box style d-pads as well as PS4 style d-pads.
  */

 (function () {

    'use strict';

    var _requestAnimationFrame,
        _cancelAnimationFrame,
        hasGamepadSupport = window.navigator.getGamepads !== undefined;

    if (String(typeof window) !== 'undefined') {

        ['webkit', 'moz'].forEach(function (key) {
            _requestAnimationFrame = _requestAnimationFrame || window.requestAnimationFrame || window[key + 'RequestAnimationFrame'] || null;
            _cancelAnimationFrame = _cancelAnimationFrame || window.cancelAnimationFrame || window[key + 'CancelAnimationFrame'] || null;
        });

    }

    function findKeyMapping(index, mapping) {

        var results = [];

        Object.keys(mapping).forEach(function (key) {

            if (mapping[key] === index) {

                results.push(key);

            } else if (Array.isArray(mapping[key]) && mapping[key].indexOf(index) !== -1) {

                results.push(key);

            }

        });

        return results;

    }

    function Gamepad() {

        this._events = {
            gamepad: [],
            axes: [],
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
            axes: {
                'stick_axis_left': [0, 2],
                'stick_axis_right': [2, 4]
            },
            keyboard: {
                'button_1': 32,
                'start': 27,
                'd_pad_up': [ 38, 87 ],
                'd_pad_down': [ 40, 83 ],
                'd_pad_left': [ 37, 65 ],
                'd_pad_right': [ 39, 68 ]
            }
        };

        this._threshold = 0.3;

        this._listeners = [];

        this._handleKeyboardEventListener = this._handleKeyboardEventListener.bind(this);
		
		this._gpMetaData={
			/** There are three valid modes:
			 ** "standard" (0 or null)
			 ** 	- the behavior that gamepads are **supposed** to follow.
			 ** "xbox" (1)
			 ** 	- some gamepads map the d-pad as a pair of axes
			 ** "ps3" (2)
			 ** 	- ps3-like gamepads use the last axis to yeild a number value of the position of the gamepad. See the code for those values.
			 **/
			mode:[],
			dpadLast:[],
			dpadStart:[],
		}; 

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
		
		//Ignoring gamepads with vendor and id of 0000 here may improove things
        if (controller && controller.connected) { 

            controller.buttons.forEach(function (button, index) {
				
				var keys = findKeyMapping(
					//findKeyMapping(index,self._gpMetaData.mapping[controller.index])-0,//first map to this, then the next
					index,
					self._keyMapping.gamepad);
                
                if (keys) {
				
                    keys.forEach(function (key) {
						
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

                    });

                }

            });

        }

    };

    Gamepad.prototype._handleGamepadAxisEventListener = function (controller) {

        var self = this; 

        if (controller && controller.connected) {

            Object.keys(self._keyMapping.axes).forEach(function (key) {
				
				var axes=(self._gpMetaData.mode[controller.index]===2)?
					(key==="stick_axis_right"?
					([controller.axes[5],controller.axes[2]*-1])://strange, right? Why 5&2 instead of 2&3? But this is how the right axis on PS3 controllers are. This alone is one reason why I couldn't have just made a mapping modification. Array.slice selects a range of items, and 5&2 are not next to one another.
					([controller.axes[0],controller.axes[1]*-1])):
					(Array.prototype.slice.apply(controller.axes, self._keyMapping.axes[key]));//Do what was done before in all other cases.
               
                if (Math.abs(axes[0]) > self._threshold || Math.abs(axes[1]) > self._threshold) {
					
					self._events.axes[controller.index][key] = {
                        pressed: self._events.axes[controller.index][key] ? false : true,
                        hold: self._events.axes[controller.index][key] ? true : false,
                        released: false,
                        value: axes
                    };

                } else if (self._events.axes[controller.index][key]) {

                    self._events.axes[controller.index][key] = {
                        pressed: false,
                        hold: false,
                        released: true,
                        value: axes
                    };

                }

            });
			
			var a =controller.axes[controller.axes.length-1];
			
			if (self._gpMetaData.mode[controller.index]===2) {
				switch(a) {//here's the magic of ps3 controllers that everyone else just couldn't figure out
					case self._gpMetaData.dpadStart[controller.index]:break;
					case 1:
						self.trigger("hold","d_pad_left",a,controller.index);
						self.trigger("hold","d_pad_up",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_left",1,controller.index);
							self.trigger("press","d_pad_up",1,controller.index);
						}
						break;
					case 0.7142857313156128:
						self.trigger("hold","d_pad_left",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_left",1,controller.index);
						}
						break;
					case 0.4285714626312256:
						self.trigger("hold","d_pad_left",a,controller.index);
						self.trigger("hold","d_pad_down",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_left",1,controller.index);
							self.trigger("press","d_pad_down",1,controller.index);
						}
						break;
					case 0.14285719394683838:
						self.trigger("hold","d_pad_down",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_down",1,controller.index);
						}
						break;
					case -0.1428571343421936:
						self.trigger("hold","d_pad_right",a,controller.index);
						self.trigger("hold","d_pad_down",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_right",1,controller.index);
							self.trigger("press","d_pad_down",1,controller.index);
						}
						break;
					case -0.4285714030265808:
						self.trigger("hold","d_pad_right",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_right",1,controller.index);
						}
						break;
					case -0.7142857313156128:
						self.trigger("hold","d_pad_right",a,controller.index);
						self.trigger("hold","d_pad_up",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_right",1,controller.index);
							self.trigger("press","d_pad_up",1,controller.index);
						}
						break;
					case -1:
						self.trigger("hold","d_pad_up",a,controller.index);
						if (self._gpMetaData.dpadLast[controller.index]!==a) {
							self.trigger("press","d_pad_up",1,controller.index);
						}
						break;
					default:
						console.warn("D-pad state:",a,"unknown!");
				}
				if (self._gpMetaData.dpadLast[controller.index]!==a) {//last doesn't equal first
					switch(self._gpMetaData.dpadLast[controller.index]) {//here's the magic of ps3 controllers that everyone else just couldn't figure out
						case self._gpMetaData.dpadStart[controller.index]:break;
						case 1:
							self.trigger("release","d_pad_left",1,controller.index);
							self.trigger("release","d_pad_up",1,controller.index);
							break;
						case 0.7142857313156128:
							self.trigger("release","d_pad_left",1,controller.index);
							break;
						case 0.4285714626312256:
							self.trigger("release","d_pad_left",1,controller.index);
							self.trigger("release","d_pad_down",1,controller.index);
							break;
						case 0.14285719394683838:
							self.trigger("release","d_pad_down",1,controller.index);
							break;
						case -0.1428571343421936:
							self.trigger("release","d_pad_right",1,controller.index);
							self.trigger("release","d_pad_down",1,controller.index);
							break;
						case -0.4285714030265808:
							self.trigger("release","d_pad_right",1,controller.index);
							break;
						case -0.7142857313156128:
							self.trigger("release","d_pad_right",1,controller.index);
							self.trigger("release","d_pad_up",1,controller.index);
							break;
						case -1:
							self.trigger("release","d_pad_up",1,controller.index);
							break;
						default:
							console.warn("D-pad state:",a,"unknown!");
					}
				}
				self._gpMetaData.dpadLast[controller.index]=a;
			}else if (self._gpMetaData.mode[controller.index]===1){
				var b=controller.axes[controller.axes.length-2],j=(a+b)/2,
					isArPress=self._gpMetaData.dpadLast[0]<=self._threshold,
					isALPress=self._gpMetaData.dpadLast[1]>=self._threshold;
				if (Math.abs(b)<self._threshold) {
				}else if (b<self._threshold) {
					self.trigger("hold","d_pad_left",j,controller.index);
					if (isAlPress) self.trigger("press","d_pad_left",j,controller.index);
				}else if (b>self._threshold) {
					self.trigger("hold","d_pad_right",j,controller.index);
					if (isAlPress) self.trigger("press","d_pad_right",j,controller.index);
				}
				if (Math.abs(a)<self._threshold) {
				}else if (a<self._threshold) {
					self.trigger("hold","d_pad_up",j,controller.index);
					if (isArPress) self.trigger("press","d_pad_up",j,controller.index);
				}else if (a>self._threshold) {
					self.trigger("hold","d_pad_down",j,controller.index);
					if (isArPress) self.trigger("press","d_pad_down",j,controller.index);
				}
				self._gpMetaData.dpadLast[controller.index]=[a,b];
			}
        }

    };

    Gamepad.prototype._handleKeyboardEventListener = function (e) {

        var self = this,
            keys = findKeyMapping(e.keyCode, self._keyMapping.keyboard);

        if (keys) {

            keys.forEach(function (key) {

                if (e.type === 'keydown' && !self._events.keyboard[key]) {

                    self._events.keyboard[key] = {
                        pressed: true,
                        hold: false,
                        released: false
                    };

                } else if (e.type === 'keyup' && self._events.keyboard[key]) {

                    self._events.keyboard[key].released = true;
                    self._events.keyboard[key].hold = false;

                }

            });

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
            gamepads = hasGamepadSupport ? window.navigator.getGamepads() : false,
            length = 4, // length = gamepads.length;
            i;

        if (gamepads) {

            for (i = 0; i < length; i = i + 1) {

                if (gamepads[i]) {

                    if (!self._events.gamepad[i]) {

                        self._handleGamepadConnected(i);

						//console.log(gamepads[i]);

                        self._events.gamepad[i] = {};
                        self._events.axes[i] = {};

						self._gpMetaData.mode[i]=0;

						//Here, we determine if the gamepad needs to be handled specially or not.
						if (gamepads[i].axes[gamepads[i].axes.length-1]<-1||gamepads[i].axes[gamepads[i].axes.length-1]>1) {
							//The last axe is outside of range; this is a common symptopm of a PS3 controller.
							//This last axe is the effective d-pad
							self._gpMetaData.mode[i]=2;
							self._gpMetaData.dpadLast[i]=gamepads[i].axes[gamepads[i].axes.length-1]-0;
							self._gpMetaData.dpadStart[i]=gamepads[i].axes[gamepads[i].axes.length-1]-0;
						}else if (gamepads[i].buttons.length<16) {
							//console.warn("x-box-like controllers not very well tested: only hold events will be triggered");
							self._gpMetaData.mode[i]=1;
						}

                    }

                    self._handleGamepadEventListener(gamepads[i]);
                    self._handleGamepadAxisEventListener(gamepads[i]);

                } else if (self._events.gamepad[i]) {

                    self._handleGamepadDisconnected(i);

                    self._events.gamepad[i] = null;
                    self._events.axes[i] = null;

                }

            }

            self._events.gamepad.forEach(function (gamepad, player) {

                if (gamepad) {

                    Object.keys(gamepad).forEach(function (key) {

                        self._handleEvent(key, gamepad, player);

                    });

                }

            });

            self._events.axes.forEach(function (gamepad, player) {

                if (gamepad) {

                    Object.keys(gamepad).forEach(function (key) {

                        self._handleEvent(key, gamepad, player);

                    });

                }

            });

        }

        Object.keys(self._events.keyboard).forEach(function (key) {

            self._handleEvent(key, self._events.keyboard, 'keyboard');

        });

        if (self._requestAnimation) {

            self._requestAnimation = _requestAnimationFrame(self._loop.bind(self));

        }

    };

    Gamepad.prototype.on = function (type, button, callback, options) {

        var self = this;

        if (Object.keys(this._handlers.gamepad).indexOf(type) !== -1 && typeof button === 'function') {

            this._handlers.gamepad[type] = button;

            this._events.gamepad = [];

        } else {

            if (typeof type === "string" && type.match(/\s+/)) {

                type = type.split(/\s+/g);

            }

            if (typeof button === "string" && button.match(/\s+/)) {

                button = button.split(/\s+/g);

            }

            if (Array.isArray(type)) {

                type.forEach(function (type) {

                    self.on(type, button, callback, options);

                });

            } else if (Array.isArray(button)) {

                button.forEach(function (button) {

                    self.on(type, button, callback, options);

                });

            } else {

                this._listeners.push({
                    type: type,
                    button: button,
                    callback: callback,
                    options: options
                });

            }

        }

    };

    Gamepad.prototype.off = function (type, button) {

        var self = this;

        if (typeof type === "string" && type.match(/\s+/)) {

            type = type.split(/\s+/g);

        }

        if (typeof button === "string" && button.match(/\s+/)) {

            button = button.split(/\s+/g);

        }

        if (Array.isArray(type)) {

            type.forEach(function (type) {

                self.off(type, button);

            });

        } else if (Array.isArray(button)) {

            button.forEach(function (button) {

                self.off(type, button);

            });

        } else {

            this._listeners = this._listeners.filter(function (listener) {

                return listener.type !== type && listener.button !== button;

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

    Gamepad.prototype.setGlobalThreshold = function (num) {

        this._threshold = parseFloat(num);

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
                        event: listener,
                        timestamp: Date.now()
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
