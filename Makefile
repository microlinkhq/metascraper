
# Binaries.
bin = ./node_modules/.bin
browserify = $(bin)/browserify
mocha = $(bin)/mocha
mocha-phantomjs = $(bin)/mocha-phantomjs

# Flags.
DEBUG ?=

# Config.
ifeq ($(DEBUG),true)
	mocha += debug
endif

# Install the dependencies.
node_modules: ./package.json
	@ npm install
	@ touch ./package.json

# Build the test source.
test/build.js: $(shell find ./lib) ./test/browser.js
	@ $(browserify) --transform babelify --outfile ./test/build.js ./test/browser.js

# Run the tests.
test: test-browser test-server

# Run the browser-side tests.
test-browser: ./node_modules ./test/build.js
	@ $(mocha-phantomjs) --reporter spec --timeout 5000 --bail ./test/browser.html

# Run the server-side tests.
test-server: ./node_modules
	@ $(mocha) --reporter spec --timeout 5000 --bail ./test/server.js

# Phony targets.
.PHONY: test
