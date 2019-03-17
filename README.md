<h1>
  <br>
  <img src="/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
</h1>

![Last version](https://img.shields.io/github/tag/microlinkhq/metascraper.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/microlinkhq/metascraper/master.svg?style=flat-square)](https://travis-ci.org/microlinkhq/metascraper)
[![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper)
[![NPM Status](https://img.shields.io/npm/dm/metascraper.svg?style=flat-square)](https://www.npmjs.org/package/metascraper)

> A library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Metadata](#metadata)
- [How it works](#how-it-works)
- [Importing Rules](#importing-rules)
- [Rules bundles](#rules-bundles)
- [API](#api)
- [Benchmark](#benchmark)
- [License](#license)

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
  require('metascraper-clearbit-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const got = require('got')

const targetUrl = 'http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance'

;(async () => {
  const { body: html, url } = await got(targetUrl)
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

?> Other metadata can be defined using a custom [rule bundle](#rule-bundles).

Here is an example of the metadata that **metascraper** can collect:

- `audio` — eg. *https://cf-media.sndcdn.com/U78RIfDPV6ok.128.mp3*<br/>
A audio URL that best represents the article.

- `author` — eg. *Noah Kulwin*<br/>
  A human-readable representation of the author's name.

- `date` — eg. *2016-05-27T00:00:00.000Z*<br/>
  An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) representation of the date the article was published.

- `description` — eg. *Venture capitalists are raising money at the fastest rate...*<br/>
  The publisher's chosen description of the article.

- `audio` — eg. *https://cf-media.sndcdn.com/U78RIfDPV6ok.128.mp3*<br/>
A audio URL that best represents the article.

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

## How it works

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
  require('metascraper-clearbit-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
```

Again, the order of rules are loaded are important: Just the first rule that resolve the value will be applied.

Use the first parameter to pass custom options specific per each rules bundle:

```js
const metascraper = require('metascraper')([
  require('metascraper-clearbit-logo')({
    size: 256,
    format: 'jpg'
  })
])
```

## Rules bundles

?> Can't find the rules bundle that you want? Let's [open an issue](https://github.com/microlinkhq/metascraper/issues/new) to create it.

| Package | Version | Dependencies |
|--------|-------|------------|
| [`metascraper-amazon`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-amazon) | [![npm](https://img.shields.io/npm/v/metascraper-amazon.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-amazon) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-amazon&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-amazon) |
| [`metascraper-audio`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-audio) | [![npm](https://img.shields.io/npm/v/metascraper-audio.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-audio) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-audio&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-audio) |
| [`metascraper-author`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-author) | [![npm](https://img.shields.io/npm/v/metascraper-author.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-author) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-author&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-author) |
| [`metascraper-clearbit-logo`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-clearbit-logo) | [![npm](https://img.shields.io/npm/v/metascraper-clearbit-logo.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-clearbit-logo) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-clearbit-logo&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-clearbit-logo) |
| [`metascraper-date`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-date) | [![npm](https://img.shields.io/npm/v/metascraper-date.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-date) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-date&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-date) |
| [`metascraper-description`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-description) | [![npm](https://img.shields.io/npm/v/metascraper-description.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-description) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-description&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-description) |
| [`@metascraper/helpers`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-helpers) | [![npm](https://img.shields.io/npm/v/@metascraper/helpers.svg?style=flat-square)](https://www.npmjs.com/package/@metascraper/helpers) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-helpers&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-helpers) |
| [`metascraper-image`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-image) | [![npm](https://img.shields.io/npm/v/metascraper-image.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-image) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-image&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-image) |
| [`metascraper-lang`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-lang) | [![npm](https://img.shields.io/npm/v/metascraper-lang.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-lang) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-lang&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-lang) |
| [`metascraper-lang-detector`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-lang-detector) | [![npm](https://img.shields.io/npm/v/metascraper-lang-detector.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-lang-detector) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-lang-detector&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-lang-detector) |
| [`metascraper-logo`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo) | [![npm](https://img.shields.io/npm/v/metascraper-logo.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-logo) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-logo&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-logo) |
| [`metascraper-logo-favicon`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-logo-favicon) | [![npm](https://img.shields.io/npm/v/metascraper-logo-favicon.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-logo-favicon) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-logo-favicon&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-logo-favicon) |
| [`metascraper-media-provider`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-media-provider) | [![npm](https://img.shields.io/npm/v/metascraper-media-provider.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-media-provider) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-media-provider&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-media-provider) |
| [`metascraper-publisher`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-publisher) | [![npm](https://img.shields.io/npm/v/metascraper-publisher.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-publisher) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-publisher&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-publisher) |
| [`metascraper-readability`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-readability) | [![npm](https://img.shields.io/npm/v/metascraper-readability.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-readability) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-readability&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-readability) |
| [`metascraper-soundcloud`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-soundcloud) | [![npm](https://img.shields.io/npm/v/metascraper-soundcloud.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-soundcloud) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-soundcloud&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-soundcloud) |
| [`metascraper-title`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-title) | [![npm](https://img.shields.io/npm/v/metascraper-title.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-title) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-title&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-title) |
| [`metascraper-url`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-url) | [![npm](https://img.shields.io/npm/v/metascraper-url.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-url) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-url&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-url) |
| [`metascraper-video`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-video) | [![npm](https://img.shields.io/npm/v/metascraper-video.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-video) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-video&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-video) |
| [`metascraper-youtube`](https://github.com/microlinkhq/metascraper/tree/master/packages/metascraper-youtube) | [![npm](https://img.shields.io/npm/v/metascraper-youtube.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-youtube) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-youtube&style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-youtube) |


### Write your own rules

A rule bundle is the simplest way for extending **metascraper** functionality.

A rule bundle can add one or more properties support.

The following schema represents the API compromise that a rule bundle need to follow:

```js
'use strict'

// `opts` can be loaded using `.metascraperrc` config file
module.exports = opts => {
  // You can define as props as you want.
  // props are organized based on an object key.
  return ({
    logo: [
      // You can setup more than one rules per prop (priority is important!).
      // They receive as parameter:
      // - `htmlDom`: the cheerio HTML instance.
      // - `url`: The input URL used for extact the content.
      ({ htmlDom: $, url: baseUrl }) => wrap($ => $('meta[property="og:logo"]').attr('content')),
      ({ htmlDom: $, url: baseUrl }) => wrap($ => $('meta[itemprop="logo"]').attr('content'))
    ]
  })
}
```

We recommend check one of the [rule bundles](#rules-bundles) already implemented to have a better perspective.

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

You can pass additional rules on execution time. These rules will be merged with your loaded rules.

## Benchmark

To give you an idea of how accurate **metascraper** is, here is a comparison of similar libraries:

| Library | [`metascraper`](https://www.npmjs.com/package/metascraper) | [`html-metadata`](https://www.npmjs.com/package/html-metadata) | [`node-metainspector`](https://www.npmjs.com/package/node-metainspector) | [`open-graph-scraper`](https://www.npmjs.com/package/open-graph-scraper) | [`unfluff`](https://www.npmjs.com/package/unfluff) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Correct | **95.54%** | **74.56%** | **61.16%** | **66.52%** | **70.90%** |
| Incorrect | 1.79% | 1.79% | 0.89% | 6.70% | 10.27% |
| Missed | 2.68% | 23.67% | 37.95% | 26.34% | 8.95% |

A big part of the reason for **metascraper**'s higher accuracy is that it relies on a series of fallbacks for each piece of metadata, instead of just looking for the most commonly-used, spec-compliant pieces of metadata, like Open Graph.

**metascraper**'s default settings are targetted specifically at parsing online articles, which is why it's able to be more highly-tuned than the other libraries for that purpose.

If you're interested in the breakdown by individual pieces of metadata, check out the [full comparison summary](/support/comparison), or dive into the [raw result data for each library](/support/comparison/results).

## License

**metascraper** © [Ian Storm Taylor](https://github.com/ianstormtaylor), Released under the [MIT](https://github.com/Kikobeats/free-email-domains/blob/master/LICENSE.md) License.<br>
Maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).
