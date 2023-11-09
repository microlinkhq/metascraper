<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-logo-favicon</strong>: Metascraper logo favicon fallback.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-logo-favicon --save
```

## API

### metascraper-logo-favicon([options])

#### options

##### google

Type: `boolean`<br>
Default: `true`

It enables logo resolution using Google API.

##### favicon

Type: `boolean`<br>
Default: `true`

It tries to resolve `favicon.ico` of the url.

##### rootFavicon

Type: `boolean`|`regexp`<br>
Default: `true`

It tries to resolve `favicon.ico` of the url when the URL is a subdomain.

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

##### keyvOpts

Type: `object`

Any option provided here will passed to [@keyvhq/memoize#options](https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions).

## License

**metascraper-logo-favicon** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
