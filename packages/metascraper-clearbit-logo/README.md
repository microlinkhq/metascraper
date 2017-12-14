# metascraper-clearbit-logo

![Last version](https://img.shields.io/github/tag/microlinkhq/metascraper-clearbit-logo.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/microlinkhq/metascraper-clearbit-logo/master.svg?style=flat-square)](https://travis-ci.org/microlinkhq/metascraper-clearbit-logo)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/metascraper-clearbit-logo.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/metascraper-clearbit-logo)
[![Dependency status](https://img.shields.io/david/microlinkhq/metascraper-clearbit-logo.svg?style=flat-square)](https://david-dm.org/microlinkhq/metascraper-clearbit-logo)
[![Dev Dependencies Status](https://img.shields.io/david/dev/microlinkhq/metascraper-clearbit-logo.svg?style=flat-square)](https://david-dm.org/microlinkhq/metascraper-clearbit-logo#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/metascraper-clearbit-logo.svg?style=flat-square)](https://www.npmjs.org/package/metascraper-clearbit-logo)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/microlinkhq)

> metascraper integration with Clearbit Logo API.

## Install

```bash
$ npm install metascraper-clearbit-logo --save
```

## Usage

```js
const clearbitLogo = require('metascraper-clearbit-logo')({
  format: 'png',
  size: '128'
})

const metascraper = require('metascraper')({plugins: [clearbitLogo]})
```

## API

### clearbitLogo([options])

#### options

##### size

Type: `string`<br>
Default: `128`

Length of longest side in pixels.

##### format

Type: `string`<br>
Default: `png`

Image format, either "png" or "jpg".

## License

**metascraper-clearbit-logo** © [microlink.io](https://microlink.io), Released under the [MIT](https://github.com/microlinkhq/metascraper-clearbit-logo/blob/master/LICENSE.md) License.<br>
Authored and maintained by microlink.io with help from [contributors](https://github.com/microlinkhq/metascraper-clearbit-logo/contributors).

> [microlink.io](https://microlink.io) · GitHub [@microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
