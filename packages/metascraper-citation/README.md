<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-citation</strong>: Get title, author, date, and publisher from Highwire Press <code>citation_*</code> and Dublin Core <code>dc.*</code> / <code>dcterms.*</code> meta tags.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-citation --save
```

Load it **before** the generic property packages so these values win over Open Graph (e.g. a clean `citation_title` instead of `og:title` with a site suffix).

```js
const metascraper = require('metascraper')([
  require('metascraper-citation')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-publisher')(),
  require('metascraper-title')()
])
```

## Supported tags

The bundle is a no-op unless [`test`](#test) finds at least one Highwire or Dublin Core tag. Highwire selectors run first; Dublin Core fills gaps (and covers repositories that only emit DC). Missing fields fall through to the generic rules.

Only the four properties below are set. Bibliographic extras (`citation_doi`, `dc.identifier`, ISSN, volume, issue, pages, PDF URL, language, abstract) are ignored.

| Property | Tags (first match wins) |
| --- | --- |
| **title** | `citation_title`, `dc.title`, `dcterms.title` |
| **author** | `citation_author`, `dc.creator`, `dcterms.creator`, `dc.contributor`, `dcterms.contributor` (first author only). If those tags are absent, names in `#author-group` are collected and joined. |
| **date** | `citation_publication_date`, `citation_date`, `citation_online_date`, `dcterms.issued`, `dcterms.created`, `dc.date`, `dcterms.date` |
| **publisher** | `citation_publisher`, `citation_journal_title`, `dc.publisher`, `dcterms.publisher` |

Names are matched case-insensitively (`DC.Title` and `dc.title` are the same tag).

## API

### test

```js
const { test } = require('metascraper-citation')
```

Returns `true` when the Cheerio document has at least one `meta[name]` starting with `citation_`, `dc.`, or `dcterms.` (case-insensitive). Used as `rules.test` so the bundle skips pages with no scholarly markup.

## License

**metascraper-citation** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
