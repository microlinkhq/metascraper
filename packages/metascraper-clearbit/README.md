# metascraper-clearbit

[![npm](https://img.shields.io/npm/v/metascraper-clearbit.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-clearbit)
[![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-clearbit&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-clearbit)

> metascraper integration with Clearbit Logo API.

## Install

```bash
$ npm install metascraper-clearbit --save
```

## API

### metascraper-clearbit([options])

#### options

#### gotOpts

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

In addition, these options are set by default:

```json
{
  "retry": 0,
  "json": true,
  "timeout": 1500
}
```

#### logoOpts

Any option provided here will passed to [Clearbit Logo API](https://clearbit.com/docs#logo-api).

## License

**metascraper-clearbit** © [microlink.io](https://microlink.io), Released under the [MIT](https://github.com/microlinkhq/metascraper-clearbit/blob/master/LICENSE.md) License.<br>
Authored and maintained by microlink.io with help from [contributors](https://github.com/microlinkhq/metascraper-clearbit/contributors).

> [microlink.io](https://microlink.io) · GitHub [@microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
