# metascraper

![Last version](https://img.shields.io/github/tag/microlinkhq/metascraper.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/microlinkhq/metascraper/master.svg?style=flat-square)](https://travis-ci.org/microlinkhq/metascraper)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/metascraper.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/metascraper)
[![Dependency status](https://img.shields.io/david/microlinkhq/metascraper.svg?style=flat-square)](https://david-dm.org/microlinkhq/metascraper)
[![Dev Dependencies Status](https://img.shields.io/david/dev/microlinkhq/metascraper.svg?style=flat-square)](https://david-dm.org/microlinkhq/metascraper#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/metascraper.svg?style=flat-square)](https://www.npmjs.org/package/metascraper)

> A library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Metadata](#metadata)
- [API](#api)
- [Comparison](#comparison)
- [License](#license)

## Getting Started

**metascraper** is library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks. 

It follows a few principles:

- Have a high accuracy for online articles by default.
- Be usable on the server and in the browser.
- Make it simple to add new rules or override existing ones.
- Don't restrict rules to CSS selectors or text accessors. 

## Installation

```bash
$ npm install metascraper --save
```

## Usage

Let's extract accurate information from the followgin article:

[![](https://raw.githubusercontent.com/microlinkhq/metascraper/master/support/screenshot.png)](http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance)

```js
const metascraper = require('metascraper')
const got = require('got')

const targetUrl = 'http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance'

;(async () => {
  const {body: html, url} = await got(targetUrl)
  const metadata = await microlink({html, url})
  console.log(metadata)
})()
```

Where the output will be something like:

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

Here is a list of the metadata that **metascraper** collects by default:

- **`author`** — eg. `Noah Kulwin`<br/>
  A human-readable representation of the author's name.

- **`date`** — eg. `2016-05-27T00:00:00.000Z`<br/>
  An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) representation of the date the article was published.

- **`description`** — eg. `Venture capitalists are raising money at the fastest rate...`<br/>
  The publisher's chosen description of the article.

- **`image`** — eg. `https://assets.entrepreneur.com/content/3x2/1300/20160504155601-GettyImages-174457162.jpeg`<br/>
  An image URL that best represents the article.
 
 - **`logo`** — eg. `https://entrepreneur.com/favicon180x180.png`<br/>
  An image URL that best represents the publisher brand.

- **`publisher`** — eg. `Fast Company`<br/>
  A human-readable representation of the publisher's name.

- **`title`** — eg. `Meet Wall Street's New A.I. Sheriffs`<br/>
  The publisher's chosen title of the article.

- **`url`** — eg. `http://motherboard.vice.com/read/google-wins-trial-against-oracle-saves-9-billion`<br/>
  The URL of the article.

## API

### metascraper(options)

#### options

##### html

*Required*<br>
Type: `String`

The HTML markup for extracting the content.

#### url

*Required*<br>
Type: `String`

The URL associated with the HTML markup.

It is used for resolve relative links that can be present in the HTML markup.

it can be used as fallback field for different rules as well.

## Comparison

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
