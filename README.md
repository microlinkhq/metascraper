<div align="center">
  <a href="https://metascraper.js.org">
    <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  </a>
  <br><br>
  <a href="https://microlink.io"><img src="https://img.shields.io/badge/powered_by-microlink.io-blue?style=flat-square&color=%23EA407B" alt="Powered by microlink.io"></a>
  <img alt="Last version" src="https://img.shields.io/github/tag/microlinkhq/metascraper.svg?style=flat-square">
  <a href="https://coveralls.io/github/microlinkhq/metascraper"><img alt="Coverage Status" src="https://img.shields.io/coveralls/microlinkhq/metascraper.svg?style=flat-square"></a>
  <a href="https://www.npmjs.org/package/metascraper"><img alt="NPM Status" src="https://img.shields.io/npm/dm/metascraper.svg?style=flat-square"></a>
  <br><br>
</div>

> A library to easily extract unified metadata from websites using Open Graph, Microdata, RDFa, Twitter Cards, JSON-LD, HTML, and more.

- [What is it](#what-is-it)
- [Getting started](#getting-started)
- [What data it detects](#what-data-it-detects)
- [The cloud API solution](#the-cloud-api-solution)
- [How it works](#how-it-works)
- [Importing rules](#importing-rules)
- [Rules bundles](#rules-bundles)
  - [Official](#official)
  - [Community](#community)
- [API](#api)
  - [constructor(rules)](#constructorrules)
    - [rules](#rules)
  - [metascraper(options)](#metascraperoptions)
    - [options](#options)
    - [html](#html)
    - [htmlDom](#htmldom)
    - [omitPropNames](#omitpropnames)
    - [pickPropNames](#pickpropnames)
    - [rules](#rules-1)
    - [url](#url)
    - [validateUrl](#validateurl)
- [Environment Variables](#environment-variables)
    - [METASCRAPER\_RE2](#metascraper_re2)
- [Benchmark](#benchmark)
- [License](#license)

---

## What is it

The **metascraper** library allows you to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and a series of fallbacks.

It follows a few principles:

- Ensure a high accuracy for online articles by default.
- Make it simple to add new rules or override existing ones.
- Don't restrict rules to CSS selectors or text accessors.

## Getting started

Below is a real example of extracting metadata from a live website. The same logic shown here is running online and can be tested directly at [microlink.io/meta](https://microlink.io/meta):

<div align="center">
  <a href="https://microlink.io/meta" target="_blank" rel="noopener">
    <img align="center" src="/static/demo1.jpeg" style="margin-top: 1rem; margin-bottom: 1.5rem;">
  </a>
  <br><br>
</div>

**metascraper** requires two inputs: The target URL and the HTML markup behind that URL.

There are multiple ways to retrieve the HTML markup, but it needs to be as accurate as possible.

For that reason, we developed [html-get](https://github.com/microlinkhq/html-get), which uses a headless browser to retrieve HTML in a way that works seamlessly with metascraper.


```js
const getHTML = require('html-get')

/**
 * `browserless` will be passed to `html-get`
 * as driver for getting the rendered HTML.
 */
const browserless = require('browserless')()

const getContent = async url => {
  // create a browser context inside the main Chromium process
  const browserContext = browserless.createContext()
  const promise = getHTML(url, { getBrowserless: () => browserContext })
  // close browser resources before return the result
  promise.then(() => browserContext).then(browser => browser.destroyContext())
  return promise
}

/**
 * `metascraper` is a collection of tiny packages,
 * so you can just use what you actually need.
 */
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

/**
 * The main logic
 */
getContent('https://microlink.io')
  .then(metascraper)
  .then(metadata => console.log(metadata))
  .then(browserless.close)
  .then(process.exit)
```

The output will be something like:

```json
{
  "author": "Microlink HQ",
  "date": "2022-07-10T22:53:04.856Z",
  "description": "Enter a URL, receive information. Normalize metadata. Get HTML markup. Take a screenshot. Identify tech stack. Generate a PDF. Automate web scraping. Run Lighthouse",
  "image": "https://cdn.microlink.io/logo/banner.jpeg",
  "logo": "https://cdn.microlink.io/logo/logo.png",
  "publisher": "Microlink",
  "title": "Turns websites into data — Microlink",
  "url": "https://microlink.io/"
}
```

## What data it detects

> **Note**: Custom metadata detection can be defined using a [rule bundle](#rules-bundles).

Here is an example of the metadata that **metascraper** can detect:

- `audio` — e.g. <small>*ht<span>tps://cf-media.sndcdn.com/U78RIfDPV6ok.128.mp3*</small><br/>
A audio URL that best represents the article.

- `author` — e.g. <small>*Noah Kulwin*</small><br/>
  A human-readable representation of the author's name.

- `date` — e.g. <small>*2016-05-27T00:00:00.000Z*</small><br/>
  An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) representation of the date the article was published.

- `description` — e.g. <small>*Venture capitalists are raising money at the fastest rate...*</small><br/>
  The publisher's chosen description of the article.

- `video` — e.g. <small>*ht<span>tps://assets.entrepreneur.com/content/preview.mp4*</small><br/>
  A video URL that best represents the article.

- `image` — e.g. <small>*ht<span>tps://assets.entrepreneur.com/content/3x2/1300/20160504155601-GettyImages-174457162.jpeg*</small><br/>
  An image URL that best represents the article.

- `lang` — e.g. <small>*en*</small><br/>
  An [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) representation of the url content language.

- `logo` — e.g. <small>*ht<span>tps://entrepreneur.com/favicon180x180.png*</small><br/>
  An image URL that best represents the publisher brand.

- `publisher` — e.g. <small>*Fast Company*</small><br/>
  A human-readable representation of the publisher's name.

- `title` — e.g. <small>*Meet Wall Street's New A.I. Sheriffs*</small><br/>
  The publisher's chosen title of the article.

- `url` — e.g. <small>*ht<span>tp://motherboard.vice.com/read/google-wins-trial-against-oracle-saves-9-billion*</small><br/>
  The URL of the article.

## The cloud API solution

Running this at scale means operating headless browsers, proxies, and antibot workarounds.

If you don’t want to manage that infrastructure, you can use the fully managed
[Microlink API](https://microlink.io/docs/api/getting-started/overview).

It automatically handles proxy rotation, paywalls, bot detection, and restricted platforms such as major social networks, while scaling on demand.

Pricing is pay-as-you-go and [starts for free](https://microlink.io/#pricing).


## How it works

**metascraper** is built out of rules bundles.

It is designed to be extensible. You can compose your own transformation pipeline using existing rules or create your own.

Rule bundles are collections of HTML selectors targeting a specific property. When you load the library, it implicitly loads the [core rules](#core-rules).

Each set of rules loads a set of selectors to extract a specific value.

Rules are ordered by priority. The first rule to successfully resolve the value stops the process. The order goes from most specific to most generic.

Rules work as fallbacks for one another:

- If the first rule fails, then it falls back on the second rule.
- If the second rule fails, it is time for the third rule.
- Etc.

**metascraper** does this until it finishes all the rules or finds the first rule that resolves the value.

## Importing rules

**metascraper** exports a constructor that need to be initialized providing a collection of rules to load:

```js
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
```

Again, the order of rules are loaded are important: Just the first rule that resolve the value will be applied.

Use the first parameter to pass custom options specific per each rules bundle:

```js
const metascraper = require('metascraper')([
  require('metascraper-logo')({
    filter: url => url.endsWith('.png')
  })
])
```

## Rules bundles

?> Can't find the rules bundle that you want? Let's [open an issue](https://github.com/microlinkhq/metascraper/issues/new) to create it.

### Official

> Rules bundles maintained by metascraper maintainers.

**Core essential**

- [metascraper-audio](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-audio) – Get audio property from HTML markup.
- [metascraper-author](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-author) – Get author property from HTML markup.
- [metascraper-date](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-date) – Get date property from HTML markup.
- [metascraper-description](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-description) – Get description property from HTML markup.
- [metascraper-feed](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-feed) – Get RSS/Atom feed URL from HTML markup.
- [metascraper-feeds](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-feeds) – Extract feed links (RSS/Atom/JSON) from HTML markup.
- [metascraper-helpers](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-helpers) – Common utility helpers for rule creation.
- [metascraper-iframe](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-iframe) – Get iframe for embedding content for the supported providers.
- [metascraper-image](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-image) – Get image property from HTML markup.
- [metascraper-lang](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-lang) – Get lang property from HTML markup.
- [metascraper-logo-favicon](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo-favicon) – Metascraper logo favicon fallback.
- [metascraper-logo](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo) – Get logo property from HTML markup.
- [metascraper-manifest](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-manifest) –  Metascraper integration for detecting PWA Web app [manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest).
- [metascraper-media-provider](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-media-provider) – Get specific video provider url (Facebook/Twitter/Vimeo/etc).
- [metascraper-publisher](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-publisher) – Get publisher property from HTML markup.
- [metascraper-readability](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-readability) – A Mozilla readability connector for metascraper.
- [metascraper-title](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-title) – Get title property from HTML markup.
- [metascraper-url](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-url) – Get url property from HTML markup.
- [metascraper-video](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-video) – Get video property from HTML markup.

**Vendor specific**

- [metascraper-amazon](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-amazon) – Metascraper integration with Amazon.
- [metascraper-instagram](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-instagram) –  Metascraper integration for Instagram.
- [metascraper-soundcloud](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-soundcloud) – Metascraper integration with SoundCloud.
- [metascraper-spotify](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-spotify) – Metascraper integration with Spotify.
- [metascraper-telegram](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-telegram) – Metascraper integration with Telegram.
- [metascraper-tiktok](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-tiktok) – Get TikTok metadata from HTML markup.
- [metascraper-uol](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-uol) – Metascraper integration for uol.com URLs.
- [metascraper-x](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-x) – Metascraper integration with x.com.
- [metascraper-youtube](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-youtube) – Metascraper integration with YouTube.

### Community

> Rules bundles maintained by individual users.

- [metascraper-address](https://github.com/goodhood-eu/metascraper-address) – Get schema.org formatted address.
- [metascraper-shopping](https://github.com/samirrayani/metascraper-shopping) – Get product information from HTML markup on merchant websites.

See [CONTRIBUTING](/CONTRIBUTING.md) to add your own module!

## API

### constructor(rules)

Create a new **metascraper** instance declaring the rules bundle to be used explicitly.

#### rules

Type: `Array`

The collection of rules bundle to be loaded.

### metascraper(options)

Call the instance for extracting content based on rules bundle provided at the constructor.

#### options

#### html

Type: `String`

The HTML markup for extracting the content.

#### htmlDom

Type: `object`

The DOM representation of the HTML markup. When it's not provided, it's get from the `html` parameter.

#### omitPropNames

Type: `Set`<br>
Default: `[]`

A set of property names that should be omitted. When specified, these properties will be missing in the returned metadata objects, and rules related to that will not be computed.

#### pickPropNames

Type: `Set`<br>
Default: `undefined`

A set of property names to pick for the metadata extraction process. When specified, only rules for these properties will be executed, and all other properties will be omitted. Takes precedence over `omitPropNames` when both are specified.

#### rules

Type: `Array`

You can pass additional rules to add on execution time. 

These rules will be merged with your loaded [rules](#rules) at the beginning.

#### url

*Required*<br>
Type: `String`

The URL associated with the HTML markup.

It is used for resolve relative links that can be present in the HTML markup.

it can be used as fallback field for different rules as well.

#### validateUrl

Type: `boolean`<br>
Default: `true`

Ensure the URL provided is validated as a [WHATWG URL](https://nodejs.org/api/url.html#url_the_whatwg_url_api) API compliant.

```js
const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-image')(),
  require('metascraper-description')()
])

const html = '<title>Example</title><meta property="og:image" content="image.jpg">'
const url = 'https://example.com'

// Omit the image property
const omitPropNames = new Set(['image'])
const metadata = await metascraper({ url, html, omitPropNames })

console.log(metadata)
// Output: { title: 'Example', image: null, description: null }
```

## Environment Variables

#### METASCRAPER_RE2

Type: `boolean`<br>
Default: `true`

It attemptt to load re2 to use instead of RegExp.

## Benchmark

To demonstrate **metascraper**'s exceptional accuracy, here is how it outperforms similar libraries:

| Library   | [metascraper](https://www.npmjs.com/package/metascraper) | [html-metadata](https://www.npmjs.com/package/html-metadata) | [node-metainspector](https://www.npmjs.com/package/node-metainspector) | [open-graph-scraper](https://www.npmjs.com/package/open-graph-scraper) | [unfluff](https://www.npmjs.com/package/unfluff) |
| :-------- | :------------------------------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------------- | :----------------------------------------------- |
| Correct   | **95.54%**                                               | **74.56%**                                                   | **61.16%**                                                             | **66.52%**                                                             | **70.90%**                                       |
| Incorrect | 1.79%                                                    | 1.79%                                                        | 0.89%                                                                  | 6.70%                                                                  | 10.27%                                           |
| Missed    | 2.68%                                                    | 23.67%                                                       | 37.95%                                                                 | 26.34%                                                                 | 8.95%                                            |

A big part of the reason for **metascraper**'s higher accuracy is that it relies on a series of fallbacks for each piece of metadata, instead of just looking for the most commonly-used, spec-compliant pieces of metadata, like Open Graph.

**metascraper**'s default settings are targetted specifically at parsing online articles, which is why it's able to be more highly-tuned than the other libraries for that purpose.

If you're interested in the breakdown by individual pieces of metadata, check out the [full comparison summary](/bench), or dive into the [raw result data for each library](/bench/results).

## License

**metascraper** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
