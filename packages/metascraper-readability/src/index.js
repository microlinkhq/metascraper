'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const { Readability } = require('@mozilla/readability')
const asyncMemoizeOne = require('async-memoize-one')
const { Browser } = require('happy-dom')

const parseReader = reader => {
  const parsed = reader.parse()
  return parsed || {}
}

const getDocument = ({ url, html }) => {
  const browser = new Browser({
    settings: {
      disableComputedStyleRendering: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true
    }
  })

  const page = browser.newPage()
  page.url = url
  page.content = html

  const teardown = () => browser.close()

  return { document, teardown }
}

const readability = asyncMemoizeOne(async (url, html, readabilityOpts) => {
  const { document, teardown } = getDocument({ url, html })
  try {
    const reader = new Readability(document, readabilityOpts)
    const result = parseReader(reader)
    return result
  } finally {
    await teardown()
  }
}, memoizeOne.EqualityFirstArgument)

module.exports = ({ readabilityOpts } = {}) => {
  const getReadbility = composeRule(($, url) =>
    readability(url, $.html(), readabilityOpts)
  )

  const rules = {
    author: getReadbility({ from: 'byline', to: 'author' }),
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    lang: getReadbility({ from: 'lang' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    title: getReadbility({ from: 'title' })
  }

  rules.pkgName = 'metascraper-readability'

  return rules
}

module.exports.readability = readability
