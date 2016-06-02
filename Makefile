
# Binaries.
bin = ./node_modules/.bin
browserify = $(bin)/browserify
mocha = $(bin)/mocha
mocha-phantomjs = $(bin)/mocha-phantomjs
node = node

# Flags.
DEBUG ?=

# Config.
ifeq ($(DEBUG),true)
	mocha += debug
	node += debug
endif

# Remove the generated files.
clean:
	@ rm -rf node_modules

# Install the dependencies.
node_modules: ./package.json
	@ npm install
	@ touch ./package.json

# Run the comparison script.
run-comparison: ./node_modules
	@ $(node) ./support/comparison/index.js

# Build the test source.
test/support/build.js: ./node_modules $(shell find ./lib) ./test/browser.js
	@ $(browserify) --transform babelify --outfile ./test/support/build.js ./test/browser.js

# Run the tests.
test: test-browser test-server

# Run the browser-side tests.
test-browser: ./node_modules ./test/support/build.js
	@ $(mocha-phantomjs) --reporter spec --timeout 5000 ./test/support/browser.html

# Run the server-side tests.
test-server: ./node_modules
	@ $(mocha) --reporter spec --timeout 5000 ./test/server.js

# Phony targets.
.PHONY: test
