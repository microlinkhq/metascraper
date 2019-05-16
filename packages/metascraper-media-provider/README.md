# metascraper-media-provider

[![npm](https://img.shields.io/npm/v/metascraper-media-provider.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-media-provider)
[![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-media-provider&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-media-provider)

> Get specific video provider url (Facebook/Twitter/Vimeo/etc).

## Install

```bash
$ npm install metascraper-media-provider --save
```

## Usage

.constructor([options])

### options

#### cacheDir

Type: `string`

It specifies cache based on file system to be used by [youtube-dl](youtube-dl).

#### onError

Type: `function`

A function to be called when something wrong happens.

It will receive `error` and `url`.

#### proxies

Type: `array`

When it is specified, a proxy will be used for each of the requests using [luminati-tunnel](https://github.com/Kikobeats/luminati-tunnel).

#### userAgent

Type: `string`

It specifies a custom user agent.

## License

**metascraper-media-provider** © [microlink.io](https://microlink.io), Released under the [MIT](https://github.com/microlinkhq//blob/master/LICENSE.md) License.<br>
Authored and maintained by microlink.io with help from [contributors](https://github.com/microlinkhq//contributors).

> [microlink.io](https://microlink.io) · GitHub [@microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
