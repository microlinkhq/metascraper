'use strict'

const { memoizeOne, composeRule, getHtml } = require('@metascraper/helpers')
const debug = require('debug-logfmt')('metascraper-defuddle')
const asyncMemoizeOne = require('async-memoize-one')
const { parseHTML } = require('linkedom')

// Single Defuddle `parseInternal` pass, memoized by HTML. See README for the
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
  memoizeOne.EqualityFirstArgument
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
