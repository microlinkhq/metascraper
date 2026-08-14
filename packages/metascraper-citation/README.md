<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-citation</strong>: Get title, author, date, and publisher from Highwire Press / Google Scholar <code>citation_*</code> meta tags.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-citation --save
```

Load it **before** the generic property packages so Highwire values win over Open Graph (e.g. a clean `citation_title` instead of `og:title` with a site suffix).

```js
const metascraper = require('metascraper')([
  require('metascraper-citation')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-publisher')(),
  require('metascraper-title')()
])
```

The bundle is a no-op unless the HTML has at least one `citation_*` tag. Missing fields (ScienceDirect often omits `citation_author`) fall through to the generic rules.

## License

**metascraper-citation** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
