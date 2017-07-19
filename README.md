# gamepad.js

> Simple customizable event binding for the HTML Gamepad API.

## Setup

### Controller Connected

```javascript
const gamepad = new Gamepad();

gamepad.on('connect', e => {
    console.log(`controller ${e.index} connected!`);
});
```

### Controller Disconnected

```javascript
const gamepad = new Gamepad();

gamepad.on('disconnect', e => {
    console.log(`controller ${e.index} disconnected!`);
});
```

### Press

```javascript
const gamepad = new Gamepad();

gamepad.on('press', 'button_1', () => {
    console.log('button 1 was pressed!');
});
```

### Hold

```javascript
const gamepad = new Gamepad();

gamepad.on('hold', 'button_1', () => {
    console.log('button 1 is being held!');
});
```

### Release

```javascript
const gamepad = new Gamepad();

gamepad.on('release', 'button_1', () => {
    console.log('button 1 was released!');
});
```

### Removing Event Listeners

```javascript
gamepad.off('release', 'button_1');
```

```javascript
gamepad.off(['release'], ['button_1']);
```

## Callback Parameters

### Button

> Returns the name of the button pressed.

```javascript
const gamepad = new Gamepad();

gamepad.on('press', 'button_1', e => {
    console.log(`${e.button} was pressed!`);
});
```

### Player

> Returns the index of the controller the button was pressed on.

```javascript
const gamepad = new Gamepad();

gamepad.on('press', 'button_1', e => {
    console.log(`player ${e.player} pressed ${e.button}!`);
});
```

### Value

> Returns the value of the button being held.

```javascript
const gamepad = new Gamepad();

gamepad.on('hold', 'shoulder_bottom_right', e => {
    console.log(`shoulder_bottom_right has a value of ${e.value}!`);
});
```

## Custom Mapping

> Sets custom key mapping.

```javascript
const gamepad = new Gamepad();

gamepad.setCustomMapping('keyboard', {
    'button_1': 32,
    'start': 27,
    'd_pad_up': [38, 87],
    'd_pad_down': [40, 83],
    'd_pad_left': [37, 65],
    'd_pad_right': [39, 68]
});
```

## Handling Events

### Pause

```javascript
const gamepad = new Gamepad();

gamepad.pause();
```

### Resume

```javascript
const gamepad = new Gamepad();

gamepad.resume();
```

### Destroy

```javascript
const gamepad = new Gamepad();

gamepad.destroy();
```

## Buttons

### Gamepad

- **button_1** - A (XBOX) / X (PS3/PS4)
- **button_2** - B (XBOX) / Circle (PS3/PS4)
- **button_3** - X (XBOX) / Square (PS3/PS4)
- **button_4** - Y (XBOX) / Triangle (PS3/PS4)
- **shoulder_top_left** - LB (XBOX) / L1 (PS3/PS4)
- **shoulder_top_right** - RB (XBOX) / R1 (PS3/PS4)
- **shoulder_bottom_left** - LT (XBOX) / L2 (PS3/PS4)
- **shoulder_bottom_right** - RT (XBOX) / R2 (PS3/PS4)
- **select** - Back (XBOX) / Select (PS3/PS4)
- **start** - Start (XBOX/PS3/PS4)
- **stick_button_left** - Left Analog Stick (XBOX/PS3/PS4)
- **stick_button_right** - Right Analog Stick (XBOX/PS3/PS4)
- **d_pad_up** - Up on the D-Pad (XBOX/PS3/PS4)
- **d_pad_down** - Down on the D-Pad (XBOX/PS3/PS4)
- **d_pad_left** - Left on the D-Pad (XBOX/PS3/PS4)
- **d_pad_right** - Right on the D-Pad (XBOX/PS3/PS4)
- **vendor** - XBOX Button (XBOX) / Playstation Button (PS3/PS4)

### Gamepad Analog Sticks

- **stick_axis_left**
- **stick_axis_right**

### Keyboard

- **button_1** - SPACE
- **start** - ESC
- **d_pad_up** - Up Arrow, W
- **d_pad_down** - Down Arrow, S
- **d_pad_left** - Left Arrow, A
- **d_pad_right** - Right Arrow, D

## Support

This plugin supports the Playstation 3, Playstation 4, XBOX 360 and XBOX One wired and wireless controllers. Support is limited to browsers with the requestAnimationFrame method and latest Gamepad API.
