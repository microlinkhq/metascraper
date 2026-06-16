'use strict'

const { memoizeOne, composeRule, getHtml } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { parseHTML } = require('linkedom')

const debug = require('debug-logfmt')('metascraper-defuddle')

const defuddleExtract = asyncMemoizeOne(async (url, html) => {
  const { Defuddle } = await import('defuddle/node')
  try {
    const { document } = parseHTML(html)
    return await Defuddle(document, url, { useAsync: false })
  } catch (err) {
    debug('Defuddle failed, fallback to next rule', { message: err.message })
    return undefined
  }
}, memoizeOne.EqualityFirstArgument)

module.exports = () => {
  const getDefuddle = composeRule(($, url) => defuddleExtract(url, getHtml($)))

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
