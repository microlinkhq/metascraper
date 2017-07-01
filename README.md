# smartlink-core

![Last version](https://img.shields.io/github/tag/smartlinkhq/smartlink-core.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/smartlinkhq/smartlink-core/master.svg?style=flat-square)](https://travis-ci.org/smartlinkhq/smartlink-core)
[![Coverage Status](https://img.shields.io/coveralls/smartlinkhq/smartlink-core.svg?style=flat-square)](https://coveralls.io/github/smartlinkhq/smartlink-core)
[![Dependency status](https://img.shields.io/david/smartlinkhq/smartlink-core.svg?style=flat-square)](https://david-dm.org/smartlinkhq/smartlink-core)
[![Dev Dependencies Status](https://img.shields.io/david/dev/smartlinkhq/smartlink-core.svg?style=flat-square)](https://david-dm.org/smartlinkhq/smartlink-core#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/smartlink-core.svg?style=flat-square)](https://www.npmjs.org/package/smartlink-core)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/smartlinkhq)

> Get metadata from HTML.

## Install

```bash
$ npm install smartlink-core --save
```

## Usage

```js
const smartlink = require('smartlink-core')
const get = require('simple-get')

get.concat('http://example.com', function (err, res, html) {
  if (err) throw err

  const output = smartlink(html)
  console.log(output)
})
```
## License

MIT © [](https://github.com/smartlinkhq).
