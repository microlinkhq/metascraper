
# metascraper

A library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks. Following a few principles:

- Be usable on the server and in the browser.
- Make it simple to add new rules or override existing ones.
- Don't restrict rules to CSS selectors or text accessors. 


## Table of Contents

- [Example](#example)
- [Server-side Usage](#server-side-usage)
- [Browser-side Usage](#browser-side-usage)
- [Creating & Overriding Rules](#creating-overriding-rules)
- [API](#api)
- [License](#license)


## Example

Using Metascraper, this metadata...

    {
      "author": "Ellen Huet",
      "date": "2016-05-24T18:00:03.894Z",
      "description": "The HR startups go to war.",
      "image": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ioh_yWEn8gHo/v1/-1x-1.jpg",
      "publisher": "Bloomberg.com",
      "title": "As Zenefits Stumbles, Gusto Goes Head-On by Selling Insurance"
    }

...would be scraped from this article...

[![](/support/screenshot.png)](http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance)


## Server-side Usage

On the server, you're typically going to only have a `url` to scrape, or already have the `html` downloaded. Here's what a simple use case might look like:

```js
import Metascraper from 'metascraper'

Metascraper
  .scrapeUrl('http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance')
  .then(function (metadata) {
    console.log(metadata)  
  })

// {
//   "author": "Ellen Huet",
//   "date": "2016-05-24T18:00:03.894Z",
//   "description": "The HR startups go to war.",
//   "image": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ioh_yWEn8gHo/v1/-1x-1.jpg",
//   "publisher": "Bloomberg.com",
//   "title": "As Zenefits Stumbles, Gusto Goes Head-On by Selling Insurance"
// }
```

Or, if you are using `async/await`, you can simply do:

```js
const metadata = await Metascraper.scrapeUrl('http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance')
```


Similarly, if you already have the `html` downloaded, you can use the `scrapeHtml` method instead:

```js
const metadata = await Metascraper.scrapeHtml(html)
```

That's it! If you want to customize what exactly gets scraped, check out the documention on [the rules system](#rules).


## Browser-side Usage

In the browser, for example inside of a Chrome extension, you might already have access to the `window` of the document you'd like to scrape. You can simply use the `scrapeWindow` method to get the metadata:

```js
import Metascraper from 'metascraper'

Metascraper
  .scrapeWindow(window)
  .then(function (metadata) {
    console.log(metadata)  
  })

// {
//   "author": "Ellen Huet",
//   "date": "2016-05-24T18:00:03.894Z",
//   "description": "The HR startups go to war.",
//   "image": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ioh_yWEn8gHo/v1/-1x-1.jpg",
//   "publisher": "Bloomberg.com",
//   "title": "As Zenefits Stumbles, Gusto Goes Head-On by Selling Insurance"
// }
```

Or if you are using `async/await` it might look even simpler:

```js
const metadata = await Metascraper.scrapeWindow(window)
```

Of course, you can also still scrape directly from `html` or a `url` if you choose to.


## Creating & Overiding Rules

By default, Metascraper ships with a set of rules that are tuned to parse out information from online articles—blogs, newspapers, press releases, etc. But there's not that says that you have to use those rules. If you have a different use case, supplying your own rules is simple.

Each rule is simply a function that receives a [Cheerio](https://github.com/cheeriojs/cheerio) instance of the document, and that returns the value it has scraped. (Or a `Promise` in the case of asynchronous scraping.) Like so:

```js
function myRule($) {
  const heading = $('h1').text()
  return heading
}
```

All of the rules are then packaged up into a single dictionary, which has the same shape as the metadata that will be scraped. Like so:

```js
const MY_RULES = {
  title: myTitleRule,
  summary: mySummaryRule,
  ...
}
```

And then you can pass that rules dictionary into any of the scraping functions as the second argument, like so:

```js
const metadata = Metascraper.scrapeHtml(html, MY_RULES)
```

The beauty of the system is that it means simple scraping needs can be defined inline easily, like so:

```js
const rules = {
  title: $ => $('title').text(),
  date: $ => $('time[pubdate]').attr('datetime'),
  excerpt: $ => $('p').first().text(),
}

const metadata = Metascraper.scrapeHtml(html, rules)
```

But in more complex cases, the set of rules can be packaged separately, and even shared with others, for example:

```js
import Metascraper from 'metascraper'
import RECIPE_RULES from 'metascraper-recipes'

const metadata = Metascraper.scrapeHtml(html, RECIPE_RULES)
```

For a more complex example of how rules work, [check out the default rules](/lib/rules).


## API

#### `scrapeUrl(url, [rules])`

```js
import Metascraper from 'metascraper'

const metadata = await Metascraper.scrapeUrl()
```

Scrapes a `url` with an optional set of `rules`.

#### `scrapeHtml(html, [rules])`

```js
import Metascraper from 'metascraper'

const metadata = await Metascraper.scrapeHtml(html)
```

Scrapes an `html` string with an optional set of `rules`.

#### `scrapeWindow(window, [rules])`

```js
import Metascraper from 'metascraper'

const metadata = await Metascraper.scrapeWindow(window)
```

Scrapes a `window` object with an optional set of `rules`.


## License

The MIT License (MIT)

Copyright &copy; 2016, Ian Storm Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
