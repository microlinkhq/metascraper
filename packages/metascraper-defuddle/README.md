<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-defuddle</strong>: A Defuddle connector for metascraper.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-defuddle --save
```

## Usage

```js
const metascraper = require('metascraper')([require('metascraper-defuddle')()])
```

It runs a single [Defuddle](https://github.com/kepano/defuddle) `parseInternal` pass — not the high-level `Defuddle()`, whose `parse()` re-runs on low `wordCount` to recover _content_. This connector extracts metadata, which is read from meta tags/schema regardless of content removals, so those retries add nothing here.

The Defuddle result is memoized by HTML, so the same page is defuddled once even when several rules (or another consumer, such as a markdown renderer) request it; the same URL re-fetched with different HTML still re-extracts.

### Options

```js
require('metascraper-defuddle')({ preprocess, defuddleOpts })
```

- **preprocess** `(document, html) => void` — mutate the parsed DOM before extraction (e.g. strip noise, normalize flattened shadow-DOM content).
- **defuddleOpts** `object` — options forwarded to Defuddle's `parseInternal` (e.g. `{ removeLowScoring: false }` to keep link-heavy blocks).

## License

**metascraper-defuddle** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
