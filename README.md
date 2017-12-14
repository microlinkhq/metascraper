# metascraper

![Last version](https://img.shields.io/github/tag/microlinkhq/metascraper.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/microlinkhq/metascraper/master.svg?style=flat-square)](https://travis-ci.org/microlinkhq/metascraper)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/metascraper.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/metascraper)
[![Dependency status](https://img.shields.io/david/microlinkhq/metascraper.svg?style=flat-square)](https://david-dm.org/microlinkhq/metascraper)
[![Dev Dependencies Status](https://img.shields.io/david/dev/microlinkhq/metascraper.svg?style=flat-square)](https://david-dm.org/microlinkhq/metascraper#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/metascraper.svg?style=flat-square)](https://www.npmjs.org/package/metascraper)

> A library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.

## Table of Contents

* [Getting Started](#getting-started)
* [Installation](#installation)
* [Usage](#usage)
* [Metadata](#metadata)
* [Customization](#customization)
  + [Basic Configuration](#basic-configuration)
  + [Advanced Configuration](#advanced-configuration)
* [Plugins](#plugins)
  + [Core Plugins](#core-plugins)
  + [Community Plugins](#community-plugins)
  + [Write your own plugin](#write-your-own-plugin)
* [API](#api)
* [Comparison](#comparison)
* [License](#license)

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

Let's extract accurate information from the following article:

[![](https://raw.githubusercontent.com/microlinkhq/metascraper/add-comparison/support/screenshot.png)](http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance)

```js
const metascraper = require('metascraper')
const got = require('got')

const targetUrl = 'http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance'

;(async () => {
  const {body: html, url} = await got(targetUrl)
  const metadata = await metascraper({html, url})
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
  
## Customization

>? Configuration file follow the same approach than projects like Babel or Prettier.

**metascraper** is built out of plugins.

You can compose your own transformation pipeline using existing plugins or write your own. 

When you load the library, implicitly it is loading [core plugins](#core-plugins).

Use a configuration file for load custom pipelines. The configuration file can be defined via:

- A `.metascraperrc` file, written in YAML or JSON, with optional extensions: `.yaml/.yml/.json/.js`.
- A `prettier.config.js` file that exports an object.
- A `"metascraper"` key in your `package.json` file.

The configuration file will be resolved starting from the location of the file being formatted, and searching up the file tree until a config file is (or isn't) found.

**Note:** Using a configuration file you need to explicitly add all the plugins that you want to use.

### Basic Configuration

Declared an `array` of `rules`, specifying each rule as `string` name of the module to load.

#### JSON

```json
// .metascraperrc
{
  "rules": [
    "metascraper-author",
    "metascraper-date",
    "metascraper-description",
    "metascraper-image",
    "metascraper-logo",
    "metascraper-publisher",
    "metascraper-title",
    "metascraper-url"
  ]
}
```

#### YAML

```yaml
#  .metascraperrc
rules:
  - metascraper-author
  - metascraper-date
  - metascraper-description
  - metascraper-image
  - metascraper-logo
  - metascraper-publisher
  - metascraper-title
  - metascraper-url
```

### Advanced Configuration

Additionally, you can pass specific configuration per module using a `object` declaration:

#### JSON

```json
// .metascraperrc
{
  "rules": [
    "metascraper-author",
    "metascraper-date",
    "metascraper-description",
    "metascraper-image",
    "metascraper-logo",
    {"metascraper-clearbit-logo": {
    "format": "jpg"
    }},
    "metascraper-publisher",
    "metascraper-title",
    "metascraper-url"
  ]
}
```

#### YAML

```yaml
# .metascraperrc
rules:
  - metascraper-author
  - metascraper-date
  - metascraper-description
  - metascraper-image
  - metascraper-logo
  - metascraper-clearbit-logo:
      format: jpg
  - metascraper-publisher
  - metascraper-title
  - metascraper-url
```

## Plugins

?> Can't find a plugin that you want? Let's [open an issue](https://github.com/microlinkhq/metacraper/issues) to create it.

### Core Plugins

These plugins will be shipped with  **metascraper** and loaded by default.

| Package | Version | Dependencies |
|--------|-------|------------|
| [`metascraper-author`](/packages/metascraper-author) | [![npm](https://img.shields.io/npm/v/metascraper-author.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-author) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-author&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-author) |
| [`metascraper-date`](/packages/metascraper-date) | [![npm](https://img.shields.io/npm/v/metascraper-date.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-date) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-date&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-date) |
| [`metascraper-description`](/packages/metascraper-description) | [![npm](https://img.shields.io/npm/v/metascraper-description.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-description) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-description&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-description) |
| [`metascraper-image`](/packages/metascraper-image) | [![npm](https://img.shields.io/npm/v/metascraper-image.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-image) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-image&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-image) |
| [`metascraper-logo`](/packages/metascraper-logo) | [![npm](https://img.shields.io/npm/v/metascraper-logo.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-logo) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-logo&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-logo) |
| [`metascraper-publisher`](/packages/metascraper-publisher) | [![npm](https://img.shields.io/npm/v/metascraper-publisher.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-publisher) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-publisher&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-publisher) |
| [`metascraper-title`](/packages/metascraper-title) | [![npm](https://img.shields.io/npm/v/metascraper-title.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-title) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-title&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-title) |
| [`metascraper-url`](/packages/metascraper-url) | [![npm](https://img.shields.io/npm/v/metascraper-url.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-url) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-url&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-url) |

### Community Plugins

These plugins will not be shipped with  **metascraper** by default and need to be specific using a configuration file.

| Package | Version | Dependencies |
|--------|-------|------------|
| [`metascraper-clearbit-logo`](/packages/metascraper-clearbit-logo) | [![npm](https://img.shields.io/npm/v/metascraper-clearbit-logo.svg?style=flat-square)](https://www.npmjs.com/package/metascraper-clearbit-logo) | [![Dependency Status](https://david-dm.org/microlinkhq/metascraper.svg?path=packages/metascraper-clearbit-logo&?style=flat-square)](https://david-dm.org/microlinkhq/metascraper?path=packages/metascraper-clearbit-logo) |

### Write your own plugin

A plugin is the simplest way for extending **metascraper** functionality.

The following schema represents the API compromise that a plugin need to follow:

```js
'use strict'

// `opts` can be loaded using `.metascraperrc`
// confguration file
module.exports = opts => {
  // define as `rule` as you want.
  // They receive as parameter:
  // - htmlDom: the cheerio HTML instance.
  // - url: The input URL used for extact the content.
  // - meta: The current state of the information detected.
  const rule = ({ htmlDom, meta, url: baseUrl }) => {
    // the logic for determinate if apply or not the rule.
    // just return the data that you want to be
    // assigned to the final output
    return !meta.name && 'hello world'
  }

  // Rules need to follow an `array` interface.
  const rules = [rule]

  // Need to assign a property name
  rules.propName = 'logo'

  // export the rules!
  return rules
}
```

We recommend check [core plugins packages](/packages) as examples to understand better how to connect your code with **metascraper** plugins.

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
