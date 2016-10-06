BIN=node_modules/.bin

build:
	$(BIN)/uglifyjs gamepad.js --comments all --mangle --output gamepad.min.js

lint:
	$(BIN)/jslint gamepad.js
