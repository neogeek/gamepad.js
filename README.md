# gamepad.js

> 🎮 Simple customizable event binding for the HTML Gamepad API.

## Setup

```bash
$ npm install neogeek/gamepad.js
```

```javascript
const gamepad = new Gamepad();

gamepad.start();
```

## Usage

### Pressed

```javascript
const gamepad = new Gamepad();

gamepad.on('pressed', 'button_1', ({ id, gamepadIndex, value }) => {
    console.log(
        `${id} was pressed by player ${
            gamepadIndex + 1
        } with a value of ${value}!`
    );
});

gamepad.start();
```

### Held

```javascript
const gamepad = new Gamepad();

gamepad.on('held', 'button_1', ({ id, gamepadIndex, value }) => {
    console.log(
        `${id} is being held by player ${
            gamepadIndex + 1
        } with a value of ${value}!`
    );
});

gamepad.start();
```

### Released

```javascript
const gamepad = new Gamepad();

gamepad.on('released', 'button_1', ({ id, gamepadIndex, value }) => {
    console.log(
        `${id} was released by player ${
            gamepadIndex + 1
        } with a value of ${value}!`
    );
});

gamepad.start();
```

### Axes

```javascript
const gamepad = new Gamepad();

gamepad.on('axes', 0, ({ id, gamepadIndex, value }) => {
    console.log(
        `${id} was held by player ${gamepadIndex + 1} with a value of ${value}!`
    );
});

gamepad.on('axes', 1, ({ id, gamepadIndex, value }) => {
    console.log(
        `${id} was held by player ${gamepadIndex + 1} with a value of ${value}!`
    );
});

gamepad.start();
```

### Removing Event Listeners

```javascript
gamepad.off('pressed', 'button_1');

gamepad.off('held', 'button_1');

gamepad.off('released', 'button_1');
```

## Migrating from v0.x to v1

1. All keypad support has been removed to reduce complexity in the package.
1. Gamepad type `press` is now `pressed` to conform to the browser standard.
1. Gamepad type `hold` is now `held`.
1. Gamepad type `release` is now `released`.

## Support

The Gamepad browser API is very fragmented. VERY. Because of this we need your help. If you have a gamepad that isn't listed below, please visit the [Gamepad.js Recorder](https://u4o9w.csb.app/) and follow the instructions to create a controller mapping file. Either submit that in an issue or a PR. Once the mapping has been confirmed by at least one other user, it can be merged into the repo and it will be avaible in the next deploy.

| Controller       | Browser        | OS      | Supported |
| ---------------- | -------------- | ------- | :-------: |
| PS4 Wired        | Chrome         | macOS   |    ❌     |
| PS4 Wired        | Chrome         | Windows |    ✅     |
| PS4 Wired        | Firefox        | macOS   |    ❌     |
| PS4 Wired        | Firefox        | Windows |    ✅     |
| PS4 Wired        | Microsoft Edge | Windows |    ✅     |
| PS4 Wired        | Opera          | macOS   |    ❌     |
| PS4 Wired        | Opera          | Windows |    ✅     |
| PS4 Wired        | Safari         | macOS   |    ❌     |
| Switch Pro Wired | Chrome         | macOS   |    ✅     |
| Switch Pro Wired | Chrome         | Windows |    ✅     |
| Switch Pro Wired | Firefox        | macOS   |    ❌     |
| Switch Pro Wired | Firefox        | Windows |    ❌     |
| Switch Pro Wired | Opera          | macOS   |    ✅     |
| Switch Pro Wired | Opera          | Windows |    ❌     |
| Switch Pro Wired | Safari         | macOS   |    ❌     |
| Xbox One Wired   | Chrome         | macOS   |    ✅     |
| Xbox One Wired   | Chrome         | Windows |    ✅     |
| Xbox One Wired   | Firefox        | macOS   |    ✅     |
| Xbox One Wired   | Firefox        | Windows |    ✅     |
| Xbox One Wired   | Microsoft Edge | Windows |    ✅     |
| Xbox One Wired   | Opera          | macOS   |    ✅     |
| Xbox One Wired   | Opera          | Windows |    ✅     |
| Xbox One Wired   | Safari         | macOS   |    ✅     |
