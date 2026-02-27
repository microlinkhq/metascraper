'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const { Readability } = require('@mozilla/readability')
const asyncMemoizeOne = require('async-memoize-one')
const { Window } = require('happy-dom')

const parseReader = reader => {
  let parsed = {}
  try {
    parsed = reader.parse()
  } catch (_) {}
  return parsed
}

const DOCUMENT_SETTINGS = {
  disableComputedStyleRendering: true,
  disableCSSFileLoading: true,
  disableIframePageLoading: true,
  disableJavaScriptEvaluation: true,
  disableJavaScriptFileLoading: true
}

const getDocument = ({ url, html }) => {
  const window = new Window({ url, settings: DOCUMENT_SETTINGS })
  window.document.documentElement.innerHTML = html
  return {
    document: window.document,
    teardown: () => window.close()
  }
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

const htmlCache = new WeakMap()

const getHtml = htmlDom => {
  if (!htmlCache.has(htmlDom)) {
    htmlCache.set(htmlDom, htmlDom.html())
  }

  return htmlCache.get(htmlDom)
}

module.exports = ({ readabilityOpts } = {}) => {
  const getReadbility = composeRule(($, url) =>
    readability(url, getHtml($), readabilityOpts)
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
