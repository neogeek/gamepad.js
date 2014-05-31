#gamepad.js

> Simple customizable event binding for the HTML Gamepad API.

##Setup

```javascript
var gamepad = new Gamepad();

gamepad.on('button_1', function () {
    console.log('button 1 was pressed!');
});
```

##Options

###Delay

> Delay the rate the callback is fired in milliseconds.

```javascript
var gamepad = new Gamepad();

gamepad.on('button_1', { delay: 30 }, function () {
    console.log('button 1 was pressed!');
});
```

###Once

> Fire the callback once per button press.

```javascript
var gamepad = new Gamepad();

gamepad.on('button_1', { once: true }, function () {
    console.log('button 1 was pressed!');
});
```

##Callback Parameters

###Button

> Returns the name of the button pressed.

```javascript
var gamepad = new Gamepad();

gamepad.on('button_1', function (e) {
    console.log(e.button + ' was pressed!');
});
```

###Player

> Returns the index of the controller the button was pressed on.

```javascript
var gamepad = new Gamepad();

gamepad.on('button_1', function (e) {
    console.log('controller ' + e.player + ' pressed ' + e.button + '!');
});
```

##Custom Mapping

> Sets custom key mapping.

```javascript
var gamepad = new Gamepad();

gamepad.setCustomMapping('keyboard', {
    'button_1': 32,
    'start': 27,
    'd_pad_up': [38, 87],
    'd_pad_down': [40, 83],
    'd_pad_left': [37, 65],
    'd_pad_right': [39, 68]
});
```

##Buttons

###Gamepads

- **button_1** - A (XBOX) / X (PS3)
- **button_2** - B (XBOX) / Circle (PS3)
- **button_3** - X (XBOX) / Square (PS3)
- **button_4** - Y (XBOX) / Triangle (PS3)
- **shoulder_top_left** - LB (XBOX) / L1 (PS3)
- **shoulder_top_right** - RB (XBOX) / R1 (PS3)
- **shoulder_bottom_left** - LT (XBOX) / L2 (PS3)
- **shoulder_bottom_right** - RT (XBOX) / R2 (PS3)
- **select** - Back (XBOX) / Select (PS3)
- **start** - Start (XBOX/PS3)
- **stick_button_left** - Left Analog Stick (XBOX/PS3)
- **stick_button_right** - Right Analog Stick (XBOX/PS3)
- **d_pad_up** - Up on the D-Pad (XBOX/PS3)
- **d_pad_down** - Down on the D-Pad (XBOX/PS3)
- **d_pad_left** - Left on the D-Pad (XBOX/PS3)
- **d_pad_right** - Right on the D-Pad (XBOX/PS3)
- **vendor** - XBOX Button (XBOX) / Playstation Button (PS3)

###Keyboard

- **button_1** - SPACE
- **start** - ESC
- **d_pad_up** - Up Arrow, W
- **d_pad_down** - Down Arrow, S
- **d_pad_left** - Left Arrow, A
- **d_pad_right** - Right Arrow, D

##Support

This plugin supports the Playstation 3 and XBOX 360 wireless controllers. Browser support is limited to browsers with the requestAnimationFrame method and Gamepad API.
