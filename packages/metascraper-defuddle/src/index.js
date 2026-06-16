'use strict'

const { composeRule, getHtml } = require('@metascraper/helpers')
const debug = require('debug-logfmt')('metascraper-defuddle')
const asyncMemoizeOne = require('async-memoize-one')
const { parseHTML } = require('linkedom')

// Cache key = HTML + url + the identity of `preprocess`/`defuddleOpts`, so a
// call with the same HTML but a different hook or options (e.g. another
// metascraper-defuddle() instance or defuddleExtract consumer) re-extracts
// instead of reusing a result produced with different ones.
const isSameExtraction = (
  [html, url, opts = {}],
  [oldHtml, oldUrl, oldOpts = {}]
) =>
  html === oldHtml &&
  url === oldUrl &&
  opts.preprocess === oldOpts.preprocess &&
  opts.defuddleOpts === oldOpts.defuddleOpts

// Single Defuddle `parseInternal` pass, memoized. See README for the
// `preprocess` / `defuddleOpts` options and the rationale.
const extractMemo = asyncMemoizeOne(
  async (html, url, { preprocess, defuddleOpts } = {}) => {
    const { DefuddleClass } = await import('defuddle/node')
    try {
      const { document } = parseHTML(html)
      if (preprocess) preprocess(document, html)
      return new DefuddleClass(document, { url }).parseInternal(defuddleOpts)
    } catch (err) {
      debug('Defuddle failed, fallback to next rule', { message: err.message })
      return undefined
    }
  },
  isSameExtraction
)

const defuddleExtract = (url, html, options) => extractMemo(html, url, options)

module.exports = ({ preprocess, defuddleOpts } = {}) => {
  const getDefuddle = composeRule(($, url) =>
    defuddleExtract(url, getHtml($), { preprocess, defuddleOpts })
  )

  const rules = {
    author: getDefuddle({ from: 'author' }),
    description: getDefuddle({ from: 'description' }),
    date: getDefuddle({ from: 'published', to: 'date' }),
    lang: getDefuddle({ from: 'language', to: 'lang' }),
    publisher: getDefuddle({ from: 'site', to: 'publisher' }),
    title: getDefuddle({ from: 'title' })
  }

  rules.pkgName = 'metascraper-defuddle'

  return rules
}

module.exports.defuddleExtract = defuddleExtract
