
# Binaries.
babel = ./node_modules/.bin/babel
mocha = ./node_modules/.bin/mocha

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

# Run the tests.
test: ./node_modules ./dist
	@ $(mocha) --compilers js:babel-core/register --reporter spec --timeout 5000 --bail

# Phony targets.
.PHONY: test
