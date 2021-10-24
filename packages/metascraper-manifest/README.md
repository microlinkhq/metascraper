# metascraper-manifest

[![npm](https://img.shields.io/npm/v/metascraper-manifest.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-manifest)
[![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-manifest&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-manifest)

> Metascraper integration for derecting PWA Web app [manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest).

## Install

```bash
$ npm install metascraper-manifest --save
```

## API

### metascraper-manifest([options])

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

**metascraper-manifest** © [Microlink](https://microlink.io), Released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [@microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
