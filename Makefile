
# Binaries.
bin = ./node_modules/.bin
babel = $(bin)/babel
browserify = $(bin)/browserify
mocha = $(bin)/mocha
mocha-phantomjs = $(bin)/mocha-phantomjs

# Variables.
mocha_opts = --reporter spec --timeout 5000 --bail
browserify_opts = --transform babelify

# Flags.
DEBUG ?=

# Config.
ifeq ($(DEBUG),true)
	mocha += debug
endif

# Build the source.
dist: $(shell find ./lib)
	@ $(babel) --out-dir ./dist ./lib
	@ touch ./dist

# Install the dependencies.
node_modules: ./package.json
	@ npm install
	@ touch ./package.json

# Build the test source.
test/build.js: $(shell find ./lib) ./test/browser.js
	@ $(browserify) $(browserify_opts) --outfile ./test/build.js ./test/browser.js

# Run the tests.
test: test-browser test-server

# Run the browser-side tests.
test-browser: ./node_modules ./dist ./test/build.js
	@ $(mocha-phantomjs) $(mocha_opts) ./test/browser.html

# Run the server-side tests.
test-server: ./node_modules ./dist ./test/build.js
	@ $(mocha) --compilers js:babel-core/register $(mocha_opts) ./test/server.js

# Phony targets.
.PHONY: test
