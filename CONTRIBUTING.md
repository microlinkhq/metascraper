# Contributing

## Rules Bundles

A rule bundle is the simplest way for extending **metascraper** functionality.

Rules bundles are a collection of HTML selectors around a determinate property.

## Writing Your Own Rules

### Get value from HTML

Every rule receives `htmlDom` (*cheerio*) and `url` as parameters inside an object:

```js
'use strict'

/**
 * A set of rules we want to declare under `metascraper-logo` namespace.
 *
**/
module.exports = () => {
  const rules = {
    logo: [
      // They receive as parameter:
      // - `htmlDom`: the cheerio HTML instance.
      // - `url`: The input URL used for extracting the content.
      ({ htmlDom: $, url }) => $('meta[property="og:logo"]').attr('content'),
      ({ htmlDom: $, url }) => $('meta[itemprop="logo"]').attr('content')
    ]
  }
  return rules
}
```

You can declare any logic you need in order to determine the output.

A set of rules under the same namespace runs in series and only the value returned by the first rule that outputs a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value will be taken. So remember, the order is important!.

### Defining `test` function

You can associate a `test` function with your rule bundle:

```js
rules.test = ({ url }) => getVideoInfo(url).service === 'youtube'
```

The `test` function will receive the same arguments as a rule. This is useful for skipping all rules that doesn't target a specific URL.

A good practice is to use a memoize function to prevent unnecessary CPU cycles for a previously computed value:

```js
const { memoizeOne } = require('@metascraper/helpers')

const test = memoizeOne(url => getVideoInfo(url).service === 'youtube')

const rules = []
rules.test = ({ url }) => test(url)
```

### Defining `pkgName` property

Additionally you can define `pkgName` property associated with your rules:

```js
const { memoizeOne } = require('@metascraper/helpers')

const rules = []
rules.pkgName = 'metascraper-module'
```

This is using for printing debug logs, see debugging section to know how to use it.

## Debugging your Rules

In case you need to see what's happening under the hood, you can set `DEBUG='metascraper*'.

This is useful for verifying rule precedence and detecting slow rules.

## Testing your Rules

Since the order of the rules is important, testing it is also an important thing in order to be sure more popular rules are executed first over less popular rules.

### Writing Unitary Test

Just write some HTML markup and as many tests as you need in order to determine the rules are sorted correctly:

```js
/* test/unit/index.js */
const should = require('should')
const metascraper = require('metascraper')([
  // loading our rules!
  require('metascraper-logo')()
])

describe('metascraper-logo', () => {
  it('creates an absolute favicon url if the logo is not present', async () => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>My Test Html</title>
      <meta property="og:logo" content="open graph value">
      <meta itemprop="logo" content="itemprop value">
    </head>
    <body>
    </body>
    </html>
    `
    const meta = await metascraper({ html, url })
    should(meta.log).be.equal('open graph value')
  })
})
```

### Writing Integration Tests

Although unit tests are a good start, the rules need to be evaluated in a real environment to demonstrate their effectiveness.

To do that, first you need to get some production HTML markup.

You can do that easily using [html-microservice](https://microlink-html.herokuapp.com/).

It is just a tiny microservice for getting the HTML of any file.

You can save the result into a file:

```
curl https://microlink-html.herokuapp.com/https://metascraper.js.org > index.html
```

Then use the file as html in your tests:

```js
/* test/integration/index.js */
const should = require('should')
const fs = require('fs')

const metascraper = require('metascraper')([
  // loading our rules!
  require('metascraper-logo')()
])

describe('metascraper-logo', () => {
  it('it resolves logo value', async () => {
    const html = fs.readFileSync('index.html', 'utf-8')
    const meta = await metascraper({ html, url })
    should(meta.logo).be.equal('https://metascraper.js.org/static/logo.png')
  })
})
```
