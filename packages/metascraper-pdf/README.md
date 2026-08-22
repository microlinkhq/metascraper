<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-pdf</strong>: Get title, author, date, description, publisher, image, logo, and lang out of a PDF document.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-pdf --save
```

## Usage

The rules download the document at `url` when it looks like a PDF.

```js
const metascraper = require('metascraper')([require('metascraper-pdf')()])

const metadata = await metascraper({
  url: 'https://arxiv.org/pdf/1706.03762v7'
})

// {
//   title: 'Attention Is All You Need',
//   author: 'Ashish Vaswani',
//   publisher: 'arXiv',
//   date: '2017-06-01T00:00:00.000Z',
//   description: 'The dominant sequence transduction models are based on…',
//   lang: 'en',
//   logo: 'https://www.google.com/s2/favicons?domain_url=…',
//   image: null
// }
```

The bundle is a no-op unless [`test`](#test) sees a PDF URL, so it is safe to mix with the HTML rules:

```js
const metascraper = require('metascraper')([
  require('metascraper-pdf')(),
  require('metascraper-title')(),
  require('metascraper-author')()
])

const metadata = await metascraper({ url, html })
```

## How it reads a document

The package fetches the URL, then reads the page the way a person does. Embedded PDF metadata is
mostly unusable — arXiv ships an empty `Title`, LaTeX ships `pedregosa11a.dvi`, Word ships
`Microsoft Word - draft.docx`, conference templates ship the venue as the `Subject`.

- **title** — the largest type on the first page, skipping the banner publishers print above it
  (`NBER WORKING PAPER SERIES`, `arXiv:2303.08774v6`, `REVIEW`) and any byline set in the same size.
- **author** — the block under the title, stripped of emails, affiliation superscripts and
  organisation names. Following metascraper's convention this returns a single name.
- **description** — the abstract, or the first paragraph of body text when there is no abstract.
- **publisher** — the venue in the running header or footer; otherwise a known host (`arXiv`,
  `NBER`, `PLOS`) or the domain.
- **date** — the identifier when the url encodes it (an arXiv id is a year-month; proceedings hosts
  put the year in the path). Otherwise the markers on the page win over the PDF creation date.
- **lang** — `dc:language` when present, then the host, then the words on the page.
- **image** — a first-page figure encoded as a PNG data URI, when the PDF embeds one that is not
  just a decoration.
- **logo** — a first-page mark encoded as a PNG data URI, or the publisher favicon.

## API

### metascraper-pdf([options])

#### options

##### maxPages

Type: `number`<br>
Default: `2`

How many pages to read text from. The title, author and publisher only ever come from the first
page; the extra page feeds the description when a document has no abstract.

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

##### keyvOpts

Type: `object`

Any option provided here will passed to [@keyvhq/memoize#options](https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions).

##### getPdf

Type: `function`

It will be called to get the PDF bytes behind `url`. Defaults to downloading the URL with `got`.

### .test(props)

Type: `function`<br>
Returns: `boolean`

`true` when `props.url` points at a PDF (`.pdf`, an `/pdf` path, or `type=printable`), which is how
the bundle stays inert for HTML input.

```js
const { test: isPdf } = require('metascraper-pdf')

isPdf({ url: 'https://arxiv.org/pdf/1706.03762v7' }) // => true
isPdf({ url: 'https://example.com' }) // => false
```

## License

**metascraper-pdf** © [microlink.io](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlink.io](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
