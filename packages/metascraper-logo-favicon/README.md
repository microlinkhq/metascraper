# metascraper-logo-favicon

[![npm](https://img.shields.io/npm/v/metascraper-logo-favicon.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-logo-favicon)
[![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-logo-favicon&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-logo-favicon)

> metascraper logo favicon fallback.

## Install

```bash
$ npm install metascraper-logo-favicon --save
```

## Usage

### metascraper-logo-favicon([options])

#### options

##### pickFn

Type: `function`

It will be used for picking the value to extract from a set of favicon detected on the markup.

```js
const pickFn = (sizes, pickDefault) => {
  const appleTouchIcon = sizes.find((item) => item.rel.includes('apple'))
  return appleTouchIcon || pickDefault(sizes)
}

const metascraper = require('metascraper')([
  require('metascraper-logo-favicon')({
    pickFn
  })
])
```

If you don't specific it, the favicon with the bigger size will be picked.

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

In addition, these options are set by default:

```json
{
  "timeout": 3000
}
```

## License

**metascraper-logo-favicon** © [Microlink](https://microlink.io), Released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [@microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
