<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-x</strong>: Metascraper integration for x.com.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-x --save
```

## API

### metascraper-x([options])

#### options

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

##### resolveUrls

Type: `boolean`

Set to `true` if you want to resolve `t.co` URLs into the final URL.

##### resolveUrl

Type: `function`

A decorator to be called after `t.co` is resolved. It doesn't do anything by default.

## License

**metascraper-x** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
