# metascraper-iframe

[![npm](https://img.shields.io/npm/v/metascraper-iframe.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-iframe)
[![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-iframe&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-iframe)

> Get iframe for embedding content for the supported providers.

## Install

```bash
$ npm install metascraper-iframe --save
```

## Supported providers

The library will check for iframe presence using different techniques:

- **HTML markup**: Looking for oEmbed links presence via `application/json+oembed`/`text/xml+oembed` selectors.
- **oEmbed providers**: Consulting provider that implements [oembed.com](https://oembed.com/) via [oembed-spec](https://github.com/microlinkhq/oembed-spec).
- **Twitter iframe**: Checking for `twitter:player` presence, meaning the target URL impementes [Twitter Player Card spec](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/player-card#:~:text=%C2%A0-,Reference,-Card%20Property).

## API

### metascraper-iframe([options])

#### options

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

## License

**metascraper-iframe** © [Microlink](https://microlink.io), Released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [@microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
