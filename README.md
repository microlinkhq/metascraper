<h1 align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
</h1>

![Last version](https://img.shields.io/github/tag/microlinkhq/metascraper.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/metascraper.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/metascraper)
[![NPM Status](https://img.shields.io/npm/dm/metascraper.svg?style=flat-square)](https://www.npmjs.org/package/metascraper)

> A library to easily get unified metadata from websites using Open Graph, Microdata, RDFa, Twitter Cards, JSON-LD, HTML, and more.

## Getting Started

**metascraper** is library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.

It follows a few principles:

- Have a high accuracy for online articles by default.
- Make it simple to add new rules or override existing ones.
- Don't restrict rules to CSS selectors or text accessors.

## Installation

```bash
$ npm install metascraper --save
```

## Usage

Let's extract accurate information from the following article:

[![](https://raw.githubusercontent.com/microlinkhq/metascraper/add-comparison/support/screenshot.png)](http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance)

Then call **metascraper** with the rules bundle you want to apply for extracting content:

```js
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const { fetch } = require('undici')

const siteUrl = 'http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance'

;(async () => {
  const { html, url } = await fetch(siteUrl).then(async res => ({
    url: res.url,
    html: await res.text()
  }))

  const metadata = await metascraper({ html, url })
  console.log(metadata)
})()
```


The output will be something like:

```json
{
  "author": "Ellen Huet",
  "date": "2016-05-24T18:00:03.894Z",
  "description": "The HR startups go to war.",
  "image": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ioh_yWEn8gHo/v1/-1x-1.jpg",
  "publisher": "Bloomberg.com",
  "title": "As Zenefits Stumbles, Gusto Goes Head-On by Selling Insurance",
  "url": "http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance"
}
```

## Metadata

?> Other metadata can be defined using a custom [rule bundle](#rules-bundles).

Here is an example of the metadata that **metascraper** can collect:

- `audio` — eg. *https://cf-media.sndcdn.com/U78RIfDPV6ok.128.mp3*<br/>
A audio URL that best represents the article.

- `author` — eg. *Noah Kulwin*<br/>
  A human-readable representation of the author's name.

- `date` — eg. *2016-05-27T00:00:00.000Z*<br/>
  An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) representation of the date the article was published.

- `description` — eg. *Venture capitalists are raising money at the fastest rate...*<br/>
  The publisher's chosen description of the article.

- `video` — eg. *https://assets.entrepreneur.com/content/preview.mp4*<br/>
  A video URL that best represents the article.

- `image` — eg. *https://assets.entrepreneur.com/content/3x2/1300/20160504155601-GettyImages-174457162.jpeg*<br/>
  An image URL that best represents the article.

- `lang` — eg. *en*<br/>
  An [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) representation of the url content language.

- `logo` — eg. *https://entrepreneur.com/favicon180x180.png*<br/>
  An image URL that best represents the publisher brand.

- `publisher` — eg. *Fast Company*<br/>
  A human-readable representation of the publisher's name.

- `title` — eg. *Meet Wall Street's New A.I. Sheriffs*<br/>
  The publisher's chosen title of the article.

- `url` — eg. *http://motherboard.vice.com/read/google-wins-trial-against-oracle-saves-9-billion*<br/>
  The URL of the article.

## How It Works

**metascraper** is built out of rules bundles.

It was designed to be easy to adapt. You can compose your own transformation pipeline using existing rules or write your own.

Rules bundles are a collection of HTML selectors around a determinate property. When you load the library, implicitly it is loading [core rules](#core-rules).

Each set of rules load a set of selectors in order to get a determinate value.

These rules are sorted with priority: The first rule that resolve the value successfully, stop the rest of rules for get the property. Rules are sorted intentionally from specific to more generic.

Rules work as fallback between them:

- If the first rule fails, then it fallback in the second rule.
- If the second rule fails, time to third rule.
- etc

**metascraper** do that until finish all the rule or find the first rule that resolves the value.

## Importing Rules

**metascraper** exports a constructor that need to be initialized providing a collection of rules to load:

```js
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
```

Again, the order of rules are loaded are important: Just the first rule that resolve the value will be applied.

Use the first parameter to pass custom options specific per each rules bundle:

```js
const metascraper = require('metascraper')([
  require('metascraper-clearbit')({
    size: 256,
    format: 'jpg'
  })
])
```

## Rules Bundles

?> Can't find the rules bundle that you want? Let's [open an issue](https://github.com/microlinkhq/metascraper/issues/new) to create it.

### Official

> Rules bundles maintained by metascraper maintainers.

**Core essential**

- [metascraper-audio](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-audio) – Get audio property from HTML markup.
- [metascraper-author](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-author) – Get author property from HTML markup.
- [metascraper-date](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-date) – Get date property from HTML markup.
- [metascraper-description](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-description) – Get description property from HTML markup.
- [metascraper-image](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-image) – Get image property from HTML markup.
- [metascraper-iframe](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-iframe) – Get iframe for embedding content for the supported providers.
- [metascraper-lang](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-lang) – Get lang property from HTML markup.
- [metascraper-logo](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo) – Get logo property from HTML markup.
- [metascraper-logo-favicon](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo-favicon) – Metascraper logo favicon fallback.
- [metascraper-media-provider](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-media-provider) – Get specific video provider url (Facebook/Twitter/Vimeo/etc).
- [metascraper-publisher](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-publisher) – Get publisher property from HTML markup.
- [metascraper-readability](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-readability) – A Mozilla readability connector for metascraper.
- [metascraper-title](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-title) – Get title property from HTML markup.
- [metascraper-url](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-url) – Get url property from HTML markup.
- [metascraper-video](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-video) – Get video property from HTML markup.

**Vendor specific**

- [metascraper-amazon](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-amazon) – Metascraper integration with Amazon.
- [metascraper-clearbit](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-clearbit) – Metascraper integration with Clearbit Logo API.
- [metascraper-instagram](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-instagram) –  Metascraper integration for Instagram.
- [metascraper-manifest](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-manifest) –  Metascraper integration for derecting PWA Web app [manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest).
- [metascraper-soundcloud](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-soundcloud) – Metascraper integration with SoundCloud.
- [metascraper-telegram](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-telegram) – Metascraper integration with Telegram.
- [metascraper-uol](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-uol) – Metascraper integration for uol.com URLs.
- [metascraper-spotify](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-spotify) – Metascraper integration with Spotify.
- [metascraper-youtube](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-youtube) – Metascraper integration with YouTube.

### Community

> Rules bundles maintained by individual users.

- [metascraper-address](https://github.com/goodhood-eu/metascraper-address) – Get schema.org formatted address.
- [metascraper-shopping](https://github.com/samirrayani/metascraper-shopping) – Get product information from HTML markup on merchant websites.

See [CONTRIBUTING](/CONTRIBUTING.md) for adding your own module!

## API

### constructor(rules)

Create a new **metascraper** instance declaring the rules bundle to be used explicitly.

#### rules

Type: `Array`

The collection of rules bundle to be loaded.

### metascraper(options)

Call the instance for extracting content based on rules bundle provided at the constructor.

#### options

#### url

*Required*<br>
Type: `String`

The URL associated with the HTML markup.

It is used for resolve relative links that can be present in the HTML markup.

it can be used as fallback field for different rules as well.

##### html

Type: `String`

The HTML markup for extracting the content.

#### rules

Type: `Array`

You can pass additional rules to add on execution time. 

These rules will be merged with your loaded [`rules`](#rules) at the beginning.

#### validateUrl

Type: `boolean`<br>
Default: `true`

Ensure the URL provided is validated as a [WHATWG URL](https://nodejs.org/api/url.html#url_the_whatwg_url_api) API compliant.

## Benchmark

To give you an idea of how accurate **metascraper** is, here is a comparison of similar libraries:

| Library   | [`metascraper`](https://www.npmjs.com/package/metascraper) | [`html-metadata`](https://www.npmjs.com/package/html-metadata) | [`node-metainspector`](https://www.npmjs.com/package/node-metainspector) | [`open-graph-scraper`](https://www.npmjs.com/package/open-graph-scraper) | [`unfluff`](https://www.npmjs.com/package/unfluff) |
|:----------|:-----------------------------------------------------------|:---------------------------------------------------------------|:-------------------------------------------------------------------------|:-------------------------------------------------------------------------|:---------------------------------------------------|
| Correct   | **95.54%**                                                 | **74.56%**                                                     | **61.16%**                                                               | **66.52%**                                                               | **70.90%**                                         |
| Incorrect | 1.79%                                                      | 1.79%                                                          | 0.89%                                                                    | 6.70%                                                                    | 10.27%                                             |
| Missed    | 2.68%                                                      | 23.67%                                                         | 37.95%                                                                   | 26.34%                                                                   | 8.95%                                              |

A big part of the reason for **metascraper**'s higher accuracy is that it relies on a series of fallbacks for each piece of metadata, instead of just looking for the most commonly-used, spec-compliant pieces of metadata, like Open Graph.

**metascraper**'s default settings are targetted specifically at parsing online articles, which is why it's able to be more highly-tuned than the other libraries for that purpose.

If you're interested in the breakdown by individual pieces of metadata, check out the [full comparison summary](/bench), or dive into the [raw result data for each library](/bench/results).

## License

**metascraper** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
