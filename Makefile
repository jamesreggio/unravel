LIB = lib/background.js lib/popup.js lib/inject.js
SRC = $(shell find src -type f)

.PHONY: build watch clean

build: $(LIB) lib/.linted

watch: build
	watchy -w src/**/* -- make build

clean:
	rm -rf lib/* lib/.linted

lib/%.js: src/%.js $(SRC)
	browserify \
		--transform [ babelify --loose all ] \
		--global-transform [ uglifyify [ --no-drop_debugger ] ] \
		$< > $@

lib/.linted: $(SRC)
	jscs $?
	jshint $?
	@touch $@
