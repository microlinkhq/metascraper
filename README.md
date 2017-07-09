# microlink-core

![Last version](https://img.shields.io/github/tag/microlinkhq/microlink-core.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/microlinkhq/microlink-core/master.svg?style=flat-square)](https://travis-ci.org/microlinkhq/microlink-core)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/microlink-core.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/microlink-core)
[![Dependency status](https://img.shields.io/david/microlinkhq/microlink-core.svg?style=flat-square)](https://david-dm.org/microlinkhq/microlink-core)
[![Dev Dependencies Status](https://img.shields.io/david/dev/microlinkhq/microlink-core.svg?style=flat-square)](https://david-dm.org/microlinkhq/microlink-core#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/microlink-core.svg?style=flat-square)](https://www.npmjs.org/package/microlink-core)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/microlinkhq)

> Get metadata from HTML.

## Install

```bash
$ npm install microlink-core --save
```

## Usage

```js
const microlink = require('microlink-core')
const get = require('simple-get')

get.concat('http://example.com', function (err, res, html) {
  if (err) throw err

  const output = microlink(html)
  console.log(output)
})
```
## License

MIT © [](https://github.com/microlinkhq).
