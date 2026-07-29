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

The record is published in the domain's own DNS, so it is self asserted: the same level of trust as `og:logo`. Domains may also publish a Verified Mark Certificate under `a=`, where a certificate authority has attested the mark against the trademark owner, but this package does not read or validate it.

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

The record is read by [bimi-url](https://github.com/kikobeats/bimi-url), and every option is passed to it: `gotOpts`, `keyvOpts`, `resolveLogoUrl`, `resolveTxt`, and `selector` are [documented there](https://github.com/kikobeats/bimi-url#api).

Supplying your own `resolveTxt` is the common one, since `node:dns` resolves with no timeout by default:

```js
const { Resolver } = require('dns').promises

const resolver = new Resolver({ timeout: 2000 })

const metascraper = require('metascraper')([
  require('metascraper-logo-bimi')({
    resolveTxt: hostname => resolver.resolveTxt(hostname)
  })
])
```

The same seam takes a [DNS over HTTPS](https://datatracker.ietf.org/doc/html/rfc8484) resolver, so the lookup leaves through the same egress as the rest of your traffic. [bimi-url](https://github.com/kikobeats/bimi-url#resolvetxt) has that example.

`createGetLogo`, `resolveLogoUrl` and `toLogoUrl` are re-exported from `bimi-url` for use outside a metascraper rule.

## License

**metascraper-logo-bimi** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
