<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-logo-bimi</strong>: Get logo property from the BIMI DNS record.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Why

[BIMI](https://datatracker.ietf.org/doc/draft-blank-ietf-bimi/) is the standard behind the brand logo mailbox providers show next to an email. Domains publish it as a TXT record:

```console
$ dig +short TXT default._bimi.microlink.io
"v=BIMI1; l=https://cdn.microlink.io/logo/logo.svg;"
```

The specification constrains the logo to [SVG Tiny P/S](https://www.w3.org/TR/SVGTiny12/): vector, square, and transparent, which is exactly the shape a logo is expected to have.

The record is published in the domain's own DNS, so it is self asserted: the same level of trust as `og:logo`. Domains may also publish a Verified Mark Certificate under `a=`, where a certificate authority has attested the mark against the trademark owner, but this package does not read or validate it, so treat the result as a BIMI published logo rather than a verified one.

That makes it a higher quality source than a favicon, and it doesn't need the markup: a single DNS lookup, so it works even when the page is JavaScript rendered or unreachable.

Coverage is the trade-off. It's common among large brands and rare in the long tail, so pair it with [metascraper-logo](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo) and [metascraper-logo-favicon](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo-favicon).

## Install

```bash
$ npm install metascraper-logo-bimi --save
```

## Usage

Rules are evaluated in the order the packages are declared, so put it first to prefer the BIMI published logo over anything found in the markup:

```js
const metascraper = require('metascraper')([
  require('metascraper-logo-bimi')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')()
])
```

The lookup is done against the registrable domain, meaning `https://blog.example.com/post` resolves `default._bimi.example.com`.

## API

### metascraper-logo-bimi([options])

#### options

##### gotOpts

Type: `object`

Any option to be passed to [got](https://github.com/sindresorhus/got#options) when the logo URL is checked.

##### keyvOpts

Type: `object`

Any option to be passed to [@keyvhq/memoize](https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions).

The resolution is memoized per domain, including the absence of a record.

The default store is an in-memory map that never evicts, so a long running process scraping many domains should supply its own store, plus a `ttl` in milliseconds to bound how long a record is trusted:

```js
const KeyvRedis = require('@keyvhq/redis')

const metascraper = require('metascraper')([
  require('metascraper-logo-bimi')({
    keyvOpts: {
      store: new KeyvRedis('redis://localhost:6379'),
      ttl: 24 * 60 * 60 * 1000
    }
  })
])
```

##### resolveLogoUrl

Type: `function`<br>
Default: `require('metascraper-logo-bimi').resolveLogoUrl`

It determines if the logo URL published in the record is valid, returning the URL or `undefined`.

The default implementation discards anything not reachable, not served as `image/svg+xml`, or that redirects away from `https`.

##### resolveTxt

Type: `function`<br>
Default: `require('dns').promises.resolveTxt`

The DNS resolver used to read the TXT record. Provide your own to run the lookup over [DNS over HTTPS](https://datatracker.ietf.org/doc/html/rfc8484), so it goes through the same egress as the rest of your traffic:

```js
const metascraper = require('metascraper')([
  require('metascraper-logo-bimi')({
    resolveTxt: async hostname => {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${hostname}&type=TXT`,
        { headers: { accept: 'application/dns-json' } }
      )
      const { Answer = [] } = await response.json()
      return Answer.filter(({ type }) => type === 16).map(({ data }) =>
        data.match(/"[^"]*"/g).map(chunk => chunk.slice(1, -1))
      )
    }
  })
])
```

##### selector

Type: `string`<br>
Default: `'default'`

The BIMI selector to query, used as `<selector>._bimi.<domain>`.

## License

**metascraper-logo-bimi** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
